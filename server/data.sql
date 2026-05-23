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

-- Login accounts. Password for every seeded account is: password123
INSERT INTO user (user_name, email, password, role) VALUES
('manager', 'manager@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'manager'),
('staff', 'staff@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'staff'),
('qwe', 'qwe@gmail.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'teacher'),
('cwt', 'cwt@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'teacher'),
('cwk', 'cwk@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'teacher'),
('msys', 'msys@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'teacher'),
('wky', 'wky@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'teacher'),
('wly', 'wly@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'teacher'),
('lct', 'lct@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'teacher'),
('hyk', 'hyk@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'teacher'),
('sws', 'sws@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'teacher'),
('teacher10', 'teacher10@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'teacher'),
('teacher11', 'teacher11@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'teacher'),
('teacher12', 'teacher12@school.com', '$2b$10$1KqbZ.jJ1BFkWvTEpT.AJ.Olsd8Ljs28zvCpBx/73A1g.Jn04KVjq', 'teacher');

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
(14, 'T012', 'T012', 'active');

INSERT INTO staging_teacher (teacher_code, teacher_name, email) VALUES
('QWE', 'QWE', 'qwe@gmail.com'),
('CWT', 'CWT', 'cwt@school.com'),
('CWK', 'CWK', 'cwk@school.com'),
('MSYS', 'MSYS', 'msys@school.com');

INSERT INTO class (class_name, grade_level) VALUES
('1M', 'F1'), ('1A', 'F1'), ('1R', 'F1'), ('1Y', 'F1'),
('2M', 'F2'), ('2A', 'F2'), ('2R', 'F2'), ('2Y', 'F2'),
('3M', 'F3'), ('3A', 'F3'), ('3R', 'F3'), ('3Y', 'F3'),
('4M', 'F4'), ('4A', 'F4'), ('4R', 'F4'), ('4Y', 'F4'),
('5M', 'F5'), ('5A', 'F5'), ('5R', 'F5'), ('5Y', 'F5'),
('6M', 'F6'), ('6A', 'F6'), ('6R', 'F6'), ('6Y', 'F6');

-- 選修科目 (is_elective = TRUE)
INSERT INTO subject (subject_name, is_elective) VALUES
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
('Yuen Ching Man', 'YUEN CHING MAN', 9, '03', 'F');

INSERT INTO room (room_name) VALUES
('G01C Meeting Room'),
('G01D Meeting Room'),
('G01K Meeting Room'),
('G01R Learning Support Room'),
('Playground'),
('Covered Playground'),
('101 Visual Arts Room'),
('102 Music Room'),
('111 Warm Room'),
('1/F Glass Room Sonata'),
('201 Little Britain'),
('202 1M Classroom'),
('203 1A Classroom'),
('204 1R Classroom'),
('205 1Y Classroom'),
('209A Lecture Room'),
('209B Creative Room'),
('301 Classroom'),
('302 2M Classroom'),
('303 2A Classroom'),
('304 2R Classroom'),
('305 2Y Classroom'),
('309 AI Lab'),
('311 Computer Room'),
('401 Classroom'),
('402 3M Classroom'),
('403 3A Classroom'),
('404 3R Classroom'),
('405 3Y Classroom'),
('409 IS Lab'),
('412 IS Lab'),
('413 CAL Room'),
('415 Library'),
('501 Classroom'),
('502 4M Classroom'),
('503 4A Classroom'),
('504 4R Classroom'),
('505 4Y Classroom'),
('509 Geography Room'),
('511 Bio Lab'),
('513 Home Economics Room'),
('601 Classroom'),
('602 5Y Classroom'),
('603 5R Classroom'),
('604 5A Classroom'),
('605 5M Classroom'),
('609 Chm Lab'),
('611 Phy Lab'),
('612 Resource Room'),
('613 Resource Room'),
('701 Classroom'),
('702 6M Classroom'),
('703 6A Classroom'),
('704 6R Classroom'),
('705 6Y Classroom'),
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
('Period 10', '15:25:00', '16:00:00');

INSERT INTO teacher_subject (teacher_id, subject_id) VALUES
(1, 2), (1, 3), (1, 6),
(2, 1), (2, 11), (2, 20),
(3, 3), (3, 7), (3, 10),
(4, 4), (4, 19),
(5, 2), (5, 8),
(6, 1), (6, 18),
(7, 9), (7, 10),
(8, 5), (8, 12),
(9, 3), (9, 6),
(10, 13), (10, 14),
(11, 15), (11, 16),
(12, 17), (12, 11);

INSERT INTO student_subject (student_id, subject_id) VALUES
(31, 13), (32, 14), (33, 15), (34, 16), (35, 17), (36, 18),
(37, 13), (38, 14), (39, 15), (40, 16), (41, 17), (42, 18),
(43, 13), (44, 14), (45, 15), (46, 16);

INSERT INTO timetable (teacher_id, subject_id, class_id, room_id, day_of_week, period_id) VALUES
(1, 2, 1, 12, 'Mon', 1),
(2, 1, 1, 12, 'Mon', 2),
(3, 3, 1, 12, 'Mon', 3),
(4, 4, 1, 12, 'Mon', 4),
(5, 8, 1, 7, 'Mon', 5),
(6, 1, 2, 13, 'Mon', 1),
(7, 10, 2, 13, 'Mon', 2),
(8, 5, 2, 13, 'Mon', 3),
(9, 6, 2, 13, 'Mon', 4),
(1, 3, 5, 19, 'Mon', 5),
(2, 11, 5, 19, 'Tue', 1),
(3, 3, 5, 19, 'Tue', 2),
(4, 19, 6, 20, 'Tue', 3),
(5, 2, 6, 20, 'Tue', 4),
(6, 18, 7, 21, 'Wed', 1),
(7, 9, 7, 21, 'Wed', 2),
(8, 12, 8, 22, 'Wed', 3),
(9, 3, 8, 22, 'Wed', 4),
(10, 13, 13, 35, 'Thu', 1),
(11, 15, 14, 36, 'Thu', 2),
(12, 17, 15, 37, 'Thu', 3),
(1, 6, 16, 38, 'Thu', 4),
(2, 20, 17, 46, 'Fri', 1),
(3, 7, 18, 45, 'Fri', 2),
(4, 4, 19, 44, 'Fri', 3),
(5, 2, 20, 43, 'Fri', 4),
(6, 1, 21, 52, 'Fri', 5),
(7, 10, 22, 53, 'Fri', 6),
(8, 5, 23, 54, 'Fri', 7),
(9, 3, 24, 55, 'Fri', 8),
(10, 14, 13, 47, 'Mon', 8),
(11, 16, 14, 48, 'Tue', 8),
(12, 11, 15, 39, 'Wed', 8);

INSERT INTO staging_timetable (teacher_code, subject, class, room, day_of_week, period) VALUES
('QWE', 'English Language', '1M', '202 1M Classroom', 'Mon', 'Period 6'),
('CWT', 'Chinese Language', '1A', '203 1A Classroom', 'Tue', 'Period 6');

INSERT INTO nomination (teacher_id, student_id) VALUES
(1, 1), (1, 2), (2, 1), (3, 5), (4, 10), (5, 31), (6, 32);

INSERT INTO prefect_nomination (teacher_id, student_id) VALUES
(1, 6), (2, 6), (3, 7), (4, 8), (5, 31), (6, 32);

INSERT INTO BLA (teacher_id, student_id, subject_id) VALUES
(1, 1, 2), (2, 1, 1), (3, 1, 3), (4, 1, 4),
(5, 1, 8), (6, 1, 18), (7, 1, 10), (8, 1, 5),
(1, 2, 2), (2, 2, 1), (3, 2, 3),
(1, 3, 2), (3, 3, 3), (9, 3, 6),
(1, 31, 2), (2, 31, 1), (3, 31, 3), (10, 31, 13);

INSERT INTO learning_goal_record (teacher_id, student_id, completed_goals) VALUES
(1, 1, 2),
(1, 2, 4),
(1, 3, 6),
(1, 4, 8),
(1, 5, 3),
(1, 6, 7),
(1, 7, 1),
(1, 8, 5),
(1, 9, 0),
(1, 10, 9),
(2, 31, 4),
(2, 32, 3),
(2, 33, 6),
(2, 34, 8);

INSERT INTO import_schedule (file_name) VALUES
('sample-timetable.xlsx');

