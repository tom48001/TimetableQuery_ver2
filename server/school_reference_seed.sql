-- Generated from Sample_teacher_data_v1.csv
-- Run this before importing outputs/school_timetable_import_system_periods.xlsx
USE school_management;

-- Ensure bilingual columns exist when upgrading an existing database.
DROP PROCEDURE IF EXISTS ensure_school_bilingual_columns;
DELIMITER $$
CREATE PROCEDURE ensure_school_bilingual_columns()
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'subject' AND COLUMN_NAME = 'subject_name_zh'
  ) THEN
    ALTER TABLE subject ADD COLUMN subject_name_zh VARCHAR(255) NULL AFTER subject_name;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'subject' AND COLUMN_NAME = 'subject_name_en'
  ) THEN
    ALTER TABLE subject ADD COLUMN subject_name_en VARCHAR(255) NULL AFTER subject_name_zh;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'room' AND COLUMN_NAME = 'room_name_zh'
  ) THEN
    ALTER TABLE room ADD COLUMN room_name_zh VARCHAR(255) NULL AFTER room_name;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.COLUMNS
    WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 'room' AND COLUMN_NAME = 'room_name_en'
  ) THEN
    ALTER TABLE room ADD COLUMN room_name_en VARCHAR(255) NULL AFTER room_name_zh;
  END IF;
END$$
DELIMITER ;
CALL ensure_school_bilingual_columns();
DROP PROCEDURE ensure_school_bilingual_columns;


INSERT INTO class (class_name, grade_level)
SELECT '#5A/5M', 'F5'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '#5A/5M');
INSERT INTO class (class_name, grade_level)
SELECT '#5R', 'F5'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '#5R');
INSERT INTO class (class_name, grade_level)
SELECT '#5Y', 'F5'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '#5Y');
INSERT INTO class (class_name, grade_level)
SELECT '#6A/6M', 'F6'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '#6A/6M');
INSERT INTO class (class_name, grade_level)
SELECT '#6R/6Y', 'F6'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '#6R/6Y');
INSERT INTO class (class_name, grade_level)
SELECT '1A', 'F1'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '1A');
INSERT INTO class (class_name, grade_level)
SELECT '1A/1M', 'F1'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '1A/1M');
INSERT INTO class (class_name, grade_level)
SELECT '1M', 'F1'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '1M');
INSERT INTO class (class_name, grade_level)
SELECT '1R', 'F1'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '1R');
INSERT INTO class (class_name, grade_level)
SELECT '1R/1Y', 'F1'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '1R/1Y');
INSERT INTO class (class_name, grade_level)
SELECT '1Y', 'F1'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '1Y');
INSERT INTO class (class_name, grade_level)
SELECT '2A', 'F2'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '2A');
INSERT INTO class (class_name, grade_level)
SELECT '2A/2M', 'F2'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '2A/2M');
INSERT INTO class (class_name, grade_level)
SELECT '2M', 'F2'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '2M');
INSERT INTO class (class_name, grade_level)
SELECT '2R', 'F2'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '2R');
INSERT INTO class (class_name, grade_level)
SELECT '2R/2Y', 'F2'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '2R/2Y');
INSERT INTO class (class_name, grade_level)
SELECT '2Y', 'F2'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '2Y');
INSERT INTO class (class_name, grade_level)
SELECT '3A', 'F3'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '3A');
INSERT INTO class (class_name, grade_level)
SELECT '3A/3M', 'F3'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '3A/3M');
INSERT INTO class (class_name, grade_level)
SELECT '3M', 'F3'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '3M');
INSERT INTO class (class_name, grade_level)
SELECT '3R', 'F3'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '3R');
INSERT INTO class (class_name, grade_level)
SELECT '3R/3Y', 'F3'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '3R/3Y');
INSERT INTO class (class_name, grade_level)
SELECT '3Y', 'F3'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '3Y');
INSERT INTO class (class_name, grade_level)
SELECT '4A', 'F4'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '4A');
INSERT INTO class (class_name, grade_level)
SELECT '4A/4M', 'F4'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '4A/4M');
INSERT INTO class (class_name, grade_level)
SELECT '4M', 'F4'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '4M');
INSERT INTO class (class_name, grade_level)
SELECT '4R', 'F4'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '4R');
INSERT INTO class (class_name, grade_level)
SELECT '4R/4Y', 'F4'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '4R/4Y');
INSERT INTO class (class_name, grade_level)
SELECT '4Y', 'F4'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '4Y');
INSERT INTO class (class_name, grade_level)
SELECT '5A', 'F5'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '5A');
INSERT INTO class (class_name, grade_level)
SELECT '5A/5M', 'F5'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '5A/5M');
INSERT INTO class (class_name, grade_level)
SELECT '5M', 'F5'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '5M');
INSERT INTO class (class_name, grade_level)
SELECT '5R', 'F5'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '5R');
INSERT INTO class (class_name, grade_level)
SELECT '5R/5Y', 'F5'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '5R/5Y');
INSERT INTO class (class_name, grade_level)
SELECT '5Y', 'F5'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '5Y');
INSERT INTO class (class_name, grade_level)
SELECT '6A', 'F6'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '6A');
INSERT INTO class (class_name, grade_level)
SELECT '6A/6M', 'F6'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '6A/6M');
INSERT INTO class (class_name, grade_level)
SELECT '6M', 'F6'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '6M');
INSERT INTO class (class_name, grade_level)
SELECT '6R', 'F6'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '6R');
INSERT INTO class (class_name, grade_level)
SELECT '6R/6Y', 'F6'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '6R/6Y');
INSERT INTO class (class_name, grade_level)
SELECT '6Y', 'F6'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = '6Y');
INSERT INTO class (class_name, grade_level)
SELECT 'S4', 'F4'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = 'S4');
INSERT INTO class (class_name, grade_level)
SELECT 'S5', 'F5'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = 'S5');
INSERT INTO class (class_name, grade_level)
SELECT 'S6', 'F6'
WHERE NOT EXISTS (SELECT 1 FROM class WHERE TRIM(class_name) = 'S6');

INSERT INTO subject (subject_name, is_elective)
SELECT 'BAFS-B2', 1
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'BAFS-B2');
INSERT INTO subject (subject_name, is_elective)
SELECT 'BIO-B2', 1
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'BIO-B2');
INSERT INTO subject (subject_name, is_elective)
SELECT 'BIO-B3', 1
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'BIO-B3');
INSERT INTO subject (subject_name, is_elective)
SELECT 'CES', 0
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'CES');
INSERT INTO subject (subject_name, is_elective)
SELECT 'CHEM-B1', 1
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'CHEM-B1');
INSERT INTO subject (subject_name, is_elective)
SELECT 'CHIN', 0
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'CHIN');
INSERT INTO subject (subject_name, is_elective)
SELECT 'CHIS', 0
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'CHIS');
INSERT INTO subject (subject_name, is_elective)
SELECT 'CHIS-B2', 1
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'CHIS-B2');
INSERT INTO subject (subject_name, is_elective)
SELECT 'CL', 0
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'CL');
INSERT INTO subject (subject_name, is_elective)
SELECT 'CLIT-B1', 1
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'CLIT-B1');
INSERT INTO subject (subject_name, is_elective)
SELECT 'CS', 0
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'CS');
INSERT INTO subject (subject_name, is_elective)
SELECT 'Career_Planning', 0
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'Career_Planning');
INSERT INTO subject (subject_name, is_elective)
SELECT 'E&RE', 0
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'E&RE');
INSERT INTO subject (subject_name, is_elective)
SELECT 'ECON-B1', 1
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'ECON-B1');
INSERT INTO subject (subject_name, is_elective)
SELECT 'ECON-B3', 1
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'ECON-B3');
INSERT INTO subject (subject_name, is_elective)
SELECT 'ENG', 0
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'ENG');
INSERT INTO subject (subject_name, is_elective)
SELECT 'ENG(Speaking)', 0
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'ENG(Speaking)');
INSERT INTO subject (subject_name, is_elective)
SELECT 'GEOG', 0
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'GEOG');
INSERT INTO subject (subject_name, is_elective)
SELECT 'GEOG-B1', 1
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'GEOG-B1');
INSERT INTO subject (subject_name, is_elective)
SELECT 'HIST', 0
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'HIST');
INSERT INTO subject (subject_name, is_elective)
SELECT 'HIST-B1', 1
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'HIST-B1');
INSERT INTO subject (subject_name, is_elective)
SELECT 'HMSC-B3', 1
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'HMSC-B3');
INSERT INTO subject (subject_name, is_elective)
SELECT 'ICT-B1', 1
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'ICT-B1');
INSERT INTO subject (subject_name, is_elective)
SELECT 'ICT-B2', 1
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'ICT-B2');
INSERT INTO subject (subject_name, is_elective)
SELECT 'JAP-B3', 1
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'JAP-B3');
INSERT INTO subject (subject_name, is_elective)
SELECT 'MATH', 0
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'MATH');
INSERT INTO subject (subject_name, is_elective)
SELECT 'MUS', 0
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'MUS');
INSERT INTO subject (subject_name, is_elective)
SELECT 'Math(M1)-B3', 1
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'Math(M1)-B3');
INSERT INTO subject (subject_name, is_elective)
SELECT 'PE', 0
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'PE');
INSERT INTO subject (subject_name, is_elective)
SELECT 'PHY-B2', 1
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'PHY-B2');
INSERT INTO subject (subject_name, is_elective)
SELECT 'PTH', 0
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'PTH');
INSERT INTO subject (subject_name, is_elective)
SELECT 'RE', 0
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'RE');
INSERT INTO subject (subject_name, is_elective)
SELECT 'RS', 0
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'RS');
INSERT INTO subject (subject_name, is_elective)
SELECT 'SCJ', 0
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'SCJ');
INSERT INTO subject (subject_name, is_elective)
SELECT 'SCJb', 0
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'SCJb');
INSERT INTO subject (subject_name, is_elective)
SELECT 'SCJc', 0
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'SCJc');
INSERT INTO subject (subject_name, is_elective)
SELECT 'STEM', 0
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'STEM');
INSERT INTO subject (subject_name, is_elective)
SELECT 'SUPP1-B1', 1
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'SUPP1-B1');
INSERT INTO subject (subject_name, is_elective)
SELECT 'SUPP1-B3', 1
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'SUPP1-B3');
INSERT INTO subject (subject_name, is_elective)
SELECT 'SUPP2-B2', 1
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'SUPP2-B2');
INSERT INTO subject (subject_name, is_elective)
SELECT 'SUPP2-B3', 1
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'SUPP2-B3');
INSERT INTO subject (subject_name, is_elective)
SELECT 'SUPP3-B3', 1
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'SUPP3-B3');
INSERT INTO subject (subject_name, is_elective)
SELECT 'SUPP4-B3', 1
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'SUPP4-B3');
INSERT INTO subject (subject_name, is_elective)
SELECT 'TL', 0
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'TL');
INSERT INTO subject (subject_name, is_elective)
SELECT 'TLC-B3', 1
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'TLC-B3');
INSERT INTO subject (subject_name, is_elective)
SELECT 'VA', 0
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'VA');
INSERT INTO subject (subject_name, is_elective)
SELECT 'VAD-B2', 1
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'VAD-B2');
INSERT INTO subject (subject_name, is_elective)
SELECT 'WCU-B3', 1
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = 'WCU-B3');
INSERT INTO subject (subject_name, is_elective)
SELECT '中文(非華語組)', 0
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = '中文(非華語組)');
INSERT INTO subject (subject_name, is_elective)
SELECT '班主任課', 0
WHERE NOT EXISTS (SELECT 1 FROM subject WHERE TRIM(subject_name) = '班主任課');

INSERT INTO room (room_name)
SELECT '101'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '101');
INSERT INTO room (room_name)
SELECT '102'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '102');
INSERT INTO room (room_name)
SELECT '111'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '111');
INSERT INTO room (room_name)
SELECT '201'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '201');
INSERT INTO room (room_name)
SELECT '202'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '202');
INSERT INTO room (room_name)
SELECT '203'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '203');
INSERT INTO room (room_name)
SELECT '204'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '204');
INSERT INTO room (room_name)
SELECT '205'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '205');
INSERT INTO room (room_name)
SELECT '209'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '209');
INSERT INTO room (room_name)
SELECT '301'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '301');
INSERT INTO room (room_name)
SELECT '302'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '302');
INSERT INTO room (room_name)
SELECT '303'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '303');
INSERT INTO room (room_name)
SELECT '304'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '304');
INSERT INTO room (room_name)
SELECT '305'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '305');
INSERT INTO room (room_name)
SELECT '309'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '309');
INSERT INTO room (room_name)
SELECT '311'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '311');
INSERT INTO room (room_name)
SELECT '401'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '401');
INSERT INTO room (room_name)
SELECT '402'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '402');
INSERT INTO room (room_name)
SELECT '403'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '403');
INSERT INTO room (room_name)
SELECT '404'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '404');
INSERT INTO room (room_name)
SELECT '405'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '405');
INSERT INTO room (room_name)
SELECT '409'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '409');
INSERT INTO room (room_name)
SELECT '412'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '412');
INSERT INTO room (room_name)
SELECT '413'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '413');
INSERT INTO room (room_name)
SELECT '415'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '415');
INSERT INTO room (room_name)
SELECT '501'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '501');
INSERT INTO room (room_name)
SELECT '502'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '502');
INSERT INTO room (room_name)
SELECT '503'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '503');
INSERT INTO room (room_name)
SELECT '504'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '504');
INSERT INTO room (room_name)
SELECT '505'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '505');
INSERT INTO room (room_name)
SELECT '509'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '509');
INSERT INTO room (room_name)
SELECT '511'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '511');
INSERT INTO room (room_name)
SELECT '513'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '513');
INSERT INTO room (room_name)
SELECT '515'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '515');
INSERT INTO room (room_name)
SELECT '601'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '601');
INSERT INTO room (room_name)
SELECT '602'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '602');
INSERT INTO room (room_name)
SELECT '603'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '603');
INSERT INTO room (room_name)
SELECT '604'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '604');
INSERT INTO room (room_name)
SELECT '605'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '605');
INSERT INTO room (room_name)
SELECT '609'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '609');
INSERT INTO room (room_name)
SELECT '611'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '611');
INSERT INTO room (room_name)
SELECT '701'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '701');
INSERT INTO room (room_name)
SELECT '702'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '702');
INSERT INTO room (room_name)
SELECT '703'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '703');
INSERT INTO room (room_name)
SELECT '704'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '704');
INSERT INTO room (room_name)
SELECT '705'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = '705');
INSERT INTO room (room_name)
SELECT 'G01'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = 'G01');
INSERT INTO room (room_name)
SELECT 'VTC'
WHERE NOT EXISTS (SELECT 1 FROM room WHERE TRIM(room_name) = 'VTC');

INSERT INTO period (period_name, start_time, end_time)
SELECT 'Period 1', '08:30:00', '09:05:00'
WHERE NOT EXISTS (SELECT 1 FROM period WHERE TRIM(period_name) = 'Period 1');
INSERT INTO period (period_name, start_time, end_time)
SELECT 'Period 2', '09:05:00', '09:40:00'
WHERE NOT EXISTS (SELECT 1 FROM period WHERE TRIM(period_name) = 'Period 2');
INSERT INTO period (period_name, start_time, end_time)
SELECT 'Period 3', '09:55:00', '10:30:00'
WHERE NOT EXISTS (SELECT 1 FROM period WHERE TRIM(period_name) = 'Period 3');
INSERT INTO period (period_name, start_time, end_time)
SELECT 'Period 4', '10:30:00', '11:05:00'
WHERE NOT EXISTS (SELECT 1 FROM period WHERE TRIM(period_name) = 'Period 4');
INSERT INTO period (period_name, start_time, end_time)
SELECT 'Period 5', '11:20:00', '11:55:00'
WHERE NOT EXISTS (SELECT 1 FROM period WHERE TRIM(period_name) = 'Period 5');
INSERT INTO period (period_name, start_time, end_time)
SELECT 'Period 6', '11:55:00', '12:30:00'
WHERE NOT EXISTS (SELECT 1 FROM period WHERE TRIM(period_name) = 'Period 6');
INSERT INTO period (period_name, start_time, end_time)
SELECT 'Period 7', '13:30:00', '14:05:00'
WHERE NOT EXISTS (SELECT 1 FROM period WHERE TRIM(period_name) = 'Period 7');
INSERT INTO period (period_name, start_time, end_time)
SELECT 'Period 8', '14:05:00', '14:40:00'
WHERE NOT EXISTS (SELECT 1 FROM period WHERE TRIM(period_name) = 'Period 8');
INSERT INTO period (period_name, start_time, end_time)
SELECT 'Period 9', '14:40:00', '15:15:00'
WHERE NOT EXISTS (SELECT 1 FROM period WHERE TRIM(period_name) = 'Period 9');
INSERT INTO period (period_name, start_time, end_time)
SELECT 'Period 10', '15:15:00', '16:30:00'
WHERE NOT EXISTS (SELECT 1 FROM period WHERE TRIM(period_name) = 'Period 10');
INSERT INTO period (period_name, start_time, end_time)
SELECT 'Period 11', '14:50:00', '15:25:00'
WHERE NOT EXISTS (SELECT 1 FROM period WHERE TRIM(period_name) = 'Period 11');
INSERT INTO period (period_name, start_time, end_time)
SELECT 'Period 12', '15:25:00', '16:00:00'
WHERE NOT EXISTS (SELECT 1 FROM period WHERE TRIM(period_name) = 'Period 12');

-- Teacher table requires a user_id, so this creates placeholder local users for testing.
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('Chapman Richard Neil', 'r@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'Chapman Richard Neil', 'R', 'active' FROM user WHERE email = 'r@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('WONG SHING FUNG', 'teacher002@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'WONG SHING FUNG', '丞', 'active' FROM user WHERE email = 'teacher002@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('YU MAN KI', 'teacher003@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'YU MAN KI', '余', 'active' FROM user WHERE email = 'teacher003@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('CHOI KAI LAM', 'teacher004@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'CHOI KAI LAM', '佳', 'active' FROM user WHERE email = 'teacher004@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('LEE SIN PONG', 'teacher005@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'LEE SIN PONG', '倩', 'active' FROM user WHERE email = 'teacher005@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('NG WAI HUNG', 'teacher006@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'NG WAI HUNG', '偉', 'active' FROM user WHERE email = 'teacher006@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('MUI CHUN KIT', 'teacher007@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'MUI CHUN KIT', '傑', 'active' FROM user WHERE email = 'teacher007@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('WONG SIK LIK', 'teacher008@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'WONG SIK LIK', '力', 'active' FROM user WHERE email = 'teacher008@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('LEE CHEUK YING', 'teacher009@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'LEE CHEUK YING', '卓', 'active' FROM user WHERE email = 'teacher009@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('TONG LAI YIN', 'teacher010@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'TONG LAI YIN', '唐', 'active' FROM user WHERE email = 'teacher010@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('WU YAN XIN', 'teacher011@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'WU YAN XIN', '妍', 'active' FROM user WHERE email = 'teacher011@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('HUI YUK HAAN', 'teacher012@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'HUI YUK HAAN', '嫻', 'active' FROM user WHERE email = 'teacher012@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('CHOW YU HONG', 'teacher013@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'CHOW YU HONG', '宇', 'active' FROM user WHERE email = 'teacher013@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('LAM YUEN SZE', 'teacher014@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'LAM YUEN SZE', '宛', 'active' FROM user WHERE email = 'teacher014@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('CHIAN HOI NING', 'teacher015@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'CHIAN HOI NING', '寧', 'active' FROM user WHERE email = 'teacher015@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('CHAN CHI KEUNG WILLIAM', 'teacher016@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'CHAN CHI KEUNG WILLIAM', '志', 'active' FROM user WHERE email = 'teacher016@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('KONG SZE MAN', 'teacher017@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'KONG SZE MAN', '思', 'active' FROM user WHERE email = 'teacher017@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('CHEUNG SZE HANG GIDEON', 'teacher018@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'CHEUNG SZE HANG GIDEON', '恆', 'active' FROM user WHERE email = 'teacher018@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('CHAN TSZ YAN JOANNE', 'teacher019@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'CHAN TSZ YAN JOANNE', '恩', 'active' FROM user WHERE email = 'teacher019@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('KWOK SZE WAI', 'teacher020@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'KWOK SZE WAI', '慧', 'active' FROM user WHERE email = 'teacher020@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('LAU CHI SHING', 'teacher021@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'LAU CHI SHING', '成', 'active' FROM user WHERE email = 'teacher021@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('LEE SUK MAN', 'teacher022@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'LEE SUK MAN', '敏', 'active' FROM user WHERE email = 'teacher022@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('CHAN LAI MAN RAYMOND', 'teacher023@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'CHAN LAI MAN RAYMOND', '文', 'active' FROM user WHERE email = 'teacher023@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('JAP4', '4@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'JAP4', '日4', 'active' FROM user WHERE email = '4@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('JAP5', '5@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'JAP5', '日5', 'active' FROM user WHERE email = '5@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('JAP6', '6@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'JAP6', '日6', 'active' FROM user WHERE email = '6@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('CHEN WEIKUN', 'teacher027@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'CHEN WEIKUN', '昆', 'active' FROM user WHERE email = 'teacher027@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('NG CHUN HO', 'teacher028@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'NG CHUN HO', '晉', 'active' FROM user WHERE email = 'teacher028@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('FUNG KING HO', 'teacher029@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'FUNG KING HO', '景', 'active' FROM user WHERE email = 'teacher029@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('LEE NGO CHING', 'teacher030@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'LEE NGO CHING', '晴', 'active' FROM user WHERE email = 'teacher030@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('CHU PO TING', 'teacher031@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'CHU PO TING', '朱', 'active' FROM user WHERE email = 'teacher031@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('WONG MAN TUNG', 'teacher032@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'WONG MAN TUNG', '東', 'active' FROM user WHERE email = 'teacher032@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('MAN YING SHEUNG', 'teacher033@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'MAN YING SHEUNG', '櫻', 'active' FROM user WHERE email = 'teacher033@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('WONG KA YAN', 'teacher034@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'WONG KA YAN', '欣', 'active' FROM user WHERE email = 'teacher034@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('KONG CHI SHING DAVID', 'teacher035@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'KONG CHI SHING DAVID', '江', 'active' FROM user WHERE email = 'teacher035@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('MAK SUM YIN SAMMY', 'teacher036@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'MAK SUM YIN SAMMY', '沁', 'active' FROM user WHERE email = 'teacher036@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('CHAN KIT KI', 'teacher037@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'CHAN KIT KI', '潔', 'active' FROM user WHERE email = 'teacher037@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('YEUNG CHUN TO DARRYL', 'teacher038@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'YEUNG CHUN TO DARRYL', '濤', 'active' FROM user WHERE email = 'teacher038@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('LEE HO YIN', 'teacher039@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'LEE HO YIN', '然', 'active' FROM user WHERE email = 'teacher039@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('WONG KIT LING', 'teacher040@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'WONG KIT LING', '玲', 'active' FROM user WHERE email = 'teacher040@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('CHENG LAI LAM', 'teacher041@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'CHENG LAI LAM', '琳', 'active' FROM user WHERE email = 'teacher041@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('FUNG CHOI YIU', 'teacher042@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'FUNG CHOI YIU', '瑤', 'active' FROM user WHERE email = 'teacher042@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('TANG KIT YING', 'teacher043@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'TANG KIT YING', '瑩', 'active' FROM user WHERE email = 'teacher043@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('YUN TSZ CHUN', 'teacher044@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'YUN TSZ CHUN', '甄', 'active' FROM user WHERE email = 'teacher044@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('WONG SZE HO', 'teacher045@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'WONG SZE HO', '皓', 'active' FROM user WHERE email = 'teacher045@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('CHEUNG WAI CHUNG', 'teacher046@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'CHEUNG WAI CHUNG', '維', 'active' FROM user WHERE email = 'teacher046@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('LAW MEI HING', 'teacher047@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'LAW MEI HING', '羅', 'active' FROM user WHERE email = 'teacher047@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('NG TSZ HING', 'teacher048@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'NG TSZ HING', '興', 'active' FROM user WHERE email = 'teacher048@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('LEE WAI FAN STEPHANIE', 'teacher049@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'LEE WAI FAN STEPHANIE', '芬', 'active' FROM user WHERE email = 'teacher049@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('SETO WAI SUM', 'teacher050@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'SETO WAI SUM', '芯', 'active' FROM user WHERE email = 'teacher050@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('YUEN TSZ KI', 'teacher051@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'YUEN TSZ KI', '芷', 'active' FROM user WHERE email = 'teacher051@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('LEE KIT CHING', 'teacher052@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'LEE KIT CHING', '菁', 'active' FROM user WHERE email = 'teacher052@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('LIU XUERONG', 'teacher053@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'LIU XUERONG', '蓉', 'active' FROM user WHERE email = 'teacher053@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('SO KA YIN CYNTHIA', 'teacher054@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'SO KA YIN CYNTHIA', '蘇', 'active' FROM user WHERE email = 'teacher054@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('WCU4', '455@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'WCU4', '西4', 'active' FROM user WHERE email = '455@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('WCU5', '556@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'WCU5', '西5', 'active' FROM user WHERE email = '556@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('HUI WAI CHI', 'teacher057@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'HUI WAI CHI', '許', 'active' FROM user WHERE email = 'teacher057@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('MOK WING KI', 'teacher058@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'MOK WING KI', '詠', 'active' FROM user WHERE email = 'teacher058@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('TAM KIN YI', 'teacher059@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'TAM KIN YI', '譚', 'active' FROM user WHERE email = 'teacher059@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('LUK YIN FUNG', 'teacher060@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'LUK YIN FUNG', '豐', 'active' FROM user WHERE email = 'teacher060@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('TANG MEI CHING AMY', 'teacher061@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'TANG MEI CHING AMY', '貞', 'active' FROM user WHERE email = 'teacher061@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('CHIU KA KIT KEN', 'teacher062@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'CHIU KA KIT KEN', '趙', 'active' FROM user WHERE email = 'teacher062@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('WAN PUI LAI', 'teacher063@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'WAN PUI LAI', '還', 'active' FROM user WHERE email = 'teacher063@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('LEUNG CHUI TIN', 'teacher064@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'LEUNG CHUI TIN', '鈿', 'active' FROM user WHERE email = 'teacher064@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('CHIN KWAN YING', 'teacher065@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'CHIN KWAN YING', '錢', 'active' FROM user WHERE email = 'teacher065@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('CHAN SUET YEE', 'teacher066@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'CHAN SUET YEE', '陳', 'active' FROM user WHERE email = 'teacher066@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('CHAU SIN MAN', 'teacher067@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'CHAU SIN MAN', '雯', 'active' FROM user WHERE email = 'teacher067@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('TSANG JIT FEI GOOFY', 'teacher068@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'TSANG JIT FEI GOOFY', '霏', 'active' FROM user WHERE email = 'teacher068@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('LAI KA LO', 'teacher069@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'LAI KA LO', '露', 'active' FROM user WHERE email = 'teacher069@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('CHAN WAN TING', 'teacher070@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'CHAN WAN TING', '韻', 'active' FROM user WHERE email = 'teacher070@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('CHAN YIP HING', 'teacher071@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'CHAN YIP HING', '馨', 'active' FROM user WHERE email = 'teacher071@school.local';
INSERT IGNORE INTO user (user_name, email, password, role) VALUES ('WOO LAI YING', 'teacher072@school.local', NULL, 'teacher');
INSERT IGNORE INTO teacher (user_id, teacher_name, teacher_code, status) SELECT user_id, 'WOO LAI YING', '麗', 'active' FROM user WHERE email = 'teacher072@school.local';

INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'ENG' WHERE t.teacher_code = 'R';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'ENG(Speaking)' WHERE t.teacher_code = 'R';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CHIN' WHERE t.teacher_code = '丞';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '丞';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '丞';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CHIN' WHERE t.teacher_code = '余';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CLIT-B1' WHERE t.teacher_code = '余';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'PTH' WHERE t.teacher_code = '余';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '余';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '余';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CES' WHERE t.teacher_code = '佳';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CS' WHERE t.teacher_code = '佳';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '佳';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '佳';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'BIO-B3' WHERE t.teacher_code = '倩';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'SCJb' WHERE t.teacher_code = '倩';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CHIS' WHERE t.teacher_code = '偉';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'HIST' WHERE t.teacher_code = '偉';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '偉';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '偉';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CHIN' WHERE t.teacher_code = '傑';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '傑';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '中文(非華語組)' WHERE t.teacher_code = '傑';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '傑';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'PHY-B2' WHERE t.teacher_code = '力';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '力';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'SCJ' WHERE t.teacher_code = '力';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'SUPP4-B3' WHERE t.teacher_code = '力';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '力';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'MATH' WHERE t.teacher_code = '卓';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'Math(M1)-B3' WHERE t.teacher_code = '卓';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '卓';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '卓';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'ENG' WHERE t.teacher_code = '唐';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '唐';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '唐';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'ENG' WHERE t.teacher_code = '妍';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '妍';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '妍';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'BAFS-B2' WHERE t.teacher_code = '嫻';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'MATH' WHERE t.teacher_code = '嫻';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '嫻';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '嫻';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CL' WHERE t.teacher_code = '宇';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'ICT-B1' WHERE t.teacher_code = '宇';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'ICT-B2' WHERE t.teacher_code = '宇';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '宇';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '宇';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CHIN' WHERE t.teacher_code = '宛';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '宛';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '宛';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'PE' WHERE t.teacher_code = '寧';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '寧';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '寧';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CHEM-B1' WHERE t.teacher_code = '志';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '志';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'SCJ' WHERE t.teacher_code = '志';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'SCJc' WHERE t.teacher_code = '志';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '志';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '思';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'VA' WHERE t.teacher_code = '思';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'VAD-B2' WHERE t.teacher_code = '思';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '思';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'ENG' WHERE t.teacher_code = '恆';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'ENG(Speaking)' WHERE t.teacher_code = '恆';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '恆';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'SUPP1-B3' WHERE t.teacher_code = '恆';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '恆';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CHIS' WHERE t.teacher_code = '恩';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CHIS-B2' WHERE t.teacher_code = '恩';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '恩';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '恩';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CHIN' WHERE t.teacher_code = '慧';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '慧';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '慧';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CL' WHERE t.teacher_code = '成';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'ICT-B2' WHERE t.teacher_code = '成';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '成';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '成';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CHIN' WHERE t.teacher_code = '敏';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'SUPP1-B1' WHERE t.teacher_code = '敏';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'SUPP4-B3' WHERE t.teacher_code = '敏';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'MATH' WHERE t.teacher_code = '文';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'PHY-B2' WHERE t.teacher_code = '文';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '文';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'SCJ' WHERE t.teacher_code = '文';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '文';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'JAP-B3' WHERE t.teacher_code = '日4';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'JAP-B3' WHERE t.teacher_code = '日5';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'JAP-B3' WHERE t.teacher_code = '日6';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'PE' WHERE t.teacher_code = '昆';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '昆';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '昆';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'MATH' WHERE t.teacher_code = '晉';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '晉';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '晉';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'MATH' WHERE t.teacher_code = '景';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '景';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '景';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CS' WHERE t.teacher_code = '晴';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'GEOG' WHERE t.teacher_code = '晴';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'HMSC-B3' WHERE t.teacher_code = '晴';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'MUS' WHERE t.teacher_code = '朱';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RE' WHERE t.teacher_code = '朱';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '朱';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '朱';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'MATH' WHERE t.teacher_code = '東';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '東';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '東';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'VA' WHERE t.teacher_code = '櫻';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'VAD-B2' WHERE t.teacher_code = '櫻';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CHIN' WHERE t.teacher_code = '欣';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '欣';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'SUPP1-B3' WHERE t.teacher_code = '欣';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'SUPP2-B2' WHERE t.teacher_code = '欣';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '欣';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'HIST' WHERE t.teacher_code = '江';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'HIST-B1' WHERE t.teacher_code = '江';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '江';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '江';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'GEOG' WHERE t.teacher_code = '沁';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'GEOG-B1' WHERE t.teacher_code = '沁';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '沁';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '沁';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'ENG' WHERE t.teacher_code = '潔';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '潔';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '潔';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'ICT-B1' WHERE t.teacher_code = '濤';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CES' WHERE t.teacher_code = '然';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CS' WHERE t.teacher_code = '然';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'TLC-B3' WHERE t.teacher_code = '然';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'ENG' WHERE t.teacher_code = '玲';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '玲';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'SUPP3-B3' WHERE t.teacher_code = '玲';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '玲';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CHIN' WHERE t.teacher_code = '琳';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CLIT-B1' WHERE t.teacher_code = '琳';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '琳';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '琳';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'BIO-B2' WHERE t.teacher_code = '瑤';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'Career_Planning' WHERE t.teacher_code = '瑤';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CHIN' WHERE t.teacher_code = '瑩';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '瑩';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '中文(非華語組)' WHERE t.teacher_code = '瑩';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '瑩';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'ECON-B1' WHERE t.teacher_code = '甄';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'ECON-B3' WHERE t.teacher_code = '甄';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'MATH' WHERE t.teacher_code = '甄';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '甄';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '甄';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CHIN' WHERE t.teacher_code = '皓';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CLIT-B1' WHERE t.teacher_code = '皓';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '皓';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '中文(非華語組)' WHERE t.teacher_code = '皓';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '皓';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CL' WHERE t.teacher_code = '維';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '維';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'STEM' WHERE t.teacher_code = '維';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '維';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CHIN' WHERE t.teacher_code = '羅';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '羅';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'SUPP3-B3' WHERE t.teacher_code = '羅';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '羅';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'MATH' WHERE t.teacher_code = '興';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '興';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'SUPP1-B1' WHERE t.teacher_code = '興';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'SUPP2-B2' WHERE t.teacher_code = '興';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'SUPP3-B3' WHERE t.teacher_code = '興';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '興';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'ECON-B1' WHERE t.teacher_code = '芬';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'ECON-B3' WHERE t.teacher_code = '芬';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '芬';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '芬';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'TL' WHERE t.teacher_code = '芯';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CES' WHERE t.teacher_code = '芷';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CS' WHERE t.teacher_code = '芷';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'MATH' WHERE t.teacher_code = '菁';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'Math(M1)-B3' WHERE t.teacher_code = '菁';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '菁';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '菁';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'ENG' WHERE t.teacher_code = '蓉';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '蓉';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '蓉';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'ENG' WHERE t.teacher_code = '蘇';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '蘇';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'SUPP1-B1' WHERE t.teacher_code = '蘇';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '蘇';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'WCU-B3' WHERE t.teacher_code = '西4';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'WCU-B3' WHERE t.teacher_code = '西5';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'MATH' WHERE t.teacher_code = '許';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'Math(M1)-B3' WHERE t.teacher_code = '許';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'ENG' WHERE t.teacher_code = '詠';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '詠';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '詠';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'GEOG' WHERE t.teacher_code = '譚';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'GEOG-B1' WHERE t.teacher_code = '譚';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'TLC-B3' WHERE t.teacher_code = '豐';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'ENG' WHERE t.teacher_code = '貞';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '貞';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'SUPP2-B2' WHERE t.teacher_code = '貞';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'SUPP2-B3' WHERE t.teacher_code = '貞';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'SUPP4-B3' WHERE t.teacher_code = '貞';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '貞';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'ENG' WHERE t.teacher_code = '趙';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '趙';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '趙';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'ENG' WHERE t.teacher_code = '還';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CHIN' WHERE t.teacher_code = '鈿';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '鈿';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'SUPP2-B3' WHERE t.teacher_code = '鈿';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '鈿';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'E&RE' WHERE t.teacher_code = '錢';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'SCJ' WHERE t.teacher_code = '陳';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'SCJc' WHERE t.teacher_code = '陳';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'TL' WHERE t.teacher_code = '雯';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'E&RE' WHERE t.teacher_code = '霏';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'PTH' WHERE t.teacher_code = '霏';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RE' WHERE t.teacher_code = '霏';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '霏';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '霏';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CHIN' WHERE t.teacher_code = '露';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '中文(非華語組)' WHERE t.teacher_code = '露';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'CHIN' WHERE t.teacher_code = '韻';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RE' WHERE t.teacher_code = '馨';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '馨';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '馨';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'BIO-B3' WHERE t.teacher_code = '麗';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'RS' WHERE t.teacher_code = '麗';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'SCJ' WHERE t.teacher_code = '麗';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = 'SCJb' WHERE t.teacher_code = '麗';
INSERT IGNORE INTO teacher_subject (teacher_id, subject_id) SELECT t.teacher_id, s.subject_id FROM teacher t JOIN subject s ON s.subject_name = '班主任課' WHERE t.teacher_code = '麗';

-- Bilingual subject and room labels for school deployment
SET SQL_SAFE_UPDATES = 0;

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

SET SQL_SAFE_UPDATES = 1;
