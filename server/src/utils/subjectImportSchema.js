import db from '../db.js';
import { parseElectiveSubjectCode } from './subjectCanonicalKey.js';

let subjectImportSchemaReady = false;

async function addColumnIfMissing(conn, definition) {
  try {
    await conn.query(`ALTER TABLE subject ADD COLUMN ${definition}`);
  } catch (error) {
    if (error.code !== 'ER_DUP_FIELDNAME' && error.errno !== 1060) throw error;
  }
}

export async function ensureSubjectImportSchema(conn = db) {
  if (subjectImportSchemaReady) return;

  await addColumnIfMissing(conn, 'import_name VARCHAR(255) NULL');
  await addColumnIfMissing(conn, "block ENUM('X1','X2','X3') NULL");

  // Preserve the old code before subject_name becomes the suffix-free display value.
  await conn.query(`
    UPDATE subject
    SET import_name = TRIM(subject_name)
    WHERE import_name IS NULL OR TRIM(import_name) = ''
  `);

  const [subjectNameIndexes] = await conn.query(`
    SELECT INDEX_NAME AS Key_name
    FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'subject'
      AND NON_UNIQUE = 0
      AND INDEX_NAME <> 'PRIMARY'
    GROUP BY INDEX_NAME
    HAVING COUNT(*) = 1 AND MAX(COLUMN_NAME) = 'subject_name'
  `);
  for (const index of subjectNameIndexes) {
    const safeIndexName = String(index.Key_name).replace(/`/g, '');
    await conn.query(`ALTER TABLE subject DROP INDEX \`${safeIndexName}\``);
  }

  const [importNameIndexes] = await conn.query(`
    SHOW INDEX FROM subject
    WHERE Column_name = 'import_name' AND Non_unique = 0
  `);
  if (!importNameIndexes.length) {
    await conn.query('ALTER TABLE subject ADD UNIQUE KEY unique_subject_import_name (import_name)');
  }
  await conn.query('ALTER TABLE subject MODIFY import_name VARCHAR(255) NOT NULL');

  const [subjects] = await conn.query('SELECT subject_id, import_name FROM subject');
  for (const subject of subjects) {
    const parsed = parseElectiveSubjectCode(subject.import_name);
    await conn.query(
      'UPDATE subject SET subject_name = ?, block = ?, is_elective = ? WHERE subject_id = ?',
      [parsed.subjectCode, parsed.electiveGroup, Boolean(parsed.electiveGroup), subject.subject_id]
    );
  }

  subjectImportSchemaReady = true;
}

export function subjectImportRecord(importName) {
  const parsed = parseElectiveSubjectCode(importName);
  return {
    import_name: parsed.importedCode,
    subject_name: parsed.subjectCode,
    block: parsed.electiveGroup,
    is_elective: Boolean(parsed.electiveGroup)
  };
}
