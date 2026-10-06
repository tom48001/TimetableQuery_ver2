import test from 'node:test';
import assert from 'node:assert/strict';
import { parseElectiveSubjectCode, subjectCanonicalKey } from '../src/utils/subjectCanonicalKey.js';
import { subjectImportRecord } from '../src/utils/subjectImportSchema.js';

test('parses the final Excel elective block suffix without a subject mapping', () => {
  assert.deepEqual(parseElectiveSubjectCode('PHY-B2'), {
    importedCode: 'PHY-B2',
    subjectCode: 'PHY',
    block: 'B2',
    electiveGroup: 'X2'
  });
  assert.equal(parseElectiveSubjectCode('CHEM-B1').electiveGroup, 'X1');
  assert.equal(parseElectiveSubjectCode('BIO-B3').electiveGroup, 'X3');
});

test('only removes a final B1-B3 suffix', () => {
  assert.equal(parseElectiveSubjectCode('PRE-B2-TOPIC').subjectCode, 'PRE-B2-TOPIC');
  assert.equal(parseElectiveSubjectCode('HIST-B4').subjectCode, 'HIST-B4');
  assert.equal(parseElectiveSubjectCode('MATH(M1)-B3').subjectCode, 'MATH(M1)');
});

test('builds database records from Excel codes without a predefined subject list', () => {
  assert.deepEqual(subjectImportRecord('CHEM-B1'), {
    import_name: 'CHEM-B1', subject_name: 'CHEM', block: 'X1', is_elective: true
  });
  assert.deepEqual(subjectImportRecord('ENG'), {
    import_name: 'ENG', subject_name: 'ENG', block: null, is_elective: false
  });
  const chemistryX1 = subjectImportRecord('CHEM-B1');
  const chemistryX2 = subjectImportRecord('CHEM-B2');
  assert.equal(chemistryX1.subject_name, chemistryX2.subject_name);
  assert.notEqual(chemistryX1.import_name, chemistryX2.import_name);
  assert.notEqual(chemistryX1.block, chemistryX2.block);
});

test('groups numbered timetable subjects with their base elective subject', () => {
  assert.equal(
    subjectCanonicalKey({ subject_name_zh: '生物-2' }),
    subjectCanonicalKey({ subject_name_zh: '生物' })
  );
  assert.equal(
    subjectCanonicalKey({ subject_name_en: 'Business, Accounting and Financial Studies-2' }),
    subjectCanonicalKey({ subject_name_en: 'Business, Accounting and Financial Studies' })
  );
});

test('normalizes a code when bilingual labels have not been populated', () => {
  assert.equal(
    subjectCanonicalKey({ subject_name: 'BIO-B3' }),
    subjectCanonicalKey({ subject_name: 'BIO' })
  );
});
