-- Mark which timetable subjects may be used for Best Learning Attitude nominations.
USE school_management;

DROP PROCEDURE IF EXISTS ensure_subject_nomination_column;
DELIMITER $$
CREATE PROCEDURE ensure_subject_nomination_column()
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE()
      AND TABLE_NAME = 'subject'
      AND COLUMN_NAME = 'is_nominatable'
  ) THEN
    ALTER TABLE subject
      ADD COLUMN is_nominatable BOOLEAN NOT NULL DEFAULT TRUE AFTER is_elective;
  END IF;
END$$
DELIMITER ;

CALL ensure_subject_nomination_column();
DROP PROCEDURE ensure_subject_nomination_column;

SET @subject_nomination_safe_updates = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;

UPDATE subject
SET is_nominatable = TRUE
WHERE subject_id IS NOT NULL;

UPDATE subject
SET is_nominatable = FALSE
WHERE subject_id IS NOT NULL
  AND (
    TRIM(subject_name) IN ('班主任課', 'Career_Planning')
    OR TRIM(subject_name) LIKE 'SUPP%'
  );

SET SQL_SAFE_UPDATES = @subject_nomination_safe_updates;

SELECT subject_id, subject_name, subject_name_zh, is_elective, is_nominatable
FROM subject
ORDER BY is_nominatable, subject_name;
