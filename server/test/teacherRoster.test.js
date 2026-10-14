import test from 'node:test';
import assert from 'node:assert/strict';
import xlsx from 'xlsx';
import { parseTeacherRoster, validateTeacherRoster, teacherNumber, exactNameCandidates } from '../src/utils/teacherRoster.js';

test('exact names normalize case and whitespace but not partial or ambiguous names', () => {
  const teachers = [
    { teacher_id: 1, teacher_name: 'CHAN   TAI MAN', chinese_name: '陳大文' },
    { teacher_id: 2, teacher_name: 'Chan Tai Ming', chinese_name: '陳大明' }
  ];
  assert.deepEqual(exactNameCandidates({ english_name: '  chan tai man ' }, teachers).map(t => t.teacher_id), [1]);
  assert.equal(exactNameCandidates({ english_name: 'Chan Tai' }, teachers).length, 0);
  assert.equal(exactNameCandidates({ english_name: 'Chan Tai Man', chinese_name: '陳大明' }, teachers).length, 2);
  assert.equal(exactNameCandidates({ chinese_name: '陳大文' }, [...teachers, { teacher_id: 3, teacher_name: '陳大文' }]).length, 2);
});

test('automatic email matching takes precedence and ambiguous names remain unresolved', async () => {
  const teacher = { teacher_id: 1, teacher_code: '甲', teacher_name: 'Teacher', user_id: 9, linked_email: 'one@example.test', linked_role: 'teacher' };
  const db = { query: async sql => {
    if (sql.includes('JOIN user u ON u.user_id=t.user_id WHERE u.email=')) return [[teacher]];
    if (sql.includes('WHERE t.teacher_code=')) return [[teacher]];
    if (sql.includes('SELECT u.user_id')) return [[{ user_id: 9, teacher_id: 1 }]];
    return [[]];
  } };
  const result = await validateTeacherRoster(db, [{ english_name: 'Renamed', email: 'one@example.test' }], { role: 'manager' });
  assert.equal(result.hasErrors, false);
  assert.equal(result.records[0].matchMethod, '電郵自動配對');
  const ambiguousDb = { query: async sql => sql.startsWith('SELECT teacher_id,teacher_code,teacher_name')
    ? [[teacher, { ...teacher, teacher_id: 2, teacher_code: '乙' }]] : [[]] };
  const ambiguous = await validateTeacherRoster(ambiguousDb, [{ english_name: 'Teacher' }], { role: 'manager' });
  assert.equal(ambiguous.hasErrors, true);
  assert.equal(ambiguous.records[0].teacher_code, '');
});

test('teacher numbers are stable padded database IDs and do not truncate after 999', () => {
  assert.equal(teacherNumber(1), '001');
  assert.equal(teacherNumber(73), '073');
  assert.equal(teacherNumber(1000), '1000');
  assert.equal(teacherNumber(null), null);
});

test('saved login mapping is reused and conflicting reassignment is rejected', async () => {
  const teacher = { teacher_id: 7, teacher_code: '志', source_login: 'abc', user_id: null };
  const db = { query: async sql => sql.includes('WHERE source_login=') || sql.includes('WHERE t.teacher_code=') ? [[teacher]] : [[]] };
  const row = { source_login: 'abc', english_name: 'Teacher', teacher_code: '' };
  const reused = await validateTeacherRoster(db, [row], { role: 'manager' });
  assert.equal(reused.hasErrors, false);
  assert.equal(reused.records[0].teacher_code, '志');
  assert.equal(reused.records[0].teacher_number, '007');
  assert.equal(reused.records[0].mappingReused, true);
  const conflict = await validateTeacherRoster(db, [{ ...row, teacher_code: '另' }], { role: 'manager' });
  assert.equal(conflict.hasErrors, true);
  const duplicate = await validateTeacherRoster(db, [row, row], { role: 'manager' });
  assert.equal(duplicate.hasErrors, true);
});

test('roster accepts supplied headers but never treats UserLogin as timetable code', () => {
  const book = xlsx.utils.book_new();
  xlsx.utils.book_append_sheet(book, xlsx.utils.aoa_to_sheet([
    ['老師名單'], ['UserLogin', 'UserEmail', 'EnglishName', 'ChineseName'],
    ['abc', 'ABC@example.test', 'Test Teacher', '測試老師'], ['', '', '', '']
  ]), 'Roster');
  const rows = parseTeacherRoster(xlsx.write(book, { type: 'buffer', bookType: 'xlsx' }));
  assert.equal(rows.length, 1);
  assert.equal(rows[0].teacher_code, '');
  assert.equal(rows[0].source_login, 'abc');
  assert.equal(rows[0].email, 'abc@example.test');
  assert.equal(rows[0].chinese_name, '測試老師');
  assert.equal(rows[0].row, 3);
});

test('preview blocks missing mappings, duplicate codes/emails and allows no-account rows', async () => {
  const db = { query: async () => [[]] };
  const row = { teacher_code: 'A', english_name: 'Teacher', email: '' };
  const missing = await validateTeacherRoster(db, [{ ...row, teacher_code: '' }], { role: 'manager' });
  assert.equal(missing.hasErrors, true);
  const duplicate = await validateTeacherRoster(db, [row, { ...row, teacher_code: 'a' }], { role: 'manager' });
  assert.equal(duplicate.hasErrors, true);
  assert.ok(duplicate.records.every(record => record.errors.length));
  const emails = await validateTeacherRoster(db, [{ ...row, email: 'one@example.test' }, { ...row, teacher_code: 'B', email: 'ONE@example.test' }], { role: 'manager' });
  assert.equal(emails.hasErrors, true);
  const valid = await validateTeacherRoster(db, [row], { role: 'manager' });
  assert.equal(valid.hasErrors, false);
  assert.equal(valid.records[0].accountStatus, '未建立帳戶');
});

test('unmatched staff with a stable login can import without timetable codes or email', async () => {
  const db = { query: async () => [[]] };
  const row = { source_login: 'staff1', english_name: 'Office Staff' };
  const result = await validateTeacherRoster(db, [row], { role: 'manager' });
  assert.equal(result.hasErrors, false);
  assert.equal(result.records[0].teacher_id, null);
  assert.equal(result.records[0].accountStatus, '未建立帳戶');
  assert.equal((await validateTeacherRoster(db, [row, row], { role: 'manager' })).hasErrors, true);
});
