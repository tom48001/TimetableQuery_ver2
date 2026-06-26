export const SUBJECT_LABELS = {
  1: 'Chinese Language',
  2: 'English Language',
  3: 'Mathematics',
  4: 'Citizenship and Social Development',
  5: 'Chinese Literature',
  6: 'Biology',
  7: 'Health Management and Social Care',
  8: 'Chinese History',
  9: 'Chemistry',
  10: 'Integrated Science',
  11: 'Visual Arts',
  12: 'Physics',
  13: 'Citizenship, Economics and Society',
  14: 'Economics',
  15: 'Information and Communication Technology',
  16: 'Technology and Living',
  17: 'History',
  18: 'Geography',
  19: 'Music',
  20: 'Physical Education'
};

export const SUBJECT_NAME_LABELS = {
  '\u4e2d\u570b\u8a9e\u6587': 'Chinese Language',
  '\u82f1\u570b\u8a9e\u6587': 'English Language',
  '\u82f1\u8a9e\u6587\u5b78': 'English Literature',
  '\u6578\u5b78': 'Mathematics',
  '\u6578\u5b78M1': 'Mathematics M1',
  '\u516c\u6c11\u8207\u793e\u6703\u767c\u5c55': 'Citizenship and Social Development',
  '\u516c\u6c11\u3001\u7d93\u6fdf\u8207\u793e\u6703': 'Citizenship, Economics and Society',
  '\u7d9c\u5408\u79d1\u5b78': 'Integrated Science',
  '\u7269\u7406': 'Physics',
  '\u5316\u5b78': 'Chemistry',
  '\u751f\u7269': 'Biology',
  '\u8cc7\u8a0a\u53ca\u901a\u8a0a\u79d1\u6280': 'Information and Communication Technology',
  'ICT': 'Information and Communication Technology',
  'STEM': 'STEM',
  '\u7d93\u6fdf': 'Economics',
  '\u4f01\u696d\u3001\u6703\u8a08\u8207\u8ca1\u52d9\u6982\u8ad6': 'Business, Accounting and Financial Studies',
  'BAFS': 'Business, Accounting and Financial Studies',
  '\u5730\u7406': 'Geography',
  '\u4e2d\u570b\u6587\u5b78': 'Chinese Literature',
  '\u4e2d\u570b\u6b77\u53f2': 'Chinese History',
  '\u6b77\u53f2': 'History',
  '\u521d\u4e2d\u4e2d\u53f2': 'Junior Chinese History',
  '\u521d\u4e2d\u53f2': 'Junior History',
  '\u5065\u5eb7\u7ba1\u7406\u8207\u793e\u6703\u95dc\u61f7': 'Health Management and Social Care',
  '\u502b\u7406\u8207\u5b97\u6559': 'Ethics and Religious Studies',
  '\u5b97\u6559\u6559\u80b2': 'Religious Education',
  '\u8996\u89ba\u85dd\u8853': 'Visual Arts',
  '\u8a2d\u8a08\u8207\u61c9\u7528\u79d1\u6280': 'Design and Applied Technology',
  '\u79d1\u6280\u8207\u751f\u6d3b': 'Technology and Living',
  '\u751f\u6d3b\u8207\u793e\u6703': 'Life and Society',
  '\u65c5\u904a\u8207\u6b3e\u5f85': 'Tourism and Hospitality Studies',
  '\u65c5\u904a\u8207\u6b3e\u5f85\u79d1': 'Tourism and Hospitality Studies',
  '\u666e\u901a\u8a71': 'Putonghua',
  '\u97f3\u6a02': 'Music',
  '\u85dd\u8853\u767c\u5c55': 'Arts Development',
  '\u9ad4\u80b2': 'Physical Education',
  '\u751f\u6daf\u898f\u5283': 'Career Planning',
  '\u4e3b\u984c\u5b78\u7fd2': 'Project Learning',
  'Visual Arts': 'Visual Arts',
  'Tourism and Hospitality Studies': 'Tourism and Hospitality Studies',
  'Physical Education': 'Physical Education'
};
function compact(value) {
  return String(value || '').replace(/\s+/g, '').trim();
}

export function subjectLabel(item, locale) {
  const isEnglish = String(locale).toLowerCase() === 'en';
  const fallback = item.subject_name || item.subject || '';

  if (!isEnglish) {
    return item.subject_name_zh || fallback;
  }

  if (item.subject_name_en) return item.subject_name_en;

  const normalized = compact(fallback);
  const direct = SUBJECT_NAME_LABELS[fallback] || SUBJECT_NAME_LABELS[normalized];
  if (direct) return direct;

  const byId = SUBJECT_LABELS[Number(item.subject_id)];
  if (byId) return byId;

  const partial = Object.keys(SUBJECT_NAME_LABELS).find(name => normalized.includes(compact(name)));
  return partial ? SUBJECT_NAME_LABELS[partial] : fallback;
}

export function roomLabel(roomName, locale) {
  const value = String(roomName || '');
  if (String(locale).toLowerCase() !== 'en') return value;

  const replacements = [
    ['\u8996\u89ba\u85dd\u8853\u5ba4', 'Visual Arts Room'],
    ['\u8996\u85dd\u5ba4', 'Visual Arts Room'],
    ['\u8996\u89ba\u85dd\u8853', 'Visual Arts'],
    ['\u97f3\u6a02\u5ba4', 'Music Room'],
    ['\u5730\u7406\u5ba4', 'Geography Room'],
    ['\u5716\u66f8\u9928', 'Library'],
    ['\u96fb\u8166\u5ba4', 'Computer Room'],
    ['\u6f14\u8b1b\u5ef3', 'Lecture Theatre'],
    ['\u8b1b\u5ef3', 'Lecture Theatre'],
    ['\u5275\u610f\u85dd\u8853\u5ba4', 'Creative Arts Room'],
    ['\u5275\u85ddRoom', 'Creative Arts Room'],
    ['\u5275\u85dd\u5ba4', 'Creative Arts Room'],
    ['\u5275\u85dd', 'Creative Arts'],
    ['CAL \u5ba4', 'CAL Room'],
    ['CAL\u5ba4', 'CAL Room'],
    ['\u5bb6\u653f\u5ba4', 'Home Economics Room'],
    ['\u6703\u8b70\u5ba4', 'Conference Room'],
    ['\u6703\u898b\u5ba4', 'Meeting Room'],
    ['\u6eab\u5ba4', 'Greenhouse'],
    ['\u6e90\u6d3b\u9f4b', 'Reflection Room'],
    ['\u5b78\u751f\u6d3b\u52d5\u4e2d\u5fc3', 'Student Activity Centre'],
    ['\u4e00\u6a13\u73bb\u7483\u623f', 'First Floor Glass Room'],
    ['\u79ae\u5802', 'Hall'],
    ['\u6709\u84cb\u64cd\u5834', 'Covered Playground'],
    ['\u64cd\u5834', 'Playground'],
    ['\u8ab2\u5ba4', 'Classroom'],
    ['\u6559\u5ba4', 'Classroom'],
    ['\u5ba4', 'Room']
  ];

  let translated = value;
  replacements.forEach(([from, to]) => {
    translated = translated.split(from).join(to);
  });

  if (translated !== value) return translated;

  return value
    .replace(/Little Britain/g, 'Little Britain')
    .replace(/Bio\s*Lab/g, 'Bio Lab')
    .replace(/Phy\s*Lab/g, 'Phy Lab')
    .replace(/IS\s*Lab/g, 'IS Lab')
    .replace(/AI\s*Lab/g, 'AI Lab');
}
