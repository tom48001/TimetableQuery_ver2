export function oppositeGroup(group) {
  return group === 'odd' ? 'even' : group === 'even' ? 'odd' : group;
}

export function pairRules(rules) {
  const pairs = new Map();
  rules.forEach(rule => {
    const key = rule.grade + ':' + rule.subject_id;
    if (!pairs.has(key)) pairs.set(key, { localKey: key, grade: rule.grade, subject_id: rule.subject_id, class_group: 'disabled', second_group: 'disabled' });
    const pair = pairs.get(key);
    pair[Number(rule.semester) === 1 ? 'class_group' : 'second_group'] = rule.class_group;
  });
  return Array.from(pairs.values()).map(pair => ({ ...pair, second_group: pair.second_group === oppositeGroup(pair.class_group) ? 'auto' : pair.second_group }));
}

export function expandRules(pairs) {
  return pairs.reduce((rows, pair) => rows.concat([1, 2].map(semester => ({
    grade: pair.grade,
    semester,
    subject_id: Number(pair.subject_id),
    class_group: semester === 1 ? pair.class_group : pair.second_group === 'auto' ? oppositeGroup(pair.class_group) : pair.second_group
  }))), []);
}
