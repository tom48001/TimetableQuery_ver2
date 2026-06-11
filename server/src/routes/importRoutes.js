import express from "express";
import multer from "multer";
import xlsx from "xlsx";
import fs from "fs";
import pool from "../db.js";
import { ensureJWT } from "../auth/auth.js";
import { requirePermission } from "../auth/permissions.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

const REQUIRED_COLUMNS = ["teacher", "subject", "class", "room", "day", "period"];

const dayMap = {
  "1": "Mon",
  "2": "Tue",
  "3": "Wed",
  "4": "Thu",
  "5": "Fri",
  "6": "Sat",
  monday: "Mon",
  mon: "Mon",
  tuesday: "Tue",
  tue: "Tue",
  wednesday: "Wed",
  wed: "Wed",
  thursday: "Thu",
  thu: "Thu",
  friday: "Fri",
  fri: "Fri",
  saturday: "Sat",
  sat: "Sat",
};

const subjectAliasMap = {
  ENG: "English",
  MATH: "Mathematics",
  MATHS: "Mathematics",
  BIO: "Biology",
};

function normalizeDay(day) {
  if (day === undefined || day === null || day === "") return null;
  return dayMap[day.toString().trim().toLowerCase()] || null;
}

function normalizePeriod(period) {
  if (period === undefined || period === null || period === "") return null;

  const raw = period.toString().trim();
  const upper = raw.toUpperCase();

  if (/^P\d+$/.test(upper)) {
    return `Period ${upper.substring(1)}`;
  }

  if (/^\d+$/.test(upper)) {
    return `Period ${upper}`;
  }

  return raw;
}

function normalizeSubject(subject) {
  const raw = subject.toString().trim();
  return subjectAliasMap[raw.toUpperCase()] || raw;
}

function formatMissing(rows, key) {
  return rows.map(row => row[key]).filter(Boolean);
}

router.post(
  "/excel",
  ensureJWT,
  requirePermission("importTimetable"),
  upload.single("file"),
  async (req, res) => {
    const conn = await pool.getConnection();

    try {
      if (!req.file) {
        return res.status(400).json({ message: "未收到 Excel 檔案" });
      }

      const workbook = xlsx.readFile(req.file.path);
      if (!workbook.SheetNames.includes("Timetable")) {
        return res.status(400).json({
          message: "Excel 必須包含名為 Timetable 的工作表",
          expectedSheet: "Timetable",
        });
      }

      const rows = xlsx.utils.sheet_to_json(workbook.Sheets.Timetable, { defval: "" });
      if (rows.length === 0) {
        return res.status(400).json({ message: "Timetable 工作表沒有資料" });
      }

      const columns = Object.keys(rows[0]).map(column => column.trim());
      const missingColumns = REQUIRED_COLUMNS.filter(column => !columns.includes(column));
      if (missingColumns.length) {
        return res.status(400).json({
          message: "Excel 欄位不完整",
          requiredColumns: REQUIRED_COLUMNS,
          missingColumns,
        });
      }

      await conn.beginTransaction();
      await conn.query("TRUNCATE TABLE staging_timetable");

      const invalidRows = [];
      let insertedStagingRows = 0;

      for (const [index, row] of rows.entries()) {
        const rowNumber = index + 2;
        const teacherCode = row.teacher?.toString().trim();
        const subject = row.subject ? normalizeSubject(row.subject) : null;
        const className = row.class?.toString().trim();
        const roomName = row.room?.toString().trim();
        const day = normalizeDay(row.day);
        const period = normalizePeriod(row.period);

        if (!teacherCode || !subject || !className || !roomName || !day || !period) {
          invalidRows.push({
            row: rowNumber,
            teacher: row.teacher,
            subject: row.subject,
            class: row.class,
            room: row.room,
            day: row.day,
            period: row.period,
          });
          continue;
        }

        await conn.query(
          `
          INSERT INTO staging_timetable
            (teacher_code, subject, class, room, day_of_week, period)
          VALUES (?, ?, ?, ?, ?, ?)
          `,
          [teacherCode, subject, className, roomName, day, period]
        );
        insertedStagingRows += 1;
      }

      if (insertedStagingRows === 0) {
        await conn.rollback();
        return res.status(400).json({
          message: "沒有可匯入的有效資料列",
          invalidRows,
        });
      }

      const [missingTeachers] = await conn.query(`
        SELECT DISTINCT st.teacher_code
        FROM staging_timetable st
        LEFT JOIN teacher t ON TRIM(st.teacher_code) = TRIM(t.teacher_code)
        WHERE t.teacher_id IS NULL
      `);

      const [missingSubjects] = await conn.query(`
        SELECT DISTINCT st.subject
        FROM staging_timetable st
        LEFT JOIN subject s ON TRIM(st.subject) = TRIM(s.subject_name)
        WHERE s.subject_id IS NULL
      `);

      const [missingClasses] = await conn.query(`
        SELECT DISTINCT st.class
        FROM staging_timetable st
        LEFT JOIN class c ON TRIM(st.class) = TRIM(c.class_name)
        WHERE c.class_id IS NULL
      `);

      const [missingRooms] = await conn.query(`
        SELECT DISTINCT st.room
        FROM staging_timetable st
        LEFT JOIN room r ON TRIM(st.room) = TRIM(r.room_name)
        WHERE r.room_id IS NULL
      `);

      const [missingPeriods] = await conn.query(`
        SELECT DISTINCT st.period
        FROM staging_timetable st
        LEFT JOIN period p ON TRIM(st.period) = TRIM(p.period_name)
        WHERE p.period_id IS NULL
      `);

      const importErrors = {
        missingTeachers: formatMissing(missingTeachers, "teacher_code"),
        missingSubjects: formatMissing(missingSubjects, "subject"),
        missingClasses: formatMissing(missingClasses, "class"),
        missingRooms: formatMissing(missingRooms, "room"),
        missingPeriods: formatMissing(missingPeriods, "period"),
        invalidRows,
      };

      const hasImportErrors = Object.values(importErrors).some(value => value.length > 0);
      if (hasImportErrors) {
        await conn.rollback();
        return res.status(400).json({
          message: "匯入失敗，請先修正 Excel 或資料庫資料",
          ...importErrors,
        });
      }

      await conn.query("TRUNCATE TABLE timetable");

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
        JOIN teacher t ON TRIM(st.teacher_code) = TRIM(t.teacher_code)
        JOIN subject s ON TRIM(st.subject) = TRIM(s.subject_name)
        JOIN class c ON TRIM(st.class) = TRIM(c.class_name)
        JOIN room r ON TRIM(st.room) = TRIM(r.room_name)
        JOIN period p ON TRIM(st.period) = TRIM(p.period_name)
      `);

      await conn.query(
        "INSERT INTO import_schedule (file_name) VALUES (?)",
        [req.file.originalname]
      );

      await conn.commit();

      res.json({
        message: "匯入成功，timetable 已更新",
        insertedTimetable: insertResult.affectedRows,
        skippedRows: invalidRows.length,
      });
    } catch (err) {
      await conn.rollback();
      console.error("Import error:", err);
      res.status(500).json({
        message: err.message || "匯入失敗",
      });
    } finally {
      if (req.file) fs.unlink(req.file.path, () => {});
      conn.release();
    }
  }
);

export default router;
