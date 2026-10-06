-- Add manager-controlled semester settings and junior subject allocation rules
-- to an existing installation. Fresh installations already include these.
USE school_management;

CREATE TABLE IF NOT EXISTS system_settings (
  setting_key VARCHAR(100) PRIMARY KEY,
  setting_value VARCHAR(255) NOT NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO system_settings (setting_key, setting_value)
VALUES ('academic_year', '2026-2027'), ('current_semester', '1');

CREATE TABLE IF NOT EXISTS junior_subject_allocation_rule (
  rule_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  grade ENUM('F1', 'F2', 'F3') NOT NULL,
  semester TINYINT NOT NULL,
  subject_id BIGINT NOT NULL,
  class_group ENUM('odd', 'even', 'all', 'disabled') NOT NULL DEFAULT 'disabled',
  UNIQUE KEY unique_junior_allocation (grade, semester, subject_id),
  INDEX idx_junior_allocation_lookup (grade, semester, class_group),
  CONSTRAINT fk_junior_allocation_subject
    FOREIGN KEY (subject_id) REFERENCES subject(subject_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

DROP PROCEDURE IF EXISTS add_student_review_columns;
DELIMITER $$
CREATE PROCEDURE add_student_review_columns()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'student' AND COLUMN_NAME = 'elective_review_required'
  ) THEN
    ALTER TABLE student ADD COLUMN elective_review_required BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'student' AND COLUMN_NAME = 'elective_review_note'
  ) THEN
    ALTER TABLE student ADD COLUMN elective_review_note VARCHAR(255) NULL;
  END IF;
END$$
DELIMITER ;

CALL add_student_review_columns();
DROP PROCEDURE add_student_review_columns;

