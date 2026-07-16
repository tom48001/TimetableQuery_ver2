import test from 'node:test';
import assert from 'node:assert/strict';
import xlsx from 'xlsx';
import { parseGroupWorkbook, parseStudentId } from '../src/utils/groupImport.js';

function workbook(sheets) {
  const book = xlsx.utils.book_new();
  Object.entries(sheets).forEach(([name, rows]) => {
    xlsx.utils.book_append_sheet(book, xlsx.utils.aoa_to_sheet(rows), name);
  });
  return book;
}

test('parses IDs without losing the leading zero', () => {
  assert.deepEqual(parseStudentId(' 1Y04 '), { studentKey: '1Y04', className: '1Y', studentNo: '04' });
});

test('detects spaced and Chinese group headers in non-fixed columns and merges languages', () => {
  const result = parseGroupWorkbook(workbook({
    'Sample_中文': [
      ['Group 1', '', '', '第二組', '', '', 'Group3'],
      ['1Y04', '黃美軒', '', '1M27', '吳健美', '', '1R03', '高宇健'],
      ['1R17', '張啟俊', '', '1M24', '李裕']
    ],
    Sample_Eng: [
      ['', '', 'Group1', '', '', 'Group 2', '', '', 'Group 3'],
      ['', '', '1Y04', 'WONG MEI HIN', '', '1M27', 'NG KIN MEI', '', '1R03', 'KO YU KIN'],
      ['', '', '1R17', 'CHEUNG KAI CHUN', '', '1M24', 'LEE YU']
    ]
  }));
  assert.equal(result.hasErrors, false);
  const first = result.records[0];
  assert.deepEqual({
    studentKey: first.studentKey, className: first.className, studentNo: first.studentNo,
    nameZh: first.nameZh, nameEn: first.nameEn, groupCode: first.groupCode,
    displayOrder: first.displayOrder, validationStatus: first.validationStatus
  }, {
    studentKey: '1Y04', className: '1Y', studentNo: '04', nameZh: '黃美軒',
    nameEn: 'WONG MEI HIN', groupCode: 'Group1', displayOrder: 1, validationStatus: 'valid'
  });
  assert.deepEqual(result.records.map(row => row.studentKey), ['1Y04', '1R17', '1M27', '1M24', '1R03']);
});

test('rejects bilingual group conflicts', () => {
  const result = parseGroupWorkbook(workbook({
    '中文': [['Group1'], ['1Y04', '黃美軒']],
    English: [['Group2'], ['1Y04', 'WONG MEI HIN']]
  }));
  assert.equal(result.hasErrors, true);
  assert.match(result.issues.find(issue => issue.severity === 'error').message, /Student 1Y04 is in Group1.*Group2/);
});

test('rejects duplicate IDs and invalid IDs, and warns for a missing language', () => {
  const result = parseGroupWorkbook(workbook({
    '中文': [
      ['第一組'],
      ['1Y04', '黃美軒'],
      ['1Y04', '黃美軒'],
      ['bad-id', '無效']
    ]
  }));
  assert.equal(result.hasErrors, true);
  assert.ok(result.issues.some(issue => /Duplicate student ID 1Y04/.test(issue.message)));
  assert.ok(result.issues.some(issue => /Invalid student ID/.test(issue.message)));
  assert.ok(result.issues.some(issue => /no English name/.test(issue.message)));
});
