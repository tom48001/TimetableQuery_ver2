DROP DATABASE IF EXISTS school_management;
CREATE DATABASE school_management CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE school_management;

CREATE TABLE user (
  user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  google_id VARCHAR(255) UNIQUE,
  user_name VARCHAR(255) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255),
  role ENUM('teacher', 'staff', 'manager') DEFAULT 'teacher',
  permissions TEXT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE teacher (
  teacher_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  user_id BIGINT UNIQUE NOT NULL,
  teacher_name VARCHAR(100) NOT NULL,
  teacher_code VARCHAR(50) UNIQUE,
  status ENUM('active', 'inactive') DEFAULT 'active',
  FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE class (
  class_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  class_name VARCHAR(255) NOT NULL UNIQUE,
  grade_level ENUM('F1','F2','F3','F4','F5','F6') NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE subject (
  subject_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  subject_name VARCHAR(255) NOT NULL UNIQUE,
  subject_name_zh VARCHAR(255) NULL,
  subject_name_en VARCHAR(255) NULL,
  is_elective BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE room (
  room_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  room_name VARCHAR(255) UNIQUE NOT NULL,
  room_name_zh VARCHAR(255) NULL,
  room_name_en VARCHAR(255) NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE period (
  period_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  period_name VARCHAR(50) NOT NULL UNIQUE,
  start_time TIME NOT NULL,
  end_time TIME NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE student (
  student_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  student_ch_name VARCHAR(255) NOT NULL,
  student_eng_name VARCHAR(255) NOT NULL,
  class_id BIGINT,
  class_number VARCHAR(2) NOT NULL,
  sex ENUM('M', 'F') NOT NULL,
  UNIQUE KEY unique_class_number (class_id, class_number),
  FOREIGN KEY (class_id) REFERENCES class(class_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE student_subject (
  student_id BIGINT NOT NULL,
  subject_id BIGINT NOT NULL,
  PRIMARY KEY (student_id, subject_id),
  FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subject(subject_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE teacher_subject (
  teacher_id BIGINT NOT NULL,
  subject_id BIGINT NOT NULL,
  PRIMARY KEY (teacher_id, subject_id),
  FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subject(subject_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE timetable (
  timetable_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  teacher_id BIGINT NOT NULL,
  subject_id BIGINT NOT NULL,
  class_id BIGINT NOT NULL,
  room_id BIGINT NOT NULL,
  day_of_week ENUM('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat') NOT NULL,
  period_id BIGINT NOT NULL,
  FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subject(subject_id) ON DELETE CASCADE,
  FOREIGN KEY (class_id) REFERENCES class(class_id) ON DELETE CASCADE,
  FOREIGN KEY (room_id) REFERENCES room(room_id) ON DELETE CASCADE,
  FOREIGN KEY (period_id) REFERENCES period(period_id) ON DELETE CASCADE,
  INDEX idx_timetable_room_id (room_id),
  UNIQUE KEY unique_teacher_slot (teacher_id, day_of_week, period_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE staging_teacher (
  teacher_code VARCHAR(50) NOT NULL,
  teacher_name VARCHAR(100) NOT NULL,
  email VARCHAR(255),
  PRIMARY KEY (teacher_code)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE staging_timetable (
  staging_timetable_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  teacher_code VARCHAR(50) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  class VARCHAR(255) NOT NULL,
  room VARCHAR(255) NOT NULL,
  day_of_week ENUM('Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat') NOT NULL,
  period VARCHAR(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE nomination (
  nomination_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  teacher_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  UNIQUE KEY unique_conduct_nomination (teacher_id, student_id),
  FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE prefect_nomination (
  prefect_nomination_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  teacher_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  UNIQUE KEY unique_prefect_nomination (teacher_id, student_id),
  FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE BLA (
  BLA_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  teacher_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  subject_id BIGINT NOT NULL,
  UNIQUE KEY unique_bla_nomination (teacher_id, student_id, subject_id),
  FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
  FOREIGN KEY (subject_id) REFERENCES subject(subject_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE learning_goal_record (
  learning_goal_record_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  teacher_id BIGINT NOT NULL,
  student_id BIGINT NOT NULL,
  completed_goals INT NOT NULL DEFAULT 0,
  UNIQUE KEY unique_learning_goal_record (teacher_id, student_id),
  FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id) ON DELETE CASCADE,
  FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE import_schedule (
  import_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  file_name VARCHAR(255) NOT NULL,
  import_date DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE import_batches (
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
  FOREIGN KEY (imported_by_user_id) REFERENCES user(user_id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE timetable_history (
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
  FOREIGN KEY (batch_id) REFERENCES import_batches(batch_id) ON DELETE CASCADE,
  INDEX idx_timetable_history_batch (batch_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

SET @default_password = '$2b$10$56QvvYnrtdQlgwFzqI3ZOu5MXh/JCP/5Wvt3vfrqhhnukrrNO87KG';
SET @teacher_permissions = '{"timetable":true,"nominations":true,"changePassword":true,"manageUsers":false,"manageStudents":false,"importTimetable":false}';
SET @staff_permissions = '{"timetable":true,"nominations":true,"changePassword":false,"manageUsers":true,"manageStudents":false,"importTimetable":false}';
SET @manager_permissions = '{"timetable":true,"nominations":true,"changePassword":false,"manageUsers":true,"manageStudents":true,"importTimetable":true}';

INSERT INTO user (user_name, email, password, role, permissions) VALUES
('manager', 'manager@school.test', @default_password, 'manager', @manager_permissions),
('staff', 'staff@school.test', @default_password, 'staff', @staff_permissions),
('CWK', 'cwk@school.test', @default_password, 'teacher', @teacher_permissions),
('CWT', 'cwt@school.test', @default_password, 'teacher', @teacher_permissions),
('QWE', 'qwe@school.test', @default_password, 'teacher', @teacher_permissions),
('SING', 'singsing894@gmail.com', @default_password, 'manager', @manager_permissions);

INSERT INTO teacher (user_id, teacher_name, teacher_code, status) VALUES
(3, 'CWK', 'CWK', 'active'),
(4, 'CWT', 'CWT', 'active'),
(5, 'QWE', 'QWE', 'active'),
(6, 'SING', 'SING', 'active');

INSERT INTO class (class_name, grade_level) VALUES
('1M', 'F1'), ('1A', 'F1'), ('1R', 'F1'), ('1Y', 'F1'),
('2M', 'F2'), ('2A', 'F2'), ('2R', 'F2'), ('2Y', 'F2'),
('3M', 'F3'), ('3A', 'F3'), ('3R', 'F3'), ('3Y', 'F3'),
('4M', 'F4'), ('4A', 'F4'), ('4R', 'F4'), ('4Y', 'F4'),
('5M', 'F5'), ('5A', 'F5'), ('5R', 'F5'), ('5Y', 'F5'),
('6M', 'F6'), ('6A', 'F6'), ('6R', 'F6'), ('6Y', 'F6');

INSERT INTO subject (subject_name, is_elective) VALUES
('English', FALSE),
('Chinese Language', FALSE),
('Mathematics', FALSE),
('Citizenship and Social Development', FALSE),
('Visual Arts', FALSE),
('Physical Education', FALSE),
('General Studies', FALSE),
('ICT', TRUE),
('History', TRUE),
('Religious Education', FALSE),
('Chinese Literature', TRUE),
('Music', FALSE),
('Geography', TRUE),
('Biology', TRUE),
('Physics', TRUE),
('BAFS', TRUE),
('Putonghua', FALSE),
('STEM', TRUE),
('Chemistry', TRUE),
('Economics', TRUE);

INSERT INTO room (room_name) VALUES
('101 Visual Arts Room'), ('102 Music Room'), ('202 1M Classroom'), ('203 1A Classroom'),
('204 1R Classroom'), ('205 1Y Classroom'), ('302 2M Classroom'), ('303 2A Classroom'),
('304 2R Classroom'), ('305 2Y Classroom'), ('401 Classroom'), ('402 3M Classroom'),
('403 3A Classroom'), ('404 3R Classroom'), ('405 3Y Classroom'), ('413 CAL Room'),
('501 Classroom'), ('502 4M Classroom'), ('503 4A Classroom'), ('504 4R Classroom'),
('505 4Y Classroom'), ('509 Geography Room'), ('602 5Y Classroom'), ('603 5R Classroom'),
('604 5A Classroom'), ('605 5M Classroom'), ('702 6M Classroom'), ('703 6A Classroom'),
('704 6R Classroom'), ('705 6Y Classroom');

INSERT INTO period (period_name, start_time, end_time) VALUES
('Period 1', '08:30:00', '09:05:00'),
('Period 2', '09:05:00', '09:40:00'),
('Period 3', '09:55:00', '10:30:00'),
('Period 4', '10:30:00', '11:05:00'),
('Period 5', '11:20:00', '11:55:00'),
('Period 6', '11:55:00', '12:30:00'),
('Period 7', '13:30:00', '14:05:00'),
('Period 8', '14:05:00', '14:40:00'),
('Period 9', '14:40:00', '15:15:00'),
('Period 10', '15:25:00', '16:00:00'),
('Period 11', '14:50:00', '15:25:00'),
('Period 12', '15:25:00', '16:00:00');

INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex) VALUES
('陳方綾', 'CHAN CHEUK LING', 1, '01', 'F'),
('陳塏營', 'CHAN HOI YING', 1, '02', 'F'),
('陳凱芯', 'CHAN HOI YU', 1, '03', 'F'),
('周芷樂', 'CHAU TSZ LOK', 1, '04', 'F'),
('張梓千', 'CHEUNG TZE CHIN', 1, '05', 'M'),
('李樂晴', 'LEE LOK CHING', 2, '01', 'F'),
('黃凱研', 'WONG HEI YIN', 2, '02', 'F'),
('趙優', 'CHIU YAU', 2, '03', 'F');

INSERT INTO student_subject (student_id, subject_id) VALUES
(1, 1), (1, 2), (1, 3), (1, 8),
(2, 1), (2, 2), (2, 3), (2, 9),
(3, 1), (3, 2), (3, 3), (3, 18),
(4, 1), (4, 2), (4, 3),
(5, 1), (5, 2), (5, 3),
(6, 1), (6, 2), (6, 3),
(7, 1), (7, 2), (7, 3),
(8, 1), (8, 2), (8, 3);

INSERT INTO teacher_subject (teacher_id, subject_id) VALUES
(1, 1), (1, 3),
(2, 2), (2, 5),
(3, 3), (3, 8),
(4, 1), (4, 9);

INSERT INTO timetable (teacher_id, subject_id, class_id, room_id, day_of_week, period_id) VALUES
(1, 3, 1, 3, 'Mon', 3),
(1, 3, 5, 7, 'Tue', 2),
(2, 2, 1, 3, 'Mon', 2),
(2, 5, 1, 1, 'Fri', 1),
(3, 1, 2, 4, 'Wed', 5),
(4, 9, 13, 18, 'Thu', 11),
(4, 9, 17, 26, 'Fri', 12);

INSERT INTO staging_teacher (teacher_code, teacher_name, email) VALUES
('CWK', 'CWK', 'cwk@school.test'),
('CWT', 'CWT', 'cwt@school.test'),
('QWE', 'QWE', 'qwe@school.test'),
('SING', 'SING', 'singsing894@gmail.com');

INSERT INTO staging_timetable (teacher_code, subject, class, room, day_of_week, period) VALUES
('CWK', 'Mathematics', '1M', '202 1M Classroom', 'Mon', 'Period 3'),
('CWT', 'Chinese Language', '1M', '202 1M Classroom', 'Mon', 'Period 2'),
('QWE', 'English', '1A', '203 1A Classroom', 'Wed', 'Period 5'),
('SING', 'History', '4M', '502 4M Classroom', 'Thu', 'Period 11');

INSERT INTO BLA (teacher_id, student_id, subject_id) VALUES
(1, 1, 3), (2, 2, 2);

INSERT INTO nomination (teacher_id, student_id) VALUES
(1, 1), (2, 2);

INSERT INTO prefect_nomination (teacher_id, student_id) VALUES
(1, 3), (2, 4);

INSERT INTO learning_goal_record (teacher_id, student_id, completed_goals) VALUES
(1, 1, 4), (1, 2, 6), (2, 3, 8);
-- Bilingual subject and room labels for school deployment
UPDATE subject
SET
  subject_name_zh = CASE TRIM(subject_name)
    WHEN 'English' THEN '英國語文'
    WHEN 'English Language' THEN '英國語文'
    WHEN 'ENG(Speaking)' THEN '英語會話'
    WHEN 'Chinese Language' THEN '中國語文'
    WHEN 'CHIN' THEN '中國語文'
    WHEN 'CL' THEN '中國語文'
    WHEN 'Mathematics' THEN '數學'
    WHEN 'Math(M1)-B3' THEN '數學延伸單元一'
    WHEN 'Citizenship and Social Development' THEN '公民與社會發展'
    WHEN 'CES' THEN '公民、經濟與社會'
    WHEN 'SCJ' THEN '綜合科學'
    WHEN 'SCJb' THEN '綜合科學'
    WHEN 'SCJc' THEN '綜合科學'
    WHEN 'CS' THEN '綜合科學'
    WHEN 'CHEM-B1' THEN '化學'
    WHEN 'Chemistry' THEN '化學'
    WHEN 'PHY-B2' THEN '物理'
    WHEN 'Physics' THEN '物理'
    WHEN 'BIO-B2' THEN '生物'
    WHEN 'BIO-B3' THEN '生物'
    WHEN 'Biology' THEN '生物'
    WHEN 'ICT' THEN '資訊及通訊科技'
    WHEN 'ICT-B1' THEN '資訊及通訊科技'
    WHEN 'ICT-B2' THEN '資訊及通訊科技'
    WHEN 'CHIS' THEN '中國歷史'
    WHEN 'CHIS-B2' THEN '中國歷史'
    WHEN 'HIST' THEN '歷史'
    WHEN 'HIST-B1' THEN '歷史'
    WHEN 'History' THEN '歷史'
    WHEN 'CLIT-B1' THEN '中國文學'
    WHEN 'Chinese Literature' THEN '中國文學'
    WHEN 'GEOG' THEN '地理'
    WHEN 'GEOG-B1' THEN '地理'
    WHEN 'Geography' THEN '地理'
    WHEN 'ECON-B1' THEN '經濟'
    WHEN 'ECON-B3' THEN '經濟'
    WHEN 'Economics' THEN '經濟'
    WHEN 'BAFS' THEN '企業、會計與財務概論'
    WHEN 'BAFS-B2' THEN '企業、會計與財務概論'
    WHEN 'VA' THEN '視覺藝術'
    WHEN 'VAD-B2' THEN '視覺藝術'
    WHEN 'Visual Arts' THEN '視覺藝術'
    WHEN 'PE' THEN '體育'
    WHEN 'Physical Education' THEN '體育'
    WHEN 'MUS' THEN '音樂'
    WHEN 'Music' THEN '音樂'
    WHEN 'PTH' THEN '普通話'
    WHEN 'Putonghua' THEN '普通話'
    WHEN 'RS' THEN '宗教教育'
    WHEN 'RE' THEN '宗教教育'
    WHEN 'Religious Education' THEN '宗教教育'
    WHEN 'E&RE' THEN '倫理與宗教'
    WHEN 'TL' THEN '科技與生活'
    WHEN 'TLC-B3' THEN '科技與生活'
    WHEN 'HMSC-B3' THEN '健康管理與社會關懷'
    WHEN 'Career_Planning' THEN '生涯規劃'
    WHEN '班主任課' THEN '班主任課'
    WHEN '中文(非華語組)' THEN '中文（非華語組）'
    WHEN 'JAP-B3' THEN '日語'
    WHEN 'WCU-B3' THEN '西班牙語'
    WHEN 'SUPP1-B1' THEN '輔導課一'
    WHEN 'SUPP1-B3' THEN '輔導課一'
    WHEN 'SUPP2-B2' THEN '輔導課二'
    WHEN 'SUPP2-B3' THEN '輔導課二'
    WHEN 'SUPP3-B3' THEN '輔導課三'
    WHEN 'SUPP4-B3' THEN '輔導課四'
    ELSE COALESCE(subject_name_zh, subject_name)
  END,
  subject_name_en = CASE TRIM(subject_name)
    WHEN 'English' THEN 'English Language'
    WHEN 'English Language' THEN 'English Language'
    WHEN 'ENG(Speaking)' THEN 'English Speaking'
    WHEN 'Chinese Language' THEN 'Chinese Language'
    WHEN 'CHIN' THEN 'Chinese Language'
    WHEN 'CL' THEN 'Chinese Language'
    WHEN 'Mathematics' THEN 'Mathematics'
    WHEN 'Math(M1)-B3' THEN 'Mathematics Extended Module 1'
    WHEN 'Citizenship and Social Development' THEN 'Citizenship and Social Development'
    WHEN 'CES' THEN 'Citizenship, Economics and Society'
    WHEN 'SCJ' THEN 'Integrated Science'
    WHEN 'SCJb' THEN 'Integrated Science'
    WHEN 'SCJc' THEN 'Integrated Science'
    WHEN 'CS' THEN 'Integrated Science'
    WHEN 'CHEM-B1' THEN 'Chemistry'
    WHEN 'Chemistry' THEN 'Chemistry'
    WHEN 'PHY-B2' THEN 'Physics'
    WHEN 'Physics' THEN 'Physics'
    WHEN 'BIO-B2' THEN 'Biology'
    WHEN 'BIO-B3' THEN 'Biology'
    WHEN 'Biology' THEN 'Biology'
    WHEN 'ICT' THEN 'Information and Communication Technology'
    WHEN 'ICT-B1' THEN 'Information and Communication Technology'
    WHEN 'ICT-B2' THEN 'Information and Communication Technology'
    WHEN 'CHIS' THEN 'Chinese History'
    WHEN 'CHIS-B2' THEN 'Chinese History'
    WHEN 'HIST' THEN 'History'
    WHEN 'HIST-B1' THEN 'History'
    WHEN 'History' THEN 'History'
    WHEN 'CLIT-B1' THEN 'Chinese Literature'
    WHEN 'Chinese Literature' THEN 'Chinese Literature'
    WHEN 'GEOG' THEN 'Geography'
    WHEN 'GEOG-B1' THEN 'Geography'
    WHEN 'Geography' THEN 'Geography'
    WHEN 'ECON-B1' THEN 'Economics'
    WHEN 'ECON-B3' THEN 'Economics'
    WHEN 'Economics' THEN 'Economics'
    WHEN 'BAFS' THEN 'Business, Accounting and Financial Studies'
    WHEN 'BAFS-B2' THEN 'Business, Accounting and Financial Studies'
    WHEN 'VA' THEN 'Visual Arts'
    WHEN 'VAD-B2' THEN 'Visual Arts'
    WHEN 'Visual Arts' THEN 'Visual Arts'
    WHEN 'PE' THEN 'Physical Education'
    WHEN 'Physical Education' THEN 'Physical Education'
    WHEN 'MUS' THEN 'Music'
    WHEN 'Music' THEN 'Music'
    WHEN 'PTH' THEN 'Putonghua'
    WHEN 'Putonghua' THEN 'Putonghua'
    WHEN 'RS' THEN 'Religious Education'
    WHEN 'RE' THEN 'Religious Education'
    WHEN 'Religious Education' THEN 'Religious Education'
    WHEN 'E&RE' THEN 'Ethics and Religious Education'
    WHEN 'TL' THEN 'Technology and Living'
    WHEN 'TLC-B3' THEN 'Technology and Living'
    WHEN 'HMSC-B3' THEN 'Health Management and Social Care'
    WHEN 'Career_Planning' THEN 'Career Planning'
    WHEN '班主任課' THEN 'Class Teacher Period'
    WHEN '中文(非華語組)' THEN 'Chinese for Non-Chinese Speaking Students'
    WHEN 'JAP-B3' THEN 'Japanese'
    WHEN 'WCU-B3' THEN 'Spanish'
    WHEN 'SUPP1-B1' THEN 'Support Class 1'
    WHEN 'SUPP1-B3' THEN 'Support Class 1'
    WHEN 'SUPP2-B2' THEN 'Support Class 2'
    WHEN 'SUPP2-B3' THEN 'Support Class 2'
    WHEN 'SUPP3-B3' THEN 'Support Class 3'
    WHEN 'SUPP4-B3' THEN 'Support Class 4'
    ELSE COALESCE(subject_name_en, subject_name)
  END;

UPDATE room
SET
  room_name_zh = CASE
    WHEN TRIM(room_name) REGEXP '^G01C([[:space:]]|$)' THEN 'G01C 會見室（一）'
    WHEN TRIM(room_name) REGEXP '^G01D([[:space:]]|$)' THEN 'G01D 會見室（二）'
    WHEN TRIM(room_name) REGEXP '^G01K([[:space:]]|$)' THEN 'G01K 會議室'
    WHEN TRIM(room_name) REGEXP '^G01R([[:space:]]|$)' THEN 'G01R 學生活動中心'
    WHEN TRIM(room_name) IN ('操場', 'Playground') THEN '操場'
    WHEN TRIM(room_name) IN ('有蓋操場', 'Covered Playground') THEN '有蓋操場'
    WHEN TRIM(room_name) REGEXP '^101([[:space:]]|$)' THEN '101 視覺藝術室'
    WHEN TRIM(room_name) REGEXP '^102([[:space:]]|$)' THEN '102 音樂室'
    WHEN TRIM(room_name) REGEXP '^111([[:space:]]|$)' THEN '111 溫室'
    WHEN TRIM(room_name) LIKE '一樓玻璃房%' OR TRIM(room_name) LIKE '%Sonata%' THEN '一樓玻璃房（Sonata）'
    WHEN TRIM(room_name) REGEXP '^201([[:space:]]|$)' THEN '201 Little Britain'
    WHEN TRIM(room_name) REGEXP '^209A([[:space:]]|$)' THEN '209A 講廳'
    WHEN TRIM(room_name) REGEXP '^209B([[:space:]]|$)' THEN '209B 創意藝術室'
    WHEN TRIM(room_name) REGEXP '^309([[:space:]]|$)' THEN '309 AI Lab'
    WHEN TRIM(room_name) REGEXP '^311([[:space:]]|$)' THEN '311 電腦室'
    WHEN TRIM(room_name) REGEXP '^409([[:space:]]|$)' THEN '409 IS Lab'
    WHEN TRIM(room_name) REGEXP '^412([[:space:]]|$)' THEN '412 IS Lab'
    WHEN TRIM(room_name) REGEXP '^413([[:space:]]|$)' THEN '413 CAL 室'
    WHEN TRIM(room_name) REGEXP '^415([[:space:]]|$)' THEN '415 圖書館'
    WHEN TRIM(room_name) REGEXP '^509([[:space:]]|$)' THEN '509 地理室'
    WHEN TRIM(room_name) REGEXP '^511([[:space:]]|$)' THEN '511 生物實驗室'
    WHEN TRIM(room_name) REGEXP '^513([[:space:]]|$)' THEN '513 家政室'
    WHEN TRIM(room_name) REGEXP '^609([[:space:]]|$)' THEN '609 化學實驗室'
    WHEN TRIM(room_name) REGEXP '^611([[:space:]]|$)' THEN '611 物理實驗室'
    WHEN TRIM(room_name) REGEXP '^612([[:space:]]|$)' THEN '612 源活齋'
    WHEN TRIM(room_name) REGEXP '^613([[:space:]]|$)' THEN '613 源活齋'
    WHEN TRIM(room_name) REGEXP '^710([[:space:]]|$)' THEN '710 Cozy Lounge'
    WHEN TRIM(room_name) REGEXP '^202([[:space:]]|$)' THEN '202 1M 課室'
    WHEN TRIM(room_name) REGEXP '^203([[:space:]]|$)' THEN '203 1A 課室'
    WHEN TRIM(room_name) REGEXP '^204([[:space:]]|$)' THEN '204 1R 課室'
    WHEN TRIM(room_name) REGEXP '^205([[:space:]]|$)' THEN '205 1Y 課室'
    WHEN TRIM(room_name) REGEXP '^301([[:space:]]|$)' THEN '301 課室'
    WHEN TRIM(room_name) REGEXP '^302([[:space:]]|$)' THEN '302 2M 課室'
    WHEN TRIM(room_name) REGEXP '^303([[:space:]]|$)' THEN '303 2A 課室'
    WHEN TRIM(room_name) REGEXP '^304([[:space:]]|$)' THEN '304 2R 課室'
    WHEN TRIM(room_name) REGEXP '^305([[:space:]]|$)' THEN '305 2Y 課室'
    WHEN TRIM(room_name) REGEXP '^401([[:space:]]|$)' THEN '401 課室'
    WHEN TRIM(room_name) REGEXP '^402([[:space:]]|$)' THEN '402 3M 課室'
    WHEN TRIM(room_name) REGEXP '^403([[:space:]]|$)' THEN '403 3A 課室'
    WHEN TRIM(room_name) REGEXP '^404([[:space:]]|$)' THEN '404 3R 課室'
    WHEN TRIM(room_name) REGEXP '^405([[:space:]]|$)' THEN '405 3Y 課室'
    WHEN TRIM(room_name) REGEXP '^501([[:space:]]|$)' THEN '501 課室'
    WHEN TRIM(room_name) REGEXP '^502([[:space:]]|$)' THEN '502 4M 課室'
    WHEN TRIM(room_name) REGEXP '^503([[:space:]]|$)' THEN '503 4A 課室'
    WHEN TRIM(room_name) REGEXP '^504([[:space:]]|$)' THEN '504 4R 課室'
    WHEN TRIM(room_name) REGEXP '^505([[:space:]]|$)' THEN '505 4Y 課室'
    WHEN TRIM(room_name) REGEXP '^601([[:space:]]|$)' THEN '601 課室'
    WHEN TRIM(room_name) REGEXP '^602([[:space:]]|$)' THEN '602 5Y 課室'
    WHEN TRIM(room_name) REGEXP '^603([[:space:]]|$)' THEN '603 5R 課室'
    WHEN TRIM(room_name) REGEXP '^604([[:space:]]|$)' THEN '604 5A 課室'
    WHEN TRIM(room_name) REGEXP '^605([[:space:]]|$)' THEN '605 5M 課室'
    WHEN TRIM(room_name) REGEXP '^701([[:space:]]|$)' THEN '701 課室'
    WHEN TRIM(room_name) REGEXP '^702([[:space:]]|$)' THEN '702 6M 課室'
    WHEN TRIM(room_name) REGEXP '^703([[:space:]]|$)' THEN '703 6A 課室'
    WHEN TRIM(room_name) REGEXP '^704([[:space:]]|$)' THEN '704 6R 課室'
    WHEN TRIM(room_name) REGEXP '^705([[:space:]]|$)' THEN '705 6Y 課室'
    ELSE COALESCE(room_name_zh, room_name)
  END,
  room_name_en = CASE
    WHEN TRIM(room_name) REGEXP '^G01C([[:space:]]|$)' THEN 'G01C Meeting Room 1'
    WHEN TRIM(room_name) REGEXP '^G01D([[:space:]]|$)' THEN 'G01D Meeting Room 2'
    WHEN TRIM(room_name) REGEXP '^G01K([[:space:]]|$)' THEN 'G01K Conference Room'
    WHEN TRIM(room_name) REGEXP '^G01R([[:space:]]|$)' THEN 'G01R Student Activity Centre'
    WHEN TRIM(room_name) IN ('操場', 'Playground') THEN 'Playground'
    WHEN TRIM(room_name) IN ('有蓋操場', 'Covered Playground') THEN 'Covered Playground'
    WHEN TRIM(room_name) REGEXP '^101([[:space:]]|$)' THEN '101 Visual Arts Room'
    WHEN TRIM(room_name) REGEXP '^102([[:space:]]|$)' THEN '102 Music Room'
    WHEN TRIM(room_name) REGEXP '^111([[:space:]]|$)' THEN '111 Greenhouse'
    WHEN TRIM(room_name) LIKE '一樓玻璃房%' OR TRIM(room_name) LIKE '%Sonata%' THEN 'First Floor Glass Room (Sonata)'
    WHEN TRIM(room_name) REGEXP '^201([[:space:]]|$)' THEN '201 Little Britain'
    WHEN TRIM(room_name) REGEXP '^209A([[:space:]]|$)' THEN '209A Lecture Theatre'
    WHEN TRIM(room_name) REGEXP '^209B([[:space:]]|$)' THEN '209B Creative Arts Room'
    WHEN TRIM(room_name) REGEXP '^309([[:space:]]|$)' THEN '309 AI Lab'
    WHEN TRIM(room_name) REGEXP '^311([[:space:]]|$)' THEN '311 Computer Room'
    WHEN TRIM(room_name) REGEXP '^409([[:space:]]|$)' THEN '409 IS Lab'
    WHEN TRIM(room_name) REGEXP '^412([[:space:]]|$)' THEN '412 IS Lab'
    WHEN TRIM(room_name) REGEXP '^413([[:space:]]|$)' THEN '413 CAL Room'
    WHEN TRIM(room_name) REGEXP '^415([[:space:]]|$)' THEN '415 Library'
    WHEN TRIM(room_name) REGEXP '^509([[:space:]]|$)' THEN '509 Geography Room'
    WHEN TRIM(room_name) REGEXP '^511([[:space:]]|$)' THEN '511 Biology Laboratory'
    WHEN TRIM(room_name) REGEXP '^513([[:space:]]|$)' THEN '513 Home Economics Room'
    WHEN TRIM(room_name) REGEXP '^609([[:space:]]|$)' THEN '609 Chemistry Laboratory'
    WHEN TRIM(room_name) REGEXP '^611([[:space:]]|$)' THEN '611 Physics Laboratory'
    WHEN TRIM(room_name) REGEXP '^612([[:space:]]|$)' THEN '612 Reflection Room'
    WHEN TRIM(room_name) REGEXP '^613([[:space:]]|$)' THEN '613 Reflection Room'
    WHEN TRIM(room_name) REGEXP '^710([[:space:]]|$)' THEN '710 Cozy Lounge'
    WHEN TRIM(room_name) REGEXP '^202([[:space:]]|$)' THEN '202 1M Classroom'
    WHEN TRIM(room_name) REGEXP '^203([[:space:]]|$)' THEN '203 1A Classroom'
    WHEN TRIM(room_name) REGEXP '^204([[:space:]]|$)' THEN '204 1R Classroom'
    WHEN TRIM(room_name) REGEXP '^205([[:space:]]|$)' THEN '205 1Y Classroom'
    WHEN TRIM(room_name) REGEXP '^301([[:space:]]|$)' THEN '301 Classroom'
    WHEN TRIM(room_name) REGEXP '^302([[:space:]]|$)' THEN '302 2M Classroom'
    WHEN TRIM(room_name) REGEXP '^303([[:space:]]|$)' THEN '303 2A Classroom'
    WHEN TRIM(room_name) REGEXP '^304([[:space:]]|$)' THEN '304 2R Classroom'
    WHEN TRIM(room_name) REGEXP '^305([[:space:]]|$)' THEN '305 2Y Classroom'
    WHEN TRIM(room_name) REGEXP '^401([[:space:]]|$)' THEN '401 Classroom'
    WHEN TRIM(room_name) REGEXP '^402([[:space:]]|$)' THEN '402 3M Classroom'
    WHEN TRIM(room_name) REGEXP '^403([[:space:]]|$)' THEN '403 3A Classroom'
    WHEN TRIM(room_name) REGEXP '^404([[:space:]]|$)' THEN '404 3R Classroom'
    WHEN TRIM(room_name) REGEXP '^405([[:space:]]|$)' THEN '405 3Y Classroom'
    WHEN TRIM(room_name) REGEXP '^501([[:space:]]|$)' THEN '501 Classroom'
    WHEN TRIM(room_name) REGEXP '^502([[:space:]]|$)' THEN '502 4M Classroom'
    WHEN TRIM(room_name) REGEXP '^503([[:space:]]|$)' THEN '503 4A Classroom'
    WHEN TRIM(room_name) REGEXP '^504([[:space:]]|$)' THEN '504 4R Classroom'
    WHEN TRIM(room_name) REGEXP '^505([[:space:]]|$)' THEN '505 4Y Classroom'
    WHEN TRIM(room_name) REGEXP '^601([[:space:]]|$)' THEN '601 Classroom'
    WHEN TRIM(room_name) REGEXP '^602([[:space:]]|$)' THEN '602 5Y Classroom'
    WHEN TRIM(room_name) REGEXP '^603([[:space:]]|$)' THEN '603 5R Classroom'
    WHEN TRIM(room_name) REGEXP '^604([[:space:]]|$)' THEN '604 5A Classroom'
    WHEN TRIM(room_name) REGEXP '^605([[:space:]]|$)' THEN '605 5M Classroom'
    WHEN TRIM(room_name) REGEXP '^701([[:space:]]|$)' THEN '701 Classroom'
    WHEN TRIM(room_name) REGEXP '^702([[:space:]]|$)' THEN '702 6M Classroom'
    WHEN TRIM(room_name) REGEXP '^703([[:space:]]|$)' THEN '703 6A Classroom'
    WHEN TRIM(room_name) REGEXP '^704([[:space:]]|$)' THEN '704 6R Classroom'
    WHEN TRIM(room_name) REGEXP '^705([[:space:]]|$)' THEN '705 6Y Classroom'
    ELSE COALESCE(room_name_en, room_name)
  END;
