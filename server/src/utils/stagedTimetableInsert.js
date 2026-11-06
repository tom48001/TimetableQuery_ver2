// Resolves staged timetable rows to database IDs and inserts them into the
// timetable table. Dimension values are matched on trimmed, case-insensitive
// equality — the same rule as the SQL TRIM() joins this replaces — but via
// small indexed temporary tables, because TRIM()-wrapped join conditions
// defeat every index and degenerate into multi-minute nested full scans.
const DIMENSIONS = [
  { table: 'teacher', key: 'teacher_id', column: 'teacher_code', stagingColumn: 'teacher_code' },
  { table: 'subject', key: 'subject_id', column: 'import_name', stagingColumn: 'subject' },
  { table: 'class', key: 'class_id', column: 'class_name', stagingColumn: '`class`' },
  { table: 'room', key: 'room_id', column: 'room_name', stagingColumn: 'room' },
  { table: 'period', key: 'period_id', column: 'period_name', stagingColumn: 'period' }
];

// Legacy ver1 databases enforce one lesson per room per slot. Real timetables
// legitimately share a room (co-teaching, co-form-teachers), so ver2 enforces
// one lesson per TEACHER per slot instead. Migrate the constraint once, after
// verifying the existing rows satisfy it.
let timetableSchemaPromise;
export function ensureTimetableImportSchema(conn) {
  if (!timetableSchemaPromise) timetableSchemaPromise = (async () => {
    const schema = `
      SELECT INDEX_NAME, MAX(COLUMN_NAME = 'teacher_id') AS has_teacher, MAX(COLUMN_NAME = 'room_id') AS has_room
      FROM information_schema.STATISTICS
      WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'timetable' AND NON_UNIQUE = 0 AND INDEX_NAME <> 'PRIMARY'
      GROUP BY INDEX_NAME
    `;
    const [indexes] = await conn.query(schema);
    const teacherSlotExists = indexes.some(index => Number(index.has_teacher) === 1);
    const legacyRoomIndexes = indexes.filter(index => Number(index.has_room) === 1);

    if (teacherSlotExists && !legacyRoomIndexes.length) return;

    if (!teacherSlotExists) {
      const [violations] = await conn.query(`
        SELECT teacher_id, day_of_week, period_id, COUNT(*) AS lessons
        FROM timetable GROUP BY teacher_id, day_of_week, period_id HAVING lessons > 1
      `);
      if (violations.length) {
        throw new Error(
          'Timetable data has a teacher booked twice in the same slot; remove the duplicate rows before importing. ' +
          violations.slice(0, 5).map(v => `teacher ${v.teacher_id} ${v.day_of_week} period ${v.period_id} ×${v.lessons}`).join('; ')
        );
      }
    }

    for (const index of legacyRoomIndexes) {
      // The legacy foreign key on room_id still needs an index after the
      // unique one goes; give it a plain one first.
      await conn.query('ALTER TABLE timetable ADD INDEX idx_timetable_room (room_id)');
      await conn.query(`ALTER TABLE timetable DROP INDEX \`${index.INDEX_NAME}\``);
    }
    if (!teacherSlotExists) {
      await conn.query('ALTER TABLE timetable ADD UNIQUE KEY unique_teacher_slot (teacher_id, day_of_week, period_id)');
    }
  })().catch(error => { timetableSchemaPromise = null; throw error; });
  return timetableSchemaPromise;
}

function chunks(values, size) {
  const result = [];
  for (let index = 0; index < values.length; index += size) {
    result.push(values.slice(index, index + size));
  }
  return result;
}

export async function insertStagedTimetableBatches(conn, stagedIds, batchSize = 500, onBatch = () => {}) {
  if (!stagedIds.length) return 0;

  // The map keys must share the staging columns' collation: mixing collations
  // (e.g. utf8mb4_unicode_ci with utf8mb4_uca1400_ai_ci) makes the equality
  // joins illegal, while forcing our own collation breaks the index lookups.
  const [collationRows] = await conn.query(`
    SELECT COLLATION_NAME AS collation FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'staging_timetable' AND COLUMN_NAME = 'teacher_code'
  `);
  const stagingCollation = collationRows.length && /^[a-z0-9_]+$/.test(collationRows[0].collation)
    ? collationRows[0].collation
    : 'utf8mb4_unicode_ci';
  const stagingCharset = stagingCollation.split('_')[0];

  await conn.query(`
    UPDATE staging_timetable
    SET teacher_code = TRIM(teacher_code),
        subject = TRIM(subject),
        \`class\` = TRIM(\`class\`),
        room = TRIM(room),
        period = TRIM(period)
  `);

  for (const dimension of DIMENSIONS) {
    const mapTable = `stg_map_${dimension.table}`;
    await conn.query(`DROP TEMPORARY TABLE IF EXISTS ${mapTable}`);
    await conn.query(`
      CREATE TEMPORARY TABLE ${mapTable} (
        value VARCHAR(255) COLLATE ${stagingCollation} NOT NULL,
        id BIGINT NOT NULL,
        KEY idx_value (value)
      ) ENGINE=InnoDB DEFAULT CHARSET=${stagingCharset} COLLATE=${stagingCollation}
    `);
    await conn.query(
      `INSERT INTO ${mapTable} SELECT TRIM(${dimension.column}), ${dimension.key} FROM ${dimension.table}`
    );
  }

  const joins = DIMENSIONS.map(dimension => (
    `JOIN stg_map_${dimension.table} m_${dimension.table} ON st.${dimension.stagingColumn} = m_${dimension.table}.value`
  )).join('\n        ');

  let affectedRows = 0;
  for (const batch of chunks(stagedIds, batchSize)) {
    const [result] = await conn.query(`
      INSERT INTO timetable
        (teacher_id, subject_id, class_id, room_id, day_of_week, period_id)
      SELECT
          m_teacher.id,
          m_subject.id,
          m_class.id,
          m_room.id,
          st.day_of_week,
          m_period.id
        FROM staging_timetable st
        ${joins}
        WHERE st.staging_timetable_id IN (?)
    `, [batch.map(row => row.staging_timetable_id)]);
    affectedRows += result.affectedRows;
    await onBatch(batch.length);
  }
  return affectedRows;
}
