import { nominationSubjectGroup, groupNominationSubjects } from '../utils/nominationSubjects.js';
import { loadNominationEligibility } from '../utils/nominationEligibility.js';
import { ensureStudentAdminSchema } from './manageStudentController.js';
import pool from '../db.js';

export const insertBLA = async (req, res) => {
  try {
    const { subject_id, student_ids } = req.body;
    const teacher_id = req.user.teacher_id;
    if (!subject_id || !Array.isArray(student_ids)) {
      return res.status(400).json({ error: '缺少必要資料或 student_ids 不是陣列' });
    }

    // student_ids 為空就直接回成功，不插入
    if (student_ids.length === 0) {
      return res.json({ message: '沒有需要插入的資料', inserted: 0 });
    }
    await ensureStudentAdminSchema();
    const group = await nominationSubjectGroup(pool, subject_id);
    if (!group) return res.status(404).json({ error: '科目不存在' });
    const eligible = await loadNominationEligibility(pool);
    const allowed = new Set(eligible.filter(row => Number(row.subject_id) === Number(group.subject_id)).map(row => Number(row.student_id)));
    if (student_ids.some(id => !allowed.has(Number(id)))) {
      return res.status(422).json({ error: '部分學生未修讀此科目，請重新載入科目及班別後再提名。' });
    }
    // 避免重複插入
    const [existing] = await pool.query('SELECT student_id FROM BLA WHERE teacher_id=? AND subject_id IN (?)', [teacher_id, group.alias_subject_ids]);
    const already = new Set(existing.map(row => Number(row.student_id)));
    const values = [...new Set(student_ids.map(Number))].filter(id => !already.has(id)).map(id => [teacher_id, id, group.subject_id]);
    if (!values.length) return res.json({ message: '提名已存在', inserted: 0 });
    await pool.query(
      `INSERT IGNORE INTO BLA (teacher_id, student_id, subject_id) VALUES ${values.map(() => '(?)').join(',')}`,
      values
    );


    res.json({ message: '批量插入成功', inserted: values.length });
  } catch (error) {
    console.error('批量插入失敗:', error);
    res.status(500).json({ error: '批量插入失敗', detail: error.message });
  }
};

export const getVotedStudents = async (req, res) => {
  try {
    const { subject_id } = req.params;
    const teacher_id = req.user.teacher_id;

    const group = await nominationSubjectGroup(pool, subject_id);
    const [rows] = await pool.query(
      `SELECT DISTINCT student_id FROM BLA WHERE subject_id IN (?) AND teacher_id = ?`,
      [group?.alias_subject_ids || [subject_id], teacher_id]
    );

    res.json(rows.map(r => r.student_id));
  } catch (error) {
    res.status(500).json({ error: '取得已投票學生失敗', detail: error.message });
  }
};

export const deleteBLA = async (req, res) => {
  const { subjectId, removed } = req.body;
  const teacherId = req.user.teacher_id;

  if (!subjectId || !Array.isArray(removed)) {
    return res.status(400).json({ message: '缺少必要參數' });
  }

  try {
    if (removed.length > 0) {
      const placeholders = removed.map(() => '?').join(',');
      const sql = `
        DELETE FROM BLA
        WHERE subject_id IN (?) AND teacher_id = ?
        AND student_id IN (${placeholders})
      `;
      const group = await nominationSubjectGroup(pool, subjectId);
      await pool.query(sql, [group?.alias_subject_ids || [subjectId], teacherId, ...removed]);
    }

    res.json({ message: '刪除成功' });
  } catch (err) {
    console.error('刪除失敗:', err);
    res.status(500).json({ message: '刪除失敗', detail: err.message });
  }
};


export const getBLAResults = async (req, res) => {
  try {
    const [subjects] = await pool.query('SELECT * FROM subject');
    const groups = groupNominationSubjects(subjects);
    const byId = new Map(groups.flatMap(group => group.alias_subject_ids.map(id => [id, group])));
    const [nominations] = await pool.query(
      `SELECT b.student_id,b.subject_id,c.class_name,s.student_ch_name,s.student_eng_name
       FROM BLA b JOIN student s ON b.student_id=s.student_id
       JOIN class c ON c.class_id=s.class_id
       ORDER BY c.class_name,CAST(s.class_number AS UNSIGNED),s.student_id`
    );
    const students = new Map();
    for (const row of nominations) {
      const group = byId.get(Number(row.subject_id));
      if (!group) continue;
      if (!students.has(row.student_id)) students.set(row.student_id, { ...row, subjects: new Map() });
      students.get(row.student_id).subjects.set(group.subject_id, group);
    }
    const rows = [...students.values()].map(row => {
      const subjects = [...row.subjects.values()].sort((a,b) => a.subject_id-b.subject_id);
      return { ...row, subjects, subject_names: subjects.map(s=>s.subject_name_zh || s.subject_name).join('、'),
        subject_ids: subjects.map(s=>s.subject_id).join(','), subject_count: subjects.length, award: subjects.length >= 8 ? '獲獎' : '' };
    });

    res.json(rows);
  } catch (error) {
    console.error("查詢提名結果失敗:", error);
    res.status(500).json({ error: "查詢提名結果失敗" });
  }
};

export const getSelectBLA = async (req, res) => {
  try {
    const { subject_id } = req.query;
    const teacher_id = req.user.teacher_id;

    if (!subject_id) {
      return res.status(400).json({ error: "缺少必要參數" });
    }

    const group = await nominationSubjectGroup(pool, subject_id);
    const [rows] = await pool.query(
      `
      SELECT DISTINCT b.student_id
      FROM BLA b
      WHERE b.subject_id IN (?) AND b.teacher_id = ?
      `,
      [group?.alias_subject_ids || [subject_id], teacher_id]
    );

    res.json(rows);
  } catch (error) {
    console.error("查詢提名結果失敗:", error);
    res.status(500).json({ error: "查詢提名結果失敗" });
  }
};
