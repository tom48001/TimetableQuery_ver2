export function linkError(status, message) {
  return Object.assign(new Error(message), { status });
}

// Caller owns the account transaction. Never infer identity from a display name
// or create a new teacher: imported IDs carry the timetable and nominations.
export async function linkTeacherAccount(conn, userId, requestedId) {
  if (requestedId === undefined) return; // Legacy edits preserve the current link.
  const teacherId = requestedId === null || requestedId === '' ? null : Number(requestedId);
  if (teacherId !== null && (!Number.isSafeInteger(teacherId) || teacherId <= 0)) {
    throw linkError(400, 'Please select a valid teacher.');
  }
  const [rows] = await conn.query(
    'SELECT teacher_id, user_id FROM teacher WHERE user_id = ? OR teacher_id = ? ORDER BY teacher_id FOR UPDATE',
    [userId, teacherId]
  );
  if (teacherId !== null) {
    const selected = rows.find(row => Number(row.teacher_id) === teacherId);
    if (!selected) throw linkError(404, 'The selected teacher no longer exists. Refresh the teacher list.');
    if (selected.user_id !== null && String(selected.user_id) !== String(userId)) {
      throw linkError(409, 'This teacher is already linked to another account. Refresh the teacher list.');
    }
  }
  await conn.query('UPDATE teacher SET user_id = NULL WHERE user_id = ?', [userId]);
  if (teacherId !== null) {
    await conn.query('UPDATE teacher SET user_id = ? WHERE teacher_id = ?', [userId, teacherId]);
  }
}
