import test from 'node:test';
import assert from 'node:assert/strict';
import { parseElectiveSubjectCode, subjectCanonicalKey } from '../src/utils/subjectCanonicalKey.js';

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
