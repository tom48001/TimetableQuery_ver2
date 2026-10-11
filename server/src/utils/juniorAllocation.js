export function juniorStudentGroup(classNumber) {
  const value = String(classNumber ?? '').trim();
  if (!/^\d+$/.test(value)) return null;
  const number = Number(value);
  if (!Number.isSafeInteger(number) || number < 1) return null;
  return number % 2 === 0 ? 'even' : 'odd';
}

export function juniorRuleAllows(rule, studentGroup) {
  if (!rule || rule.class_group === 'disabled') return false;
  return rule.class_group === 'all' || rule.class_group === studentGroup;
}
