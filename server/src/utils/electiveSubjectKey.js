import { parseElectiveSubjectCode } from './subjectCanonicalKey.js';

// Roster labels and timetable abbreviations describe the same elective.
// C/E are retained in stored data; the elective overview groups both media.
const aliases = new Map(Object.entries({
  '中國文學': 'CLIT', '中國歷史': 'CHIS', '歷史': 'HIST',
  '地理': 'GEOG', '化學': 'CHEM', '物理': 'PHY', '生物': 'BIO',
  '經濟': 'ECON', '視覺藝術': 'VAD', 'VA': 'VAD',
  '企業、會計與財務概論': 'BAFS', '資訊及通訊科技': 'ICT',
  '健康管理與社會關懷': 'HMSC', '主題學習課程': 'TLC',
  '日語': 'JAP', '西式食品製作(APL)': 'WCU',
  'M1': 'MATH(M1)', '數學延伸單元一': 'MATH(M1)'
}));

export function electiveSubjectKey(subject = {}) {
  const code = parseElectiveSubjectCode(subject.import_name || subject.subject_name).subjectCode
    .toUpperCase().replace(/（/g, '(').replace(/）/g, ')')
    .replace(/\s+/g, '').replace(/\((?:C|E)\)$/i, '');
  return aliases.get(code) || code;
}
