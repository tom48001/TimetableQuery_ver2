export function subjectHeadIds(user) {
  let value = user.subject_head_subject_ids;
  if (typeof value === 'string') {
    try { value = JSON.parse(value); } catch { value = []; }
  }
  if (value == null) value = user.subject_head_subject_id ? [user.subject_head_subject_id] : [];
  if (!Array.isArray(value)) return [];
  return [...new Set(value.map(Number).filter(id => Number.isSafeInteger(id) && id > 0))];
}

export async function validateHeadSubjects(db, ids) {
  if (!ids.length) return false;
  const [rows] = await db.query('SELECT subject_id FROM subject WHERE subject_id IN (?)', [ids]);
  return rows.length === ids.length;
}

export async function resolveHeadSubjectIds(user, resolve) {
  const groups = await Promise.all(subjectHeadIds(user).map(id => resolve(id)));
  return [...new Set(groups.flat().map(Number))];
}
