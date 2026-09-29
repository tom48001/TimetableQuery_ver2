import test from 'node:test';
import assert from 'node:assert/strict';
import { canonicalRoomList, missingRoomReferences } from '../src/utils/roomReference.js';

test('returns only reference rooms in the requested order with canonical labels', () => {
  const rooms = canonicalRoomList([
    { room_id: 3, room_name: '515 Other Room' },
    { room_id: 2, room_name: '111 Greenhouse' },
    { room_id: 1, room_name: 'G01K Meeting Room' },
    { room_id: 4, room_name: '一樓玻璃房 (Sonata)' }
  ]);

  assert.deepEqual(rooms.map(room => room.room_id), [1, 2, 4]);
  assert.equal(rooms[0].room_name_zh, 'G01K 大會議室');
  assert.equal(rooms[1].room_name_zh, '111 禮堂');
  assert.equal(rooms[2].room_name_en, 'First Floor Glass Room (Sonata)');
});

test('identifies reference rooms that need to be created', () => {
  const missing = missingRoomReferences([
    { room_name: 'G01C Meeting Room' },
    { room_name: '101 Visual Arts Room' }
  ]);

  assert.equal(missing.some(room => room.key === 'G01C'), false);
  assert.equal(missing.some(room => room.key === '101'), false);
  assert.equal(missing.some(room => room.key === '710'), true);
});
