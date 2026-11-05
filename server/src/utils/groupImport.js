import xlsx from 'xlsx';

const CHINESE_DIGITS = { '零': 0, '一': 1, '二': 2, '三': 3, '四': 4, '五': 5, '六': 6, '七': 7, '八': 8, '九': 9 };

function text(value) {
  return String(value === undefined || value === null ? '' : value).trim();
}

function chineseNumber(value) {
  if (value === '十') return 10;
  const parts = String(value).split('十');
  if (parts.length === 2) {
    const tens = parts[0] ? CHINESE_DIGITS[parts[0]] : 1;
    const units = parts[1] ? CHINESE_DIGITS[parts[1]] : 0;
    return Number.isFinite(tens) && Number.isFinite(units) ? tens * 10 + units : null;
  }
  return CHINESE_DIGITS[value] || null;
}

export function normalizeGroupHeader(value) {
  const header = text(value);
  const english = header.match(/^group\s*(\d+)$/i);
  if (english) return { groupCode: `Group${Number(english[1])}`, label: header };
  const chinese = header.match(/^第([零一二三四五六七八九十]+)組$/);
  if (!chinese) return null;
  const number = chineseNumber(chinese[1]);
  return number ? { groupCode: `Group${number}`, label: header } : null;
}

export function parseStudentId(value) {
  const studentKey = text(value).replace(/\s+/g, '').toUpperCase();
  const match = studentKey.match(/^(\d+[A-Z]+)(\d+)$/);
  if (!match) return null;
  return { studentKey, className: match[1], studentNo: match[2] };
}

export function parseSheetContext(sheetName) {
  const match = text(sheetName).match(/^[SF]?([1-6])[_\-\s]+(.+)$/i);
  if (!match) return { gradeLevel: '', subjectCode: '' };
  return {
    gradeLevel: `S${match[1]}`,
    subjectCode: text(match[2])
  };
}

function nameLanguage(name) {
  if (/[㐀-鿿]/u.test(name)) return 'zh';
  if (/[A-Za-z]/.test(name)) return 'en';
  return null;
}

export function detectSheetLanguage(sheetName, names) {
  const normalizedName = text(sheetName).toLowerCase();
  if (/(中文|中文名|中文版|chinese|(?:^|[_-])(?:chi|zh)(?:$|[_-]))/i.test(normalizedName)) return 'zh';
  if (/(英文|英文名|英文版|english|(?:^|[_-])(?:eng|en)(?:$|[_-]))/i.test(normalizedName)) return 'en';
  const counts = names.reduce((result, name) => {
    const language = nameLanguage(name);
    if (language) result[language] += 1;
    return result;
  }, { zh: 0, en: 0 });
  return counts.zh > counts.en ? 'zh' : 'en';
}

function sheetRecords(workbook, sheetName) {
  const matrix = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: '', raw: false });
  const context = parseSheetContext(sheetName);
  const headerRowIndex = matrix.findIndex(row => row.some(value => normalizeGroupHeader(value)));
  if (headerRowIndex < 0) return { records: [], issues: [] };
  const headers = matrix[headerRowIndex]
    .map((value, column) => ({ ...normalizeGroupHeader(value), column }))
    .filter(header => header.groupCode);
  const pending = [];
  const issues = [];

  headers.forEach(header => {
    const seen = new Set();
    let displayOrder = 0;
    for (let rowIndex = headerRowIndex + 1; rowIndex < matrix.length; rowIndex += 1) {
      const firstValue = text(matrix[rowIndex][header.column]);
      const secondValue = text(matrix[rowIndex][header.column + 1]);
      if (!firstValue && !secondValue) break;
      displayOrder += 1;
      const firstParsed = parseStudentId(firstValue);
      const secondParsed = parseStudentId(secondValue);
      const parsed = firstParsed || secondParsed;
      const studentId = firstParsed ? firstValue : secondValue;
      const studentName = firstParsed ? secondValue : firstValue;
      const source = { sheetName, row: rowIndex + 1, groupCode: header.groupCode, ...context };
      if (!parsed) {
        issues.push({ severity: 'error', scope: 'row', affectsRecord: false, studentKey: studentId || '-', ...source, message: `Invalid student ID "${studentId || '(empty)'}" on worksheet ${sheetName}, row ${rowIndex + 1}.` });
        continue;
      }
      const worksheetGrade = context.gradeLevel.match(/\d/)?.[0];
      const studentGrade = parsed.className.match(/^\d/)?.[0];
      if (worksheetGrade && studentGrade && worksheetGrade !== studentGrade) {
        issues.push({
          severity: 'error',
          scope: 'row',
          studentKey: parsed.studentKey,
          ...source,
          message: `Student ${parsed.studentKey} is Form ${studentGrade}, but worksheet ${sheetName} is labelled ${context.gradeLevel}.`
        });
      }
      if (seen.has(parsed.studentKey)) {
        issues.push({ severity: 'error', scope: 'row', affectsRecord: false, studentKey: parsed.studentKey, ...source, message: `Duplicate student ID ${parsed.studentKey} in ${header.groupCode} on worksheet ${sheetName}; the duplicate row will be skipped.` });
        continue;
      }
      seen.add(parsed.studentKey);
      pending.push({
        ...parsed,
        ...context,
        studentName,
        groupCode: header.groupCode,
        displayOrder,
        sheetName,
        row: rowIndex + 1
      });
    }
  });

  const sheetLanguage = detectSheetLanguage(sheetName, pending.map(record => record.studentName));
  return {
    records: pending.map(record => ({
      ...record,
      language: nameLanguage(record.studentName) || sheetLanguage
    })),
    issues
  };
}

export function parseGroupWorkbook(workbook) {
  const parsedSheets = workbook.SheetNames.map(sheetName => sheetRecords(workbook, sheetName));
  const sourceRecords = parsedSheets.flatMap(sheet => sheet.records);
  const issues = parsedSheets.flatMap(sheet => sheet.issues);
  const merged = new Map();

  sourceRecords.forEach(source => {
    const contextKey = `${source.gradeLevel || '-'}|${source.subjectCode.toUpperCase() || '-'}|${source.studentKey}`;
    let record = merged.get(contextKey);
    if (!record) {
      record = {
        studentKey: source.studentKey,
        className: source.className,
        studentNo: source.studentNo,
        gradeLevel: source.gradeLevel,
        subjectCode: source.subjectCode,
        nameZh: '',
        nameEn: '',
        groupCode: source.groupCode,
        displayOrder: source.displayOrder,
        sourceSheets: []
      };
      merged.set(contextKey, record);
    } else if (record.groupCode !== source.groupCode) {
      issues.push({
        severity: 'error',
        scope: 'fatal',
        studentKey: source.studentKey,
        groupCode: record.groupCode,
        gradeLevel: source.gradeLevel,
        subjectCode: source.subjectCode,
        message: `Student ${source.studentKey} is in ${record.groupCode} on the ${record.sourceSheets[0]?.language === 'zh' ? 'Chinese' : 'English'} worksheet, but ${source.groupCode} on the ${source.language === 'zh' ? 'Chinese' : 'English'} worksheet.`
      });
    }
    const nameField = source.language === 'zh' ? 'nameZh' : 'nameEn';
    if (record[nameField] && record[nameField] !== source.studentName) {
      issues.push({
        severity: 'warning',
        scope: 'row',
        studentKey: source.studentKey,
        groupCode: source.groupCode,
        gradeLevel: source.gradeLevel,
        subjectCode: source.subjectCode,
        message: `Student ${source.studentKey} has conflicting ${source.language === 'zh' ? 'Chinese' : 'English'} names.`
      });
    } else {
      record[nameField] = source.studentName;
    }
    record.sourceSheets.push({ name: source.sheetName, language: source.language, row: source.row });
  });

  const records = Array.from(merged.values())
    .sort((a, b) => (
      a.gradeLevel.localeCompare(b.gradeLevel, 'en', { numeric: true }) ||
      a.subjectCode.localeCompare(b.subjectCode, 'en', { sensitivity: 'base' }) ||
      Number(a.groupCode.replace(/\D/g, '')) - Number(b.groupCode.replace(/\D/g, '')) ||
      a.displayOrder - b.displayOrder
    ))
    .map(record => {
      const recordIssues = issues.filter(issue => (
        issue.affectsRecord !== false &&
        issue.studentKey === record.studentKey &&
        (!issue.gradeLevel || (
          issue.gradeLevel === record.gradeLevel &&
          issue.subjectCode === record.subjectCode
        ))
      ));
      const warningContext = {
        studentKey: record.studentKey,
        groupCode: record.groupCode,
        gradeLevel: record.gradeLevel,
        subjectCode: record.subjectCode
      };
      if (!record.nameZh) recordIssues.push({ severity: 'warning', ...warningContext, message: `Student ${record.studentKey} has no Chinese name.` });
      if (!record.nameEn) recordIssues.push({ severity: 'warning', ...warningContext, message: `Student ${record.studentKey} has no English name.` });
      issues.push(...recordIssues.filter(issue => !issues.includes(issue)));
      return {
        ...record,
        validationStatus: recordIssues.some(issue => issue.severity === 'error') ? 'error' : (recordIssues.length ? 'warning' : 'valid'),
        messages: recordIssues.map(issue => issue.message)
      };
    });

  if (!sourceRecords.length) issues.push({ severity: 'error', scope: 'fatal', studentKey: '-', message: 'No group headers or student records were found.' });
  const counts = records.reduce((result, record) => {
    result[record.validationStatus] += 1;
    return result;
  }, { valid: 0, warning: 0, error: 0 });
  const unlinkedRowErrors = issues.filter(issue => issue.severity === 'error' && issue.scope === 'row' && issue.affectsRecord === false).length;
  const hasFatalErrors = issues.some(issue => issue.severity === 'error' && issue.scope === 'fatal');
  return {
    records,
    issues,
    counts: {
      ...counts,
      importable: counts.valid + counts.warning,
      skipped: counts.error + unlinkedRowErrors
    },
    hasErrors: issues.some(issue => issue.severity === 'error'),
    hasFatalErrors
  };
}

export function readGroupFile(buffer) {
  return parseGroupWorkbook(xlsx.read(buffer, { type: 'buffer' }));
}
