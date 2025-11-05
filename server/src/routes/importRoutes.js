import express from "express";
import multer from "multer";
import xlsx from "xlsx";
import pool from "../db.js";

const router = express.Router();
const upload = multer({ dest: "uploads/" });

// 匯入 Excel (Teachers + Timetable)
router.post("/excel", upload.single("file"), async (req, res) => {
  console.log("=== 匯入 Excel API 觸發 ===");

  const conn = await pool.getConnection();
  try {
    if (!req.file) {
      return res.status(400).json({ message: "未收到檔案" });
    }

    console.log("收到檔案：", req.file.originalname);

    const workbook = xlsx.readFile(req.file.path);
    const sheetNames = workbook.SheetNames;
    console.log("工作表名稱：", sheetNames);

    // ========= (A) 匯入 Teachers =========
    if (sheetNames.includes("Teachers")) {
      const teachersSheet = workbook.Sheets["Teachers"];
      const teachers = xlsx.utils.sheet_to_json(teachersSheet);
      console.log(`讀取 Teachers 共 ${teachers.length} 筆`);

      await conn.query("TRUNCATE TABLE staging_teacher");

      for (let row of teachers) {
        if (!row.teacher_code) continue;
        await conn.query(
          "INSERT INTO staging_teacher (teacher_code, teacher_name, email) VALUES (?, ?, ?)",
          [row.teacher_code, row.teacher_name, row.email]
        );
      }

      // 新增老師
      await conn.query(`
        INSERT INTO teacher (user_id, teacher_code, teacher_name, status)
        SELECT u.user_id, s.teacher_code, s.teacher_name, 'active'
        FROM staging_teacher s
        JOIN user u ON s.email = u.email
        LEFT JOIN teacher t ON s.teacher_code = t.teacher_code
        WHERE t.teacher_code IS NULL
      `);

      // 更新老師
      await conn.query(`
        UPDATE teacher t
        JOIN staging_teacher s ON t.teacher_code = s.teacher_code
        SET t.teacher_name = s.teacher_name,
            t.status = 'active'
      `);

      // 標記離職
      await conn.query(`
        UPDATE teacher t
        LEFT JOIN staging_teacher s ON t.teacher_code = s.teacher_code
        SET t.status = 'inactive'
        WHERE s.teacher_code IS NULL
      `);
    }

    // ========= (B) 匯入 Timetable =========
    if (sheetNames.includes("Timetable")) {
      const timetableSheet = workbook.Sheets["Timetable"];
      const timetable = xlsx.utils.sheet_to_json(timetableSheet);
      console.log(`📚 讀取 Timetable 共 ${timetable.length} 筆`);

      await conn.query("TRUNCATE TABLE staging_timetable");

      for (let row of timetable) {
        if (!row.teacher_code || !row.subject) continue;
        await conn.query(
          "INSERT INTO staging_timetable (teacher_code, subject, class, room, day_of_week, period) VALUES (?, ?, ?, ?, ?, ?)",
          [
            row.teacher_code,
            row.subject,
            row.class,
            row.room,
            row.day_of_week,
            row.period,
          ]
        );
      }

      // Step 1: 刪除 timetable 入面舊堂 (同一老師 + 星期 + period)
await conn.query(`
  CREATE TEMPORARY TABLE tmp_delete_ids
  SELECT tt.timetable_id
  FROM timetable tt
  JOIN teacher t ON tt.teacher_id = t.teacher_id
  WHERE NOT EXISTS (
    SELECT 1
    FROM staging_timetable st
    JOIN period p ON st.period = p.period_name
    WHERE st.teacher_code = t.teacher_code
      AND st.day_of_week = tt.day_of_week
      AND p.period_id = tt.period_id
  );
`);

      await conn.query(`
        DELETE FROM timetable
        WHERE timetable_id IN (SELECT timetable_id FROM tmp_delete_ids);
      `);

      await conn.query(`DROP TEMPORARY TABLE tmp_delete_ids;`);

      // Step 2: 插入 staging 堂
      await conn.query(`
  INSERT INTO timetable (teacher_id, subject_id, class_id, room_id, day_of_week, period_id)
  SELECT t.teacher_id, ssub.subject_id, c.class_id, r.room_id, st.day_of_week, p.period_id
  FROM staging_timetable st
  JOIN teacher t ON st.teacher_code = t.teacher_code
  JOIN subject ssub ON st.subject = ssub.subject_name
  JOIN class c ON st.class = c.class_name
  JOIN room r ON st.room = r.room_name
  JOIN period p ON st.period = p.period_name
  ON DUPLICATE KEY UPDATE
    subject_id = VALUES(subject_id),
    class_id = VALUES(class_id),
    room_id = VALUES(room_id),
    teacher_id = VALUES(teacher_id);
`);
    }

    // ========= (C) 匯入紀錄 =========
    await conn.query(
      "INSERT INTO import_schedule (file_name) VALUES (?)",
      [req.file.originalname]
    );

    // ========= (D) 統計結果 =========
    const [[added]] = await conn.query("SELECT COUNT(*) AS count FROM staging_teacher");
    const [[updated]] = await conn.query("SELECT COUNT(*) AS count FROM teacher WHERE status = 'active'");
    const [[inactive]] = await conn.query("SELECT COUNT(*) AS count FROM teacher WHERE status = 'inactive'");

    console.log(`匯入完成：新增 ${added.count}，更新 ${updated.count}，標記離職 ${inactive.count}`);

    // ========= (E) 回傳結果 =========
    res.json({
      message: "匯入成功",
      added: added.count,
      updated: updated.count,
      inactive: inactive.count,
    });
  } catch (err) {
    console.error("Import error:", err);
    res.status(500).json({
      message: err.message || "匯入失敗（未知原因）",
    });
  } finally {
    conn.release();
  }
});

export default router;
