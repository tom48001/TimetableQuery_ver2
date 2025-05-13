INSERT INTO user (user_name, email, password, role) VALUES
(1,1,1, 'manager'),
(2,2,2, 'teacher');

INSERT INTO teacher (teacher_id, user_id, teacher_name, title) VALUES
(1, 1, 'Tom', 'English'),
(2, 2, 'qwe', 'Science');

INSERT INTO class (class_name, grade_level) VALUES
('1M', 'F1'),('1A', 'F1'),('1R', 'F1'),('1Y', 'F1'),
('2M', 'F2'),('2A', 'F2'),('2R', 'F2'),('2Y', 'F2'),
('3M', 'F3'),('3A', 'F3'),('3R', 'F3'),('3Y', 'F3'),
('4M', 'F4'),('4A', 'F4'),('4R', 'F4'),('4Y', 'F4'),
('5M', 'F5'),('5A', 'F5'),('5R', 'F5'),('5Y', 'F5'),
('6M', 'F6'),('6A', 'F6'),('6R', 'F6'),('6Y', 'F6');

INSERT INTO subject (subject_name, is_elective) VALUES
('Mathematics', FALSE),
('English', FALSE),
('Chinese', FALSE),
('Science', FALSE),
('History', FALSE),
('Computer Science', TRUE),
('Music', TRUE),
('Art', TRUE);

INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex) VALUES
('陳大文', 'Chan Tai Man', 1, '01', 'M'),    -- 1M
('張小麗', 'Cheung Siu Lai', 1, '15', 'F'),  -- 1M
('李志強', 'Lee Chi Keung', 2, '11', 'M'),    -- 1A
('王美玲', 'Wong Mei Ling', 5, '09', 'F'),    -- 2M
('黃家輝', 'Wong Ka Fai', 6, '03', 'M'),     -- 2A
('林小娟', 'Lam Siu Kuen', 9, '20', 'F'),    -- 3M
('吳志明', 'Ng Chi Ming', 10, '20', 'M'),    -- 3A
('鄭秀文', 'Cheng Sau Man', 13, '21', 'F'),  -- 4M
('馬國明', 'Ma Kwok Ming', 14, '07', 'M'),   -- 4A
('劉德華', 'Lau Tak Wah', 17, '21', 'M');    -- 5M

INSERT INTO room (room_name) VALUES
('Room 101'),
('Room 102'),
('Room 103'),
('Room 201'),
('Room 202'),
('Computer Lab'),
('Music Room'),
('Art Room');

INSERT INTO period (period_name, start_time, end_time) VALUES
('Period 1', '08:30:00', '09:05:00'),
('Period 2', '09:05:00', '09:40:00'),
('Period 3', '09:55:00', '10:30:00'),
('Period 4', '10:30:00', '11:05:00'),
('Period 5', '11:20:00', '11:55:00'),
('Period 6', '11:55:00', '14:05:00'),
('Period 7', '13:30:00', '15:00:00'),
('Period 8', '14:05:00', '14:40:00'),
('Period 9', '14:40:00', '15:15:00'), -- 普通學生是 period9-10
('Period 10', '15:15:00', '15:30:00'),
('Period 11', '14:50:00', '15:25:00'), -- 如果有10就是 period11-12
('Period 12', '15:25:00', '16:00:00');

INSERT INTO student_subject (student_id, subject_id) VALUES
(1, 6),  -- Chan Tai Man takes Computer Science with John Smith
(2, 7),  -- Cheung Siu Lai takes Music with Emily Chen
(3, 8),  -- Lee Chi Keung takes Art with Sarah Lee
(4, 6),  -- Wong Mei Ling takes Computer Science with John Smith
(5, 7);  -- Wong Ka Fai takes Music with Emily Chen

INSERT INTO teacher_subject (teacher_id, subject_id) VALUES
-- John Smith (数学老师)可以教数学和计算机科学
(1, 1),  -- 数学
(1, 6),  -- 计算机科学
-- Emily Chen (英语老师)可以教英语和音乐
(2, 2),  -- 英语
(2, 7);  -- 音乐

INSERT INTO timetable (teacher_id, subject_id, class_id, room_id, day_of_week, period_id) VALUES
(1, 2, 1, 2, 'Mon', 2),  -- English for 1A in Room 102, Period 2 on Monday
(2, 4, 1, 3, 'Tue', 1);  -- Science for 1A in Room 103, Period 1 on Tuesday