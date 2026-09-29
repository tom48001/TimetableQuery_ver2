export function juniorClassGroup(className) {
  const match = String(className || '').trim().toUpperCase().match(/([A-Z])$/);
  if (!match) return null;
  const position = match[1].charCodeAt(0) - 64;
  return position % 2 === 0 ? 'even' : 'odd';
}

export function juniorRuleAllows(rule, classGroup) {
  if (!rule || rule.class_group === 'disabled') return false;
  return rule.class_group === 'all' || rule.class_group === classGroup;
}
