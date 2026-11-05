import test from 'node:test';
import assert from 'node:assert/strict';
import { electiveSubjectKey } from '../src/utils/electiveSubjectKey.js';

test('roster names match timetable codes without erasing distinct subjects', () => {
  for (const [label, code] of [['化學(C)', 'CHEM-B1'], ['生物(E)', 'BIO-B2'], ['生物(C)', 'BIO-B3'], ['M1（E）', 'Math(M1)-B3'], ['西式食品製作(APL)', 'WCU-B3'], ['視覺藝術(C)', 'VAD-B2']]) {
    assert.equal(electiveSubjectKey({ subject_name: label }), electiveSubjectKey({ subject_name: code }));
  }
  assert.notEqual(electiveSubjectKey({ subject_name: '中國歷史' }), electiveSubjectKey({ subject_name: '歷史(C)' }));
  assert.notEqual(electiveSubjectKey({ subject_name: 'SUPP1-B1' }), electiveSubjectKey({ subject_name: 'SUPP2-B2' }));
});

test('elective query matches roster aliases and only joins the requested block and form', {
  skip: process.env.ELECTIVE_INTEGRATION !== '1', timeout: 60000
}, async () => {
  assert.match(process.env.DB_NAME || '', /^codex_elective_test_/);
  const { default: pool } = await import('../src/db.js');
  const { getStudentElectives } = await import('../src/controllers/subjectController.js');
  const { ensureStudentAdminSchema } = await import('../src/controllers/manageStudentController.js');
  const { ensureSubjectImportSchema } = await import('../src/utils/subjectImportSchema.js');
  try {
    await ensureStudentAdminSchema(); await ensureSubjectImportSchema();
    await pool.query("INSERT INTO subject (subject_id,import_name,subject_name,block,is_elective) VALUES (901,'BIO-B2','BIO','X2',1),(902,'BIO-B3','BIO','X3',1),(903,'生物(E)','生物(E)',NULL,1)");
    await pool.query("INSERT INTO teacher (teacher_id,teacher_code,teacher_name) VALUES (901,'test','Test')");
    await pool.query("INSERT INTO class (class_id,class_name,grade_level) VALUES (901,'S4','F4')");
    const [[cls]] = await pool.query("SELECT class_id FROM class WHERE class_name='4M'");
    await pool.query("INSERT INTO student (regno,student_ch_name,student_eng_name,class_id,class_number,sex,status,x2_subject_id) VALUES ('test1','測試','Test',?,'01','F','active',903)", [cls.class_id]);
    await pool.query("INSERT INTO timetable (teacher_id,subject_id,class_id,room_id,day_of_week,period_id) SELECT 901,901,901,MIN(room_id),'Mon',1 FROM room");
    await pool.query("INSERT INTO timetable (teacher_id,subject_id,class_id,room_id,day_of_week,period_id) SELECT 901,902,901,MIN(room_id),'Tue',2 FROM room");
    async function query(form, block) {
      let result; let status=200;
      await getStudentElectives({body:{form,block,subject:901}}, { status(code) {status=code;return this;}, json(rows) {result=rows;} });
      assert.equal(status,200,JSON.stringify(result));return result;
    }
    const rows=await query('F4','X2');
    assert.equal(rows.length,1);
    assert.ok(rows[0].timetable_id);
    assert.equal(rows[0].day_of_week,'Mon');
    assert.equal((await query('F4','X3')).length,0);
    assert.equal((await query('F5','X2')).length,0);
  } finally { await pool.end(); }
});
