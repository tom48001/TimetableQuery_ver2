import test from 'node:test';
import assert from 'node:assert/strict';

import {
  getLearningGoalReward,
  normalizeCompletedGoals
} from '../src/utils/learningGoalReward.js';

test('awards a souvenir for exactly two completed goals', () => {
  assert.deepEqual(getLearningGoalReward(2), {
    award: '紀念品',
    prize: false,
    merit_offset_count: 0
  });
});

test('applies the bronze, silver and gold reward bands', () => {
  assert.equal(getLearningGoalReward(3).award, '銅獎');
  assert.equal(getLearningGoalReward(4).merit_offset_count, 1);
  assert.equal(getLearningGoalReward(5).award, '銀獎');
  assert.equal(getLearningGoalReward(6).merit_offset_count, 1);
  assert.equal(getLearningGoalReward(7).award, '金獎');
  assert.equal(getLearningGoalReward(8).merit_offset_count, 2);
});

test('does not award students who complete fewer than two goals', () => {
  assert.deepEqual(getLearningGoalReward(1), {
    award: '未獲獎',
    prize: false,
    merit_offset_count: 0
  });
});

test('keeps completed goal totals within the programme maximum', () => {
  assert.equal(normalizeCompletedGoals(9), 8);
  assert.equal(normalizeCompletedGoals(-1), 0);
  assert.equal(normalizeCompletedGoals(3.8), 3);
});
