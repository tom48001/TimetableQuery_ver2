import test from 'node:test';
import assert from 'node:assert/strict';
import { nominationEligibility } from '../src/utils/nominationEligibility.js';
import { defaultChineseSubjectName, fillChineseSubjectNames } from '../src/utils/subjectDisplayNames.js';

test('nomination eligibility follows actual class lessons and elective blocks', () => {
  const subjects = [{subject_id:1,subject_name:'CHIN'}, {subject_id:2,subject_name:'MUS'},
    {subject_id:3,subject_name:'BIO',block:'X2',is_elective:1}, {subject_id:4,subject_name:'生物(E)'},
    {subject_id:5,subject_name:'SUPP1'}, {subject_id:6,subject_name:'CHIS',is_nominatable:0}];
  const students = [{student_id:1,class_id:1,class_name:'1M',status:'active'},
    {student_id:2,class_id:2,class_name:'1A',status:'active'},
    {student_id:3,class_id:3,class_name:'4M',status:'active',x2_subject_id:4},
    {student_id:4,class_id:3,class_name:'4M',status:'active',x3_subject_id:4},
    {student_id:5,class_id:1,class_name:'1M',status:'inactive'}];
  const lessons = [{subject_id:1,class_name:'1M'}, {subject_id:1,class_name:'1M'},
    {subject_id:2,class_name:'#1M/1A'}, {subject_id:3,class_name:'S4'},
    {subject_id:5,class_name:'1M'}, {subject_id:6,class_name:'1M'}];
  assert.deepEqual(nominationEligibility(subjects,lessons,students).map(r=>[r.subject_id,r.student_id]), [[1,1],[2,1],[2,2],[3,3]]);
  assert.equal(defaultChineseSubjectName('CHEM-B1'),'化學');
  assert.equal(defaultChineseSubjectName('CS'),'公民與社會發展');
  assert.equal(defaultChineseSubjectName('UNKNOWN'),null);
});

test('database counts, student selection and submission enforce the same rule; names preserve custom values', {
  skip: process.env.NOMINATION_INTEGRATION !== '1', timeout: 60000
}, async () => {
  assert.match(process.env.DB_NAME || '', /^codex_nomination_test_/);
  const { default: db } = await import('../src/db.js');
  const { ensureStudentAdminSchema } = await import('../src/controllers/manageStudentController.js');
  const { getStudentsByClassNSubject } = await import('../src/controllers/studentController.js');
  const { insertBLA, getSelectBLA, deleteBLA, getBLAResults } = await import('../src/controllers/blaController.js');
  const { loadNominationEligibility } = await import('../src/utils/nominationEligibility.js');
  const invoke = async (fn,req) => {let status=200;let data;await fn(req,{status(s){status=s;return this;},json(d){data=d;}});return {status,data};};
  try {
    await ensureStudentAdminSchema();
    await db.query("INSERT INTO subject (subject_id,import_name,subject_name,subject_name_zh,is_elective) VALUES (901,'MUS','MUS',NULL,0),(902,'CHIS','CHIS','校訂名稱',0),(903,'UNKNOWN','UNKNOWN',NULL,0)");
    await fillChineseSubjectNames(db);
    const [names]=await db.query('SELECT subject_name_zh FROM subject WHERE subject_id IN (901,902,903) ORDER BY subject_id');
    assert.deepEqual(names.map(r=>r.subject_name_zh),['音樂','校訂名稱',null]);
    await db.query("INSERT INTO teacher (teacher_id,teacher_code,teacher_name) VALUES (901,'TEST','Test')");
    const [classes]=await db.query("SELECT class_id FROM class WHERE class_name IN ('1M','1A') ORDER BY class_name");
    const [a,b]=classes.map(r=>r.class_id);
    await db.query("INSERT INTO student (student_id,regno,student_ch_name,student_eng_name,class_id,class_number,sex,status) VALUES (901,'a','甲','A',?,'01','F','active'),(902,'b','乙','B',?,'01','F','active')",[a,b]);
    await db.query("INSERT INTO timetable (teacher_id,subject_id,class_id,room_id,day_of_week,period_id) SELECT 901,901,?,MIN(room_id),'Mon',1 FROM room",[a]);
    assert.equal((await loadNominationEligibility(db)).filter(r=>r.subject_id===901).length,1);
    const allowed=await invoke(getStudentsByClassNSubject,{params:{classId:a,subjectId:901}});
    assert.equal(allowed.data.length,1);
    const blocked=await invoke(getStudentsByClassNSubject,{params:{classId:b,subjectId:901}});
    assert.deepEqual(blocked.data,[]);
    const denied=await invoke(insertBLA,{user:{teacher_id:901},body:{subject_id:901,student_ids:[901,902]}});
    assert.equal(denied.status,422);
    const [[empty]]=await db.query('SELECT COUNT(*) n FROM BLA');assert.equal(empty.n,0);
    const saved=await invoke(insertBLA,{user:{teacher_id:901},body:{subject_id:901,student_ids:[901]}});
    assert.equal(saved.status,200);
    const [[count]]=await db.query('SELECT COUNT(*) n FROM BLA');assert.equal(count.n,1);
    await db.query("INSERT INTO subject (subject_id,import_name,subject_name,block,is_elective) VALUES (910,'BIO-B2','BIO','X2',1),(911,'BIO-B3','BIO','X3',1),(912,'生物(C)','生物(C)',NULL,1)");
    await db.query('UPDATE student SET x2_subject_id=912,x3_subject_id=912 WHERE student_id=901');
    for (const id of [910,911]) await db.query("INSERT INTO timetable (teacher_id,subject_id,class_id,room_id,day_of_week,period_id) SELECT 901,?,?,MIN(room_id),'Tue',? FROM room",[id,a,id-908]);
    const joined=await loadNominationEligibility(db);
    assert.equal(joined.filter(r=>r.subject_id===910).length,1);
    assert.equal(joined.filter(r=>r.subject_id===911).length,0);
    // Previously stored block-specific nominations remain visible and count once.
    await db.query('INSERT INTO BLA (teacher_id,student_id,subject_id) VALUES (901,901,910),(901,901,911)');
    const selected=await invoke(getSelectBLA,{user:{teacher_id:901},query:{subject_id:910}});
    assert.equal(selected.data.length,1);
    const repeat=await invoke(insertBLA,{user:{teacher_id:901},body:{subject_id:911,student_ids:[901]}});
    assert.equal(repeat.data.inserted,0);
    const result=await invoke(getBLAResults,{});
    assert.equal(result.data[0].subject_count,2); // Music + Biology, not three blocks.
    const removed=await invoke(deleteBLA,{user:{teacher_id:901},body:{subjectId:910,removed:[901]}});
    assert.equal(removed.status,200);
    const [[remaining]]=await db.query('SELECT COUNT(*) n FROM BLA WHERE subject_id IN (910,911)');
    assert.equal(remaining.n,0);
  } finally {await db.end();}
});
