import { electiveSubjectKey } from './electiveSubjectKey.js';
import { parseElectiveSubjectCode } from './subjectCanonicalKey.js';

const blaElectives = new Set(['BIO', 'ECON', 'MATH(M1)']);
const blaNames = {
  BIO: ['生物', 'Biology'],
  ECON: ['經濟', 'Economics'],
  'MATH(M1)': ['數學延伸單元一', 'Mathematics Extended Module 1']
};

export function isBlaNominationSubject(subject) {
  if ((subject.is_nominatable != null && subject.is_nominatable !== '' && Number(subject.is_nominatable) === 0) || /^(SUPP|Career_Planning$|班主任課$)/i.test(subject.subject_name || '')) return false;
  const elective = Boolean(subject.block) || Number(subject.is_elective) === 1 ||
    Boolean(parseElectiveSubjectCode(subject.import_name || subject.subject_name).electiveGroup);
  return !elective || blaElectives.has(electiveSubjectKey(subject));
}

export function nominationSubjectKey(subject) {
  const key = electiveSubjectKey(subject);
  return ['SCJ', 'SCJB', 'SCJC'].includes(key) ? 'SCJ' : key;
}
export function groupNominationSubjects(subjects) {
  const groups = new Map();
  for (const subject of [...subjects].sort((a,b) => a.subject_id - b.subject_id)) {
    const key = nominationSubjectKey(subject);
    if (!groups.has(key)) groups.set(key, {
      ...subject, block: null, alias_subject_ids: [],
      ...(blaNames[key] ? { subject_name: key, subject_name_zh: blaNames[key][0], subject_name_en: blaNames[key][1] } : {})
    });
    const group = groups.get(key);
    group.alias_subject_ids.push(Number(subject.subject_id));
    if (!group.subject_name_zh && subject.subject_name_zh) group.subject_name_zh = subject.subject_name_zh;
  }
  return [...groups.values()];
}
export async function nominationSubjectGroup(db, id) {
  const [subjects] = await db.query('SELECT * FROM subject');
  return groupNominationSubjects(subjects).find(group => group.alias_subject_ids.includes(Number(id)));
}
