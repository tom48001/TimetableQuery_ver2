export function parseElectiveSubjectCode(value) {
  const importedCode = String(value || '').trim();
  const match = importedCode.match(/^(.*?)-B([123])$/iu);

  if (!match || !match[1].trim()) {
    return {
      importedCode,
      subjectCode: importedCode,
      block: null,
      electiveGroup: null
    };
  }

  return {
    importedCode,
    subjectCode: match[1].trim(),
    block: `B${match[2]}`,
    electiveGroup: `X${match[2]}`
  };
}

export function subjectCanonicalKey(subject = {}) {
  return String(subject.subject_name_zh || subject.subject_name_en || subject.subject_name || '')
    .trim()
    .replace(/[-－]\s*[123]$/u, '')
    .replace(/-B[123]$/iu, '')
    .replace(/\s+/gu, '')
    .toLowerCase();
}
