-- Timetable Query System - production database schema
-- Target: MySQL 8.0+
-- Safe for a new production installation:
--   * does not DROP the database or any table
--   * does not truncate or delete existing data
--   * does not create test users, teachers, students or timetable records
--
-- In MySQL Workbench, connect with an account allowed to create a database,
-- open this file, review the database name, then run the entire script once.

CREATE DATABASE IF NOT EXISTS school_management
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE school_management;

CREATE TABLE IF NOT EXISTS user (
  user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  google_id VARCHAR(255) NULL UNIQUE,
  user_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password VARCHAR(255) NULL,
  role ENUM('teacher', 'subject_head', 'staff', 'manager') NOT NULL DEFAULT 'teacher',
  permissions TEXT NULL,
  subject_head_subject_id BIGINT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS teacher (
  teacher_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT NULL UNIQUE,
  teacher_name VARCHAR(100) NOT NULL,
  teacher_code VARCHAR(50) NULL UNIQUE,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  CONSTRAINT fk_teacher_user_account
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS class (
  class_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  class_name VARCHAR(255) NOT NULL UNIQUE,
  grade_level ENUM('F1', 'F2', 'F3', 'F4', 'F5', 'F6') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS subject (
  subject_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  import_name VARCHAR(255) NOT NULL UNIQUE,
  subject_name VARCHAR(255) NOT NULL,
  block ENUM('X1', 'X2', 'X3') NULL,
  subject_name_zh VARCHAR(255) NULL,
  subject_name_en VARCHAR(255) NULL,
  is_elective BOOLEAN NOT NULL DEFAULT FALSE,
  is_nominatable BOOLEAN NOT NULL DEFAULT TRUE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

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
  CONSTRAINT fk_junior_allocation_subject FOREIGN KEY (subject_id) REFERENCES subject(subject_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS room (
  room_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  room_name VARCHAR(255) NOT NULL UNIQUE,
  room_name_zh VARCHAR(255) NULL,
  room_name_en VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS period (
  period_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  period_name VARCHAR(50) NOT NULL UNIQUE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS student (
  student_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  regno VARCHAR(50) NULL,
  email VARCHAR(255) NULL,
  student_ch_name VARCHAR(255) NOT NULL,
  student_eng_name VARCHAR(255) NOT NULL,
  class_id BIGINT NULL,
  class_number VARCHAR(10) NOT NULL,
  sex ENUM('M', 'F') NOT NULL,
  status ENUM('active', 'inactive') NOT NULL DEFAULT 'active',
  is_ncs BOOLEAN NOT NULL DEFAULT FALSE,
  x1_subject_id BIGINT NULL,
  x2_subject_id BIGINT NULL,
  x3_subject_id BIGINT NULL,
  class_code VARCHAR(20) NULL,
  house VARCHAR(50) NULL,
  language_group VARCHAR(100) NULL,
  supp_class VARCHAR(100) NULL,
  maths_group VARCHAR(100) NULL,
  citizenship VARCHAR(100) NULL,
  dropped_subjects VARCHAR(255) NULL,
  remarks TEXT NULL,
  elective_review_required BOOLEAN NOT NULL DEFAULT FALSE,
  elective_review_note VARCHAR(255) NULL,
  INDEX idx_student_class_id (class_id),
  INDEX idx_student_regno (regno),
  INDEX idx_student_email (email),
  CONSTRAINT fk_student_class
    FOREIGN KEY (class_id) REFERENCES class(class_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS student_subject (
  student_id BIGINT NOT NULL,
  subject_id BIGINT NOT NULL,
  PRIMARY KEY (student_id, subject_id),
  CONSTRAINT fk_student_subject_student
    FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
  CONSTRAINT fk_student_subject_subject
    FOREIGN KEY (subject_id) REFERENCES subject(subject_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS teacher_subject (
  teacher_id BIGINT NOT NULL,
  subject_id BIGINT NOT NULL,
  PRIMARY KEY (teacher_id, subject_id),
  CONSTRAINT fk_teacher_subject_teacher
    FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id) ON DELETE CASCADE,
  CONSTRAINT fk_teacher_subject_subject
    FOREIGN KEY (subject_id) REFERENCES subject(subject_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS timetable (
  timetable_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  teacher_id BIGINT NOT NULL,
  subject_id BIGINT NOT NULL,
  class_id BIGINT NOT NULL,
  room_id BIGINT NOT NULL,
  day_of_week ENUM('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat') NOT NULL,
  period_id BIGINT NOT NULL,
  UNIQUE KEY unique_teacher_slot (teacher_id, day_of_week, period_id),
  INDEX idx_timetable_subject (subject_id),
  INDEX idx_timetable_class (class_id),
  INDEX idx_timetable_room_id (room_id),
  INDEX idx_timetable_period (period_id),
  CONSTRAINT fk_timetable_teacher
    FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id) ON DELETE CASCADE,
  CONSTRAINT fk_timetable_subject
    FOREIGN KEY (subject_id) REFERENCES subject(subject_id) ON DELETE CASCADE,
  CONSTRAINT fk_timetable_class
    FOREIGN KEY (class_id) REFERENCES class(class_id) ON DELETE CASCADE,
  CONSTRAINT fk_timetable_room
    FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE CASCADE,
  CONSTRAINT fk_timetable_period
    FOREIGN KEY (period_id) REFERENCES period(period_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS student_lesson_group (
  student_id BIGINT NOT NULL,
  timetable_id BIGINT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (student_id, timetable_id),
  INDEX idx_student_lesson_group_student (student_id),
  INDEX idx_student_lesson_group_timetable (timetable_id),
  CONSTRAINT fk_student_lesson_group_student
    FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
  CONSTRAINT fk_student_lesson_group_timetable
    FOREIGN KEY (timetable_id) REFERENCES timetable(timetable_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS staging_teacher (
  teacher_code VARCHAR(50) NOT NULL PRIMARY KEY,
  teacher_name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS staging_timetable (
  staging_timetable_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  teacher_code VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  class VARCHAR(255) NOT NULL,
  room VARCHAR(255) NOT NULL,
  day_of_week ENUM('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat') NOT NULL,
  period VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS nomination (
  nomination_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  teacher_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  UNIQUE KEY unique_conduct_nomination (teacher_id, student_id),
  CONSTRAINT fk_nomination_teacher
    FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id) ON DELETE CASCADE,
  CONSTRAINT fk_nomination_student
    FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS prefect_nomination (
  prefect_nomination_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  teacher_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  UNIQUE KEY unique_prefect_nomination (teacher_id, student_id),
  CONSTRAINT fk_prefect_nomination_teacher
    FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id) ON DELETE CASCADE,
  CONSTRAINT fk_prefect_nomination_student
    FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS BLA (
  BLA_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  teacher_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  subject_id BIGINT NOT NULL,
  UNIQUE KEY unique_bla_nomination (teacher_id, student_id, subject_id),
  CONSTRAINT fk_bla_teacher
    FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id) ON DELETE CASCADE,
  CONSTRAINT fk_bla_student
    FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
  CONSTRAINT fk_bla_subject
    FOREIGN KEY (subject_id) REFERENCES subject(subject_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS learning_goal_record (
  learning_goal_record_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  teacher_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  completed_goals INT NOT NULL DEFAULT 0,
  semester ENUM('first', 'second') NOT NULL DEFAULT 'first',
  UNIQUE KEY unique_learning_goal_record_semester (teacher_id, student_id, semester),
  CONSTRAINT fk_learning_goal_teacher
    FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id) ON DELETE CASCADE,
  CONSTRAINT fk_learning_goal_student
    FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS learning_goal_reward_rule (
  rule_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  min_goals INT NOT NULL,
  max_goals INT NOT NULL,
  award_name VARCHAR(100) NOT NULL,
  has_prize BOOLEAN NOT NULL DEFAULT FALSE,
  merit_offset_count INT NOT NULL DEFAULT 0,
  display_order INT NOT NULL DEFAULT 0,
  UNIQUE KEY unique_learning_goal_rule_range (min_goals, max_goals)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS import_schedule (
  import_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  import_date DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS import_batches (
  batch_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  imported_by_user_id BIGINT NULL,
  imported_by_name VARCHAR(255) NULL,
  status ENUM('success', 'failed', 'rolled_back') NOT NULL DEFAULT 'success',
  inserted_rows INT NOT NULL DEFAULT 0,
  skipped_rows INT NOT NULL DEFAULT 0,
  error_code VARCHAR(80) NULL,
  error_message TEXT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  rolled_back_at DATETIME NULL,
  INDEX idx_import_batches_created_at (created_at),
  INDEX idx_import_batches_status (status),
  CONSTRAINT fk_import_batches_user
    FOREIGN KEY (imported_by_user_id) REFERENCES user(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS timetable_history (
  history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  batch_id BIGINT NOT NULL,
  timetable_id BIGINT NULL,
  teacher_id BIGINT NOT NULL,
  subject_id BIGINT NOT NULL,
  class_id BIGINT NOT NULL,
  room_id BIGINT NOT NULL,
  day_of_week ENUM('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat') NOT NULL,
  period_id BIGINT NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_timetable_history_batch (batch_id),
  CONSTRAINT fk_timetable_history_batch
    FOREIGN KEY (batch_id) REFERENCES import_batches(batch_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS student_import_batches (
  batch_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  imported_by_user_id BIGINT NULL,
  imported_by_name VARCHAR(255) NULL,
  status ENUM('success', 'failed', 'rolled_back') NOT NULL DEFAULT 'success',
  inserted_rows INT NOT NULL DEFAULT 0,
  updated_rows INT NOT NULL DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  rolled_back_at DATETIME NULL,
  INDEX idx_student_import_created_at (created_at),
  CONSTRAINT fk_student_import_batches_user
    FOREIGN KEY (imported_by_user_id) REFERENCES user(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS student_import_history (
  history_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  batch_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  was_existing BOOLEAN NOT NULL,
  regno VARCHAR(50) NULL,
  email VARCHAR(255) NULL,
  student_ch_name VARCHAR(255) NULL,
  student_eng_name VARCHAR(255) NULL,
  class_id BIGINT NULL,
  class_number VARCHAR(10) NULL,
  sex VARCHAR(10) NULL,
  status VARCHAR(20) NULL,
  is_ncs BOOLEAN NULL,
  x1_subject_id BIGINT NULL,
  x2_subject_id BIGINT NULL,
  x3_subject_id BIGINT NULL,
  class_code VARCHAR(20) NULL,
  house VARCHAR(50) NULL,
  language_group VARCHAR(100) NULL,
  supp_class VARCHAR(100) NULL,
  maths_group VARCHAR(100) NULL,
  citizenship VARCHAR(100) NULL,
  dropped_subjects VARCHAR(255) NULL,
  remarks TEXT NULL,
  INDEX idx_student_import_history_batch (batch_id),
  CONSTRAINT fk_student_import_history_batch
    FOREIGN KEY (batch_id) REFERENCES student_import_batches(batch_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Subject heads may optionally be linked to their managed subject.
SET @subject_head_fk_exists = (
  SELECT COUNT(*)
  FROM information_schema.REFERENTIAL_CONSTRAINTS
  WHERE CONSTRAINT_SCHEMA = DATABASE()
    AND TABLE_NAME = 'user'
    AND CONSTRAINT_NAME = 'fk_user_subject_head_subject'
);
SET @subject_head_fk_sql = IF(
  @subject_head_fk_exists = 0,
  'ALTER TABLE user ADD CONSTRAINT fk_user_subject_head_subject FOREIGN KEY (subject_head_subject_id) REFERENCES subject(subject_id) ON DELETE SET NULL',
  'SELECT 1'
);
PREPARE subject_head_fk_statement FROM @subject_head_fk_sql;
EXECUTE subject_head_fk_statement;
DEALLOCATE PREPARE subject_head_fk_statement;

-- Required school period configuration. Existing rows are preserved.
INSERT INTO period (period_name, start_time, end_time) VALUES
  ('Period 1',  '08:30:00', '09:05:00'),
  ('Period 2',  '09:05:00', '09:40:00'),
  ('Period 3',  '09:55:00', '10:30:00'),
  ('Period 4',  '10:30:00', '11:05:00'),
  ('Period 5',  '11:20:00', '11:55:00'),
  ('Period 6',  '11:55:00', '12:30:00'),
  ('Period 7',  '13:30:00', '14:05:00'),
  ('Period 8',  '14:05:00', '14:40:00'),
  ('Period 9',  '14:40:00', '15:15:00'),
  ('Period 10', '15:15:00', '16:00:00'),
  ('Period 11', '14:50:00', '15:25:00'),
  ('Period 12', '15:25:00', '16:00:00')
ON DUPLICATE KEY UPDATE
  start_time = VALUES(start_time),
  end_time = VALUES(end_time);

-- Default learning-goal award rules. Existing rules are preserved.
INSERT INTO learning_goal_reward_rule
  (min_goals, max_goals, award_name, has_prize, merit_offset_count, display_order)
VALUES
  (2, 2, '紀念品', FALSE, 0, 1),
  (3, 4, '銅獎', TRUE, 1, 2),
  (5, 6, '銀獎', TRUE, 1, 3),
  (7, 8, '金獎', TRUE, 2, 4)
ON DUPLICATE KEY UPDATE
  award_name = VALUES(award_name),
  has_prize = VALUES(has_prize),
  merit_offset_count = VALUES(merit_offset_count),
  display_order = VALUES(display_order);

-- FIRST MANAGER ACCOUNT
-- Before launch, replace the email below with the real school Google account,
-- ensure the same email is present in MANAGER_EMAILS in server/.env, then
-- remove the leading "-- " from the INSERT lines. The manager can sign in
-- through Google and create the remaining users from the management page.
--
-- INSERT INTO user (user_name, email, password, role, permissions)
-- VALUES (
--   'School Administrator',
--   'admin@school.edu.hk',
--   NULL,
--   'manager',
--   '{"timetable":true,"nominations":true,"changePassword":true,"manageUsers":true,"manageStudents":true,"importTimetable":true}'
-- )
-- ON DUPLICATE KEY UPDATE
--   role = 'manager',
--   permissions = VALUES(permissions);

SELECT 'Production schema installed successfully.' AS result;
