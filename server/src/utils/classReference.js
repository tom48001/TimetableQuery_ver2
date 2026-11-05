// Infer the grade without changing the original timetable group name or
// assigning any students. Membership is managed through lesson-group lists.
export function gradeLevelForClass(className) {
  const parts = String(className || '').trim().toUpperCase()
    .replace(/^#\s*/, '')
    .split(/[/／,，]/);
  const grades = parts.map(part => {
    const match = part.trim().match(/^[SF]?([1-6])(?:[A-Z]+)?$/);
    return match ? match[1] : null;
  });
  if (grades.some(grade => !grade) || new Set(grades).size !== 1) return '';
  return `F${grades[0]}`;
}
