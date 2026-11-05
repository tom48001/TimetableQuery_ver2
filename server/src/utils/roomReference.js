export const ROOM_REFERENCE = [
  ['G01C', 'G01C 會見室(一)', 'G01C Meeting Room 1'],
  ['G01D', 'G01D 會見室(二)', 'G01D Meeting Room 2'],
  ['G01K', 'G01K 大會議室', 'G01K Conference Room'],
  ['G01R', 'G01R 學生活動中心', 'G01R Student Activity Centre'],
  ['操場', '操場', 'Playground'],
  ['有蓋操場', '有蓋操場', 'Covered Playground'],
  ['101', '101 視覺藝術室', '101 Visual Arts Room'],
  ['102', '102 音樂室', '102 Music Room'],
  ['111', '111 禮堂', '111 School Hall'],
  ['SONATA', '一樓玻璃房（Sonata）', 'First Floor Glass Room (Sonata)'],
  ['201', '201 Little Britain', '201 Little Britain'],
  ['202', '202 1M 課室', '202 1M Classroom'],
  ['203', '203 1A 課室', '203 1A Classroom'],
  ['204', '204 1R 課室', '204 1R Classroom'],
  ['205', '205 1Y 課室', '205 1Y Classroom'],
  ['209A', '209A 演講廳', '209A Lecture Theatre'],
  ['209B', '209B 創藝室', '209B Creative Arts Room'],
  ['301', '301', '301'],
  ['302', '302 2M 課室', '302 2M Classroom'],
  ['303', '303 2A 課室', '303 2A Classroom'],
  ['304', '304 2R 課室', '304 2R Classroom'],
  ['305', '305 2Y 課室', '305 2Y Classroom'],
  ['309', '309 AI Lab', '309 AI Lab'],
  ['311', '311 電腦室', '311 Computer Room'],
  ['401', '401', '401'],
  ['402', '402 3M 課室', '402 3M Classroom'],
  ['403', '403 3A 課室', '403 3A Classroom'],
  ['404', '404 3R 課室', '404 3R Classroom'],
  ['405', '405 3Y 課室', '405 3Y Classroom'],
  ['409', '409 IS Lab', '409 IS Lab'],
  ['412', '412 IS Lab', '412 IS Lab'],
  ['413', '413 CAL 室', '413 CAL Room'],
  ['415', '415 圖書館', '415 Library'],
  ['501', '501', '501'],
  ['502', '502 4M 課室', '502 4M Classroom'],
  ['503', '503 4A 課室', '503 4A Classroom'],
  ['504', '504 4R 課室', '504 4R Classroom'],
  ['505', '505 4Y 課室', '505 4Y Classroom'],
  ['509', '509 地理室', '509 Geography Room'],
  ['511', '511 Bio Lab', '511 Bio Lab'],
  ['513', '513 家政室', '513 Home Economics Room'],
  ['601', '601', '601'],
  ['602', '602 5Y 課室', '602 5Y Classroom'],
  ['603', '603 5R 課室', '603 5R Classroom'],
  ['604', '604 5A 課室', '604 5A Classroom'],
  ['605', '605 5M 課室', '605 5M Classroom'],
  ['609', '609 Chm Lab', '609 Chemistry Lab'],
  ['611', '611 Phy Lab', '611 Physics Lab'],
  ['612', '612 源活齋', '612 Reflection Room'],
  ['613', '613 源活齋', '613 Reflection Room'],
  ['701', '701', '701'],
  ['702', '702 6M 課室', '702 6M Classroom'],
  ['703', '703 6A 課室', '703 6A Classroom'],
  ['704', '704 6R 課室', '704 6R Classroom'],
  ['705', '705 6Y 課室', '705 6Y Classroom'],
  ['710', '710 Cozy Lounge', '710 Cozy Lounge']
].map(([key, roomNameZh, roomNameEn]) => ({ key, roomNameZh, roomNameEn }));

function roomKey(room) {
  const names = [room.room_name, room.room_name_zh, room.room_name_en]
    .filter(Boolean)
    .join(' ');
  if (/sonata|一樓玻璃房/i.test(names)) return 'SONATA';
  if (/有蓋操場|covered playground/i.test(names)) return '有蓋操場';
  if (/(^|\s)操場(\s|$)|(^|\s)playground(\s|$)/i.test(names)) return '操場';
  const match = String(room.room_name || '').trim().match(/^([A-Za-z]?\d+[A-Za-z]?)/);
  return match ? match[1].toUpperCase() : '';
}

export function canonicalRoomList(rows) {
  const roomsByKey = new Map();
  rows.forEach(room => {
    const key = roomKey(room);
    if (key && !roomsByKey.has(key)) roomsByKey.set(key, room);
  });

  return ROOM_REFERENCE.flatMap(reference => {
    const room = roomsByKey.get(reference.key);
    if (!room) return [];
    return [{
      ...room,
      room_name_zh: reference.roomNameZh,
      room_name_en: reference.roomNameEn
    }];
  });
}

export function missingRoomReferences(rows) {
  const existingKeys = new Set(rows.map(roomKey).filter(Boolean));
  return ROOM_REFERENCE.filter(reference => !existingKeys.has(reference.key));
}
