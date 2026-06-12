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
  is_elective BOOLEAN DEFAULT FALSE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE room (
  room_id BIGINT AUTO_INCREMENT PRIMARY KEY,
  room_name VARCHAR(255) UNIQUE NOT NULL
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
  UNIQUE KEY unique_room_slot (room_id, day_of_week, period_id),
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
