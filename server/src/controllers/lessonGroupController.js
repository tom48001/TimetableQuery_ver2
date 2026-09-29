import pool from '../db.js';
import { ensureStudentAdminSchema } from './manageStudentController.js';
import { resolveSubjectIds } from './subjectController.js';

async function lessonGroupScope(user) {
  const role = String(user?.role || 'teacher').trim().toLowerCase();
  if (role === 'manager' || role === 'staff') return { type: 'all' };

  if (role === 'subject_head') {
    const [users] = await pool.query(
      'SELECT subject_head_subject_id FROM user WHERE user_id = ? LIMIT 1',
      [user?.id]
    );
    const subjectId = Number(users[0]?.subject_head_subject_id) || 0;
    return {
      type: 'subject',
      subjectId,
      subjectIds: subjectId ? await resolveSubjectIds(subjectId) : []
    };
  }

  const [teachers] = await pool.query(
    "SELECT teacher_id FROM teacher WHERE user_id = ? AND COALESCE(status, 'active') = 'active' LIMIT 1",
    [user?.id]
  );
  return { type: 'teacher', teacherId: Number(teachers[0]?.teacher_id) || 0 };
}

async function canAccessLessonGroup(user, classId, subjectId, day, periodId) {
  const scope = await lessonGroupScope(user);
  if (scope.type === 'all') return true;
  if (scope.type === 'subject') return scope.subjectIds.map(Number).includes(Number(subjectId));
  if (!scope.teacherId) return false;
  const [rows] = await pool.query(
    `SELECT timetable_id FROM timetable
     WHERE class_id = ? AND subject_id = ? AND day_of_week = ? AND period_id = ? AND teacher_id = ?
     LIMIT 1`,
    [classId, subjectId, day, periodId, scope.teacherId]
  );
  return rows.length > 0;
}

async function canAddLessonGroupTeacher(user, subjectId) {
  const scope = await lessonGroupScope(user);
  if (scope.type === 'all') {
    return String(user?.role || '').trim().toLowerCase() === 'manager';
  }
  return scope.type === 'subject' && scope.subjectIds.map(Number).includes(Number(subjectId));
}

function normaliseClassListSql(alias) {
  return `
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(${alias}.class_name, '#', ''),
          '／',
          '/'
        ),
        '/',
        ','
      ),
      ' ',
      ''
    ),
    '，',
    ','
  )
`;
}

export async function ensureLessonGroupSchema(connOrPool = pool) {
  await connOrPool.query(`
    CREATE TABLE IF NOT EXISTS student_lesson_group (
      student_id BIGINT NOT NULL,
      timetable_id BIGINT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
      PRIMARY KEY (student_id, timetable_id),
      UNIQUE KEY unique_student_lesson_group_slot (student_id, timetable_id),
      FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
      FOREIGN KEY (timetable_id) REFERENCES timetable(timetable_id) ON DELETE CASCADE,
      INDEX idx_student_lesson_group_student (student_id),
      INDEX idx_student_lesson_group_timetable (timetable_id)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
  `);
}

function splitGroupWhere(alias = 'tt') {
  return `
    ${alias}.class_id = ?
    AND ${alias}.subject_id = ?
    AND ${alias}.day_of_week = ?
    AND ${alias}.period_id = ?
  `;
}

async function matchingLessonFamily(connOrPool, classId, subjectId, day, periodId) {
  const [rows] = await connOrPool.query(`
    SELECT tt.timetable_id, tt.teacher_id, tt.room_id, tt.day_of_week, tt.period_id,
           t.teacher_name, r.room_name, p.period_name
    FROM timetable tt
    JOIN teacher t ON tt.teacher_id = t.teacher_id
    JOIN room r ON tt.room_id = r.room_id
    JOIN period p ON tt.period_id = p.period_id
    WHERE tt.class_id = ? AND tt.subject_id = ?
    ORDER BY FIELD(tt.day_of_week, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'), tt.period_id, t.teacher_name, r.room_name
  `, [classId, subjectId]);
  const slots = new Map();
  rows.forEach(row => {
    const key = `${row.day_of_week}-${row.period_id}`;
    if (!slots.has(key)) slots.set(key, []);
    slots.get(key).push(row);
  });
  const selected = slots.get(`${day}-${periodId}`) || [];
  if (selected.length < 2) return { selected: [], family: [] };
  const matchingSlots = Array.from(slots.values()).filter(slot => slot.length === selected.length && slot.length > 1);
  return {
    selected,
    familySlots: matchingSlots,
    family: matchingSlots.flat()
  };
}

export async function getSplitLessonGroups(req, res) {
  try {
    await ensureLessonGroupSchema();
    const scope = await lessonGroupScope(req.user);
    if ((scope.type === 'subject' && !scope.subjectIds.length) || (scope.type === 'teacher' && !scope.teacherId)) {
      return res.json([]);
    }
    const scopeCondition = scope.type === 'subject'
      ? 'AND tt.subject_id IN (?)'
      : (scope.type === 'teacher'
        ? `AND EXISTS (
             SELECT 1 FROM timetable own_tt
             WHERE own_tt.class_id = tt.class_id
               AND own_tt.subject_id = tt.subject_id
               AND own_tt.day_of_week = tt.day_of_week
               AND own_tt.period_id = tt.period_id
               AND own_tt.teacher_id = ?
           )`
        : '');
    const scopeParams = scope.type === 'subject'
      ? [scope.subjectIds]
      : (scope.type === 'teacher' ? [scope.teacherId] : []);
    const [rows] = await pool.query(`
      SELECT
        tt.class_id,
        c.class_name,
        c.grade_level,
        tt.subject_id,
        s.subject_name,
        s.subject_name_zh,
        s.subject_name_en,
        tt.day_of_week,
        tt.period_id,
        p.period_name,
        COUNT(DISTINCT tt.timetable_id) AS group_count,
        COUNT(DISTINCT slg.student_id) AS assigned_students,
        (
          SELECT COUNT(*)
          FROM student st
          JOIN class sc ON st.class_id = sc.class_id
          WHERE st.status = 'active'
            AND (
              st.class_id = tt.class_id
              OR FIND_IN_SET(REPLACE(sc.class_name, ' ', ''), ${normaliseClassListSql('c')}) > 0
              OR REPLACE(c.class_name, ' ', '') IN (sc.grade_level, REPLACE(sc.grade_level, 'F', 'S'))
            )
        ) AS student_count
      FROM timetable tt
      JOIN class c ON tt.class_id = c.class_id
      JOIN subject s ON tt.subject_id = s.subject_id
      JOIN period p ON tt.period_id = p.period_id
      LEFT JOIN student_lesson_group slg ON slg.timetable_id = tt.timetable_id
      WHERE TRIM(COALESCE(s.subject_name_zh, s.subject_name)) <> '班主任課'
        AND UPPER(TRIM(COALESCE(s.subject_name_en, s.subject_name))) NOT IN ('CLASS TEACHER', 'CLASS TEACHER PERIOD', 'HOMEROOM')
        ${scopeCondition}
      GROUP BY
        tt.class_id, c.class_name, c.grade_level, tt.subject_id, s.subject_name, s.subject_name_zh,
        s.subject_name_en, tt.day_of_week, tt.period_id, p.period_name
      HAVING COUNT(DISTINCT tt.timetable_id) > 1
      ORDER BY
        CAST(LEFT(c.class_name, 1) AS UNSIGNED),
        c.class_name,
        FIELD(tt.day_of_week, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'),
        tt.period_id,
        s.subject_name
    `, scopeParams);

    const families = new Map();
    rows.forEach(row => {
      const key = `${row.grade_level}-${row.class_id}-${row.subject_id}-${row.group_count}`;
      if (!families.has(key)) {
        families.set(key, { ...row, family_signature: String(row.group_count), occurrences: [] });
      }
      const family = families.get(key);
      family.occurrences.push({ day_of_week: row.day_of_week, period_id: row.period_id, period_name: row.period_name });
      family.assigned_students = Math.max(Number(family.assigned_students || 0), Number(row.assigned_students || 0));
    });
    res.json(Array.from(families.values()).map(family => ({
      ...family,
      occurrence_count: family.occurrences.length,
      schedule_labels: family.occurrences.map(item => `${item.day_of_week} ${item.period_name}`)
    })));
  } catch (err) {
    console.error('Failed to load split lesson groups:', err);
    res.status(500).json({ code: 'DATABASE_ERROR', error: 'Failed to load split lesson groups.' });
  }
}

export async function getSplitLessonGroupDetail(req, res) {
  const classId = Number(req.query.classId);
  const subjectId = Number(req.query.subjectId);
  const day = String(req.query.day || '');
  const periodId = Number(req.query.periodId);

  if (!classId || !subjectId || !day || !periodId) {
    return res.status(400).json({ code: 'INVALID_GROUP', error: 'Missing split lesson group parameters.' });
  }

  try {
    await ensureStudentAdminSchema();
    await ensureLessonGroupSchema();
    if (!(await canAccessLessonGroup(req.user, classId, subjectId, day, periodId))) {
      return res.status(403).json({ code: 'GROUP_ACCESS_DENIED', error: 'You do not have permission to manage this lesson group.' });
    }
    const lessonFamily = await matchingLessonFamily(pool, classId, subjectId, day, periodId);
    if (lessonFamily.selected.length < 2) {
      return res.status(404).json({ code: 'GROUP_NOT_FOUND', error: 'Split lesson group was not found.' });
    }
    const familyTimetableIds = lessonFamily.family.map(lesson => lesson.timetable_id);
    const representativeByIndex = lessonFamily.selected.map(lesson => lesson.timetable_id);
    const optionIndexByTimetableId = new Map();
    lessonFamily.familySlots.forEach(slot => {
      slot.forEach((lesson, index) => optionIndexByTimetableId.set(Number(lesson.timetable_id), index));
    });

    const [lessons] = await pool.query(`
      SELECT
        tt.timetable_id,
        tt.teacher_id,
        t.teacher_name,
        tt.room_id,
        r.room_name,
        0 AS assigned_count
      FROM timetable tt
      JOIN teacher t ON tt.teacher_id = t.teacher_id
      JOIN room r ON tt.room_id = r.room_id
      WHERE ${splitGroupWhere('tt')}
      GROUP BY tt.timetable_id, tt.teacher_id, t.teacher_name, tt.room_id, r.room_name
      ORDER BY t.teacher_name, r.room_name
    `, [classId, subjectId, day, periodId]);

    if (lessons.length < 2) {
      return res.status(404).json({ code: 'GROUP_NOT_FOUND', error: 'Split lesson group was not found.' });
    }

    const [students] = await pool.query(`
      SELECT
        st.student_id,
        st.student_ch_name AS student_name,
        st.student_eng_name AS english_name,
        st.class_number,
        sc.class_name,
        NULL AS assigned_timetable_id
      FROM student st
      JOIN class sc ON st.class_id = sc.class_id
      JOIN class selected_class ON selected_class.class_id = ?
      WHERE st.status = 'active'
        AND (
          st.class_id = selected_class.class_id
          OR FIND_IN_SET(REPLACE(sc.class_name, ' ', ''), ${normaliseClassListSql('selected_class')}) > 0
          OR REPLACE(selected_class.class_name, ' ', '') IN (sc.grade_level, REPLACE(sc.grade_level, 'F', 'S'))
        )
      ORDER BY sc.class_name, CAST(st.class_number AS UNSIGNED), st.class_number, st.student_ch_name
    `, [classId]);

    const [familyAssignments] = await pool.query(`
      SELECT slg.student_id, slg.timetable_id
      FROM student_lesson_group slg
      JOIN timetable tt ON slg.timetable_id = tt.timetable_id
      WHERE slg.timetable_id IN (?)
      ORDER BY slg.updated_at DESC
    `, [familyTimetableIds]);
    const assignmentByStudent = new Map();
    familyAssignments.forEach(assignment => {
      if (assignmentByStudent.has(assignment.student_id)) return;
      assignmentByStudent.set(
        assignment.student_id,
        representativeByIndex[optionIndexByTimetableId.get(Number(assignment.timetable_id))] || null
      );
    });
    students.forEach(student => {
      student.assigned_timetable_id = assignmentByStudent.get(student.student_id) || null;
    });
    lessons.forEach(lesson => {
      lesson.assigned_count = students.filter(student => Number(student.assigned_timetable_id) === Number(lesson.timetable_id)).length;
    });

    res.json({ lessons, students, occurrences: lessonFamily.family.length / lessonFamily.selected.length });
  } catch (err) {
    console.error('Failed to load split lesson group detail:', err);
    res.status(500).json({ code: 'DATABASE_ERROR', error: 'Failed to load split lesson group detail.' });
  }
}

export async function saveSplitLessonGroupAssignments(req, res) {
  const classId = Number(req.body.classId);
  const subjectId = Number(req.body.subjectId);
  const day = String(req.body.day || '');
  const periodId = Number(req.body.periodId);
  const assignments = Array.isArray(req.body.assignments) ? req.body.assignments : [];

  if (!classId || !subjectId || !day || !periodId) {
    return res.status(400).json({ code: 'INVALID_GROUP', error: 'Missing split lesson group parameters.' });
  }

  const conn = await pool.getConnection();

  try {
    await ensureLessonGroupSchema(conn);
    if (!(await canAccessLessonGroup(req.user, classId, subjectId, day, periodId))) {
      return res.status(403).json({ code: 'GROUP_ACCESS_DENIED', error: 'You do not have permission to manage this lesson group.' });
    }
    await conn.beginTransaction();

    const lessonFamily = await matchingLessonFamily(conn, classId, subjectId, day, periodId);
    const validTimetableIds = new Set(lessonFamily.selected.map(row => Number(row.timetable_id)));
    const familyTimetableIds = lessonFamily.family.map(row => Number(row.timetable_id));
    const selectedOptionById = new Map(
      lessonFamily.selected.map((row, index) => [Number(row.timetable_id), index])
    );

    if (validTimetableIds.size < 2) {
      await conn.rollback();
      return res.status(404).json({ code: 'GROUP_NOT_FOUND', error: 'Split lesson group was not found.' });
    }

    const studentIds = assignments
      .map(item => Number(item.student_id))
      .filter(Number.isFinite);

    if (studentIds.length) {
      await conn.query(
        'DELETE FROM student_lesson_group WHERE student_id IN (?) AND timetable_id IN (?)',
        [studentIds, familyTimetableIds]
      );
    }

    const values = assignments
      .map(item => ({
        studentId: Number(item.student_id),
        timetableId: Number(item.timetable_id)
      }))
      .filter(item => Number.isFinite(item.studentId) && validTimetableIds.has(item.timetableId))
      .flatMap(item => {
        const optionIndex = selectedOptionById.get(item.timetableId);
        return lessonFamily.familySlots
          .filter(slot => slot[optionIndex])
          .map(slot => [item.studentId, slot[optionIndex].timetable_id]);
      });

    if (values.length) {
      await conn.query(
        'INSERT INTO student_lesson_group (student_id, timetable_id) VALUES ?',
        [values]
      );
    }

    await conn.commit();
    res.json({
      code: 'ASSIGNMENTS_SAVED',
      message: 'Split lesson assignments saved across all matching lessons.',
      assignedRows: values.length,
      occurrenceCount: lessonFamily.family.length / lessonFamily.selected.length
    });
  } catch (err) {
    await conn.rollback();
    console.error('Failed to save split lesson assignments:', err);
    res.status(500).json({ code: 'DATABASE_ERROR', error: 'Failed to save split lesson assignments.' });
  } finally {
    conn.release();
  }
}

export async function addSplitLessonGroupTeacher(req, res) {
  const classId = Number(req.body.classId);
  const subjectId = Number(req.body.subjectId);
  const day = String(req.body.day || '');
  const periodId = Number(req.body.periodId);
  const teacherId = Number(req.body.teacherId);
  const roomId = Number(req.body.roomId);

  if (!classId || !subjectId || !day || !periodId || !teacherId || !roomId) {
    return res.status(400).json({ code: 'INVALID_GROUP_TEACHER', error: 'Missing lesson group, teacher, or room.' });
  }

  if (!(await canAddLessonGroupTeacher(req.user, subjectId))) {
    return res.status(403).json({ code: 'GROUP_TEACHER_ACCESS_DENIED', error: 'Only the subject head or a manager can add a teacher.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const lessonFamily = await matchingLessonFamily(conn, classId, subjectId, day, periodId);
    if (lessonFamily.selected.length < 2 || !lessonFamily.familySlots.length) {
      await conn.rollback();
      return res.status(404).json({ code: 'GROUP_NOT_FOUND', error: 'Split lesson group was not found.' });
    }
    const [teacherRows] = await conn.query(
      "SELECT teacher_id, teacher_name FROM teacher WHERE teacher_id = ? AND COALESCE(status, 'active') = 'active' LIMIT 1",
      [teacherId]
    );
    const [roomRows] = await conn.query('SELECT room_id, room_name FROM room WHERE room_id = ? LIMIT 1', [roomId]);
    const teacher = teacherRows[0];
    const room = roomRows[0];
    if (!teacher || !room) {
      await conn.rollback();
      return res.status(400).json({ code: 'INVALID_TEACHER_OR_ROOM', error: 'Teacher or room was not found.' });
    }

    const familySlots = lessonFamily.familySlots.map(slot => ({
      day: slot[0].day_of_week,
      periodId: Number(slot[0].period_id)
    }));
    const timetableSlotConditions = familySlots.map(() => '(tt.day_of_week = ? AND tt.period_id = ?)').join(' OR ');
    const slotParams = familySlots.flatMap(slot => [slot.day, slot.periodId]);

    const [existingGroupRows] = await conn.query(
      `SELECT tt.timetable_id FROM timetable tt
       WHERE tt.teacher_id = ? AND tt.class_id = ? AND tt.subject_id = ? AND (${timetableSlotConditions})
       LIMIT 1`,
      [teacherId, classId, subjectId, ...slotParams]
    );
    if (existingGroupRows.length) {
      await conn.rollback();
      return res.status(409).json({ code: 'TEACHER_ALREADY_IN_GROUP', error: 'This teacher is already in the lesson group.' });
    }

    const [busyRows] = await conn.query(
      `SELECT tt.day_of_week, p.period_name, c.class_name
       FROM timetable tt
       JOIN period p ON tt.period_id = p.period_id
       JOIN class c ON tt.class_id = c.class_id
       WHERE tt.teacher_id = ? AND (${timetableSlotConditions})
       LIMIT 1`,
      [teacherId, ...slotParams]
    );
    if (busyRows.length) {
      await conn.rollback();
      const conflict = busyRows[0];
      return res.status(409).json({
        code: 'TEACHER_NOT_AVAILABLE',
        error: `${teacher.teacher_name} already teaches ${conflict.class_name} at ${conflict.day_of_week} ${conflict.period_name}.`
      });
    }

    const [roomBusyRows] = await conn.query(
      `SELECT tt.day_of_week, p.period_name, c.class_name
       FROM timetable tt
       JOIN period p ON tt.period_id = p.period_id
       JOIN class c ON tt.class_id = c.class_id
       WHERE tt.room_id = ? AND (${timetableSlotConditions})
       LIMIT 1`,
      [roomId, ...slotParams]
    );
    if (roomBusyRows.length) {
      await conn.rollback();
      const conflict = roomBusyRows[0];
      return res.status(409).json({
        code: 'ROOM_NOT_AVAILABLE',
        error: `${room.room_name} is already used by ${conflict.class_name} at ${conflict.day_of_week} ${conflict.period_name}.`
      });
    }

    const values = familySlots.map(slot => [teacherId, subjectId, classId, roomId, slot.day, slot.periodId]);
    await conn.query(
      `INSERT INTO timetable (teacher_id, subject_id, class_id, room_id, day_of_week, period_id)
       VALUES ?`,
      [values]
    );
    await conn.commit();
    return res.status(201).json({
      code: 'GROUP_TEACHER_ADDED',
      message: `${teacher.teacher_name} added to ${values.length} matching lesson(s).`,
      teacher,
      room,
      occurrenceCount: values.length
    });
  } catch (err) {
    await conn.rollback();
    console.error('Failed to add split lesson group teacher:', err);
    if (err.code === 'ER_DUP_ENTRY' || err.errno === 1062) {
      return res.status(409).json({
        code: 'TEACHER_NOT_AVAILABLE',
        error: 'The selected teacher already has a lesson in one of these periods.'
      });
    }
    return res.status(500).json({ code: 'DATABASE_ERROR', error: 'Failed to add the teacher to the lesson group.' });
  } finally {
    conn.release();
  }
}

export async function deleteSplitLessonGroupTeacher(req, res) {
  const timetableId = Number(req.params.timetableId);
  const classId = Number(req.query.classId);
  const subjectId = Number(req.query.subjectId);
  const day = String(req.query.day || '');
  const periodId = Number(req.query.periodId);

  if (!timetableId || !classId || !subjectId || !day || !periodId) {
    return res.status(400).json({ code: 'INVALID_GROUP_TEACHER', error: 'Missing lesson group or teacher parameters.' });
  }
  if (!(await canAddLessonGroupTeacher(req.user, subjectId))) {
    return res.status(403).json({ code: 'GROUP_TEACHER_ACCESS_DENIED', error: 'Only the subject head or a manager can delete a teacher.' });
  }

  const conn = await pool.getConnection();
  try {
    await conn.beginTransaction();
    const lessonFamily = await matchingLessonFamily(conn, classId, subjectId, day, periodId);
    if (lessonFamily.selected.length < 2) {
      await conn.rollback();
      return res.status(404).json({ code: 'GROUP_NOT_FOUND', error: 'Split lesson group was not found.' });
    }
    if (lessonFamily.selected.length <= 2) {
      await conn.rollback();
      return res.status(409).json({ code: 'MINIMUM_GROUPS_REQUIRED', error: 'A split lesson must keep at least two teachers.' });
    }

    const target = lessonFamily.selected.find(lesson => Number(lesson.timetable_id) === timetableId);
    if (!target) {
      await conn.rollback();
      return res.status(404).json({ code: 'GROUP_TEACHER_NOT_FOUND', error: 'The selected teacher group was not found.' });
    }

    const targetTimetableIds = lessonFamily.family
      .filter(lesson => Number(lesson.teacher_id) === Number(target.teacher_id) && Number(lesson.room_id) === Number(target.room_id))
      .map(lesson => Number(lesson.timetable_id));
    if (!targetTimetableIds.length) {
      await conn.rollback();
      return res.status(404).json({ code: 'GROUP_TEACHER_NOT_FOUND', error: 'The selected teacher group was not found.' });
    }

    const [[assignmentCountRows]] = await conn.query(
      'SELECT COUNT(DISTINCT student_id) AS student_count FROM student_lesson_group WHERE timetable_id IN (?)',
      [targetTimetableIds]
    );
    await conn.query('DELETE FROM student_lesson_group WHERE timetable_id IN (?)', [targetTimetableIds]);
    await conn.query('DELETE FROM timetable WHERE timetable_id IN (?)', [targetTimetableIds]);
    await conn.commit();
    return res.json({
      code: 'GROUP_TEACHER_DELETED',
      message: `${target.teacher_name} removed from ${targetTimetableIds.length} matching lesson(s).`,
      deletedLessons: targetTimetableIds.length,
      unassignedStudents: Number(assignmentCountRows?.student_count || 0)
    });
  } catch (err) {
    await conn.rollback();
    console.error('Failed to delete split lesson group teacher:', err);
    return res.status(500).json({ code: 'DATABASE_ERROR', error: 'Failed to delete the teacher from the lesson group.' });
  } finally {
    conn.release();
  }
}
