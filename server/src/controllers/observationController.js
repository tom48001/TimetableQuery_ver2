import db from '../db.js';

export const getObservationSchedule = async (req, res) => {
  const rawObserverIds = req.body.observerIds || req.body.observers;
  const rawTargetId = req.body.targetId || req.body.target;
  const observerIds = (Array.isArray(rawObserverIds) ? rawObserverIds : String(rawObserverIds || '').split(','))
    .map(id => Number(id))
    .filter(id => Number.isFinite(id) && id > 0);
  const targetId = Number(rawTargetId);

  if (observerIds.length === 0 || !Number.isFinite(targetId) || targetId <= 0) {
    return res.status(400).json({ error: 'Missing observing teachers or target teacher.' });
  }

  try {
    const [rows] = await db.query(
      `SELECT
         tt.teacher_id,
         te.teacher_name,
         tt.day_of_week AS day,
         p.period_id,
         p.period_name,
         c.class_name,
         s.subject_id,
         s.subject_name,
         r.room_id,
         r.room_name
       FROM timetable tt
       JOIN teacher te ON tt.teacher_id = te.teacher_id
       JOIN class c ON tt.class_id = c.class_id
       JOIN subject s ON tt.subject_id = s.subject_id
       JOIN room r ON tt.room_id = r.room_id
       JOIN period p ON tt.period_id = p.period_id
       WHERE tt.teacher_id = ?
         AND NOT EXISTS (
           SELECT 1
           FROM timetable busy
           WHERE busy.day_of_week = tt.day_of_week
             AND busy.period_id = tt.period_id
             AND busy.teacher_id IN (?)
         )
       ORDER BY FIELD(tt.day_of_week, 'Mon','Tue','Wed','Thu','Fri','Sat'), p.period_id`,
      [targetId, observerIds]
    );

    res.json(rows);
  } catch (err) {
    console.error('Failed to load observation schedule:', err);
    res.status(500).json({ error: 'Failed to load observation schedule.' });
  }
};