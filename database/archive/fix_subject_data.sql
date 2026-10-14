-- Replace legacy test subjects with the canonical timetable/elective codes.
-- Keeps ICT, BAFS, STEM and General Studies because they are active standalone codes.
USE school_management;

DROP PROCEDURE IF EXISTS fix_subject_data;
DELIMITER $$
CREATE PROCEDURE fix_subject_data()
BEGIN
  DECLARE original_safe_updates BOOLEAN DEFAULT TRUE;
  DECLARE mapping_count INT DEFAULT 0;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    DROP TEMPORARY TABLE IF EXISTS subject_merge_map;
    SET SQL_SAFE_UPDATES = original_safe_updates;
    RESIGNAL;
  END;

  SET original_safe_updates = @@SQL_SAFE_UPDATES;
  SET SQL_SAFE_UPDATES = 0;
  START TRANSACTION;

  DROP TEMPORARY TABLE IF EXISTS subject_merge_map;
  CREATE TEMPORARY TABLE subject_merge_map (
    legacy_subject_id BIGINT PRIMARY KEY,
    canonical_subject_id BIGINT NOT NULL,
    UNIQUE KEY unique_subject_merge_target (legacy_subject_id, canonical_subject_id)
  );

  INSERT INTO subject_merge_map (legacy_subject_id, canonical_subject_id)
  SELECT legacy.subject_id, canonical.subject_id
  FROM (
    SELECT 'English' legacy_name, 'ENG' canonical_name UNION ALL
    SELECT 'Chinese Language', 'CHIN' UNION ALL
    SELECT 'Mathematics', 'MATH' UNION ALL
    SELECT 'Citizenship and Social Development', 'CES' UNION ALL
    SELECT 'Visual Arts', 'VA' UNION ALL
    SELECT 'Physical Education', 'PE' UNION ALL
    SELECT 'History', 'HIST' UNION ALL
    SELECT 'Religious Education', 'RE' UNION ALL
    SELECT 'Chinese Literature', 'CLIT-B1' UNION ALL
    SELECT 'Music', 'MUS' UNION ALL
    SELECT 'Geography', 'GEOG' UNION ALL
    SELECT 'Biology', 'BIO' UNION ALL
    SELECT 'Physics', 'PHY' UNION ALL
    SELECT 'Putonghua', 'PTH' UNION ALL
    SELECT 'Chemistry', 'CHEM' UNION ALL
    SELECT 'Economics', 'ECON'
  ) names
  JOIN subject legacy ON legacy.subject_name = names.legacy_name
  JOIN subject canonical ON canonical.subject_name = names.canonical_name;

  SELECT COUNT(*) INTO mapping_count FROM subject_merge_map;
  IF mapping_count <> 16 THEN
    SIGNAL SQLSTATE '45000'
      SET MESSAGE_TEXT = 'Expected 16 legacy subject mappings. No changes were committed.';
  END IF;

  INSERT IGNORE INTO teacher_subject (teacher_id, subject_id)
  SELECT relation.teacher_id, map.canonical_subject_id
  FROM teacher_subject relation
  JOIN subject_merge_map map ON map.legacy_subject_id = relation.subject_id;
  DELETE relation
  FROM teacher_subject relation
  JOIN subject_merge_map map ON map.legacy_subject_id = relation.subject_id;

  INSERT IGNORE INTO student_subject (student_id, subject_id)
  SELECT relation.student_id, map.canonical_subject_id
  FROM student_subject relation
  JOIN subject_merge_map map ON map.legacy_subject_id = relation.subject_id;
  DELETE relation
  FROM student_subject relation
  JOIN subject_merge_map map ON map.legacy_subject_id = relation.subject_id;

  INSERT IGNORE INTO BLA (teacher_id, student_id, subject_id)
  SELECT nomination.teacher_id, nomination.student_id, map.canonical_subject_id
  FROM BLA nomination
  JOIN subject_merge_map map ON map.legacy_subject_id = nomination.subject_id;
  DELETE nomination
  FROM BLA nomination
  JOIN subject_merge_map map ON map.legacy_subject_id = nomination.subject_id;

  UPDATE timetable relation
  JOIN subject_merge_map map ON map.legacy_subject_id = relation.subject_id
  SET relation.subject_id = map.canonical_subject_id;

  UPDATE timetable_history relation
  JOIN subject_merge_map map ON map.legacy_subject_id = relation.subject_id
  SET relation.subject_id = map.canonical_subject_id;

  UPDATE user relation
  JOIN subject_merge_map map ON map.legacy_subject_id = relation.subject_head_subject_id
  SET relation.subject_head_subject_id = map.canonical_subject_id;

  UPDATE student relation
  JOIN subject_merge_map map ON map.legacy_subject_id = relation.x1_subject_id
  SET relation.x1_subject_id = map.canonical_subject_id;
  UPDATE student relation
  JOIN subject_merge_map map ON map.legacy_subject_id = relation.x2_subject_id
  SET relation.x2_subject_id = map.canonical_subject_id;
  UPDATE student relation
  JOIN subject_merge_map map ON map.legacy_subject_id = relation.x3_subject_id
  SET relation.x3_subject_id = map.canonical_subject_id;

  UPDATE student_import_history relation
  JOIN subject_merge_map map ON map.legacy_subject_id = relation.x1_subject_id
  SET relation.x1_subject_id = map.canonical_subject_id;
  UPDATE student_import_history relation
  JOIN subject_merge_map map ON map.legacy_subject_id = relation.x2_subject_id
  SET relation.x2_subject_id = map.canonical_subject_id;
  UPDATE student_import_history relation
  JOIN subject_merge_map map ON map.legacy_subject_id = relation.x3_subject_id
  SET relation.x3_subject_id = map.canonical_subject_id;

  DELETE legacy
  FROM subject legacy
  JOIN subject_merge_map map ON map.legacy_subject_id = legacy.subject_id;

  UPDATE subject
  SET subject_name_zh = CASE subject_name
        WHEN 'BAFS-B2' THEN '企業、會計與財務概論-2'
        WHEN 'PHY' THEN '物理'
        WHEN 'Math(M1)' THEN '數學延伸單元一'
        WHEN 'CHEM' THEN '化學'
        WHEN 'BIO' THEN '生物'
        WHEN 'ECON' THEN '經濟'
        WHEN 'JAP' THEN '日語'
        WHEN 'CLIT' THEN '中國文學'
        WHEN 'APL' THEN '應用學習'
        ELSE subject_name_zh
      END,
      subject_name_en = CASE subject_name
        WHEN 'BAFS-B2' THEN 'Business, Accounting and Financial Studies-2'
        WHEN 'PHY' THEN 'Physics'
        WHEN 'Math(M1)' THEN 'Mathematics Extended Module 1'
        WHEN 'CHEM' THEN 'Chemistry'
        WHEN 'BIO' THEN 'Biology'
        WHEN 'ECON' THEN 'Economics'
        WHEN 'JAP' THEN 'Japanese'
        WHEN 'CLIT' THEN 'Chinese Literature'
        WHEN 'APL' THEN 'Applied Learning'
        ELSE subject_name_en
      END
  WHERE subject_name IN ('BAFS-B2', 'PHY', 'Math(M1)', 'CHEM', 'BIO', 'ECON', 'JAP', 'CLIT', 'APL');

  -- Distinguish subject blocks such as BIO-B2/BIO-B3 in both languages.
  UPDATE subject
  SET subject_name_zh = CASE
        WHEN RIGHT(TRIM(subject_name_zh), 2) = CONCAT('-', RIGHT(TRIM(subject_name), 1))
          THEN subject_name_zh
        ELSE CONCAT(TRIM(subject_name_zh), '-', RIGHT(TRIM(subject_name), 1))
      END,
      subject_name_en = CASE
        WHEN RIGHT(TRIM(subject_name_en), 2) = CONCAT('-', RIGHT(TRIM(subject_name), 1))
          THEN subject_name_en
        ELSE CONCAT(TRIM(subject_name_en), '-', RIGHT(TRIM(subject_name), 1))
      END
  WHERE TRIM(subject_name) REGEXP '-B[123]$'
    AND subject_name_zh IS NOT NULL
    AND subject_name_en IS NOT NULL;

  -- Distinguish non-B timetable codes that share a translated name.
  UPDATE subject
  SET subject_name_zh = CASE TRIM(subject_name)
        WHEN 'E&RE' THEN '倫理與宗教（E&RE）'
        WHEN 'RE' THEN '倫理與宗教（RE）'
        WHEN 'RS' THEN '倫理與宗教（RS）'
        WHEN 'CS' THEN '綜合科學（CS）'
        WHEN 'SCJ' THEN '綜合科學（SCJ）'
        WHEN 'SCJb' THEN '綜合科學（SCJb）'
        WHEN 'SCJc' THEN '綜合科學（SCJc）'
        ELSE subject_name_zh
      END,
      subject_name_en = CASE TRIM(subject_name)
        WHEN 'E&RE' THEN 'Ethics and Religious Education (E&RE)'
        WHEN 'RE' THEN 'Ethics and Religious Education (RE)'
        WHEN 'RS' THEN 'Ethics and Religious Education (RS)'
        WHEN 'CS' THEN 'Integrated Science (CS)'
        WHEN 'SCJ' THEN 'Integrated Science (SCJ)'
        WHEN 'SCJb' THEN 'Integrated Science (SCJb)'
        WHEN 'SCJc' THEN 'Integrated Science (SCJc)'
        ELSE subject_name_en
      END
  WHERE TRIM(subject_name) IN ('E&RE', 'RE', 'RS', 'CS', 'SCJ', 'SCJb', 'SCJc');

  DROP TEMPORARY TABLE subject_merge_map;
  COMMIT;
  SET SQL_SAFE_UPDATES = original_safe_updates;
END$$
DELIMITER ;

CALL fix_subject_data();
DROP PROCEDURE fix_subject_data;
