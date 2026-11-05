export const MAX_LEARNING_GOALS = 8;

export function normalizeCompletedGoals(value) {
  const goals = Math.max(0, Math.floor(Number(value) || 0));
  return Math.min(goals, MAX_LEARNING_GOALS);
}

export function getLearningGoalReward(value) {
  const completedGoals = normalizeCompletedGoals(value);

  if (completedGoals >= 7) {
    return {
      award: '金獎',
      prize: true,
      merit_offset_count: 2
    };
  }

  if (completedGoals >= 5) {
    return {
      award: '銀獎',
      prize: true,
      merit_offset_count: 1
    };
  }

  if (completedGoals >= 3) {
    return {
      award: '銅獎',
      prize: true,
      merit_offset_count: 1
    };
  }

  if (completedGoals === 2) {
    return {
      award: '紀念品',
      prize: false,
      merit_offset_count: 0
    };
  }

  return {
    award: '未獲獎',
    prize: false,
    merit_offset_count: 0
  };
}
