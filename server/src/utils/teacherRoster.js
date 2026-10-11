import xlsx from 'xlsx';
import { googleDomain, isGoogleEmailAllowed } from './googleAccess.js';

const text = value => String(value ?? '').trim();
const header = value => text(value).toLowerCase().replace(/[\s_-]/g, '');
// MySQL already allocates teacher_id atomically. Format that stable identity,
// rather than allocating another sequence or changing the timetable code.
export function teacherNumber(id) {
  return id === null || id === undefined ? null : String(id).padStart(3, '0');
}
export function normalizedTeacherName(value) {
  return text(value).replace(/\s+/g, ' ').toUpperCase();
}

export function exactNameCandidates(row, teachers) {
  const names = [row.english_name, row.chinese_name].map(normalizedTeacherName).filter(Boolean);
  return teachers.filter(teacher => [teacher.english_name, teacher.chinese_name, teacher.teacher_name]
    .some(name => name && names.includes(normalizedTeacherName(name))));
}
const aliases = {
  teacher_code: ['teachercode', 'abbreviation', '老師代號', '教師代號'],
  source_login: ['userlogin', 'login', '登入名稱'],
  email: ['useremail', 'email', '電郵'],
  english_name: ['englishname', 'teachername', '英文姓名', '姓名'],
  chinese_name: ['chinesename', '中文姓名']
};

export function normalizeRoster(records) {
  return records.map((record, index) => ({
    row: Number(record.row) || index + 2,
    sheet: text(record.sheet),
    teacher_code: text(record.teacher_code).toUpperCase(),
    source_login: text(record.source_login),
    email: text(record.email).toLowerCase(),
    english_name: text(record.english_name),
    chinese_name: text(record.chinese_name)
  }));
}

export function parseTeacherRoster(buffer) {
  const workbook = xlsx.read(buffer, { type: 'buffer' });
  const records = [];
  for (const sheet of workbook.SheetNames) {
    const matrix = xlsx.utils.sheet_to_json(workbook.Sheets[sheet], { header: 1, defval: '', raw: false });
    const headerIndex = matrix.findIndex((row, index) => index < 20
      && row.some(value => [...aliases.english_name, ...aliases.chinese_name].includes(header(value)))
      && row.some(value => [...aliases.source_login, ...aliases.teacher_code].includes(header(value))));
    if (headerIndex < 0) continue;
    const columns = Object.fromEntries(Object.entries(aliases).map(([key, names]) => [key, matrix[headerIndex].findIndex(value => names.includes(header(value)))]));
    matrix.slice(headerIndex + 1).forEach((row, index) => {
      const record = Object.fromEntries(Object.entries(columns).map(([key, column]) => [key, column < 0 ? '' : text(row[column])]));
      if (Object.values(record).some(Boolean)) records.push({ ...record, sheet, row: headerIndex + index + 2 });
    });
  }
  // UserLogin is not a timetable code. Validation resolves saved mappings,
  // linked emails and unique exact names; unmatched staff can be created.
  return normalizeRoster(records);
}

let schemaPromise;
export function ensureTeacherRosterSchema(db) {
  if (!schemaPromise) schemaPromise = (async () => {
    for (const column of ['source_login', 'english_name', 'chinese_name']) {
      try { await db.query(`ALTER TABLE teacher ADD COLUMN ${column} VARCHAR(255) NULL`); }
      catch (error) { if (error.code !== 'ER_DUP_FIELDNAME') throw error; }
    }
  })().catch(error => { schemaPromise = null; throw error; });
  return schemaPromise;
}

export async function validateTeacherRoster(db, input, actor, lock = false) {
  const records = normalizeRoster(input);
  let nameTeachers;
  for (const row of records) {
    row.mappingErrors = [];
    row.mappingReused = false;
    row.matchMethod = row.teacher_code ? '已選擇老師' : '';
    const [matches] = row.source_login ? await db.query(`SELECT teacher_id,teacher_code FROM teacher WHERE source_login=?${lock ? ' FOR UPDATE' : ''}`, [row.source_login]) : [[]];
    if (matches.length > 1) row.mappingErrors.push('UserLogin 對應多位老師，請先在資料庫修正重複配對。');
    else if (matches.length === 1) {
      if (row.teacher_code && row.teacher_code !== String(matches[0].teacher_code).toUpperCase()) {
        row.mappingErrors.push('UserLogin 已配對另一老師代號，不能在匯入時覆寫。');
      } else {
        row.teacher_code = String(matches[0].teacher_code).toUpperCase();
        row.mappingReused = true;
        row.matchMethod = '已保存的 UserLogin 配對';
      }
    }
    if (row.teacher_code || row.mappingErrors.length) continue;
    const [emailMatches] = row.email ? await db.query(`SELECT t.teacher_id,t.teacher_code
      FROM teacher t JOIN user u ON u.user_id=t.user_id WHERE u.email=?${lock ? ' FOR UPDATE' : ''}`, [row.email]) : [[]];
    if (emailMatches.length > 1) {
      row.mappingErrors.push('電郵對應多位老師，請確認配對。');
      continue;
    }
    if (emailMatches.length === 1) {
      row.teacher_code = String(emailMatches[0].teacher_code || '').toUpperCase();
      row.matchMethod = '電郵自動配對';
      continue;
    }
    if (!nameTeachers) {
      [nameTeachers] = await db.query(`SELECT teacher_id,teacher_code,teacher_name,english_name,chinese_name FROM teacher${lock ? ' FOR UPDATE' : ''}`);
    }
    const nameMatches = exactNameCandidates(row, nameTeachers);
    if (nameMatches.length === 1) {
      row.teacher_code = String(nameMatches[0].teacher_code || '').toUpperCase();
      row.matchMethod = '姓名自動配對';
    } else if (nameMatches.length > 1) {
      row.mappingErrors.push('姓名對應多位人員或中英文姓名配對不一致，請修正名單或在使用者管理核對資料。');
    }
  }
  const frequency = key => records.reduce((map, row) => {
    const value = row[key].toUpperCase();
    if (value) map.set(value, (map.get(value) || 0) + 1);
    return map;
  }, new Map());
  const codes = frequency('teacher_code');
  const emails = frequency('email');
  const logins = frequency('source_login');
  const matchedTeachers = new Set();
  const matchedAccounts = new Set();
  for (const row of records) {
    row.errors = row.mappingErrors;
    delete row.mappingErrors;
    row.warnings = [];
    const name = row.english_name || row.chinese_name;
    if (row.teacher_code.length > 50) row.errors.push('老師代號過長。');
    if (!row.teacher_code && !row.source_login) row.errors.push('新的人員請提供 UserLogin，供日後重匯識別。');
    if (!name || name.length > 100) row.errors.push('姓名必須為 1 至 100 字元。');
    if (row.chinese_name.length > 255 || row.source_login.length > 255) row.errors.push('中文姓名或 UserLogin 過長。');
    if (codes.get(row.teacher_code.toUpperCase()) > 1) row.errors.push('老師代號重複，請修正配對。');
    if (row.source_login && logins.get(row.source_login.toUpperCase()) > 1) row.errors.push('UserLogin 在名單中重複。');
    if (row.email && (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(row.email) || row.email.length > 255)) row.errors.push('電郵格式不正確。');
    if (row.email && emails.get(row.email.toUpperCase()) > 1) row.errors.push('電郵在名單中重複。');
    const [teachers] = row.teacher_code ? await db.query(`SELECT t.*, u.email AS linked_email, u.role AS linked_role
      FROM teacher t LEFT JOIN user u ON u.user_id=t.user_id WHERE t.teacher_code=?${lock ? ' FOR UPDATE' : ''}`, [row.teacher_code]) : [[]];
    const teacher = teachers[0];
    if (teacher?.source_login && row.source_login && teacher.source_login.toUpperCase() !== row.source_login.toUpperCase()) row.errors.push('此老師已配對另一 UserLogin，請先核對身份。');
    const [accounts] = row.email ? await db.query(`SELECT u.user_id,u.role,t.teacher_id FROM user u
      LEFT JOIN teacher t ON t.user_id=u.user_id WHERE u.email=?${lock ? ' FOR UPDATE' : ''}`, [row.email]) : [[]];
    const account = accounts[0];
    if (teacher && matchedTeachers.has(String(teacher.teacher_id))) row.errors.push('多筆資料配對到同一位老師，請修正代號。');
    if (account && matchedAccounts.has(String(account.user_id))) row.errors.push('多筆資料配對到同一帳戶，請修正電郵。');
    if (teacher) matchedTeachers.add(String(teacher.teacher_id));
    if (account) matchedAccounts.add(String(account.user_id));
    if (teacher?.user_id && row.email && teacher.linked_email.toLowerCase() !== row.email) row.errors.push('此老師已連結另一電郵，請先在使用者管理核對。');
    if (account?.teacher_id && String(account.teacher_id) !== String(teacher?.teacher_id)) row.errors.push('此電郵已連結另一位老師。');
    if (actor.role !== 'manager' && (teacher?.linked_role === 'manager' || account?.role === 'manager')) row.errors.push('只有管理員可修改管理員帳戶的老師資料。');
    row.teacher_id = teacher?.teacher_id || null;
    row.teacher_number = teacherNumber(row.teacher_id);
    row.user_id = teacher?.user_id || account?.user_id || null;
    row.action = teacher ? '更新老師' : '新增老師';
    row.accountStatus = teacher?.user_id ? '已有帳戶' : (row.email ? (account ? '連結已有帳戶' : '建立 Teacher 帳戶') : '未建立帳戶');
    const domain = googleDomain();
    if (row.email && !isGoogleEmailAllowed(row.email)) row.warnings.push(`目前 Google 登入只允許 @${domain} 或已指定的管理員電郵，此電郵需先調整登入設定才可登入。`);
  }
  return { records, totalRows: records.length, hasErrors: !records.length || records.some(row => row.errors.length) };
}
