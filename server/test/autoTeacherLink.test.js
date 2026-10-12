import test from 'node:test';
import assert from 'node:assert/strict';
import { autoLinkTeacherAccount } from '../src/utils/teacherAccountLink.js';
for (const [label, linked, matches, writes] of [
  ['existing identity', [{ teacher_id: 1 }], [], 0],
  ['unique match', [], [{ teacher_id: 2, user_id: null }], 2],
  ['ambiguous names', [], [{ teacher_id: 2, user_id: null }, { teacher_id: 3, user_id: null }], 0],
  ['claimed teacher', [], [{ teacher_id: 2, user_id: 9 }], 0],
  ['no match', [], [], 0]
]) test(label, async () => {
  let changed = 0;
  const conn = { query: async sql => {
    if (sql.startsWith('UPDATE')) { changed++; return [{}]; }
    if (sql.includes('SELECT user_name')) return [[{ user_name: 'Teacher' }]];
    if (sql.includes('OR teacher_id')) return [matches];
    if (sql.includes('LOWER')) return [matches];
    return [linked];
  } };
  await autoLinkTeacherAccount(conn, 1);
  assert.equal(changed, writes);
});
