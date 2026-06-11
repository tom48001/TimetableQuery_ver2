USE school_management;

SET FOREIGN_KEY_CHECKS = 0;

TRUNCATE TABLE import_schedule;
TRUNCATE TABLE BLA;
TRUNCATE TABLE learning_goal_record;
TRUNCATE TABLE prefect_nomination;
TRUNCATE TABLE nomination;
TRUNCATE TABLE timetable;
TRUNCATE TABLE teacher_subject;
TRUNCATE TABLE student_subject;
TRUNCATE TABLE period;
TRUNCATE TABLE room;
TRUNCATE TABLE student;
TRUNCATE TABLE subject;
TRUNCATE TABLE class;
TRUNCATE TABLE staging_timetable;
TRUNCATE TABLE staging_teacher;
TRUNCATE TABLE teacher;
TRUNCATE TABLE user;

SET FOREIGN_KEY_CHECKS = 1;

-- All seeded accounts use password: password123
INSERT INTO user (user_name, email, password, role, permissions) VALUES
('manager', 'manager@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'manager', '{"timetable":true,"nominations":true,"changePassword":false,"manageUsers":true,"manageStudents":true,"importTimetable":true}'),
('staff', 'staff@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'staff', '{"timetable":true,"nominations":true,"changePassword":false,"manageUsers":true,"manageStudents":false,"importTimetable":false}'),
('qwe', 'qwe@gmail.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'teacher', '{"timetable":true,"nominations":true,"changePassword":true,"manageUsers":false,"manageStudents":false,"importTimetable":false}'),
('cwt', 'cwt@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'teacher', '{"timetable":true,"nominations":true,"changePassword":true,"manageUsers":false,"manageStudents":false,"importTimetable":false}'),
('cwk', 'cwk@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'teacher', '{"timetable":true,"nominations":true,"changePassword":true,"manageUsers":false,"manageStudents":false,"importTimetable":false}'),
('msys', 'msys@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'teacher', '{"timetable":true,"nominations":true,"changePassword":true,"manageUsers":false,"manageStudents":false,"importTimetable":false}'),
('wky', 'wky@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'teacher', '{"timetable":true,"nominations":true,"changePassword":true,"manageUsers":false,"manageStudents":false,"importTimetable":false}'),
('wly', 'wly@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'teacher', '{"timetable":true,"nominations":true,"changePassword":true,"manageUsers":false,"manageStudents":false,"importTimetable":false}'),
('lct', 'lct@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'teacher', '{"timetable":true,"nominations":true,"changePassword":true,"manageUsers":false,"manageStudents":false,"importTimetable":false}'),
('hyk', 'hyk@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'teacher', '{"timetable":true,"nominations":true,"changePassword":true,"manageUsers":false,"manageStudents":false,"importTimetable":false}'),
('sws', 'sws@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'teacher', '{"timetable":true,"nominations":true,"changePassword":true,"manageUsers":false,"manageStudents":false,"importTimetable":false}'),
('teacher10', 'teacher10@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'teacher', '{"timetable":true,"nominations":true,"changePassword":true,"manageUsers":false,"manageStudents":false,"importTimetable":false}'),
('teacher11', 'teacher11@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'teacher', '{"timetable":true,"nominations":true,"changePassword":true,"manageUsers":false,"manageStudents":false,"importTimetable":false}'),
('teacher12', 'teacher12@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'teacher', '{"timetable":true,"nominations":true,"changePassword":true,"manageUsers":false,"manageStudents":false,"importTimetable":false}'),
('SING', 'singsing894@gmail.com', '123', 'teacher', '{"timetable":true,"nominations":true,"changePassword":true,"manageUsers":false,"manageStudents":false,"importTimetable":false}');

INSERT INTO teacher (user_id, teacher_name, teacher_code, status) VALUES
(3, 'QWE', 'QWE', 'active'),
(4, 'CWT', 'CWT', 'active'),
(5, 'CWK', 'CWK', 'active'),
(6, 'MSYS', 'MSYS', 'active'),
(7, 'WKY', 'WKY', 'active'),
(8, 'WLY', 'WLY', 'active'),
(9, 'LCT', 'LCT', 'active'),
(10, 'HYK', 'HYK', 'active'),
(11, 'SWS', 'SWS', 'active'),
(12, 'T010', 'T010', 'active'),
(13, 'T011', 'T011', 'active'),
(14, 'T012', 'T012', 'active'),
(15, 'SING', 'SING', 'active');

INSERT INTO staging_teacher (teacher_code, teacher_name, email) VALUES
('QWE', 'QWE', 'qwe@gmail.com'),
('CWT', 'CWT', 'cwt@school.com'),
('CWK', 'CWK', 'cwk@school.com'),
('MSYS', 'MSYS', 'msys@school.com'),
('WKY', 'WKY', 'wky@school.com'),
('WLY', 'WLY', 'wly@school.com'),
('LCT', 'LCT', 'lct@school.com'),
('HYK', 'HYK', 'hyk@school.com'),
('SWS', 'SWS', 'sws@school.com'),
('SING', 'SING', 'singsing894@gmail.com');

INSERT INTO class (class_name, grade_level) VALUES
('1M', 'F1'), ('1A', 'F1'), ('1R', 'F1'), ('1Y', 'F1'),
('2M', 'F2'), ('2A', 'F2'), ('2R', 'F2'), ('2Y', 'F2'),
('3M', 'F3'), ('3A', 'F3'), ('3R', 'F3'), ('3Y', 'F3'),
('4M', 'F4'), ('4A', 'F4'), ('4R', 'F4'), ('4Y', 'F4'),
('5M', 'F5'), ('5A', 'F5'), ('5R', 'F5'), ('5Y', 'F5'),
('6M', 'F6'), ('6A', 'F6'), ('6R', 'F6'), ('6Y', 'F6');

INSERT INTO subject (subject_name, is_elective) VALUES
-- 核心科目 (is_elective = FALSE)
('中國語文', FALSE),
('英國語文', FALSE),
('數學', FALSE),
('公民與社會發展', FALSE),

-- 選修科目 (is_elective = TRUE)
('中國文學', TRUE),
('生物', TRUE),
('企業、會計與財務概論', TRUE),
('英語文學', TRUE),
('化學', TRUE),
('設計與應用科技', TRUE),
('中國歷史', TRUE),
('物理', TRUE),
('健康管理與社會關懷', TRUE),
('經濟', TRUE),
('資訊及通訊科技', TRUE),
('倫理與宗教', TRUE),
('科技與生活', TRUE),
('地理', TRUE),
('音樂', TRUE),
('歷史', TRUE),
('視覺藝術', TRUE),
('旅遊與款待', TRUE),
('體育', TRUE);

INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex) VALUES
('Chan Cheuk Ling', 'CHAN CHEUK LING', 1, '01', 'F'),
('Chan Hoi Ying', 'CHAN HOI YING', 1, '02', 'F'),
('Chan Hoi Yu', 'CHAN HOI YU', 1, '03', 'F'),
('Chan Yin Ting', 'CHAN YIN TING', 1, '04', 'F'),
('Chau Tsz Lok', 'CHAU TSZ LOK', 1, '05', 'M'),
('Cheung Tze Chin', 'CHEUNG TZE CHIN', 1, '06', 'M'),
('Ho Sum Yee Hailey', 'HO SUM YEE HAILEY', 1, '07', 'F'),
('Huang Cathy', 'HUANG CATHY', 1, '08', 'F'),
('Io Pui Yan', 'IO PUI YAN', 1, '09', 'F'),
('Kan Hiu Man', 'KAN HIU MAN', 1, '10', 'F'),
('Li Lai Ki', 'LI LAI KI', 1, '11', 'F'),
('Li Yiwen', 'LI YIWEN', 1, '12', 'F'),
('Lo Hiu Lam Macy', 'LO HIU LAM MACY', 1, '13', 'F'),
('Mau Hing Yu Hailey', 'MAU HING YU HAILEY', 1, '14', 'F'),
('Tran Lok Yung Harmony', 'TRAN LOK YUNG HARMONY', 1, '15', 'F'),
('Wong Hei Yin', 'WONG HEI YIN', 1, '16', 'F'),
('Wong Yuen Ching', 'WONG YUEN CHING', 1, '17', 'F'),
('Yu Kat Kai', 'YU KAT KAI', 1, '18', 'M'),
('Chan Chun Sing', 'CHAN CHUN SING', 1, '19', 'M'),
('Chan Ming Wai', 'CHAN MING WAI', 1, '20', 'M'),
('Chiu Yau', 'CHIU YAU', 1, '21', 'M'),
('Chung Chi Pui', 'CHUNG CHI PUI', 1, '22', 'M'),
('Lai Pak Kiu', 'LAI PAK KIU', 1, '23', 'M'),
('Lai Tsz Hei', 'LAI TSZ HEI', 1, '24', 'M'),
('Leung Sze Hon', 'LEUNG SZE HON', 1, '25', 'M'),
('Liang Haoquan', 'LIANG HAOQUAN', 1, '26', 'M'),
('Mak Chun Hei', 'MAK CHUN HEI', 1, '27', 'M'),
('Mok Ping Hong', 'MOK PING HONG', 1, '28', 'M'),
('Pang Ho Yin', 'PANG HO YIN', 1, '29', 'M'),
('Siu Pak Hin', 'SIU PAK HIN', 1, '30', 'M'),
('Chan Tsz Ling', 'CHAN TSZ LING', 2, '01', 'F'),
('Cheung Hoi Lam', 'CHEUNG HOI LAM', 2, '02', 'F'),
('Ho Ka Yan', 'HO KA YAN', 2, '03', 'F'),
('Lam Wai Ting', 'LAM WAI TING', 2, '04', 'F'),
('Lee Chun Hei', 'LEE CHUN HEI', 2, '05', 'M'),
('Ng Wing Yan', 'NG WING YAN', 2, '06', 'F'),
('Wong Tsz Kwan', 'WONG TSZ KWAN', 2, '07', 'M'),
('Yip Lok Lam', 'YIP LOK LAM', 2, '08', 'F'),
('Cheng Yu Hin', 'CHENG YU HIN', 5, '01', 'M'),
('Fong Ching Yi', 'FONG CHING YI', 5, '02', 'F'),
('Kwok Ho Yin', 'KWOK HO YIN', 5, '03', 'M'),
('Lau Hoi Ching', 'LAU HOI CHING', 5, '04', 'F'),
('Tang Ka Hei', 'TANG KA HEI', 5, '05', 'M'),
('Tse Wing Lam', 'TSE WING LAM', 9, '01', 'F'),
('Tsui Long Hei', 'TSUI LONG HEI', 9, '02', 'M'),
('Yuen Ching Man', 'YUEN CHING MAN', 9, '03', 'F'),
('BBC', 'BBC', 23, '01', 'F'),
('ABC', 'ABC', 24, '01', 'F');

INSERT INTO room (room_name) VALUES
('G01C 會見室(一)'),
('G01D 會見室(二)'),
('G01K 會議室'),
('G01R 學生活動中心'),
('操場'),
('有蓋操場'),
('101 視覺藝術室'),
('102 音樂室'),
('111 溫室'),
('一樓玻璃房 (Sonata)'),
('201 Little Britain'),
('202 1M 課室'),
('203 1A 課室'),
('204 1R 課室'),
('205 1Y 課室'),
('209A 講廳'),
('209B 創藝室'),
('301 課室'),
('302 2M 課室'),
('303 2A 課室'),
('304 2R 課室'),
('305 2Y 課室'),
('309 AI Lab'),
('311 電腦室'),
('401 課室'),
('402 3M 課室'),
('403 3A 課室'),
('404 3R 課室'),
('405 3Y 課室'),
('409 IS Lab'),
('412 IS Lab'),
('413 CAL 室'),
('415 圖書館'),
('501 課室'),
('502 4M 課室'),
('503 4A 課室'),
('504 4R 課室'),
('505 4Y 課室'),
('509 地理室'),
('511 Bio Lab'),
('513 家政室'),
('601 課室'),
('602 5Y 課室'),
('603 5R 課室'),
('604 5A 課室'),
('605 5M 課室'),
('609 Chm Lab'),
('611 Phy Lab'),
('612 源活齋'),
('613 源活齋'),
('701 課室'),
('702 6M 課室'),
('703 6A 課室'),
('704 6R 課室'),
('705 6Y 課室'),
('710 Cozy Lounge');

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

INSERT INTO teacher_subject (teacher_id, subject_id) VALUES
(1, 2), (1, 3), (1, 6), (1, 7), (1, 13),
(2, 1), (2, 11), (2, 19), (2, 20), (2, 18),
(3, 3), (3, 7), (3, 10), (3, 14), (3, 15),
(4, 4), (4, 19), (4, 5), (4, 11), (4, 16),
(5, 2), (5, 8), (5, 9), (5, 17),
(6, 1), (6, 18), (6, 11), (6, 12),
(7, 9), (7, 10), (7, 5), (7, 20),
(8, 5), (8, 12), (8, 4), (8, 19),
(9, 3), (9, 6), (9, 7), (9, 13),
(10, 13), (10, 14), (10, 15), (10, 16),
(11, 15), (11, 16), (11, 17), (11, 14),
(12, 17), (12, 11), (12, 18), (12, 13);

INSERT INTO student_subject (student_id, subject_id) VALUES
(1, 13), (1, 14), (2, 15), (2, 16), (3, 17), (3, 18),
(4, 13), (5, 14), (6, 15), (7, 16), (8, 17), (9, 18),
(10, 13), (11, 14), (12, 15), (13, 16), (14, 17), (15, 18),
(16, 13), (17, 14), (18, 15), (19, 16), (20, 17), (21, 18),
(22, 13), (23, 14), (24, 15), (25, 16), (26, 17), (27, 18),
(28, 13), (29, 14), (30, 15),
(31, 13), (32, 14), (33, 15), (34, 16), (35, 17), (36, 18),
(37, 13), (38, 14), (39, 15), (40, 16), (41, 17), (42, 18),
(43, 13), (44, 14), (45, 15), (46, 16),
(31, 17), (32, 18), (33, 13), (34, 14), (35, 15), (36, 16),
(47, 9),(48, 9),
(37, 17), (38, 18), (39, 13), (40, 14), (41, 15), (42, 16);

INSERT INTO timetable (teacher_id, subject_id, class_id, room_id, day_of_week, period_id)
SELECT t.teacher_id, s.subject_id, c.class_id, r.room_id, seed.day_of_week, p.period_id
FROM (
  SELECT 'QWE' AS teacher_code, '英國語文' AS subject_name, '1M' AS class_name, '202 1M 課室' AS room_name, 'Mon' AS day_of_week, 'Period 1' AS period_name
  UNION ALL SELECT 'CWT', '中國語文', '1M', '202 1M 課室', 'Mon', 'Period 2'
  UNION ALL SELECT 'CWK', '數學', '1M', '202 1M 課室', 'Mon', 'Period 3'
  UNION ALL SELECT 'MSYS', '公民與社會發展', '1M', '202 1M 課室', 'Mon', 'Period 4'
  UNION ALL SELECT 'WKY', '視覺藝術', '1M', '101 視覺藝術室', 'Mon', 'Period 5'
  UNION ALL SELECT 'WLY', '中國語文', '1A', '203 1A 課室', 'Mon', 'Period 1'
  UNION ALL SELECT 'LCT', '體育', '1A', '203 1A 課室', 'Mon', 'Period 2'
  UNION ALL SELECT 'HYK', '健康管理與社會關懷', '1A', '203 1A 課室', 'Mon', 'Period 3'
  UNION ALL SELECT 'SWS', '資訊及通訊科技', '1A', '203 1A 課室', 'Mon', 'Period 4'
  UNION ALL SELECT 'QWE', '數學', '2M', '302 2M 課室', 'Mon', 'Period 5'
  UNION ALL SELECT 'CWT', '歷史', '2M', '302 2M 課室', 'Tue', 'Period 1'
  UNION ALL SELECT 'CWK', '數學', '2M', '302 2M 課室', 'Tue', 'Period 2'
  UNION ALL SELECT 'MSYS', '倫理與宗教', '2A', '303 2A 課室', 'Tue', 'Period 3'
  UNION ALL SELECT 'WKY', '英國語文', '2A', '303 2A 課室', 'Tue', 'Period 4'
  UNION ALL SELECT 'WLY', '中國文學', '2R', '304 2R 課室', 'Wed', 'Period 1'
  UNION ALL SELECT 'LCT', '音樂', '2R', '304 2R 課室', 'Wed', 'Period 2'
  UNION ALL SELECT 'HYK', '地理', '2Y', '305 2Y 課室', 'Wed', 'Period 3'
  UNION ALL SELECT 'SWS', '數學', '2Y', '305 2Y 課室', 'Wed', 'Period 4'
  UNION ALL SELECT 'T010', '生物', '4M', '502 4M 課室', 'Thu', 'Period 1'
  UNION ALL SELECT 'T011', '物理', '4A', '503 4A 課室', 'Thu', 'Period 2'
  UNION ALL SELECT 'T012', '企業、會計與財務概論', '4R', '504 4R 課室', 'Thu', 'Period 3'
  UNION ALL SELECT 'QWE', '資訊及通訊科技', '4Y', '505 4Y 課室', 'Thu', 'Period 4'
  UNION ALL SELECT 'CWT', '中國語文', '5M', '605 5M 課室', 'Fri', 'Period 1'
  UNION ALL SELECT 'CWK', '科技與生活', '5A', '604 5A 課室', 'Fri', 'Period 2'
  UNION ALL SELECT 'MSYS', '公民與社會發展', '5R', '603 5R 課室', 'Fri', 'Period 3'
  UNION ALL SELECT 'WKY', '英國語文', '5Y', '602 5Y 課室', 'Fri', 'Period 4'
  UNION ALL SELECT 'WLY', '中國語文', '6M', '702 6M 課室', 'Fri', 'Period 5'
  UNION ALL SELECT 'LCT', '體育', '6A', '703 6A 課室', 'Fri', 'Period 6'
  UNION ALL SELECT 'HYK', '健康管理與社會關懷', '6R', '704 6R 課室', 'Fri', 'Period 7'
  UNION ALL SELECT 'SWS', '數學', '6Y', '705 6Y 課室', 'Fri', 'Period 8'
  UNION ALL SELECT 'T010', '化學', '4M', '609 Chm Lab', 'Mon', 'Period 8'
  UNION ALL SELECT 'T011', '經濟', '4A', '611 Phy Lab', 'Tue', 'Period 8'
  UNION ALL SELECT 'T012', '歷史', '4R', '509 地理室', 'Wed', 'Period 8'
  UNION ALL SELECT 'T012', '化學', '6R', '609 Chm Lab', 'Wed', 'Period 11'
  UNION ALL SELECT 'T012', '化學', '6Y', '609 Chm Lab', 'Wed', 'Period 12'
) seed
JOIN teacher t ON t.teacher_code = seed.teacher_code
JOIN subject s ON s.subject_name = seed.subject_name
JOIN class c ON c.class_name = seed.class_name
JOIN room r ON r.room_name = seed.room_name
JOIN period p ON p.period_name = seed.period_name;

INSERT INTO staging_timetable (teacher_code, subject, class, room, day_of_week, period) VALUES
('QWE', '英國語文', '1M', '202 1M 課室', 'Mon', 'Period 6'),
('CWT', '中國語文', '1A', '203 1A 課室', 'Tue', 'Period 6'),
('CWK', '數學', '1R', '204 1R 課室', 'Wed', 'Period 6'),
('MSYS', '公民與社會發展', '1Y', '205 1Y 課室', 'Thu', 'Period 6'),
('WKY', '英國語文', '2M', '302 2M 課室', 'Fri', 'Period 6'),
('WLY', '中國語文', '2A', '303 2A 課室', 'Mon', 'Period 7'),
('LCT', '體育', '2R', '304 2R 課室', 'Tue', 'Period 7'),
('HYK', '健康管理與社會關懷', '2Y', '305 2Y 課室', 'Wed', 'Period 7'),
('SWS', '資訊及通訊科技', '3M', '402 3M 課室', 'Thu', 'Period 7'),
('T010', '生物', '4M', '511 Bio Lab', 'Fri', 'Period 7'),
('T011', '物理', '4A', '611 Phy Lab', 'Mon', 'Period 9'),
('T012', '企業、會計與財務概論', '4R', '413 CAL 室', 'Tue', 'Period 9'),
('QWE', '科技與生活', '5A', '604 5A 課室', 'Wed', 'Period 9'),
('CWT', '歷史', '5R', '603 5R 課室', 'Thu', 'Period 9'),
('CWK', '數學', '6Y', '705 6Y 課室', 'Fri', 'Period 10'),
('MSYS', '倫理與宗教', '3A', '403 3A 課室', 'Mon', 'Period 11'),
('WKY', '視覺藝術', '3R', '404 3R 課室', 'Tue', 'Period 11'),
('SWS', '地理', '3Y', '405 3Y 課室', 'Wed', 'Period 12');

INSERT INTO import_schedule (file_name) VALUES
('sample-timetable.xlsx');
