import test from 'node:test';
import assert from 'node:assert/strict';
import { groupNominationSubjects, isBlaNominationSubject } from '../src/utils/nominationSubjects.js';
import { loadNominationEligibility } from '../src/utils/nominationEligibility.js';

test('BLA keeps ordinary subjects and only BIO, ECON, M1 electives', () => {
  assert.equal(isBlaNominationSubject({subject_name:'MUS',is_elective:0}), true);
  for (const name of ['BIO','ECON','MATH(M1)','M1','生物','經濟','數學延伸單元一']) {
    assert.equal(isBlaNominationSubject({import_name:name+'-B2',is_elective:1}), true);
  }
  for (const name of ['CHEM','PHY','BAFS']) {
    assert.equal(isBlaNominationSubject({import_name:name+'-B3'}), false);
  }
  assert.equal(isBlaNominationSubject({subject_name:'BIO',block:'X1',is_nominatable:0}), false);
});

test('BIO X2 and X3 share one name and unique eligible students; unrelated electives excluded', async () => {
  const subjects = [
    {subject_id:1,subject_name:'BIO',import_name:'BIO-B2',block:'X2'},
    {subject_id:2,subject_name:'BIO',import_name:'BIO-B3',block:'X3'},
    {subject_id:3,subject_name:'生物(E)'},
    {subject_id:4,subject_name:'CHEM',import_name:'CHEM-B1',block:'X1'},
    {subject_id:5,subject_name:'MUS'}
  ];
  const lessons = [1,2,4].map(subject_id=>({subject_id,class_name:'S4'}));
  lessons.push({subject_id:5,class_name:'4M'});
  const students = [
    {student_id:1,status:'active',class_id:1,class_name:'4M',x2_subject_id:3},
    {student_id:2,status:'active',class_id:1,class_name:'4M',x3_subject_id:3},
    {student_id:3,status:'active',class_id:1,class_name:'4M',x2_subject_id:3,x3_subject_id:3},
    {student_id:4,status:'active',class_id:1,class_name:'4M',x1_subject_id:4}
  ];
  const groups = groupNominationSubjects(subjects);
  assert.equal(groups.filter(g=>g.subject_name_zh==='生物').length,1);
  assert.equal(groups[0].block,null);
  const db = { query: async sql => [sql.includes('FROM subject') ? subjects : sql.includes('FROM timetable') ? lessons : students] };
  const eligible = await loadNominationEligibility(db);
  assert.deepEqual(eligible.filter(r=>r.subject_id===1).map(r=>r.student_id),[1,3,2]);
  assert.equal(eligible.some(r=>r.subject_id===4),false);
  assert.equal(eligible.filter(r=>r.subject_id===5).length,4);
});
