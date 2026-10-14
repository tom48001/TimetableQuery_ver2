import { electiveSubjectKey } from './electiveSubjectKey.js';

export function nominationSubjectKey(subject) {
  const key = electiveSubjectKey(subject);
  return ['SCJ', 'SCJB', 'SCJC'].includes(key) ? 'SCJ' : key;
}
export function groupNominationSubjects(subjects) {
  const groups = new Map();
  for (const subject of [...subjects].sort((a,b) => a.subject_id - b.subject_id)) {
    const key = nominationSubjectKey(subject);
    if (!groups.has(key)) groups.set(key, { ...subject, block: null, alias_subject_ids: [] });
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
