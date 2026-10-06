-- Generated from Sample_data_students_v3.csv
-- Test data only: for duplicate class + class number, the first source row is kept.
-- Source rows: 850
-- Insert rows: 535
-- Duplicate groups: 225
-- Duplicate rows skipped: 315

USE school_management;
SET SQL_SAFE_UPDATES = 0;

DELETE FROM student_subject;
DELETE FROM nomination;
DELETE FROM prefect_nomination;
DELETE FROM learning_goal_record;
DELETE FROM BLA;
DELETE FROM student;

INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃欣軒', 'KHAN JOHN', c.class_id, '12', 'M'
FROM class c WHERE TRIM(c.class_name) = '1R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳偉軒', 'HO TOM', c.class_id, '12', 'F'
FROM class c WHERE TRIM(c.class_name) = '1Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁婷婷', 'NG JOHN', c.class_id, '27', 'M'
FROM class c WHERE TRIM(c.class_name) = '1R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '法蒂瑪', 'SMITH TOM', c.class_id, '30', 'M'
FROM class c WHERE TRIM(c.class_name) = '1R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉強軒', 'HO GRACE', c.class_id, '01', 'F'
FROM class c WHERE TRIM(c.class_name) = '1Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃玲強', 'CHOW KEVIN', c.class_id, '29', 'M'
FROM class c WHERE TRIM(c.class_name) = '1A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '阿里', 'KHAN MARY', c.class_id, '19', 'F'
FROM class c WHERE TRIM(c.class_name) = '1M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳欣玲', 'LEE KEVIN', c.class_id, '27', 'F'
FROM class c WHERE TRIM(c.class_name) = '1M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃美軒', 'WONG KEVIN', c.class_id, '04', 'F'
FROM class c WHERE TRIM(c.class_name) = '1Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張婷欣', 'LAM TOM', c.class_id, '17', 'M'
FROM class c WHERE TRIM(c.class_name) = '1R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李婷欣', 'LI GRACE', c.class_id, '18', 'M'
FROM class c WHERE TRIM(c.class_name) = '1R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃晴婷', 'NG MARY', c.class_id, '02', 'M'
FROM class c WHERE TRIM(c.class_name) = '1M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高明華', 'LAM SARAH', c.class_id, '34', 'M'
FROM class c WHERE TRIM(c.class_name) = '1A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張晴軒', 'CHEUNG MICHAEL', c.class_id, '03', 'F'
FROM class c WHERE TRIM(c.class_name) = '1R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳華美', 'KHAN EMILY', c.class_id, '16', 'F'
FROM class c WHERE TRIM(c.class_name) = '1A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周婷婷', 'KHAN AMY', c.class_id, '13', 'M'
FROM class c WHERE TRIM(c.class_name) = '1A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高強宇', 'WONG MICHAEL', c.class_id, '07', 'M'
FROM class c WHERE TRIM(c.class_name) = '1M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張美偉', 'WONG MICHAEL', c.class_id, '21', 'M'
FROM class c WHERE TRIM(c.class_name) = '1M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高婷健', 'LI MARY', c.class_id, '18', 'F'
FROM class c WHERE TRIM(c.class_name) = '1M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高偉宇', 'LAM EMILY', c.class_id, '25', 'M'
FROM class c WHERE TRIM(c.class_name) = '1R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳美婷', 'WONG ALI', c.class_id, '33', 'M'
FROM class c WHERE TRIM(c.class_name) = '1M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李華偉', 'KHAN EMILY', c.class_id, '16', 'M'
FROM class c WHERE TRIM(c.class_name) = '1R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '美雅', 'SMITH EMILY', c.class_id, '14', 'M'
FROM class c WHERE TRIM(c.class_name) = '1R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁軒晴', 'KHAN MICHAEL', c.class_id, '08', 'M'
FROM class c WHERE TRIM(c.class_name) = '1Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁欣晴', 'NG AMY', c.class_id, '28', 'F'
FROM class c WHERE TRIM(c.class_name) = '1Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳偉軒', 'LAU MARY', c.class_id, '28', 'F'
FROM class c WHERE TRIM(c.class_name) = '1M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉晴健', 'LAU CHRIS', c.class_id, '15', 'M'
FROM class c WHERE TRIM(c.class_name) = '1M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林軒美', 'LAU DAVID', c.class_id, '05', 'M'
FROM class c WHERE TRIM(c.class_name) = '1R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高強美', 'LAU GRACE', c.class_id, '09', 'M'
FROM class c WHERE TRIM(c.class_name) = '1R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '辛格', 'KHAN JOHN', c.class_id, '24', 'M'
FROM class c WHERE TRIM(c.class_name) = '1M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '傑克', 'KHAN TOM', c.class_id, '33', 'F'
FROM class c WHERE TRIM(c.class_name) = '1Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃強欣', 'HO SARAH', c.class_id, '27', 'F'
FROM class c WHERE TRIM(c.class_name) = '1Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '阿里', 'SINGH SARAH', c.class_id, '13', 'M'
FROM class c WHERE TRIM(c.class_name) = '1M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張婷婷', 'SMITH CHRIS', c.class_id, '31', 'F'
FROM class c WHERE TRIM(c.class_name) = '1Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林欣婷', 'CHAN TOM', c.class_id, '20', 'M'
FROM class c WHERE TRIM(c.class_name) = '1A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉華美', 'LEE ALI', c.class_id, '35', 'F'
FROM class c WHERE TRIM(c.class_name) = '1M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林宇晴', 'HO ALI', c.class_id, '30', 'F'
FROM class c WHERE TRIM(c.class_name) = '1M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高欣健', 'WONG TOM', c.class_id, '17', 'M'
FROM class c WHERE TRIM(c.class_name) = '1Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃婷華', 'CHEUNG TOM', c.class_id, '10', 'F'
FROM class c WHERE TRIM(c.class_name) = '1R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃華華', 'CHEUNG CHRIS', c.class_id, '07', 'M'
FROM class c WHERE TRIM(c.class_name) = '1A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '法蒂瑪', 'SINGH MICHAEL', c.class_id, '28', 'M'
FROM class c WHERE TRIM(c.class_name) = '1R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林美華', 'CHEUNG DAVID', c.class_id, '10', 'F'
FROM class c WHERE TRIM(c.class_name) = '1A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林晴健', 'CHOW JOHN', c.class_id, '22', 'M'
FROM class c WHERE TRIM(c.class_name) = '1A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁軒欣', 'CHEUNG DAVID', c.class_id, '03', 'M'
FROM class c WHERE TRIM(c.class_name) = '1Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳晴強', 'LI DAVID', c.class_id, '26', 'F'
FROM class c WHERE TRIM(c.class_name) = '1A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳宇宇', 'LEE DAVID', c.class_id, '13', 'F'
FROM class c WHERE TRIM(c.class_name) = '1Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周晴健', 'LAU SARAH', c.class_id, '09', 'F'
FROM class c WHERE TRIM(c.class_name) = '1M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳華玲', 'WONG KEVIN', c.class_id, '28', 'M'
FROM class c WHERE TRIM(c.class_name) = '1A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周婷欣', 'LEE MARY', c.class_id, '32', 'M'
FROM class c WHERE TRIM(c.class_name) = '1Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁美強', 'LI TOM', c.class_id, '15', 'M'
FROM class c WHERE TRIM(c.class_name) = '1A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃宇偉', 'LI AMY', c.class_id, '19', 'F'
FROM class c WHERE TRIM(c.class_name) = '1Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林美欣', 'WONG GRACE', c.class_id, '20', 'F'
FROM class c WHERE TRIM(c.class_name) = '1M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃玲玲', 'CHAN GRACE', c.class_id, '35', 'M'
FROM class c WHERE TRIM(c.class_name) = '1R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周軒明', 'CHEUNG CHRIS', c.class_id, '05', 'M'
FROM class c WHERE TRIM(c.class_name) = '1Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉軒明', 'LI CHRIS', c.class_id, '24', 'F'
FROM class c WHERE TRIM(c.class_name) = '1R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林晴明', 'LI JOHN', c.class_id, '23', 'M'
FROM class c WHERE TRIM(c.class_name) = '1M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳玲強', 'LAU ALI', c.class_id, '05', 'M'
FROM class c WHERE TRIM(c.class_name) = '1M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高晴強', 'NG KEVIN', c.class_id, '20', 'M'
FROM class c WHERE TRIM(c.class_name) = '1R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林欣強', 'LAU ALI', c.class_id, '21', 'M'
FROM class c WHERE TRIM(c.class_name) = '1A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁美明', 'HO MICHAEL', c.class_id, '32', 'F'
FROM class c WHERE TRIM(c.class_name) = '1M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃明健', 'KHAN MARY', c.class_id, '30', 'M'
FROM class c WHERE TRIM(c.class_name) = '1A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃玲華', 'CHAN DAVID', c.class_id, '35', 'F'
FROM class c WHERE TRIM(c.class_name) = '1A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳健明', 'CHOW EMILY', c.class_id, '32', 'M'
FROM class c WHERE TRIM(c.class_name) = '1A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉偉軒', 'HO TOM', c.class_id, '22', 'F'
FROM class c WHERE TRIM(c.class_name) = '1R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周欣偉', 'CHOW ALI', c.class_id, '17', 'M'
FROM class c WHERE TRIM(c.class_name) = '1A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳欣明', 'KHAN TOM', c.class_id, '04', 'F'
FROM class c WHERE TRIM(c.class_name) = '1A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李宇晴', 'LI CHRIS', c.class_id, '24', 'F'
FROM class c WHERE TRIM(c.class_name) = '1Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉宇美', 'CHEUNG TOM', c.class_id, '01', 'M'
FROM class c WHERE TRIM(c.class_name) = '1A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳強健', 'CHEUNG AMY', c.class_id, '08', 'M'
FROM class c WHERE TRIM(c.class_name) = '1R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉美明', 'NG AMY', c.class_id, '04', 'F'
FROM class c WHERE TRIM(c.class_name) = '1R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周明美', 'KHAN JOHN', c.class_id, '06', 'M'
FROM class c WHERE TRIM(c.class_name) = '1M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉明美', 'CHOW AMY', c.class_id, '14', 'M'
FROM class c WHERE TRIM(c.class_name) = '1A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周玲美', 'CHAN JOHN', c.class_id, '26', 'F'
FROM class c WHERE TRIM(c.class_name) = '1Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁玲美', 'LI SARAH', c.class_id, '35', 'M'
FROM class c WHERE TRIM(c.class_name) = '1Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高明晴', 'KHAN AMY', c.class_id, '21', 'M'
FROM class c WHERE TRIM(c.class_name) = '1Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林健欣', 'KHAN MICHAEL', c.class_id, '21', 'F'
FROM class c WHERE TRIM(c.class_name) = '1R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張健玲', 'LEE ALI', c.class_id, '31', 'F'
FROM class c WHERE TRIM(c.class_name) = '1A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李強軒', 'CHAN TOM', c.class_id, '19', 'F'
FROM class c WHERE TRIM(c.class_name) = '1A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉偉婷', 'KHAN MICHAEL', c.class_id, '03', 'M'
FROM class c WHERE TRIM(c.class_name) = '1M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李晴婷', 'WONG TOM', c.class_id, '30', 'F'
FROM class c WHERE TRIM(c.class_name) = '1Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉美強', 'SMITH JOHN', c.class_id, '18', 'F'
FROM class c WHERE TRIM(c.class_name) = '1Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉婷晴', 'HO EMILY', c.class_id, '10', 'M'
FROM class c WHERE TRIM(c.class_name) = '1Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃華宇', 'LAU EMILY', c.class_id, '11', 'F'
FROM class c WHERE TRIM(c.class_name) = '1A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳晴晴', 'LEE AMY', c.class_id, '29', 'M'
FROM class c WHERE TRIM(c.class_name) = '1R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳軒軒', 'LI EMILY', c.class_id, '12', 'M'
FROM class c WHERE TRIM(c.class_name) = '1M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張婷晴', 'KHAN EMILY', c.class_id, '11', 'F'
FROM class c WHERE TRIM(c.class_name) = '1Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周健明', 'CHOW ALI', c.class_id, '34', 'F'
FROM class c WHERE TRIM(c.class_name) = '1R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉欣欣', 'SMITH DAVID', c.class_id, '25', 'M'
FROM class c WHERE TRIM(c.class_name) = '1M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張晴玲', 'LI MARY', c.class_id, '11', 'M'
FROM class c WHERE TRIM(c.class_name) = '1R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳華宇', 'CHOW MICHAEL', c.class_id, '09', 'M'
FROM class c WHERE TRIM(c.class_name) = '1Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高宇玲', 'HO SARAH', c.class_id, '05', 'M'
FROM class c WHERE TRIM(c.class_name) = '1A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳強晴', 'CHOW KEVIN', c.class_id, '34', 'M'
FROM class c WHERE TRIM(c.class_name) = '1M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高宇婷', 'HO CHRIS', c.class_id, '33', 'F'
FROM class c WHERE TRIM(c.class_name) = '1A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高健玲', 'LEE AMY', c.class_id, '23', 'F'
FROM class c WHERE TRIM(c.class_name) = '2R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃玲晴', 'CHAN ALI', c.class_id, '01', 'F'
FROM class c WHERE TRIM(c.class_name) = '2M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張欣欣', 'LAU AMY', c.class_id, '09', 'F'
FROM class c WHERE TRIM(c.class_name) = '2M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳健宇', 'SMITH DAVID', c.class_id, '05', 'M'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉欣晴', 'LAM DAVID', c.class_id, '33', 'M'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高玲強', 'LEE JOHN', c.class_id, '20', 'M'
FROM class c WHERE TRIM(c.class_name) = '2R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李軒欣', 'CHOW DAVID', c.class_id, '31', 'M'
FROM class c WHERE TRIM(c.class_name) = '2A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張強軒', 'SMITH EMILY', c.class_id, '05', 'F'
FROM class c WHERE TRIM(c.class_name) = '2M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高宇宇', 'CHOW KEVIN', c.class_id, '33', 'F'
FROM class c WHERE TRIM(c.class_name) = '2M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張健明', 'LAU KEVIN', c.class_id, '23', 'F'
FROM class c WHERE TRIM(c.class_name) = '2M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張玲玲', 'LAU MARY', c.class_id, '07', 'M'
FROM class c WHERE TRIM(c.class_name) = '2R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉華明', 'CHOW EMILY', c.class_id, '27', 'M'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉宇健', 'LAM EMILY', c.class_id, '24', 'F'
FROM class c WHERE TRIM(c.class_name) = '2M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林明華', 'CHEUNG MICHAEL', c.class_id, '25', 'M'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁偉偉', 'CHEUNG TOM', c.class_id, '23', 'F'
FROM class c WHERE TRIM(c.class_name) = '2A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '辛格', 'SINGH MICHAEL', c.class_id, '30', 'M'
FROM class c WHERE TRIM(c.class_name) = '2A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林偉晴', 'WONG JOHN', c.class_id, '20', 'F'
FROM class c WHERE TRIM(c.class_name) = '2A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳婷強', 'LAM TOM', c.class_id, '15', 'F'
FROM class c WHERE TRIM(c.class_name) = '2A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁晴明', 'LAU AMY', c.class_id, '06', 'M'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '辛格', 'KHAN EMILY', c.class_id, '26', 'F'
FROM class c WHERE TRIM(c.class_name) = '2A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉強晴', 'LAU JOHN', c.class_id, '07', 'F'
FROM class c WHERE TRIM(c.class_name) = '2M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁美明', 'LEE KEVIN', c.class_id, '18', 'F'
FROM class c WHERE TRIM(c.class_name) = '2M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張玲美', 'CHOW ALI', c.class_id, '14', 'F'
FROM class c WHERE TRIM(c.class_name) = '2R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張婷玲', 'HO JOHN', c.class_id, '21', 'M'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李偉明', 'LAU ALI', c.class_id, '19', 'F'
FROM class c WHERE TRIM(c.class_name) = '2A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃婷宇', 'CHEUNG CHRIS', c.class_id, '01', 'M'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李明玲', 'LAM DAVID', c.class_id, '03', 'F'
FROM class c WHERE TRIM(c.class_name) = '2R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林晴明', 'LI EMILY', c.class_id, '25', 'M'
FROM class c WHERE TRIM(c.class_name) = '2R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周軒華', 'LI DAVID', c.class_id, '20', 'M'
FROM class c WHERE TRIM(c.class_name) = '2M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張強健', 'LI ALI', c.class_id, '30', 'F'
FROM class c WHERE TRIM(c.class_name) = '2R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周欣軒', 'WONG GRACE', c.class_id, '22', 'F'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張欣婷', 'NG EMILY', c.class_id, '08', 'F'
FROM class c WHERE TRIM(c.class_name) = '2R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林軒軒', 'CHOW KEVIN', c.class_id, '08', 'M'
FROM class c WHERE TRIM(c.class_name) = '2M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁宇健', 'HO JOHN', c.class_id, '29', 'F'
FROM class c WHERE TRIM(c.class_name) = '2R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉欣健', 'CHEUNG MARY', c.class_id, '03', 'M'
FROM class c WHERE TRIM(c.class_name) = '2A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張欣強', 'CHEUNG KEVIN', c.class_id, '34', 'M'
FROM class c WHERE TRIM(c.class_name) = '2A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高宇宇', 'WONG AMY', c.class_id, '28', 'F'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃宇玲', 'HO TOM', c.class_id, '18', 'F'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李婷婷', 'LAU MARY', c.class_id, '21', 'F'
FROM class c WHERE TRIM(c.class_name) = '2R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張婷明', 'LAM SARAH', c.class_id, '17', 'M'
FROM class c WHERE TRIM(c.class_name) = '2R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳偉晴', 'CHAN ALI', c.class_id, '13', 'M'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳美華', 'LAM GRACE', c.class_id, '21', 'M'
FROM class c WHERE TRIM(c.class_name) = '2M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃婷宇', 'WONG EMILY', c.class_id, '26', 'F'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '阿里', 'SMITH TOM', c.class_id, '04', 'F'
FROM class c WHERE TRIM(c.class_name) = '2A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳偉健', 'LEE DAVID', c.class_id, '31', 'M'
FROM class c WHERE TRIM(c.class_name) = '2M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高欣軒', 'WONG CHRIS', c.class_id, '12', 'F'
FROM class c WHERE TRIM(c.class_name) = '2R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高偉軒', 'LI KEVIN', c.class_id, '15', 'M'
FROM class c WHERE TRIM(c.class_name) = '2R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉強偉', 'SMITH JOHN', c.class_id, '22', 'M'
FROM class c WHERE TRIM(c.class_name) = '2A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高美華', 'CHAN KEVIN', c.class_id, '08', 'F'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林玲婷', 'CHAN TOM', c.class_id, '01', 'F'
FROM class c WHERE TRIM(c.class_name) = '2A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁晴健', 'SMITH GRACE', c.class_id, '32', 'F'
FROM class c WHERE TRIM(c.class_name) = '2A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳偉晴', 'CHOW EMILY', c.class_id, '12', 'M'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '法蒂瑪', 'SINGH MARY', c.class_id, '05', 'F'
FROM class c WHERE TRIM(c.class_name) = '2A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳婷華', 'CHEUNG MICHAEL', c.class_id, '22', 'F'
FROM class c WHERE TRIM(c.class_name) = '2R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃華宇', 'WONG JOHN', c.class_id, '10', 'M'
FROM class c WHERE TRIM(c.class_name) = '2R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林宇強', 'CHAN MICHAEL', c.class_id, '12', 'F'
FROM class c WHERE TRIM(c.class_name) = '2A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳偉婷', 'LAM ALI', c.class_id, '25', 'M'
FROM class c WHERE TRIM(c.class_name) = '2A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉強美', 'CHEUNG EMILY', c.class_id, '35', 'M'
FROM class c WHERE TRIM(c.class_name) = '2M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '法蒂瑪', 'KHAN CHRIS', c.class_id, '34', 'M'
FROM class c WHERE TRIM(c.class_name) = '2M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳美健', 'HO MARY', c.class_id, '07', 'M'
FROM class c WHERE TRIM(c.class_name) = '2A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高軒晴', 'LEE TOM', c.class_id, '13', 'M'
FROM class c WHERE TRIM(c.class_name) = '2R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳婷玲', 'CHOW ALI', c.class_id, '28', 'F'
FROM class c WHERE TRIM(c.class_name) = '2M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃晴婷', 'LAU ALI', c.class_id, '14', 'M'
FROM class c WHERE TRIM(c.class_name) = '2A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周健宇', 'SMITH MARY', c.class_id, '19', 'F'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高強強', 'KHAN CHRIS', c.class_id, '15', 'M'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高健美', 'CHOW KEVIN', c.class_id, '11', 'M'
FROM class c WHERE TRIM(c.class_name) = '2A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高偉華', 'LAU SARAH', c.class_id, '30', 'F'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉強軒', 'LI CHRIS', c.class_id, '26', 'M'
FROM class c WHERE TRIM(c.class_name) = '2R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林晴健', 'KHAN SARAH', c.class_id, '12', 'M'
FROM class c WHERE TRIM(c.class_name) = '2M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁宇宇', 'CHAN EMILY', c.class_id, '18', 'F'
FROM class c WHERE TRIM(c.class_name) = '2A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周宇華', 'WONG SARAH', c.class_id, '13', 'F'
FROM class c WHERE TRIM(c.class_name) = '2A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周美晴', 'LEE MARY', c.class_id, '09', 'M'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高偉健', 'NG MICHAEL', c.class_id, '27', 'F'
FROM class c WHERE TRIM(c.class_name) = '2R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周健華', 'CHOW MARY', c.class_id, '01', 'M'
FROM class c WHERE TRIM(c.class_name) = '2R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳美健', 'KHAN KEVIN', c.class_id, '32', 'F'
FROM class c WHERE TRIM(c.class_name) = '2R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張華健', 'SMITH EMILY', c.class_id, '31', 'F'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳宇軒', 'CHAN JOHN', c.class_id, '33', 'F'
FROM class c WHERE TRIM(c.class_name) = '2A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林晴玲', 'LAU DAVID', c.class_id, '02', 'F'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林軒欣', 'WONG MICHAEL', c.class_id, '07', 'F'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李婷偉', 'NG CHRIS', c.class_id, '24', 'M'
FROM class c WHERE TRIM(c.class_name) = '2R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁婷強', 'SMITH AMY', c.class_id, '02', 'M'
FROM class c WHERE TRIM(c.class_name) = '2A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李明偉', 'CHOW GRACE', c.class_id, '17', 'M'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林晴華', 'CHOW DAVID', c.class_id, '32', 'F'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁欣美', 'WONG CHRIS', c.class_id, '09', 'F'
FROM class c WHERE TRIM(c.class_name) = '2A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高宇強', 'KHAN ALI', c.class_id, '34', 'M'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林明強', 'LI JOHN', c.class_id, '19', 'M'
FROM class c WHERE TRIM(c.class_name) = '2R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃偉偉', 'LAM AMY', c.class_id, '02', 'F'
FROM class c WHERE TRIM(c.class_name) = '2M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃華宇', 'CHAN AMY', c.class_id, '17', 'M'
FROM class c WHERE TRIM(c.class_name) = '2M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '阿里', 'KHAN TOM', c.class_id, '06', 'M'
FROM class c WHERE TRIM(c.class_name) = '2A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高軒欣', 'WONG DAVID', c.class_id, '29', 'F'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林明健', 'KHAN GRACE', c.class_id, '25', 'F'
FROM class c WHERE TRIM(c.class_name) = '2M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張強宇', 'KHAN MARY', c.class_id, '10', 'F'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李偉美', 'NG AMY', c.class_id, '04', 'M'
FROM class c WHERE TRIM(c.class_name) = '2Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周健婷', 'LAM KEVIN', c.class_id, '28', 'M'
FROM class c WHERE TRIM(c.class_name) = '3A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳健強', 'WONG MICHAEL', c.class_id, '27', 'M'
FROM class c WHERE TRIM(c.class_name) = '3Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃宇玲', 'WONG KEVIN', c.class_id, '14', 'F'
FROM class c WHERE TRIM(c.class_name) = '3R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周宇欣', 'HO GRACE', c.class_id, '18', 'M'
FROM class c WHERE TRIM(c.class_name) = '3Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高玲明', 'SMITH CHRIS', c.class_id, '30', 'F'
FROM class c WHERE TRIM(c.class_name) = '3M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁玲偉', 'CHOW AMY', c.class_id, '15', 'M'
FROM class c WHERE TRIM(c.class_name) = '3A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁婷宇', 'LI ALI', c.class_id, '07', 'F'
FROM class c WHERE TRIM(c.class_name) = '3R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林華健', 'LEE DAVID', c.class_id, '03', 'M'
FROM class c WHERE TRIM(c.class_name) = '3A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張偉宇', 'LEE GRACE', c.class_id, '10', 'M'
FROM class c WHERE TRIM(c.class_name) = '3R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳華偉', 'CHEUNG MICHAEL', c.class_id, '14', 'M'
FROM class c WHERE TRIM(c.class_name) = '3M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳晴玲', 'LAU EMILY', c.class_id, '12', 'M'
FROM class c WHERE TRIM(c.class_name) = '3R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高偉華', 'LI GRACE', c.class_id, '05', 'F'
FROM class c WHERE TRIM(c.class_name) = '3A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高強健', 'LI KEVIN', c.class_id, '24', 'F'
FROM class c WHERE TRIM(c.class_name) = '3M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉明華', 'SMITH EMILY', c.class_id, '33', 'F'
FROM class c WHERE TRIM(c.class_name) = '3Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃美婷', 'SMITH KEVIN', c.class_id, '28', 'F'
FROM class c WHERE TRIM(c.class_name) = '3M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '法蒂瑪', 'KHAN CHRIS', c.class_id, '09', 'F'
FROM class c WHERE TRIM(c.class_name) = '3Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳宇宇', 'LAM AMY', c.class_id, '31', 'F'
FROM class c WHERE TRIM(c.class_name) = '3Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張軒強', 'NG KEVIN', c.class_id, '15', 'M'
FROM class c WHERE TRIM(c.class_name) = '3Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周健偉', 'CHEUNG TOM', c.class_id, '04', 'F'
FROM class c WHERE TRIM(c.class_name) = '3A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林軒欣', 'LAU KEVIN', c.class_id, '32', 'M'
FROM class c WHERE TRIM(c.class_name) = '3Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李欣偉', 'CHOW GRACE', c.class_id, '10', 'F'
FROM class c WHERE TRIM(c.class_name) = '3Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃軒軒', 'LAU MARY', c.class_id, '19', 'M'
FROM class c WHERE TRIM(c.class_name) = '3Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃玲軒', 'KHAN JOHN', c.class_id, '31', 'F'
FROM class c WHERE TRIM(c.class_name) = '3A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉華宇', 'HO MICHAEL', c.class_id, '23', 'F'
FROM class c WHERE TRIM(c.class_name) = '3R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高華強', 'LEE MARY', c.class_id, '17', 'F'
FROM class c WHERE TRIM(c.class_name) = '3M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張美婷', 'CHOW MICHAEL', c.class_id, '26', 'M'
FROM class c WHERE TRIM(c.class_name) = '3Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高玲軒', 'CHEUNG DAVID', c.class_id, '19', 'M'
FROM class c WHERE TRIM(c.class_name) = '3A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁健晴', 'LAM MARY', c.class_id, '01', 'M'
FROM class c WHERE TRIM(c.class_name) = '3A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林玲軒', 'NG DAVID', c.class_id, '16', 'M'
FROM class c WHERE TRIM(c.class_name) = '3M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁軒美', 'LI KEVIN', c.class_id, '32', 'F'
FROM class c WHERE TRIM(c.class_name) = '3R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁偉華', 'CHEUNG TOM', c.class_id, '28', 'F'
FROM class c WHERE TRIM(c.class_name) = '3R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳欣婷', 'LI EMILY', c.class_id, '16', 'M'
FROM class c WHERE TRIM(c.class_name) = '3A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林玲婷', 'HO DAVID', c.class_id, '02', 'F'
FROM class c WHERE TRIM(c.class_name) = '3Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林明婷', 'LAU TOM', c.class_id, '19', 'F'
FROM class c WHERE TRIM(c.class_name) = '3R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁婷晴', 'LI DAVID', c.class_id, '25', 'M'
FROM class c WHERE TRIM(c.class_name) = '3A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁玲婷', 'LEE TOM', c.class_id, '34', 'F'
FROM class c WHERE TRIM(c.class_name) = '3M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉玲健', 'LEE AMY', c.class_id, '34', 'M'
FROM class c WHERE TRIM(c.class_name) = '3R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳晴晴', 'WONG EMILY', c.class_id, '26', 'F'
FROM class c WHERE TRIM(c.class_name) = '3R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳強欣', 'LAM MICHAEL', c.class_id, '35', 'F'
FROM class c WHERE TRIM(c.class_name) = '3R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林軒偉', 'LI ALI', c.class_id, '01', 'F'
FROM class c WHERE TRIM(c.class_name) = '3M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張玲華', 'CHAN GRACE', c.class_id, '10', 'M'
FROM class c WHERE TRIM(c.class_name) = '3M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '傑克', 'SINGH AMY', c.class_id, '29', 'M'
FROM class c WHERE TRIM(c.class_name) = '3A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林健晴', 'LI EMILY', c.class_id, '15', 'F'
FROM class c WHERE TRIM(c.class_name) = '3R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '美雅', 'SMITH EMILY', c.class_id, '19', 'M'
FROM class c WHERE TRIM(c.class_name) = '3M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳欣欣', 'KHAN EMILY', c.class_id, '30', 'F'
FROM class c WHERE TRIM(c.class_name) = '3R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高華偉', 'HO KEVIN', c.class_id, '04', 'M'
FROM class c WHERE TRIM(c.class_name) = '3Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周軒健', 'CHAN MICHAEL', c.class_id, '07', 'F'
FROM class c WHERE TRIM(c.class_name) = '3M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉婷健', 'SMITH GRACE', c.class_id, '11', 'F'
FROM class c WHERE TRIM(c.class_name) = '3M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周宇美', 'SMITH GRACE', c.class_id, '22', 'F'
FROM class c WHERE TRIM(c.class_name) = '3A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉強明', 'NG CHRIS', c.class_id, '16', 'M'
FROM class c WHERE TRIM(c.class_name) = '3R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳華健', 'LAU AMY', c.class_id, '14', 'F'
FROM class c WHERE TRIM(c.class_name) = '3A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁健華', 'WONG KEVIN', c.class_id, '20', 'F'
FROM class c WHERE TRIM(c.class_name) = '3A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳軒華', 'CHOW EMILY', c.class_id, '21', 'M'
FROM class c WHERE TRIM(c.class_name) = '3A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃玲軒', 'WONG MICHAEL', c.class_id, '32', 'M'
FROM class c WHERE TRIM(c.class_name) = '3M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁宇欣', 'CHAN JOHN', c.class_id, '11', 'F'
FROM class c WHERE TRIM(c.class_name) = '3R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '阿里', 'KHAN GRACE', c.class_id, '09', 'M'
FROM class c WHERE TRIM(c.class_name) = '3R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁強宇', 'LI ALI', c.class_id, '06', 'M'
FROM class c WHERE TRIM(c.class_name) = '3M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '辛格', 'SINGH TOM', c.class_id, '23', 'M'
FROM class c WHERE TRIM(c.class_name) = '3Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林軒婷', 'LEE AMY', c.class_id, '09', 'M'
FROM class c WHERE TRIM(c.class_name) = '3M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林華欣', 'SMITH MARY', c.class_id, '12', 'M'
FROM class c WHERE TRIM(c.class_name) = '3M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周欣宇', 'LEE DAVID', c.class_id, '07', 'M'
FROM class c WHERE TRIM(c.class_name) = '3A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林華婷', 'NG JOHN', c.class_id, '13', 'F'
FROM class c WHERE TRIM(c.class_name) = '3R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉華宇', 'SMITH CHRIS', c.class_id, '28', 'F'
FROM class c WHERE TRIM(c.class_name) = '3Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '傑克', 'KHAN MICHAEL', c.class_id, '21', 'M'
FROM class c WHERE TRIM(c.class_name) = '3M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周明欣', 'CHAN ALI', c.class_id, '30', 'F'
FROM class c WHERE TRIM(c.class_name) = '3A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李晴婷', 'LAM MICHAEL', c.class_id, '32', 'M'
FROM class c WHERE TRIM(c.class_name) = '3A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳美健', 'CHEUNG MARY', c.class_id, '30', 'M'
FROM class c WHERE TRIM(c.class_name) = '3Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳美強', 'KHAN ALI', c.class_id, '05', 'F'
FROM class c WHERE TRIM(c.class_name) = '3M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳晴婷', 'CHEUNG AMY', c.class_id, '34', 'M'
FROM class c WHERE TRIM(c.class_name) = '3A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林健欣', 'HO SARAH', c.class_id, '27', 'M'
FROM class c WHERE TRIM(c.class_name) = '3R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林晴華', 'CHOW TOM', c.class_id, '17', 'F'
FROM class c WHERE TRIM(c.class_name) = '3A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '美雅', 'SINGH MICHAEL', c.class_id, '26', 'M'
FROM class c WHERE TRIM(c.class_name) = '3A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉晴健', 'LAM DAVID', c.class_id, '11', 'F'
FROM class c WHERE TRIM(c.class_name) = '3A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁強強', 'CHOW CHRIS', c.class_id, '20', 'M'
FROM class c WHERE TRIM(c.class_name) = '3M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '傑克', 'KHAN KEVIN', c.class_id, '18', 'M'
FROM class c WHERE TRIM(c.class_name) = '3A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳健偉', 'LI EMILY', c.class_id, '20', 'M'
FROM class c WHERE TRIM(c.class_name) = '3R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉軒華', 'LAM GRACE', c.class_id, '26', 'F'
FROM class c WHERE TRIM(c.class_name) = '3M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁強婷', 'LAM CHRIS', c.class_id, '16', 'F'
FROM class c WHERE TRIM(c.class_name) = '3Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李欣明', 'WONG MARY', c.class_id, '22', 'M'
FROM class c WHERE TRIM(c.class_name) = '3Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳華宇', 'NG JOHN', c.class_id, '22', 'F'
FROM class c WHERE TRIM(c.class_name) = '3R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳強玲', 'LAU MARY', c.class_id, '24', 'F'
FROM class c WHERE TRIM(c.class_name) = '3R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周偉宇', 'LAM MICHAEL', c.class_id, '12', 'M'
FROM class c WHERE TRIM(c.class_name) = '3A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張健玲', 'LAU CHRIS', c.class_id, '15', 'M'
FROM class c WHERE TRIM(c.class_name) = '3M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '辛格', 'SMITH TOM', c.class_id, '21', 'F'
FROM class c WHERE TRIM(c.class_name) = '3Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林婷玲', 'HO MICHAEL', c.class_id, '24', 'M'
FROM class c WHERE TRIM(c.class_name) = '3A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '辛格', 'SINGH JOHN', c.class_id, '20', 'M'
FROM class c WHERE TRIM(c.class_name) = '4A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉玲晴', 'LAU AMY', c.class_id, '14', 'M'
FROM class c WHERE TRIM(c.class_name) = '4M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳晴欣', 'HO MICHAEL', c.class_id, '06', 'F'
FROM class c WHERE TRIM(c.class_name) = '4M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '法蒂瑪', 'SINGH KEVIN', c.class_id, '22', 'M'
FROM class c WHERE TRIM(c.class_name) = '4M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁晴玲', 'SMITH EMILY', c.class_id, '25', 'F'
FROM class c WHERE TRIM(c.class_name) = '4R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃婷強', 'SMITH GRACE', c.class_id, '25', 'F'
FROM class c WHERE TRIM(c.class_name) = '4M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '美雅', 'SMITH GRACE', c.class_id, '16', 'M'
FROM class c WHERE TRIM(c.class_name) = '4A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳玲軒', 'LEE SARAH', c.class_id, '20', 'F'
FROM class c WHERE TRIM(c.class_name) = '4M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉玲婷', 'KHAN AMY', c.class_id, '12', 'F'
FROM class c WHERE TRIM(c.class_name) = '4Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳偉軒', 'LAU DAVID', c.class_id, '05', 'F'
FROM class c WHERE TRIM(c.class_name) = '4M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '辛格', 'KHAN MARY', c.class_id, '21', 'F'
FROM class c WHERE TRIM(c.class_name) = '4Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉華宇', 'CHEUNG SARAH', c.class_id, '35', 'M'
FROM class c WHERE TRIM(c.class_name) = '4M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高婷美', 'CHOW JOHN', c.class_id, '16', 'F'
FROM class c WHERE TRIM(c.class_name) = '4R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高強婷', 'SMITH MICHAEL', c.class_id, '01', 'F'
FROM class c WHERE TRIM(c.class_name) = '4R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周欣美', 'NG DAVID', c.class_id, '32', 'M'
FROM class c WHERE TRIM(c.class_name) = '4M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周華美', 'LAU GRACE', c.class_id, '31', 'M'
FROM class c WHERE TRIM(c.class_name) = '4A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉玲強', 'LEE AMY', c.class_id, '26', 'M'
FROM class c WHERE TRIM(c.class_name) = '4Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳明玲', 'LI TOM', c.class_id, '21', 'M'
FROM class c WHERE TRIM(c.class_name) = '4R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳玲宇', 'SMITH TOM', c.class_id, '29', 'F'
FROM class c WHERE TRIM(c.class_name) = '4R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃晴宇', 'SMITH MICHAEL', c.class_id, '17', 'F'
FROM class c WHERE TRIM(c.class_name) = '4Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張華強', 'CHAN MARY', c.class_id, '04', 'M'
FROM class c WHERE TRIM(c.class_name) = '4Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林欣華', 'LAM KEVIN', c.class_id, '28', 'F'
FROM class c WHERE TRIM(c.class_name) = '4M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉美軒', 'CHAN CHRIS', c.class_id, '22', 'F'
FROM class c WHERE TRIM(c.class_name) = '4A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁宇婷', 'CHEUNG KEVIN', c.class_id, '32', 'M'
FROM class c WHERE TRIM(c.class_name) = '4R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高軒欣', 'CHEUNG KEVIN', c.class_id, '01', 'F'
FROM class c WHERE TRIM(c.class_name) = '4M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉玲健', 'SMITH KEVIN', c.class_id, '02', 'M'
FROM class c WHERE TRIM(c.class_name) = '4M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周婷強', 'CHOW GRACE', c.class_id, '04', 'M'
FROM class c WHERE TRIM(c.class_name) = '4R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃健婷', 'SMITH AMY', c.class_id, '33', 'M'
FROM class c WHERE TRIM(c.class_name) = '4R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李宇婷', 'LI CHRIS', c.class_id, '12', 'F'
FROM class c WHERE TRIM(c.class_name) = '4R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周美明', 'SMITH KEVIN', c.class_id, '19', 'M'
FROM class c WHERE TRIM(c.class_name) = '4R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李華美', 'LEE SARAH', c.class_id, '13', 'F'
FROM class c WHERE TRIM(c.class_name) = '4Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳明強', 'WONG KEVIN', c.class_id, '22', 'F'
FROM class c WHERE TRIM(c.class_name) = '4Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁健玲', 'WONG DAVID', c.class_id, '30', 'F'
FROM class c WHERE TRIM(c.class_name) = '4R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳美華', 'NG MICHAEL', c.class_id, '09', 'F'
FROM class c WHERE TRIM(c.class_name) = '4R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁玲華', 'HO SARAH', c.class_id, '29', 'F'
FROM class c WHERE TRIM(c.class_name) = '4M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳偉婷', 'WONG CHRIS', c.class_id, '33', 'F'
FROM class c WHERE TRIM(c.class_name) = '4M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '美雅', 'KHAN AMY', c.class_id, '14', 'F'
FROM class c WHERE TRIM(c.class_name) = '4A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁宇美', 'WONG AMY', c.class_id, '11', 'F'
FROM class c WHERE TRIM(c.class_name) = '4A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周欣軒', 'CHAN MICHAEL', c.class_id, '06', 'M'
FROM class c WHERE TRIM(c.class_name) = '4A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁軒宇', 'CHEUNG GRACE', c.class_id, '16', 'F'
FROM class c WHERE TRIM(c.class_name) = '4M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉欣華', 'WONG ALI', c.class_id, '16', 'F'
FROM class c WHERE TRIM(c.class_name) = '4Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '阿里', 'SMITH JOHN', c.class_id, '23', 'F'
FROM class c WHERE TRIM(c.class_name) = '4M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉晴美', 'SMITH CHRIS', c.class_id, '03', 'F'
FROM class c WHERE TRIM(c.class_name) = '4R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃欣偉', 'SMITH JOHN', c.class_id, '05', 'M'
FROM class c WHERE TRIM(c.class_name) = '4A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉欣健', 'HO MARY', c.class_id, '24', 'M'
FROM class c WHERE TRIM(c.class_name) = '4R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高軒宇', 'LAU SARAH', c.class_id, '21', 'F'
FROM class c WHERE TRIM(c.class_name) = '4M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '法蒂瑪', 'SMITH EMILY', c.class_id, '25', 'F'
FROM class c WHERE TRIM(c.class_name) = '4Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳明偉', 'WONG EMILY', c.class_id, '31', 'M'
FROM class c WHERE TRIM(c.class_name) = '4R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高偉晴', 'CHEUNG DAVID', c.class_id, '20', 'M'
FROM class c WHERE TRIM(c.class_name) = '4Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉宇強', 'WONG KEVIN', c.class_id, '15', 'F'
FROM class c WHERE TRIM(c.class_name) = '4R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李晴軒', 'CHEUNG CHRIS', c.class_id, '04', 'M'
FROM class c WHERE TRIM(c.class_name) = '4A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張強玲', 'LEE MARY', c.class_id, '05', 'F'
FROM class c WHERE TRIM(c.class_name) = '4R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '阿里', 'SMITH TOM', c.class_id, '08', 'F'
FROM class c WHERE TRIM(c.class_name) = '4R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳健偉', 'CHOW CHRIS', c.class_id, '14', 'F'
FROM class c WHERE TRIM(c.class_name) = '4R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '傑克', 'KHAN AMY', c.class_id, '34', 'M'
FROM class c WHERE TRIM(c.class_name) = '4Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張美偉', 'LAM MARY', c.class_id, '22', 'M'
FROM class c WHERE TRIM(c.class_name) = '4R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林玲美', 'NG MARY', c.class_id, '28', 'F'
FROM class c WHERE TRIM(c.class_name) = '4Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周宇婷', 'LEE TOM', c.class_id, '17', 'F'
FROM class c WHERE TRIM(c.class_name) = '4A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳美華', 'LI TOM', c.class_id, '26', 'F'
FROM class c WHERE TRIM(c.class_name) = '4M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳明美', 'LI TOM', c.class_id, '30', 'M'
FROM class c WHERE TRIM(c.class_name) = '4A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林婷玲', 'NG DAVID', c.class_id, '29', 'F'
FROM class c WHERE TRIM(c.class_name) = '4A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉晴強', 'LI GRACE', c.class_id, '08', 'F'
FROM class c WHERE TRIM(c.class_name) = '4A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張明明', 'KHAN AMY', c.class_id, '17', 'M'
FROM class c WHERE TRIM(c.class_name) = '4M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張美強', 'LI EMILY', c.class_id, '34', 'M'
FROM class c WHERE TRIM(c.class_name) = '4A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周欣美', 'CHOW GRACE', c.class_id, '02', 'M'
FROM class c WHERE TRIM(c.class_name) = '4R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李華強', 'LEE CHRIS', c.class_id, '27', 'M'
FROM class c WHERE TRIM(c.class_name) = '4A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁華健', 'KHAN ALI', c.class_id, '11', 'F'
FROM class c WHERE TRIM(c.class_name) = '4R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁晴軒', 'LI GRACE', c.class_id, '25', 'M'
FROM class c WHERE TRIM(c.class_name) = '4A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁玲晴', 'LEE DAVID', c.class_id, '07', 'F'
FROM class c WHERE TRIM(c.class_name) = '4R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳玲軒', 'WONG MICHAEL', c.class_id, '02', 'F'
FROM class c WHERE TRIM(c.class_name) = '4Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周宇強', 'CHAN KEVIN', c.class_id, '11', 'M'
FROM class c WHERE TRIM(c.class_name) = '4M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃美強', 'SMITH TOM', c.class_id, '24', 'F'
FROM class c WHERE TRIM(c.class_name) = '4Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張玲強', 'SMITH SARAH', c.class_id, '11', 'F'
FROM class c WHERE TRIM(c.class_name) = '4Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張軒強', 'CHOW MICHAEL', c.class_id, '19', 'F'
FROM class c WHERE TRIM(c.class_name) = '4A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '傑克', 'SMITH CHRIS', c.class_id, '28', 'F'
FROM class c WHERE TRIM(c.class_name) = '4A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張強軒', 'LAM MICHAEL', c.class_id, '24', 'F'
FROM class c WHERE TRIM(c.class_name) = '4A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃宇明', 'WONG CHRIS', c.class_id, '35', 'F'
FROM class c WHERE TRIM(c.class_name) = '4A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳欣軒', 'CHAN MARY', c.class_id, '27', 'M'
FROM class c WHERE TRIM(c.class_name) = '4R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周玲軒', 'LAU EMILY', c.class_id, '18', 'F'
FROM class c WHERE TRIM(c.class_name) = '4R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉玲華', 'CHEUNG GRACE', c.class_id, '09', 'M'
FROM class c WHERE TRIM(c.class_name) = '4M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高晴欣', 'LEE AMY', c.class_id, '33', 'M'
FROM class c WHERE TRIM(c.class_name) = '4A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃華晴', 'LAM MICHAEL', c.class_id, '34', 'F'
FROM class c WHERE TRIM(c.class_name) = '4M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉玲明', 'SMITH SARAH', c.class_id, '15', 'M'
FROM class c WHERE TRIM(c.class_name) = '4A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃偉晴', 'NG ALI', c.class_id, '14', 'M'
FROM class c WHERE TRIM(c.class_name) = '4Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃強偉', 'CHAN DAVID', c.class_id, '10', 'M'
FROM class c WHERE TRIM(c.class_name) = '4Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張華婷', 'LAU JOHN', c.class_id, '15', 'M'
FROM class c WHERE TRIM(c.class_name) = '4Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃華宇', 'LEE KEVIN', c.class_id, '24', 'M'
FROM class c WHERE TRIM(c.class_name) = '4M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高強健', 'KHAN AMY', c.class_id, '04', 'F'
FROM class c WHERE TRIM(c.class_name) = '5M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高健玲', 'WONG SARAH', c.class_id, '18', 'F'
FROM class c WHERE TRIM(c.class_name) = '5A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高宇強', 'HO MARY', c.class_id, '32', 'M'
FROM class c WHERE TRIM(c.class_name) = '5M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周偉欣', 'CHOW GRACE', c.class_id, '04', 'F'
FROM class c WHERE TRIM(c.class_name) = '5A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高晴美', 'LI GRACE', c.class_id, '04', 'F'
FROM class c WHERE TRIM(c.class_name) = '5R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁明華', 'LAU DAVID', c.class_id, '33', 'M'
FROM class c WHERE TRIM(c.class_name) = '5R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳婷軒', 'CHAN DAVID', c.class_id, '13', 'F'
FROM class c WHERE TRIM(c.class_name) = '5R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃婷明', 'LAM TOM', c.class_id, '10', 'M'
FROM class c WHERE TRIM(c.class_name) = '5M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周偉健', 'SMITH ALI', c.class_id, '31', 'M'
FROM class c WHERE TRIM(c.class_name) = '5M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉明婷', 'SMITH SARAH', c.class_id, '17', 'M'
FROM class c WHERE TRIM(c.class_name) = '5Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳明華', 'KHAN TOM', c.class_id, '11', 'M'
FROM class c WHERE TRIM(c.class_name) = '5M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張婷晴', 'LAM JOHN', c.class_id, '28', 'F'
FROM class c WHERE TRIM(c.class_name) = '5M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃玲晴', 'CHOW ALI', c.class_id, '23', 'M'
FROM class c WHERE TRIM(c.class_name) = '5M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳明晴', 'KHAN TOM', c.class_id, '34', 'M'
FROM class c WHERE TRIM(c.class_name) = '5A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高華軒', 'NG MICHAEL', c.class_id, '07', 'F'
FROM class c WHERE TRIM(c.class_name) = '5A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林欣偉', 'SMITH TOM', c.class_id, '09', 'F'
FROM class c WHERE TRIM(c.class_name) = '5Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張軒軒', 'LAU GRACE', c.class_id, '17', 'M'
FROM class c WHERE TRIM(c.class_name) = '5M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張婷健', 'LAM JOHN', c.class_id, '06', 'M'
FROM class c WHERE TRIM(c.class_name) = '5M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁明玲', 'LAM KEVIN', c.class_id, '06', 'M'
FROM class c WHERE TRIM(c.class_name) = '5R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '美雅', 'SMITH TOM', c.class_id, '35', 'F'
FROM class c WHERE TRIM(c.class_name) = '5A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃偉宇', 'KHAN MICHAEL', c.class_id, '24', 'F'
FROM class c WHERE TRIM(c.class_name) = '5R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉軒玲', 'SMITH GRACE', c.class_id, '22', 'F'
FROM class c WHERE TRIM(c.class_name) = '5R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁晴華', 'SMITH MARY', c.class_id, '05', 'M'
FROM class c WHERE TRIM(c.class_name) = '5M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃美玲', 'SMITH AMY', c.class_id, '16', 'F'
FROM class c WHERE TRIM(c.class_name) = '5Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張晴婷', 'LEE MARY', c.class_id, '17', 'F'
FROM class c WHERE TRIM(c.class_name) = '5A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉宇華', 'LEE EMILY', c.class_id, '27', 'M'
FROM class c WHERE TRIM(c.class_name) = '5Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高華宇', 'CHAN JOHN', c.class_id, '14', 'M'
FROM class c WHERE TRIM(c.class_name) = '5A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張華玲', 'LAU KEVIN', c.class_id, '19', 'F'
FROM class c WHERE TRIM(c.class_name) = '5M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃美強', 'LEE KEVIN', c.class_id, '12', 'M'
FROM class c WHERE TRIM(c.class_name) = '5A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張欣軒', 'LEE MARY', c.class_id, '18', 'M'
FROM class c WHERE TRIM(c.class_name) = '5Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張健晴', 'LAM AMY', c.class_id, '09', 'M'
FROM class c WHERE TRIM(c.class_name) = '5R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉偉偉', 'SMITH ALI', c.class_id, '08', 'M'
FROM class c WHERE TRIM(c.class_name) = '5R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高明強', 'LEE ALI', c.class_id, '34', 'F'
FROM class c WHERE TRIM(c.class_name) = '5Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李華明', 'NG CHRIS', c.class_id, '21', 'M'
FROM class c WHERE TRIM(c.class_name) = '5M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁玲明', 'HO ALI', c.class_id, '30', 'F'
FROM class c WHERE TRIM(c.class_name) = '5Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉偉強', 'LEE KEVIN', c.class_id, '31', 'F'
FROM class c WHERE TRIM(c.class_name) = '5R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周健軒', 'NG MICHAEL', c.class_id, '26', 'F'
FROM class c WHERE TRIM(c.class_name) = '5A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉玲華', 'CHOW CHRIS', c.class_id, '32', 'F'
FROM class c WHERE TRIM(c.class_name) = '5R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳美強', 'WONG EMILY', c.class_id, '16', 'M'
FROM class c WHERE TRIM(c.class_name) = '5R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李健明', 'KHAN MARY', c.class_id, '35', 'F'
FROM class c WHERE TRIM(c.class_name) = '5M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高健強', 'KHAN AMY', c.class_id, '27', 'F'
FROM class c WHERE TRIM(c.class_name) = '5M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉明婷', 'KHAN CHRIS', c.class_id, '19', 'M'
FROM class c WHERE TRIM(c.class_name) = '5Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳軒宇', 'HO SARAH', c.class_id, '01', 'M'
FROM class c WHERE TRIM(c.class_name) = '5R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周美美', 'LI CHRIS', c.class_id, '28', 'F'
FROM class c WHERE TRIM(c.class_name) = '5Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉偉宇', 'SMITH AMY', c.class_id, '09', 'M'
FROM class c WHERE TRIM(c.class_name) = '5A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林明玲', 'HO DAVID', c.class_id, '29', 'F'
FROM class c WHERE TRIM(c.class_name) = '5M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃欣華', 'LEE ALI', c.class_id, '13', 'F'
FROM class c WHERE TRIM(c.class_name) = '5M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林欣健', 'HO TOM', c.class_id, '22', 'M'
FROM class c WHERE TRIM(c.class_name) = '5M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高明軒', 'CHEUNG EMILY', c.class_id, '35', 'F'
FROM class c WHERE TRIM(c.class_name) = '5R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳健健', 'KHAN AMY', c.class_id, '26', 'M'
FROM class c WHERE TRIM(c.class_name) = '5Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁婷軒', 'LEE TOM', c.class_id, '11', 'F'
FROM class c WHERE TRIM(c.class_name) = '5R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林宇軒', 'KHAN EMILY', c.class_id, '08', 'M'
FROM class c WHERE TRIM(c.class_name) = '5A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李健欣', 'SMITH DAVID', c.class_id, '14', 'F'
FROM class c WHERE TRIM(c.class_name) = '5R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳玲欣', 'CHOW MARY', c.class_id, '22', 'F'
FROM class c WHERE TRIM(c.class_name) = '5A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周宇婷', 'HO JOHN', c.class_id, '02', 'M'
FROM class c WHERE TRIM(c.class_name) = '5M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳晴婷', 'CHOW DAVID', c.class_id, '02', 'M'
FROM class c WHERE TRIM(c.class_name) = '5Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉婷偉', 'CHAN DAVID', c.class_id, '28', 'M'
FROM class c WHERE TRIM(c.class_name) = '5R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林強偉', 'CHAN AMY', c.class_id, '33', 'M'
FROM class c WHERE TRIM(c.class_name) = '5A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張明宇', 'NG TOM', c.class_id, '26', 'F'
FROM class c WHERE TRIM(c.class_name) = '5M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高明健', 'WONG ALI', c.class_id, '03', 'F'
FROM class c WHERE TRIM(c.class_name) = '5R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高美玲', 'LAU GRACE', c.class_id, '14', 'F'
FROM class c WHERE TRIM(c.class_name) = '5Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高健偉', 'SMITH MICHAEL', c.class_id, '25', 'F'
FROM class c WHERE TRIM(c.class_name) = '5M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉婷軒', 'HO ALI', c.class_id, '18', 'M'
FROM class c WHERE TRIM(c.class_name) = '5M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃偉婷', 'SMITH KEVIN', c.class_id, '10', 'F'
FROM class c WHERE TRIM(c.class_name) = '5A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張婷華', 'LAM ALI', c.class_id, '01', 'M'
FROM class c WHERE TRIM(c.class_name) = '5M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉欣華', 'WONG MARY', c.class_id, '27', 'M'
FROM class c WHERE TRIM(c.class_name) = '5A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周玲婷', 'CHOW EMILY', c.class_id, '17', 'M'
FROM class c WHERE TRIM(c.class_name) = '5R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '美雅', 'KHAN JOHN', c.class_id, '01', 'M'
FROM class c WHERE TRIM(c.class_name) = '5A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張偉宇', 'NG JOHN', c.class_id, '24', 'M'
FROM class c WHERE TRIM(c.class_name) = '5Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李美明', 'WONG TOM', c.class_id, '13', 'M'
FROM class c WHERE TRIM(c.class_name) = '5A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林健偉', 'CHEUNG KEVIN', c.class_id, '09', 'M'
FROM class c WHERE TRIM(c.class_name) = '5M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳華婷', 'CHAN JOHN', c.class_id, '35', 'M'
FROM class c WHERE TRIM(c.class_name) = '5Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李強華', 'CHEUNG KEVIN', c.class_id, '21', 'M'
FROM class c WHERE TRIM(c.class_name) = '5R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '法蒂瑪', 'KHAN GRACE', c.class_id, '24', 'F'
FROM class c WHERE TRIM(c.class_name) = '5M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁玲明', 'CHEUNG GRACE', c.class_id, '20', 'F'
FROM class c WHERE TRIM(c.class_name) = '5A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁玲美', 'CHAN MARY', c.class_id, '03', 'M'
FROM class c WHERE TRIM(c.class_name) = '5Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張偉宇', 'HO KEVIN', c.class_id, '34', 'F'
FROM class c WHERE TRIM(c.class_name) = '5M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁軒晴', 'CHEUNG GRACE', c.class_id, '21', 'M'
FROM class c WHERE TRIM(c.class_name) = '5Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁華偉', 'LAU ALI', c.class_id, '08', 'F'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張華婷', 'SMITH DAVID', c.class_id, '12', 'F'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳欣強', 'HO EMILY', c.class_id, '10', 'M'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉華欣', 'HO CHRIS', c.class_id, '11', 'M'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃強美', 'CHOW EMILY', c.class_id, '23', 'F'
FROM class c WHERE TRIM(c.class_name) = '6Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉明欣', 'KHAN GRACE', c.class_id, '02', 'M'
FROM class c WHERE TRIM(c.class_name) = '6Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林健婷', 'WONG JOHN', c.class_id, '01', 'M'
FROM class c WHERE TRIM(c.class_name) = '6A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃美美', 'CHEUNG GRACE', c.class_id, '30', 'F'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳欣婷', 'CHOW DAVID', c.class_id, '02', 'F'
FROM class c WHERE TRIM(c.class_name) = '6A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁明偉', 'CHOW ALI', c.class_id, '25', 'F'
FROM class c WHERE TRIM(c.class_name) = '6Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高偉軒', 'LAU AMY', c.class_id, '14', 'F'
FROM class c WHERE TRIM(c.class_name) = '6Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳明玲', 'HO GRACE', c.class_id, '01', 'M'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉欣強', 'KHAN KEVIN', c.class_id, '22', 'M'
FROM class c WHERE TRIM(c.class_name) = '6Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉強晴', 'LI GRACE', c.class_id, '27', 'M'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁玲軒', 'KHAN KEVIN', c.class_id, '32', 'F'
FROM class c WHERE TRIM(c.class_name) = '6Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳華健', 'LAM MARY', c.class_id, '28', 'F'
FROM class c WHERE TRIM(c.class_name) = '6A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '美雅', 'KHAN SARAH', c.class_id, '07', 'M'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃婷婷', 'KHAN SARAH', c.class_id, '24', 'F'
FROM class c WHERE TRIM(c.class_name) = '6A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '傑克', 'KHAN CHRIS', c.class_id, '33', 'F'
FROM class c WHERE TRIM(c.class_name) = '6A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉婷欣', 'CHAN CHRIS', c.class_id, '21', 'F'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周宇健', 'HO GRACE', c.class_id, '04', 'M'
FROM class c WHERE TRIM(c.class_name) = '6Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳偉健', 'KHAN KEVIN', c.class_id, '33', 'M'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高明明', 'LAU SARAH', c.class_id, '12', 'M'
FROM class c WHERE TRIM(c.class_name) = '6Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁欣軒', 'CHOW DAVID', c.class_id, '18', 'M'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李明軒', 'LAM MARY', c.class_id, '03', 'F'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃玲美', 'NG AMY', c.class_id, '30', 'M'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉健玲', 'SMITH GRACE', c.class_id, '11', 'M'
FROM class c WHERE TRIM(c.class_name) = '6Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁強美', 'CHEUNG SARAH', c.class_id, '05', 'F'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周晴晴', 'LEE EMILY', c.class_id, '08', 'M'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃玲強', 'CHAN MARY', c.class_id, '02', 'M'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周宇玲', 'LAU SARAH', c.class_id, '11', 'F'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉健軒', 'LI EMILY', c.class_id, '15', 'F'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁強玲', 'SMITH AMY', c.class_id, '17', 'M'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '辛格', 'KHAN AMY', c.class_id, '34', 'M'
FROM class c WHERE TRIM(c.class_name) = '6Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '阿里', 'SINGH TOM', c.class_id, '07', 'M'
FROM class c WHERE TRIM(c.class_name) = '6Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳晴美', 'CHOW CHRIS', c.class_id, '12', 'M'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高強偉', 'NG EMILY', c.class_id, '26', 'M'
FROM class c WHERE TRIM(c.class_name) = '6A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳強玲', 'CHAN KEVIN', c.class_id, '19', 'F'
FROM class c WHERE TRIM(c.class_name) = '6Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李健美', 'CHAN EMILY', c.class_id, '05', 'F'
FROM class c WHERE TRIM(c.class_name) = '6A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁明婷', 'WONG TOM', c.class_id, '09', 'F'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳玲玲', 'LI MICHAEL', c.class_id, '14', 'M'
FROM class c WHERE TRIM(c.class_name) = '6A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳明晴', 'NG MARY', c.class_id, '15', 'F'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周婷強', 'LAM MARY', c.class_id, '19', 'M'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳偉健', 'CHAN ALI', c.class_id, '16', 'M'
FROM class c WHERE TRIM(c.class_name) = '6Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高婷軒', 'LAU TOM', c.class_id, '16', 'F'
FROM class c WHERE TRIM(c.class_name) = '6A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林軒欣', 'CHAN AMY', c.class_id, '31', 'M'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張欣美', 'LI MICHAEL', c.class_id, '08', 'M'
FROM class c WHERE TRIM(c.class_name) = '6A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃婷健', 'HO DAVID', c.class_id, '23', 'M'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃美欣', 'CHEUNG MICHAEL', c.class_id, '07', 'M'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周偉玲', 'HO DAVID', c.class_id, '27', 'M'
FROM class c WHERE TRIM(c.class_name) = '6A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高明晴', 'CHOW SARAH', c.class_id, '34', 'F'
FROM class c WHERE TRIM(c.class_name) = '6A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李婷晴', 'NG SARAH', c.class_id, '19', 'M'
FROM class c WHERE TRIM(c.class_name) = '6A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林宇健', 'HO DAVID', c.class_id, '24', 'M'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉美健', 'KHAN EMILY', c.class_id, '13', 'M'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳偉華', 'CHEUNG ALI', c.class_id, '29', 'F'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林明偉', 'CHOW EMILY', c.class_id, '20', 'F'
FROM class c WHERE TRIM(c.class_name) = '6A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳晴婷', 'CHAN TOM', c.class_id, '04', 'M'
FROM class c WHERE TRIM(c.class_name) = '6A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周軒明', 'CHOW TOM', c.class_id, '22', 'M'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳婷明', 'WONG MARY', c.class_id, '05', 'F'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張軒軒', 'SMITH CHRIS', c.class_id, '21', 'M'
FROM class c WHERE TRIM(c.class_name) = '6Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高華健', 'KHAN JOHN', c.class_id, '22', 'F'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張晴軒', 'CHEUNG EMILY', c.class_id, '14', 'F'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高健華', 'CHOW MARY', c.class_id, '23', 'M'
FROM class c WHERE TRIM(c.class_name) = '6A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周明玲', 'KHAN EMILY', c.class_id, '01', 'M'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳宇美', 'SMITH SARAH', c.class_id, '10', 'M'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林明宇', 'WONG DAVID', c.class_id, '22', 'F'
FROM class c WHERE TRIM(c.class_name) = '6A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉軒華', 'NG JOHN', c.class_id, '20', 'F'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '吳健健', 'KHAN MARY', c.class_id, '20', 'F'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉明欣', 'LAM KEVIN', c.class_id, '17', 'F'
FROM class c WHERE TRIM(c.class_name) = '6A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '美雅', 'SMITH MARY', c.class_id, '35', 'M'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃晴明', 'WONG SARAH', c.class_id, '09', 'F'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周欣明', 'HO ALI', c.class_id, '25', 'F'
FROM class c WHERE TRIM(c.class_name) = '6A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉晴華', 'CHOW SARAH', c.class_id, '29', 'M'
FROM class c WHERE TRIM(c.class_name) = '6Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林宇婷', 'CHOW EMILY', c.class_id, '20', 'M'
FROM class c WHERE TRIM(c.class_name) = '6Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '林明明', 'WONG SARAH', c.class_id, '32', 'M'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張晴明', 'LAU JOHN', c.class_id, '16', 'F'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高華宇', 'LEE GRACE', c.class_id, '27', 'M'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李欣明', 'LAM CHRIS', c.class_id, '08', 'M'
FROM class c WHERE TRIM(c.class_name) = '6Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉偉華', 'NG AMY', c.class_id, '29', 'M'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳軒偉', 'LAM EMILY', c.class_id, '09', 'F'
FROM class c WHERE TRIM(c.class_name) = '6A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃晴宇', 'CHEUNG CHRIS', c.class_id, '05', 'F'
FROM class c WHERE TRIM(c.class_name) = '6Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張宇欣', 'WONG EMILY', c.class_id, '06', 'M'
FROM class c WHERE TRIM(c.class_name) = '6A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '法蒂瑪', 'KHAN JOHN', c.class_id, '24', 'M'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '李華偉', 'LAM SARAH', c.class_id, '25', 'F'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃軒偉', 'LAU DAVID', c.class_id, '32', 'M'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張晴強', 'HO AMY', c.class_id, '35', 'F'
FROM class c WHERE TRIM(c.class_name) = '6A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '張健強', 'NG MARY', c.class_id, '02', 'F'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '周明宇', 'NG DAVID', c.class_id, '28', 'F'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃欣強', 'SMITH GRACE', c.class_id, '21', 'F'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳欣玲', 'LEE MARY', c.class_id, '34', 'F'
FROM class c WHERE TRIM(c.class_name) = '6R'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '劉健玲', 'WONG SARAH', c.class_id, '06', 'F'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁玲玲', 'CHEUNG DAVID', c.class_id, '35', 'M'
FROM class c WHERE TRIM(c.class_name) = '6Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高晴晴', 'LAU ALI', c.class_id, '19', 'M'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '黃婷美', 'LAM EMILY', c.class_id, '17', 'M'
FROM class c WHERE TRIM(c.class_name) = '6Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '美雅', 'SINGH CHRIS', c.class_id, '21', 'M'
FROM class c WHERE TRIM(c.class_name) = '6A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '高美明', 'LI MICHAEL', c.class_id, '15', 'F'
FROM class c WHERE TRIM(c.class_name) = '6A'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳華強', 'CHOW AMY', c.class_id, '33', 'F'
FROM class c WHERE TRIM(c.class_name) = '6M'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '梁強美', 'LAM KEVIN', c.class_id, '09', 'M'
FROM class c WHERE TRIM(c.class_name) = '6Y'
LIMIT 1;
INSERT INTO student (student_ch_name, student_eng_name, class_id, class_number, sex)
SELECT '陳美軒', 'LEE DAVID', c.class_id, '03', 'M'
FROM class c WHERE TRIM(c.class_name) = '6Y'
LIMIT 1;

SET SQL_SAFE_UPDATES = 1;

SELECT COUNT(*) AS student_count FROM student;