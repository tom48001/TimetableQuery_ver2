import { groupNominationSubjects } from './nominationSubjects.js';
import { electiveSubjectKey } from './electiveSubjectKey.js';

export function classTakesLesson(studentClass, lessonClass) {
  const name = String(studentClass.class_name || '').trim().toUpperCase();
  const parts = String(lessonClass || '').toUpperCase().replace(/[#\s]/g, '').split(/[/／,，、]/);
  return parts.includes(name) || parts.some(part => /^[FS][1-6]$/.test(part) && part.slice(1) === name.charAt(0));
}

export function nominationEligibility(subjects, lessons, students) {
  const byId = new Map(subjects.map(subject => [Number(subject.subject_id), subject]));
  const eligible = [];
  for (const subject of subjects) {
    if (subject.is_nominatable === 0 || /^(SUPP|Career_Planning$|班主任課$)/i.test(subject.subject_name || '')) continue;
    const classes = lessons.filter(lesson => Number(lesson.subject_id) === Number(subject.subject_id));
    if (!classes.length) continue;
    for (const student of students) {
      if (student.status !== 'active' || !classes.some(lesson => classTakesLesson(student, lesson.class_name))) continue;
      if (subject.block || subject.is_elective) {
        const slots = subject.block ? [subject.block.toLowerCase() + '_subject_id'] : ['x1_subject_id', 'x2_subject_id', 'x3_subject_id'];
        if (!slots.some(slot => {
          const chosen = byId.get(Number(student[slot]));
          return chosen && electiveSubjectKey(chosen) === electiveSubjectKey(subject);
        })) continue;
      }
      eligible.push({ subject_id: subject.subject_id, student_id: student.student_id, class_id: student.class_id });
    }
  }
  return eligible;
}

export async function loadNominationEligibility(db) {
  const [subjects] = await db.query('SELECT * FROM subject');
  const [lessons] = await db.query('SELECT DISTINCT tt.subject_id,c.class_name FROM timetable tt JOIN class c ON c.class_id=tt.class_id');
  const [students] = await db.query(`SELECT s.student_id,s.class_id,s.status,s.x1_subject_id,s.x2_subject_id,s.x3_subject_id,c.class_name
    FROM student s JOIN class c ON c.class_id=s.class_id WHERE s.status='active'`);
  const canonical = new Map();
  for (const group of groupNominationSubjects(subjects)) {
    for (const id of group.alias_subject_ids) canonical.set(id, group.subject_id);
  }
  const unique = new Map();
  for (const row of nominationEligibility(subjects, lessons, students)) {
    const subject_id = canonical.get(Number(row.subject_id));
    unique.set(subject_id + ':' + row.student_id, { ...row, subject_id });
  }
  return [...unique.values()];
}
