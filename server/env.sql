USE school_management;
drop DATABASE IF EXISTS school_management;

select * from user;
select * from teacher;
select * from class;
select * from subject;
select * from student;
select * from room;
select * from timetable;
select * from period;
select * from student_subject;
select * from teacher_subject;

CREATE DATABASE IF NOT EXISTS school_management;
USE school_management;

-- 用户表
CREATE TABLE user (
    user_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    google_id VARCHAR(255) UNIQUE,
    user_name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255),
    role ENUM('teacher', 'manager') DEFAULT 'teacher'
);

-- 老師表（可直接用user_id）
CREATE TABLE teacher (
    teacher_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id BIGINT UNIQUE NOT NULL,
    teacher_name VARCHAR(100) NOT NULL,
    title VARCHAR(50), -- 教什麼科目
    FOREIGN KEY (user_id) REFERENCES user(user_id) ON DELETE CASCADE
);

-- 班级表
CREATE TABLE class (
    class_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    class_name VARCHAR(255) NOT NULL,
    grade_level ENUM('F1','F2','F3','F4', 'F5', 'F6') NOT NULL
);

-- 科目表
CREATE TABLE subject (
    subject_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    subject_name VARCHAR(255) NOT NULL,
    is_elective BOOLEAN DEFAULT FALSE -- 是否選修科目
);

-- 學生表（多對多選修科目）
CREATE TABLE student (
    student_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    student_ch_name VARCHAR(255) NOT NULL,
    student_eng_name VARCHAR(255) NOT NULL,
    class_id BIGINT,
    class_number VARCHAR(2) NOT NULL,
    sex ENUM('M', 'F') NOT NULL,
    FOREIGN KEY (class_id) REFERENCES class(class_id) ON DELETE SET NULL
);

-- 學生-科目關係表（解選修科目限制）
CREATE TABLE student_subject (
    student_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    PRIMARY KEY (student_id, subject_id),
    FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subject(subject_id) ON DELETE CASCADE
);

CREATE TABLE teacher_subject (
    teacher_id BIGINT NOT NULL,
    subject_id BIGINT NOT NULL,
    PRIMARY KEY (teacher_id, subject_id),
    FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id),
    FOREIGN KEY (subject_id) REFERENCES subject(subject_id)
);

-- 房間上課時間表
CREATE TABLE room (
    room_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    room_name VARCHAR(255) UNIQUE NOT NULL
);

CREATE TABLE period (
    period_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    period_name VARCHAR(50) NOT NULL,
    start_time TIME NOT NULL,
    end_time TIME NOT NULL
);

-- 時間表
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
    UNIQUE KEY (room_id, day_of_week, period_id),  -- 防止教室時間衝突
    UNIQUE KEY (teacher_id, day_of_week, period_id)  -- 防止教師時間衝突
);

-- 提名表
CREATE TABLE nomination (
    nomination_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacher_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
);

CREATE TABLE BLA (
    BLA_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    teacher_id BIGINT NOT NULL,
    student_id BIGINT NOT NULL,
	  subject_id BIGINT NOT NULL,
    FOREIGN KEY (teacher_id) REFERENCES teacher(teacher_id) ON DELETE CASCADE,
    FOREIGN KEY (student_id) REFERENCES student(student_id) ON DELETE CASCADE,
    FOREIGN KEY (subject_id) REFERENCES subject(subject_id) ON DELETE CASCADE
);

-- 匯入時間表
CREATE TABLE import_schedule (
    import_id BIGINT AUTO_INCREMENT PRIMARY KEY,
    file_name VARCHAR(255) NOT NULL,
    import_date DATETIME DEFAULT CURRENT_TIMESTAMP
);
