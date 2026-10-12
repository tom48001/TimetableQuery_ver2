export function validSemesterDates(first, second, year) {
  const valid = value => /^\d{4}-\d{2}-\d{2}$/.test(value || '') && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
  const [start, end] = String(year).split('-').map(Number);
  return valid(first) && valid(second) && end === start + 1 && first < second && first.slice(0, 4) === String(start) && Number(second.slice(0, 4)) <= end;
}

export function effectiveSemester(settings, now = new Date()) {
  const manual = Number(settings.current_semester) === 2 ? 2 : 1;
  if (!settings.automatic_semester_switching) return manual;
  if (!validSemesterDates(settings.first_semester_start, settings.second_semester_start, settings.academic_year)) return manual;
  const today = new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Hong_Kong', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
  if (today >= settings.second_semester_start) return 2;
  if (today >= settings.first_semester_start) return 1;
  return manual;
}
