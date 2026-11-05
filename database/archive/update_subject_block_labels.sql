-- Add the timetable block number to bilingual subject display names.
-- Safe to run more than once.
USE school_management;

SET @subject_label_safe_updates = @@SQL_SAFE_UPDATES;
SET SQL_SAFE_UPDATES = 0;
START TRANSACTION;

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


-- Distinguish non-B timetable codes that otherwise have identical display names.
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

COMMIT;
SET SQL_SAFE_UPDATES = @subject_label_safe_updates;

SELECT subject_id, subject_name, subject_name_zh, subject_name_en
FROM subject
WHERE TRIM(subject_name) REGEXP '-B[123]$'
   OR TRIM(subject_name) IN ('E&RE', 'RE', 'RS', 'CS', 'SCJ', 'SCJb', 'SCJc')
ORDER BY subject_name;
