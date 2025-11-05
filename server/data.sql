USE school_management;

-- 使用者帳號 (manager + 2 位老師)
INSERT INTO user (user_name, email, password, role) VALUES
('manager', 'manager@school.com', 'manager123', 'manager'),
('tom', 'tom@school.com', 'password123', 'teacher'),
('qwe', 'qwe@school.com', '$2b$10$g454V1eMzRdazPDBN1b6u.Hdyfg8/CU/53YAyTZKwLjl6A1ilpZpq', 'manager'),
('jchan', 'jchan@school.edu', '123456', 'teacher'),
('amok', 'amok@school.edu', '123456', 'teacher'),
('llee', 'llee@school.edu', '123456', 'teacher'),
('philip', 'singsing894@gmail.com', '123456', 'teacher'),
('mwong', 'mwong@school.com', '123456', 'teacher'),
('mho', 'mho@school.com', '123456', 'teacher'),
('mlam', 'mlam@school.com', '123456', 'teacher'),
('mng', 'mng@school.com', '123456', 'teacher'),
('mcheung', 'mcheung@school.com', '123456', 'teacher'),
('mlau', 'mlau@school.com', '123456', 'teacher'),
('myip', 'myip@school.com', '123456', 'teacher'),
('mcheng', 'mcheng@school.com', '123456', 'teacher'),
('mtang', 'mtang@school.com', '123456', 'teacher'),
('mfong', 'mfong@school.com', '123456', 'teacher');

-- 老師基本資料（user_id 要正確對應）
INSERT INTO teacher (user_id, teacher_name) VALUES
(2, 'Tom'),
(3, 'qwe'),
(4, 'Mr. Chan'),
(5, 'Ms. Mok'),
(6, 'Ms. Lee'),
(7, 'Mr. Wong'),
(8, 'Ms. Ho'),
(9, 'Mr. Lam'),
(10, 'Ms. Ng'),
(11, 'Mr. Cheung'),
(12, 'Ms. Lau'),
(13, 'Mr. Yip'),
(14, 'Ms. Cheng'),
(15, 'Mr. Tang'),
(16, 'Ms. Fong');

-- 班級資料 (會 auto-increment id，class_id 1~24)
INSERT INTO class (class_name, grade_level) VALUES
('1M', 'F1'), ('1A', 'F1'), ('1R', 'F1'), ('1Y', 'F1'),
('2M', 'F2'), ('2A', 'F2'), ('2R', 'F2'), ('2Y', 'F2'),
('3M', 'F3'), ('3A', 'F3'), ('3R', 'F3'), ('3Y', 'F3'),
('4M', 'F4'), ('4A', 'F4'), ('4R', 'F4'), ('4Y', 'F4'),
('5M', 'F5'), ('5A', 'F5'), ('5R', 'F5'), ('5Y', 'F5'),
('6M', 'F6'), ('6A', 'F6'), ('6R', 'F6'), ('6Y', 'F6');

-- 核心科目 (is_elective = FALSE)
INSERT INTO subject (subject_name, is_elective) VALUES
('中國語文', FALSE),
('英國語文', FALSE),
('數學', FALSE),
('公民與社會發展', FALSE);

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

-- 學生資料
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex) VALUES
('陳大文', 'Chan Tai Man', 1, '01', 'M'),
('張小麗', 'Cheung Siu Lai', 1, '15', 'F'),
('李志強', 'Lee Chi Keung', 2, '11', 'M'),
('王美玲', 'Wong Mei Ling', 5, '09', 'F'),
('黃家輝', 'Wong Ka Fai', 6, '03', 'M'),
('林小娟', 'Lam Siu Kuen', 9, '20', 'F'),
('吳志明', 'Ng Chi Ming', 10, '20', 'M'),
('鄭秀文', 'Cheng Sau Man', 13, '21', 'F'),
('馬國明', 'Ma Kwok Ming', 14, '07', 'M'),
('劉德華', 'Lau Tak Wah', 17, '21', 'M'),
('何嘉儀', 'Ho Ka Yi', 1, '04', 'F'),
('林子豪', 'Lam Tsz Ho', 1, '05', 'M'),
('周美華', 'Chow Mei Wah', 2, '06', 'F'),
('陳偉強', 'Chan Wai Keung', 3, '07', 'M'),
('羅淑儀', 'Law Suk Yi', 4, '08', 'F');

-- 班房
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

-- 課節
INSERT INTO period (period_name, start_time, end_time) VALUES
('Period 1', '08:30:00', '09:05:00'),
('Period 2', '09:05:00', '09:40:00'),
('Period 3', '09:55:00', '10:30:00'),
('Period 4', '10:30:00', '11:05:00'),
('Period 5', '11:20:00', '11:55:00'),
('Period 6', '11:55:00', '14:05:00'),
('Period 7', '13:30:00', '15:00:00'),
('Period 8', '14:05:00', '14:40:00'),
('Period 9', '14:40:00', '15:15:00'),
('Period 10', '15:15:00', '15:30:00'),
('Period 11', '14:50:00', '15:25:00'),
('Period 12', '15:25:00', '16:00:00');

-- 學生選修科目
INSERT INTO student_subject (student_id, subject_id) VALUES
(1, 6),   -- 陳大文 → 中國文學
(2, 7),   -- 張小麗 → 生物
(3, 8),   -- 李志強 → 企會財
(4, 9),   -- 王美玲 → 英語文學
(5, 10),  -- 黃家輝 → 化學
(6, 11),  -- 林小娟 → 設計與應用科技
(7, 12),  -- 吳志明 → 中國歷史
(8, 13),  -- 鄭秀文 → 物理
(9, 14),  -- 馬國明 → 健康管理與社會關懷
(10, 15), -- 劉德華 → 經濟
(11, 16), -- 何嘉儀 → 資訊科技
(12, 17), -- 林子豪 → 倫理與宗教
(13, 18), -- 周美華 → 科技與生活
(14, 19), -- 陳偉強 → 地理
(15, 15); -- 羅淑儀 → 經濟

-- 老師授課科目（需與 subject_id 對應）
INSERT INTO teacher_subject (teacher_id, subject_id) VALUES
(1, 2),  -- Tom → 英文
(1, 3),  -- Tom → 數學
(1, 15), -- Tom → 資訊科技

(2, 4),  -- qwe → 科學
(2, 7),  -- qwe → 生物
(2, 15), -- qwe → 音樂

(3, 3),  -- Mr. Chan → 數學
(3, 16), -- Mr. Chan → 歷史
(3, 13), -- Mr. Chan → 物理

(4, 12), -- Ms. Mok → 中國歷史
(4, 4),  -- Ms. Mok → 公民與社會發展

(5, 1),  -- Ms. Lee → 中文
(5, 6);  -- Ms. Lee → 中國文學

INSERT INTO timetable (teacher_id, subject_id, class_id, room_id, day_of_week, period_id) VALUES
(1, 2, 1, 12, 'Mon', 1),  -- Tom 英文 → 1M
(1, 3, 2, 13, 'Tue', 2),  -- Tom 數學 → 1A
(1, 15, 3, 23, 'Wed', 3), -- Tom ICT → 1R

(2, 4, 1, 14, 'Mon', 2),  -- qwe 科學 → 1M
(2, 7, 5, 22, 'Thu', 3),  -- qwe 生物 → 2Y
(2, 15, 6, 8,  'Fri', 4), -- qwe 音樂 → 音樂室

(3, 3, 2, 13, 'Mon', 3),  -- Mr. Chan 數學 → 1A
(3, 16, 6, 22, 'Wed', 2), -- Mr. Chan 歷史 → 2Y
(3, 13, 9, 29, 'Thu', 5), -- Mr. Chan 物理 → 3M

(4, 12, 5, 20, 'Tue', 1), -- Ms. Mok 中國歷史 → 2A
(4, 4, 8, 21, 'Fri', 3),  -- Ms. Mok 公社 → 2R

(5, 1, 1, 12, 'Mon', 4),  -- Ms. Lee 中文 → 1M
(5, 6, 4, 19, 'Thu', 1),  -- Ms. Lee 中國文學 → 2M

(3, 5, 2, 1, 'Mon', 11),
(1, 11, 4, 4, 'Mon', 12),
(2, 20, 7, 5, 'Mon', 11),

(1, 5, 2, 1, 'Fri', 8),
(1, 11, 4, 4, 'Fri', 9),
(1, 20, 7, 5, 'Fri', 10),
(1, 11, 4, 4, 'Fri', 11),
(1, 20, 7, 5, 'Fri', 12);