import { randomUUID } from 'node:crypto';
import express from 'express';
import multer from 'multer';
import fs from 'node:fs/promises';
import db from '../db.js';
import { ensureSession } from '../auth/auth.js';
import { requirePermission, ensurePermissionsColumn } from '../auth/permissions.js';
import { parseTeacherRoster, ensureTeacherRosterSchema, validateTeacherRoster } from '../utils/teacherRoster.js';
import { withImportJob, setImportTotal, setImportProcessed } from '../utils/importJobs.js';

const router = express.Router();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 10 * 1024 * 1024 } });
router.use(ensureSession, requirePermission('manageUsers'));

router.post('/preview', upload.single('file'), async (req, res) => {
  try {
    if (!req.file || !/\.(xlsx|xls|csv)$/i.test(req.file.originalname)) return res.status(400).json({ message: '請上傳老師名單 Excel 或 CSV。' });
    await ensureTeacherRosterSchema(db);
    const records = parseTeacherRoster(await fs.readFile(req.file.path));
    if (!records.length) return res.status(400).json({ message: '找不到老師名單欄位，需有 UserLogin 或 TeacherCode，以及 EnglishName 或 ChineseName。' });
    if (records.length > 2000) return res.status(400).json({ message: '每次最多匯入 2000 位老師。' });
    return res.json(await validateTeacherRoster(db, records, req.user));
  } catch (error) { return res.status(500).json({ message: error.message }); }
  finally { if (req.file) await fs.unlink(req.file.path).catch(() => {}); }
});

router.post('/validate', async (req, res) => {
  try {
    if (!Array.isArray(req.body.records) || !req.body.records.length || req.body.records.length > 2000) return res.status(400).json({ message: '請提供 1 至 2000 筆老師資料。' });
    await ensureTeacherRosterSchema(db);
    return res.json(await validateTeacherRoster(db, req.body.records, req.user));
  } catch (error) { return res.status(500).json({ message: error.message }); }
});

router.post('/save', withImportJob(async (req, res) => {
  let conn;
  let locked = false;
  try {
    if (!Array.isArray(req.body.records) || !req.body.records.length || req.body.records.length > 2000) return res.status(400).json({ message: '請提供 1 至 2000 筆老師資料。' });
    await setImportTotal(req, req.body.records.length);
    await ensureTeacherRosterSchema(db);
    await ensurePermissionsColumn();
    conn = await db.getConnection();
    const [[lock]] = await conn.query("SELECT GET_LOCK('school_teacher_roster_import', 5) AS acquired");
    if (Number(lock.acquired) !== 1) return res.status(409).json({ message: '另一個老師名單匯入正在進行，請稍後再試。' });
    locked = true;
    await conn.beginTransaction();
    const preview = await validateTeacherRoster(conn, req.body.records, req.user, true);
    if (preview.hasErrors) {
      await conn.rollback();
      return res.status(422).json({ message: '配對或電郵有衝突，請修正預覽後再匯入。', ...preview });
    }
    let createdTeachers = 0;
    let updatedTeachers = 0;
    let createdAccounts = 0;
    let withoutAccounts = 0;
    let processed = 0;
    for (const row of preview.records) {
      const name = row.english_name || row.chinese_name;
      let teacherId = row.teacher_id;
      if (teacherId) {
        await conn.query('UPDATE teacher SET teacher_name=?,source_login=COALESCE(?,source_login),english_name=COALESCE(?,english_name),chinese_name=COALESCE(?,chinese_name) WHERE teacher_id=?',
          [name, row.source_login || null, row.english_name || null, row.chinese_name || null, teacherId]);
        updatedTeachers += 1;
      } else {
        const [insert] = await conn.query('INSERT INTO teacher (teacher_code,teacher_name,source_login,english_name,chinese_name) VALUES (?,?,?,?,?)',
          [row.teacher_code || `STAFF-${randomUUID()}`, name, row.source_login || null, row.english_name || null, row.chinese_name || null]);
        teacherId = insert.insertId;
        createdTeachers += 1;
      }
      let userId = row.user_id;
      if (!userId && row.email) {
        const [insert] = await conn.query("INSERT INTO user (user_name,email,password,role) VALUES (?,?,NULL,'teacher')", [name, row.email]);
        userId = insert.insertId;
        createdAccounts += 1;
      }
      if (userId) {
        await conn.query('UPDATE teacher SET user_id=? WHERE teacher_id=?', [userId, teacherId]);
        // Preserve existing role, permissions, password and Google identity.
        await conn.query('UPDATE user SET user_name=? WHERE user_id=?', [name, userId]);
      } else withoutAccounts += 1;
      processed += 1;
      await setImportProcessed(req, processed);
    }
    await conn.commit();
    return res.json({ message: '老師名單導入完成。', totalRows: processed, createdTeachers, updatedTeachers, createdAccounts, withoutAccounts });
  } catch (error) {
    if (conn) await conn.rollback();
    return res.status(409).json({ message: ['ER_DUP_ENTRY', 'ER_LOCK_DEADLOCK'].includes(error.code)
      ? '資料已被其他操作修改，請重新驗證預覽。' : error.message });
  } finally {
    if (locked) await conn.query("SELECT RELEASE_LOCK('school_teacher_roster_import')").catch(() => {});
    if (conn) conn.release();
  }
}));
export default router;
