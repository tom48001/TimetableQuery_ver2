import express from "express";
import multer from "multer";
import xlsx from "xlsx";
import fs from "fs";
import pool from "../db.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

/**
 * day_of_week 正規化
 * Excel 可接受：Mon / Monday / 1
 */
const dayMap = {
  monday: 1, mon: 1,
  tuesday: 2, tue: 2,
  wednesday: 3, wed: 3,
  thursday: 4, thu: 4,
  friday: 5, fri: 5,
  saturday: 6, sat: 6,
  sunday: 7, sun: 7,
};

function normalizeDay(day) {
  if (!day) return null;
  if (typeof day === "number") return day;
  const key = day.toString().trim().toLowerCase();
  return dayMap[key] || null;
}

/**
 * =========================================
 * POST /api/import/excel
 * 方案 D：只匯入 Timetable（老師必須已存在）
 * =========================================
 */
router.post("/excel", upload.single("file"), async (req, res) => {
  console.log("🔥 IMPORT TIMETABLE (FINAL)");

  const conn = await pool.getConnection();

  try {
    if (!req.file) {
      return res.status(400).json({ message: "未收到 Excel 檔案" });
    }

    const workbook = xlsx.readFile(req.file.path);
    if (!workbook.SheetNames.includes("Timetable")) {
      return res.status(400).json({
        message: "Excel 必須包含 Timetable 工作表",
      });
    }

    const timetableSheet = workbook.Sheets["Timetable"];
    const rows = xlsx.utils.sheet_to_json(timetableSheet);

    /**
     * (A) 清空 staging
     */
    await conn.query("TRUNCATE TABLE staging_timetable");

// ==============================
// (B) 寫入 staging（最終正式版）
// ==============================

// subject 縮寫對照表（依你學校實際情況可再加）
const subjectAliasMap = {
  ENG: "英國語文",
  MATH: "數學",
  BIO: "生物",
};

// period 轉換：P1 → Period 1
function normalizePeriod(p) {
  if (!p) return null;
  const raw = p.toString().trim().toUpperCase();
  if (raw.startsWith("P")) {
    const num = raw.substring(1);
    if (!isNaN(num)) return `Period ${num}`;
  }
  return p.toString().trim();
}

for (const row of rows) {
  const teacherCode = row.teacher;
  const subjectRaw  = row.subject;
  const className   = row.class;
  const roomName    = row.room;
  const dayRaw      = row.day;
  const periodRaw   = row.period;

  // 必要欄位檢查
  if (!teacherCode || !subjectRaw || !className || !roomName || !periodRaw) {
    continue;
  }

  const dayNum = normalizeDay(dayRaw);
  if (!dayNum) continue;

  // subject 轉換（ENG → 英國語文）
  const subjectName =
    subjectAliasMap[subjectRaw.toString().trim().toUpperCase()] ||
    subjectRaw.toString().trim();

  // period 轉換（P1 → Period 1）
  const periodName = normalizePeriod(periodRaw);

  await conn.query(
    `
    INSERT INTO staging_timetable
      (teacher_code, subject, class, room, day_of_week, period)
    VALUES (?, ?, ?, ?, ?, ?)
    `,
    [
      teacherCode.toString().trim(),
      subjectName,
      className.toString().trim(),
      roomName.toString().trim(),
      dayNum,
      periodName,
    ]
  );
}

const [missingSubjects] = await conn.query(`
  SELECT DISTINCT st.subject
  FROM staging_timetable st
  LEFT JOIN subject s
    ON TRIM(st.subject) = TRIM(s.subject_name)
  WHERE s.subject_id IS NULL
`);

const [missingClasses] = await conn.query(`
  SELECT DISTINCT st.class
  FROM staging_timetable st
  LEFT JOIN class c
    ON TRIM(st.class) = TRIM(c.class_name)
  WHERE c.class_id IS NULL
`);

const [missingRooms] = await conn.query(`
  SELECT DISTINCT st.room
  FROM staging_timetable st
  LEFT JOIN room r
    ON TRIM(st.room) = TRIM(r.room_name)
  WHERE r.room_id IS NULL
`);

    /**
     * (D) 驗證 teacher_code（老師必須已存在）
     */
    const [missingTeachers] = await conn.query(`
      SELECT DISTINCT st.teacher_code
      FROM staging_timetable st
      LEFT JOIN teacher t ON st.teacher_code = t.teacher_code
      WHERE t.teacher_id IS NULL
    `);

    if (missingTeachers.length) {
      return res.status(400).json({
        message: "匯入失敗：以下老師尚未建立帳號",
        missingTeachers: missingTeachers.map(r => r.teacher_code),
      });
    }

    /**
     * (E) 刪除舊 timetable（只刪本次影響的時段）
     */
    const [deleteResult] = await conn.query(`
      TRUNCATE TABLE timetable
    `);

    /**
     * (F) 插入新 timetable
     */
    const [insertResult] = await conn.query(`
      INSERT INTO timetable
        (teacher_id, subject_id, class_id, room_id, day_of_week, period_id)
      SELECT
        t.teacher_id,
        s.subject_id,
        c.class_id,
        r.room_id,
        st.day_of_week,
        p.period_id
      FROM staging_timetable st
      JOIN teacher t ON st.teacher_code = t.teacher_code
      JOIN subject s ON st.subject = s.subject_name
      JOIN class c ON st.class = c.class_name
      JOIN room r ON st.room = r.room_name
      JOIN period p ON st.period = p.period_name
    `);

    /**
     * (G) 紀錄匯入歷史
     */
    await conn.query(
      "INSERT INTO import_schedule (file_name) VALUES (?)",
      [req.file.originalname]
    );

    /**
     * (H) 成功回傳
     */
    res.json({
      message: "匯入成功（Timetable 已更新）",
      deletedTimetable: deleteResult.affectedRows,
      insertedTimetable: insertResult.affectedRows,
    });

  } catch (err) {
    console.error("Import error:", err);
    res.status(500).json({
      message: err.message || "匯入失敗",
    });
  } finally {
    if (req.file) fs.unlink(req.file.path, () => {});
    conn.release();
  }
});

export default router;
