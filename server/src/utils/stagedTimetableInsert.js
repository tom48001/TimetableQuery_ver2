// Resolves staged timetable rows to database IDs and inserts them into the
// timetable table. Dimension values are matched on trimmed, case-insensitive
// equality — the same rule as the SQL TRIM() joins this replaces. Resolution
// happens in memory: the old TRIM()-wrapped SQL joins defeated every index
// and degenerated into multi-minute nested full scans, and CREATE TEMPORARY
// TABLE (the obvious SQL fix) needs a privilege the documented application
// account does not have. Rows the maps cannot resolve fall back to the exact
// per-row TRIM() lookup, so behaviour only ever matches the old semantics.
const DIMENSIONS = [
  { table: 'teacher', key: 'teacher_id', column: 'teacher_code', stagingColumn: 'teacher_code' },
  { table: 'subject', key: 'subject_id', column: 'import_name', stagingColumn: 'subject' },
  { table: 'class', key: 'class_id', column: 'class_name', stagingColumn: 'class' },
  { table: 'room', key: 'room_id', column: 'room_name', stagingColumn: 'room' },
  { table: 'period', key: 'period_id', column: 'period_name', stagingColumn: 'period' }
];

function chunks(values, size) {
  const result = [];
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

function buildLookup(rows) {
  const exact = new Map();
  const upper = new Map();
  for (const row of rows) {
    const value = String(row.value ?? '').trim();
    if (!exact.has(value)) exact.set(value, row.id);
    const folded = value.toUpperCase();
    if (!upper.has(folded)) upper.set(folded, row.id);
  }
  return value => {
    const trimmed = String(value ?? '').trim();
    if (exact.has(trimmed)) return exact.get(trimmed);
    return upper.get(trimmed.toUpperCase()) ?? null;
  };
}

async function resolveRowBySql(conn, stagingId) {
  const [rows] = await conn.query(`
    SELECT t.teacher_id, s.subject_id, c.class_id, r.room_id, p.period_id
    FROM staging_timetable st
    JOIN teacher t ON TRIM(st.teacher_code) = TRIM(t.teacher_code)
    JOIN subject s ON TRIM(st.subject) = TRIM(s.import_name)
    JOIN class c ON TRIM(st.class) = TRIM(c.class_name)
    JOIN room r ON TRIM(st.room) = TRIM(r.room_name)
    JOIN period p ON TRIM(st.period) = TRIM(p.period_name)
    WHERE st.staging_timetable_id = ?
  `, [stagingId]);
  return rows[0] || null;
}

export async function insertStagedTimetableBatches(conn, stagedIds, batchSize = 500, onBatch = () => {}) {
  if (!stagedIds.length) return 0;

  await conn.query(`
    UPDATE staging_timetable
    SET teacher_code = TRIM(teacher_code),
        subject = TRIM(subject),
        \`class\` = TRIM(\`class\`),
        room = TRIM(room),
        period = TRIM(period)
  `);

  const lookups = {};
  for (const dimension of DIMENSIONS) {
    const [rows] = await conn.query(
      `SELECT ${dimension.key} AS id, TRIM(${dimension.column}) AS value FROM ${dimension.table}`
    );
    lookups[dimension.table] = buildLookup(rows);
  }

  let affectedRows = 0;
  for (const batch of chunks(stagedIds, batchSize)) {
    const ids = batch.map(row => row.staging_timetable_id);
    const [staged] = await conn.query(`
      SELECT staging_timetable_id, teacher_code, subject, \`class\`, room, period, day_of_week
      FROM staging_timetable
      WHERE staging_timetable_id IN (?)
    `, [ids]);

    const values = [];
    for (const row of staged) {
      const teacherId = lookups.teacher(row.teacher_code);
      const subjectId = lookups.subject(row.subject);
      const classId = lookups.class(row.class);
      const roomId = lookups.room(row.room);
      const periodId = lookups.period(row.period);
      if (teacherId === null || subjectId === null || classId === null || roomId === null || periodId === null) {
        const resolved = await resolveRowBySql(conn, row.staging_timetable_id);
        if (resolved) {
          values.push([resolved.teacher_id, resolved.subject_id, resolved.class_id, resolved.room_id, row.day_of_week, resolved.period_id]);
        }
        continue;
      }
      values.push([teacherId, subjectId, classId, roomId, row.day_of_week, periodId]);
    }

    if (values.length) {
      const [result] = await conn.query(
        'INSERT INTO timetable (teacher_id, subject_id, class_id, room_id, day_of_week, period_id) VALUES ?',
        [values]
      );
      affectedRows += result.affectedRows;
    }
    await onBatch(batch.length);
  }
  return affectedRows;
}

// Legacy ver1 databases enforce one lesson per room per slot. Real timetables
// legitimately share a room (co-teaching, co-form-teachers), so ver2 enforces
// one lesson per TEACHER per slot instead. Migrate the constraint once, after
// verifying the existing rows satisfy it.
let timetableSchemaPromise;
export function ensureTimetableImportSchema(conn) {
  if (!timetableSchemaPromise) timetableSchemaPromise = (async () => {
    const [indexes] = await conn.query(`
      SELECT INDEX_NAME, MAX(COLUMN_NAME = 'teacher_id') AS has_teacher, MAX(COLUMN_NAME = 'room_id') AS has_room
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'timetable' AND NON_UNIQUE = 0 AND INDEX_NAME <> 'PRIMARY'
      GROUP BY INDEX_NAME
    `);
    const teacherSlotExists = indexes.some(index => Number(index.has_teacher) === 1);
    const legacyRoomIndexes = indexes.filter(index => Number(index.has_room) === 1);

    if (teacherSlotExists && !legacyRoomIndexes.length) return;

    if (!teacherSlotExists) {
      const [violations] = await conn.query(`
        SELECT teacher_id, day_of_week, period_id, COUNT(*) AS lessons
        FROM timetable GROUP BY teacher_id, day_of_week, period_id HAVING lessons > 1
      `);
      if (violations.length) {
        throw new Error(
          'Timetable data has a teacher booked twice in the same slot; remove the duplicate rows before importing. ' +
          violations.slice(0, 5).map(v => `teacher ${v.teacher_id} ${v.day_of_week} period ${v.period_id} ×${v.lessons}`).join('; ')
        );
      }
    }

    for (const index of legacyRoomIndexes) {
      // The legacy foreign key on room_id still needs an index after the
      // unique one goes; give it a plain one first.
      await conn.query('ALTER TABLE timetable ADD INDEX idx_timetable_room (room_id)');
      await conn.query(`ALTER TABLE timetable DROP INDEX \`${index.INDEX_NAME}\``);
    }
    if (!teacherSlotExists) {
      await conn.query('ALTER TABLE timetable ADD UNIQUE KEY unique_teacher_slot (teacher_id, day_of_week, period_id)');
    }
  })().catch(error => { timetableSchemaPromise = null; throw error; });
  return timetableSchemaPromise;
}
