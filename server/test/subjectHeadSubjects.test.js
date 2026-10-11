import test from 'node:test';
import assert from 'node:assert/strict';
import { subjectHeadIds, resolveHeadSubjectIds, validateHeadSubjects } from '../src/utils/subjectHeadSubjects.js';

test('multiple subjects roundtrip and legacy single subject remains supported', () => {
  assert.deepEqual(subjectHeadIds({ subject_head_subject_id: 7 }), [7]);
  assert.deepEqual(subjectHeadIds({ subject_head_subject_ids: JSON.stringify([7, 8, 7]) }), [7, 8]);
  assert.deepEqual(subjectHeadIds({ subject_head_subject_ids: [], subject_head_subject_id: 7 }), []);
  assert.deepEqual(subjectHeadIds({ subject_head_subject_ids: 'invalid' }), []);
});
test('permissions combine only assigned subject families', async () => {
  const ids = await resolveHeadSubjectIds({ subject_head_subject_ids: [7, 8] }, async id => ({ 7: [7, 17], 8: [8, 18] })[id]);
  assert.deepEqual(ids, [7, 17, 8, 18]);
  assert.equal(ids.includes(9), false);
  assert.deepEqual(await resolveHeadSubjectIds({ subject_head_subject_ids: [8] }, async id => [id]), [8]);
});
test('reject nonexistent or empty managed subjects', async () => {
  const db = { query: async () => [[{ subject_id: 7 }]] };
  assert.equal(await validateHeadSubjects(db, []), false);
  assert.equal(await validateHeadSubjects(db, [7, 8]), false);
  assert.equal(await validateHeadSubjects(db, [7]), true);
});
