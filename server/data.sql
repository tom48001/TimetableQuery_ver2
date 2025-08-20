-- 使用者帳號 (manager + 2 位老師)
INSERT INTO user (user_name, email, password, role) VALUES
('manager', 'manager@school.com', 'manager123', 'manager'),
('tom', 'tom@school.com', 'password123', 'teacher'),
('qwe', 'qwe@school.com', 'password456', 'teacher'),
('jchan', 'jchan@school.edu', '123456', 'teacher'),
('amok', 'amok@school.edu', '123456', 'teacher'),
('llee', 'llee@school.edu', '123456', 'teacher');

-- 老師基本資料（user_id 要正確對應）
INSERT INTO teacher (teacher_id, user_id, teacher_name, title) VALUES
(1, 2, 'Tom', 'English'),
(2, 3, 'qwe', 'Science'),
(3, 4, 'Mr. Chan', 'Mathematics'),
(4, 5, 'Ms. Mok', 'History'),
(5, 6, 'Ms. Lee', 'Chinese');

-- 班級資料 (會 auto-increment id，class_id 1~24)
INSERT INTO class (class_name, grade_level) VALUES
('1M', 'F1'), ('1A', 'F1'), ('1R', 'F1'), ('1Y', 'F1'),
('2M', 'F2'), ('2A', 'F2'), ('2R', 'F2'), ('2Y', 'F2'),
('3M', 'F3'), ('3A', 'F3'), ('3R', 'F3'), ('3Y', 'F3'),
('4M', 'F4'), ('4A', 'F4'), ('4R', 'F4'), ('4Y', 'F4'),
('5M', 'F5'), ('5A', 'F5'), ('5R', 'F5'), ('5Y', 'F5'),
('6M', 'F6'), ('6A', 'F6'), ('6R', 'F6'), ('6Y', 'F6');

-- 科目
INSERT INTO subject (subject_name, is_elective) VALUES
('Mathematics', FALSE),
('English', FALSE),
('Chinese', FALSE),
('Science', FALSE),
('History', FALSE),
('Computer Science', TRUE),
('Music', TRUE),
('Art', TRUE);

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
('Room 101'), ('Room 102'), ('Room 103'), ('Room 201'),
('Room 202'), ('Computer Lab'), ('Music Room'), ('Art Room');

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
(1, 6), (2, 7), (3, 8), (4, 6), (5, 7), (10, 6),
(6, 6),  -- Ho Ka Yi: Computer Science
(7, 1),  -- Lam Tsz Ho: Mathematics
(8, 2),  -- Chow Mei Wah: English
(9, 3),  -- Chan Wai Keung: Chinese
(10, 5); -- Law Suk Yi: History

-- 老師授課科目（需與 subject_id 對應）
INSERT INTO teacher_subject (teacher_id, subject_id) VALUES
(1, 1),  -- Tom 授數學
(1, 2),  -- Tom 授英文
(1, 6),  -- Tom 授電腦
(2, 4),  -- qwe 授科學
(2, 7),  -- qwe 授音樂
(3, 1),  -- Mr. Chan teaches Mathematics
(3, 6),  -- Mr. Chan teaches Computer Science
(4, 5),  -- Ms. Mok teaches History
(5, 3),  -- Ms. Lee teaches Chinese

-- 老師課表 (teacher_id, subject_id, class_id, room_id, day, period_id)
INSERT INTO timetable (teacher_id, subject_id, class_id, room_id, day_of_week, period_id) VALUES
(1, 2, 1, 2, 'Mon', 2),  -- Tom 授 1M 英文 在 Room 102, 星期一第二節
(2, 4, 1, 3, 'Tue', 1),  -- qwe 授 1M 科學 在 Room 103, 星期二第一節
(3, 1, 1, 1, 'Mon', 1),  -- Math by Mr. Chan
(4, 5, 2, 4, 'Wed', 3),  -- History by Ms. Mok
(5, 3, 2, 5, 'Thu', 4),  -- Chinese by Ms. Lee
(1, 6, 1, 6, 'Fri', 2),  -- Computer Science by Tom
(2, 7, 2, 7, 'Tue', 3),  -- Music by qwe
(2, 4, 5, 8, 'Mon', 5),
(3, 4, 6, 8, 'Fri', 5),
(1, 2, 1, 2, 'Mon', 11);