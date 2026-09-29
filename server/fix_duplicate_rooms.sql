-- Merge legacy English room-name rows into the canonical room-code rows.
-- The canonical schema stores the code in room_name and translated display names
-- in room_name_zh and room_name_en.
USE school_management;

DROP PROCEDURE IF EXISTS fix_duplicate_rooms;
DELIMITER $$
CREATE PROCEDURE fix_duplicate_rooms()
BEGIN
  DECLARE timetable_history_exists INT DEFAULT 0;
  DECLARE original_safe_updates BOOLEAN DEFAULT TRUE;

  DECLARE EXIT HANDLER FOR SQLEXCEPTION
  BEGIN
    ROLLBACK;
    DROP TEMPORARY TABLE IF EXISTS duplicate_room_map;
    SET SQL_SAFE_UPDATES = original_safe_updates;
    RESIGNAL;
  END;

  SET original_safe_updates = @@SQL_SAFE_UPDATES;
  SET SQL_SAFE_UPDATES = 0;
  START TRANSACTION;

  DROP TEMPORARY TABLE IF EXISTS duplicate_room_map;
  CREATE TEMPORARY TABLE duplicate_room_map (
    duplicate_room_id BIGINT PRIMARY KEY,
    canonical_room_id BIGINT NOT NULL
  );

  INSERT INTO duplicate_room_map (duplicate_room_id, canonical_room_id)
  SELECT duplicate_room.room_id, canonical_room.room_id
  FROM room duplicate_room
  JOIN room canonical_room
    ON canonical_room.room_name = TRIM(SUBSTRING_INDEX(duplicate_room.room_name, ' ', 1))
  WHERE duplicate_room.room_id <> canonical_room.room_id
    AND duplicate_room.room_name <> canonical_room.room_name
    AND canonical_room.room_name REGEXP '^(G?[0-9]+[A-Za-z]?)$'
    AND (
      duplicate_room.room_name_zh = canonical_room.room_name_zh
      OR duplicate_room.room_name_en = canonical_room.room_name_en
    );

  UPDATE timetable tt
  JOIN duplicate_room_map room_map
    ON room_map.duplicate_room_id = tt.room_id
  SET tt.room_id = room_map.canonical_room_id;

  SELECT COUNT(*) INTO timetable_history_exists
  FROM information_schema.TABLES
  WHERE TABLE_SCHEMA = DATABASE()
    AND TABLE_NAME = 'timetable_history';

  IF timetable_history_exists > 0 THEN
    UPDATE timetable_history history
    JOIN duplicate_room_map room_map
      ON room_map.duplicate_room_id = history.room_id
    SET history.room_id = room_map.canonical_room_id;
  END IF;

  DELETE duplicate_room
  FROM room duplicate_room
  JOIN duplicate_room_map room_map
    ON room_map.duplicate_room_id = duplicate_room.room_id;

  DROP TEMPORARY TABLE duplicate_room_map;
  COMMIT;
  SET SQL_SAFE_UPDATES = original_safe_updates;
END$$
DELIMITER ;

CALL fix_duplicate_rooms();
DROP PROCEDURE fix_duplicate_rooms;
