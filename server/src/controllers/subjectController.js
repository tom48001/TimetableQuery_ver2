import db from '../db.js';

export const getElectives = async (req, res) => {
  try {
    const { subject } = req.body;
    const [electineName] = await db.query(
      `SELECT subject_name
      FROM subject
      WHERE subject_id = ?`,
      [subject]
    );
    res.json({ subject_name: electineName[0].subject_name });
    console.log('取得選修課程名字:', { subject_name: electineName[0].subject_name });
  } catch (error) {
    console.error('取得選修課程名字失敗:', error);
    res.status(500).json({ error: '伺服器錯誤' });
  }
}

export const getStudentElectives = async (req, res) => {
  const { form, subject } = req.body;
  if (!form || !subject) {
    return res.status(400).json({ error: '請提拱年級與選修 ID' });
  }

  try{
    const [rows] = await db.query(
      `SELECT 
         c.class_name,
         s.student_id,
         s.class_number,
         s.student_ch_name,
         s.student_eng_name,
         s.sex
       FROM student s
       JOIN student_subject ss ON s.student_id = ss.student_id
       JOIN class c ON s.class_id = c.class_id
       WHERE ss.subject_id = ?
         AND c.grade_level = ?`,
      [subject, form]
    );    
    res.json(rows)
    console.log('取得選修課程:', rows);
  }
  catch (err) {
    console.error('取得選修課程失敗:', err);
    res.status(500).json({ error: '伺服器錯誤' });
  }
}