-- Migrate legacy subject rows to the Excel-driven subject identity model.
-- Safe properties:
--   * preserves subject_id values and every foreign-key reference
--   * does not delete or merge subject rows
--   * preserves the original imported code before changing subject_name
-- Target: MySQL 8.0+

USE school_management;

DROP PROCEDURE IF EXISTS migrate_subject_import_identity;
DELIMITER $$
CREATE PROCEDURE migrate_subject_import_identity()
BEGIN
  DECLARE subject_name_unique_index VARCHAR(255) DEFAULT NULL;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'subject' AND COLUMN_NAME = 'import_name'
  ) THEN
    ALTER TABLE subject ADD COLUMN import_name VARCHAR(255) NULL AFTER subject_id;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'subject' AND COLUMN_NAME = 'block'
  ) THEN
    ALTER TABLE subject ADD COLUMN block ENUM('X1', 'X2', 'X3') NULL AFTER subject_name;
  END IF;

  UPDATE subject
  SET import_name = TRIM(subject_name)
  WHERE import_name IS NULL OR TRIM(import_name) = '';

  SELECT INDEX_NAME INTO subject_name_unique_index
  FROM information_schema.STATISTICS
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'subject'
    AND COLUMN_NAME = 'subject_name'
    AND NON_UNIQUE = 0
    AND INDEX_NAME <> 'PRIMARY'
  LIMIT 1;

  IF subject_name_unique_index IS NOT NULL THEN
    SET @drop_subject_name_index = CONCAT(
      'ALTER TABLE subject DROP INDEX `',
      REPLACE(subject_name_unique_index, '`', ''),
      '`'
    );
    PREPARE drop_index_statement FROM @drop_subject_name_index;
    EXECUTE drop_index_statement;
    DEALLOCATE PREPARE drop_index_statement;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.STATISTICS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'subject'
      AND COLUMN_NAME = 'import_name'
      AND NON_UNIQUE = 0
  ) THEN
    ALTER TABLE subject ADD UNIQUE KEY unique_subject_import_name (import_name);
  END IF;

  UPDATE subject
  SET block = CASE
        WHEN import_name REGEXP '-B1$' THEN 'X1'
        WHEN import_name REGEXP '-B2$' THEN 'X2'
        WHEN import_name REGEXP '-B3$' THEN 'X3'
        ELSE NULL
      END,
      subject_name = REGEXP_REPLACE(import_name, '-B[123]$', ''),
      is_elective = CASE WHEN import_name REGEXP '-B[123]$' THEN TRUE ELSE is_elective END;

  ALTER TABLE subject MODIFY import_name VARCHAR(255) NOT NULL;
END$$
DELIMITER ;

CALL migrate_subject_import_identity();
DROP PROCEDURE migrate_subject_import_identity;

