import express from 'express';
import db from '../db.js';
import { ensureJWT } from '../auth/auth.js';
import { requirePermission } from '../auth/permissions.js';
import { canonicalRoomList, missingRoomReferences } from '../utils/roomReference.js';

const router = express.Router();

router.use(ensureJWT);
router.use(requirePermission('timetable'));

async function loadPreferredRooms() {
  const [rows] = await db.query(`
    SELECT r.room_id, r.room_name, r.room_name_zh, r.room_name_en
    FROM room r
    WHERE NOT EXISTS (
      SELECT 1
      FROM room preferred
      WHERE TRIM(SUBSTRING_INDEX(r.room_name, ' ', 1)) REGEXP '^(G?[0-9]+[A-Za-z]?)$'
        AND TRIM(SUBSTRING_INDEX(preferred.room_name, ' ', 1)) =
            TRIM(SUBSTRING_INDEX(r.room_name, ' ', 1))
        AND (
          CHAR_LENGTH(TRIM(preferred.room_name)) > CHAR_LENGTH(TRIM(r.room_name))
          OR (
            CHAR_LENGTH(TRIM(preferred.room_name)) = CHAR_LENGTH(TRIM(r.room_name))
            AND preferred.room_id < r.room_id
          )
        )
    )
  `);
  return rows;
}

router.get('/', async (req, res) => {
  try {
    let rows = await loadPreferredRooms();
    const missingRooms = missingRoomReferences(rows);
    if (missingRooms.length) {
      await db.query(
        'INSERT INTO room (room_name, room_name_zh, room_name_en) VALUES ?',
        [missingRooms.map(room => [room.roomNameZh, room.roomNameZh, room.roomNameEn])]
      );
      rows = await loadPreferredRooms();
    }
    res.json(canonicalRoomList(rows));
  } catch (err) {
    console.error('Failed to load rooms:', err);
    res.status(500).json({ code: 'DATABASE_ERROR', error: 'Failed to load rooms.' });
  }
});

router.get('/schedule/:roomId', async (req, res) => {
  const { roomId } = req.params;

  try {
    const [rows] = await db.query(
      `SELECT DISTINCT
        t.teacher_name AS teacher_name,
        c.class_name AS class_name,
        s.subject_id,
        s.subject_name AS subject_name,
        s.subject_name_zh,
        s.subject_name_en,
        p.period_name,
        p.start_time,
        p.end_time,
        tt.day_of_week
      FROM room selected_room
      JOIN room schedule_room
        ON schedule_room.room_id = selected_room.room_id
        OR (
          TRIM(SUBSTRING_INDEX(selected_room.room_name, ' ', 1)) REGEXP '^(G?[0-9]+[A-Za-z]?)$'
          AND TRIM(SUBSTRING_INDEX(schedule_room.room_name, ' ', 1)) =
              TRIM(SUBSTRING_INDEX(selected_room.room_name, ' ', 1))
        )
      JOIN timetable tt ON tt.room_id = schedule_room.room_id
      JOIN teacher t ON tt.teacher_id = t.teacher_id
      JOIN class c ON tt.class_id = c.class_id
      JOIN subject s ON tt.subject_id = s.subject_id
      JOIN period p ON tt.period_id = p.period_id
      WHERE selected_room.room_id = ?
      ORDER BY
        FIELD(tt.day_of_week, 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'),
        p.start_time`,
      [roomId]
    );
    res.json(rows);
  } catch (err) {
    console.error('Failed to load room schedule:', err);
    res.status(500).json({ code: 'DATABASE_ERROR', error: 'Failed to load room schedule.' });
  }
});

export default router;
