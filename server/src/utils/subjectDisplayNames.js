import { parseElectiveSubjectCode } from './subjectCanonicalKey.js';

// RS and CL remain unchanged until their school-specific names are confirmed.
const chineseNames = {
  CS: '公民與社會發展', CES: '公民、經濟與社會', RE: '宗教教育', 'E&RE': '倫理與宗教',
  SCJ: '綜合科學', SCJB: '綜合科學', SCJC: '綜合科學', TLC: '主題學習', WCU: '西式食品製作',
  CHIN: '中國語文', ENG: '英國語文', MATH: '數學', CHIS: '中國歷史',
  HIST: '歷史', GEOG: '地理', BIO: '生物', CHEM: '化學', PHY: '物理',
  CLIT: '中國文學', ECON: '經濟', MUS: '音樂', PE: '體育', PTH: '普通話',
  ICT: '資訊及通訊科技', BAFS: '企業、會計與財務概論', STEM: '科學、科技、工程及數學',
  VA: '視覺藝術', VAD: '視覺藝術', TL: '科技與生活',
  HMSC: '健康管理與社會關懷', JAP: '日語', 'MATH(M1)': '數學延伸單元一'
};
export function defaultChineseSubjectName(code) {
  if (/^SUPP[12]$/i.test(parseElectiveSubjectCode(code).subjectCode)) return '退選';
  return chineseNames[parseElectiveSubjectCode(code).subjectCode.toUpperCase()] || null;
}
export async function fillChineseSubjectNames(db) {
  const [subjects] = await db.query("SELECT subject_id,import_name,subject_name FROM subject WHERE subject_name_zh IS NULL OR TRIM(subject_name_zh)=''");
  for (const subject of subjects) {
    const name = defaultChineseSubjectName(subject.import_name || subject.subject_name);
    if (name) await db.query("UPDATE subject SET subject_name_zh=? WHERE subject_id=? AND (subject_name_zh IS NULL OR TRIM(subject_name_zh)='')", [name, subject.subject_id]);
  }
}
