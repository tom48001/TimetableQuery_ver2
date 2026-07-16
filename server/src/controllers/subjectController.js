import db from '../db.js';
import { ensureStudentAdminSchema } from './manageStudentController.js';

const SUBJECT_ALIAS_GROUPS = [
  ['PHY', 'PHYSICS', '物理'],
  ['CHEM', 'CHEMISTRY', '化學'],
  ['BIO', 'BIOLOGY', '生物'],
  ['ECON', 'ECONOMICS', '經濟'],
  ['ICT', 'INFORMATIONANDCOMMUNICATIONTECHNOLOGY', '資訊及通訊科技'],
  ['JAP', 'JAPANESE', '日語'],
  ['CLIT', 'CHINESELITERATURE', '中國文學'],
  ['CHIST', 'CHINESEHISTORY', '中國歷史'],
  ['GEOG', 'GEOGRAPHY', '地理'],
  ['HIST', 'HISTORY', '歷史'],
  ['MATHM1', 'MATH(M1)', 'MATHEMATICSM1', '數學延伸單元一', '數學M1'],
  ['BAFS', 'BUSINESSACCOUNTINGANDFINANCIALSTUDIES', '企業、會計與財務概論'],
  ['HMSC', 'HEALTHMANAGEMENTANDSOCIALCARE', '健康管理與社會關懷'],
  ['VA', 'VISUALARTS', '視覺藝術'],
  ['TL', 'TECHNOLOGYANDLIVING', '科技與生活'],
  ['SPANISH', '西班牙語'],
  ['STEM'],
  ['APL']
];

const SUBJECT_ALIAS_MAP = new Map();
SUBJECT_ALIAS_GROUPS.forEach(group => {
  const canonical = group[0];
  group.forEach(alias => SUBJECT_ALIAS_MAP.set(normalizeSubjectKey(alias), canonical));
});

const normaliseClassListSql = `
  REPLACE(
    REPLACE(
      REPLACE(
        REPLACE(
          REPLACE(ttc.class_name, '#', ''),
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

function normalizeSubjectKey(value) {
  return String(value || '')
    .trim()
    .toUpperCase()
    .replace(/[\s\-_/／，,、.]/g, '');
}

function subjectCanonicalKey(subject) {
  const candidates = [
    subject.subject_name,
    subject.subject_name_zh,
    subject.subject_name_en
  ].map(normalizeSubjectKey).filter(Boolean);

  for (const candidate of candidates) {
    if (SUBJECT_ALIAS_MAP.has(candidate)) return SUBJECT_ALIAS_MAP.get(candidate);
  }

  return candidates[0] || String(subject.subject_id || '');
}

function sortSubjectRows(rows) {
  return rows.sort((a, b) =>
    String(a.subject_name_zh || a.subject_name || '').localeCompare(
      String(b.subject_name_zh || b.subject_name || ''),
      'zh-Hant',
      { sensitivity: 'base' }
    )
  );
}

async function electiveSubjectRows() {
  const [rows] = await db.query(`
    SELECT DISTINCT
      sub.subject_id,
      sub.subject_name,
      sub.subject_name_zh,
      sub.subject_name_en,
      sub.is_elective
    FROM subject sub
    LEFT JOIN student st
      ON sub.subject_id IN (st.x1_subject_id, st.x2_subject_id, st.x3_subject_id)
     AND st.status = 'active'
    WHERE sub.is_elective = TRUE
       OR st.student_id IS NOT NULL
    ORDER BY sub.subject_name
  `);

  const grouped = new Map();
  rows.forEach(row => {
    const key = subjectCanonicalKey(row);
    const existing = grouped.get(key);
    if (!existing) {
      grouped.set(key, { ...row, alias_subject_ids: [row.subject_id] });
      return;
    }

    existing.alias_subject_ids.push(row.subject_id);
    if (!existing.subject_name_zh && row.subject_name_zh) existing.subject_name_zh = row.subject_name_zh;
    if (!existing.subject_name_en && row.subject_name_en) existing.subject_name_en = row.subject_name_en;
    if (String(existing.subject_name || '').length > String(row.subject_name || '').length) {
      existing.subject_name = row.subject_name;
      existing.subject_id = row.subject_id;
    }
  });

  return sortSubjectRows(Array.from(grouped.values()));
}

async function resolveSubjectIds(subjectId) {
  const [selectedRows] = await db.query(
    'SELECT subject_id, subject_name, subject_name_zh, subject_name_en FROM subject WHERE subject_id = ?',
    [subjectId]
  );

  if (!selectedRows.length) return [];

  const selectedKey = subjectCanonicalKey(selectedRows[0]);
  const [allRows] = await db.query(
    'SELECT subject_id, subject_name, subject_name_zh, subject_name_en FROM subject'
  );

  return allRows
    .filter(row => subjectCanonicalKey(row) === selectedKey)
    .map(row => row.subject_id);
}

export const getElectives = async (req, res) => {
  try {
    const { subject } = req.body;
    const subjectIds = await resolveSubjectIds(subject);
    if (!subjectIds.length) {
      return res.status(404).json({ error: 'Subject not found.' });
    }

    const [rows] = await db.query(
      `SELECT subject_id, subject_name, subject_name_zh, subject_name_en
       FROM subject
       WHERE subject_id IN (?)
       ORDER BY
         CASE WHEN subject_name_zh IS NOT NULL AND subject_name_zh <> '' THEN 0 ELSE 1 END,
         LENGTH(subject_name),
         subject_name
       LIMIT 1`,
      [subjectIds]
    );

    res.json({ ...rows[0], alias_subject_ids: subjectIds });
  } catch (error) {
    console.error('Failed to load elective subject:', error);
    res.status(500).json({ error: 'Failed to load elective subject.' });
  }
};

export const getElectiveSubjectOptions = async (req, res) => {
  try {
    const rows = await electiveSubjectRows();
    res.json(rows);
  } catch (error) {
    console.error('Error fetching elective subjects:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getStudentElectives = async (req, res) => {
  const { form, subject } = req.body;
  if (!form || !subject) {
    return res.status(400).json({ error: 'Please provide form and subject.' });
  }

  try {
    await ensureStudentAdminSchema();
    const subjectIds = await resolveSubjectIds(subject);

    if (!subjectIds.length) {
      return res.status(404).json({ error: 'Subject not found.' });
    }

    const [rows] = await db.query(
      `
      SELECT
        c.class_name,
        c.grade_level,
        s.student_id,
        s.class_number,
        s.student_ch_name,
        s.student_eng_name,
        s.sex,
        tt.timetable_id,
        tt.day_of_week,
        p.period_name,
        p.period_id,
        t.teacher_name,
        r.room_name,
        ttc.class_name AS timetable_class_name,
        sub.subject_name
      FROM student s
      JOIN class c ON s.class_id = c.class_id
      LEFT JOIN (
        timetable tt
        JOIN class ttc ON tt.class_id = ttc.class_id
      )
        ON tt.subject_id IN (?)
       AND (
          tt.class_id = s.class_id
          OR FIND_IN_SET(REPLACE(c.class_name, ' ', ''), ${normaliseClassListSql}) > 0
          OR REPLACE(ttc.class_name, ' ', '') IN (?, ?)
       )
      LEFT JOIN period p ON tt.period_id = p.period_id
      LEFT JOIN teacher t ON tt.teacher_id = t.teacher_id
      LEFT JOIN room r ON tt.room_id = r.room_id
      LEFT JOIN subject sub ON tt.subject_id = sub.subject_id
      WHERE c.grade_level = ?
        AND s.status = 'active'
        AND (
          s.x1_subject_id IN (?)
          OR s.x2_subject_id IN (?)
          OR s.x3_subject_id IN (?)
        )
      ORDER BY
        CAST(LEFT(c.class_name, 1) AS UNSIGNED),
        FIELD(SUBSTRING(c.class_name, 2, 1), 'M', 'A', 'R', 'Y'),
        c.class_name,
        CAST(s.class_number AS UNSIGNED),
        s.class_number,
        tt.day_of_week,
        p.period_id
      `,
      [subjectIds, form, form.replace('F', 'S'), form, subjectIds, subjectIds, subjectIds]
    );

    res.json(rows);
  } catch (err) {
    console.error('Failed to load elective students:', err);
    res.status(500).json({ error: 'Failed to load elective students.' });
  }
};
