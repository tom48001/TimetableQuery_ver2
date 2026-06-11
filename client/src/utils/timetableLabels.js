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
  '中國語文': 'Chinese Language',
  '中文': 'Chinese Language',
  '英文': 'English Language',
  '英國語文': 'English Language',
  '英語文學': 'English Literature',
  '數學': 'Mathematics',
  '數學M1': 'Mathematics M1',
  '公民與社會發展': 'Citizenship and Social Development',
  '公民、經濟與社會': 'Citizenship, Economics and Society',
  '綜合科學': 'Integrated Science',
  '物理': 'Physics',
  '化學': 'Chemistry',
  '生物': 'Biology',
  '資訊及通訊科技': 'Information and Communication Technology',
  'ICT': 'Information and Communication Technology',
  'STEM': 'STEM',
  '經濟': 'Economics',
  '企業、會計與財務概論': 'Business, Accounting and Financial Studies',
  'BAFS': 'Business, Accounting and Financial Studies',
  '地理': 'Geography',
  '中國文學': 'Chinese Literature',
  '中國歷史': 'Chinese History',
  '歷史': 'History',
  '初中中史': 'Junior Chinese History',
  '初中歷史': 'Junior History',
  '健康管理與社會關懷': 'Health Management and Social Care',
  '倫理與宗教': 'Ethics and Religious Studies',
  '宗教教育': 'Religious Education',
  '視覺藝術': 'Visual Arts',
  '設計與應用科技': 'Design and Applied Technology',
  '科技與生活': 'Technology and Living',
  '生活與社會': 'Life and Society',
  '旅遊與款待': 'Tourism and Hospitality Studies',
  '普通話': 'Putonghua',
  '音樂': 'Music',
  '藝術發展': 'Arts Development',
  '體育': 'Physical Education',
  '生涯規劃': 'Career Planning',
  '主題學習': 'Project Learning'
};

function compact(value) {
  return String(value || '').replace(/\s+/g, '').trim();
}

export function subjectLabel(item, locale) {
  const fallback = item.subject_name || item.subject || '';
  if (locale !== 'en') return fallback;

  const byId = SUBJECT_LABELS[Number(item.subject_id)];
  if (byId) return byId;

  const normalized = compact(fallback);
  const direct = SUBJECT_NAME_LABELS[fallback] || SUBJECT_NAME_LABELS[normalized];
  if (direct) return direct;

  const partial = Object.keys(SUBJECT_NAME_LABELS).find(name => normalized.includes(compact(name)));
  return partial ? SUBJECT_NAME_LABELS[partial] : fallback;
}

export function roomLabel(roomName, locale) {
  const value = String(roomName || '');
  if (locale !== 'en') return value;

  return value
    .replace(/課室/g, 'Classroom')
    .replace(/音樂室/g, 'Music Room')
    .replace(/視覺藝術室/g, 'Visual Arts Room')
    .replace(/視覺藝術/g, 'Visual Arts')
    .replace(/地理室/g, 'Geography Room')
    .replace(/圖書館/g, 'Library')
    .replace(/電腦室/g, 'Computer Room')
    .replace(/演講廳/g, 'Lecture Theatre')
    .replace(/劇藝室/g, 'Drama Room')
    .replace(/劇藝/g, 'Drama')
    .replace(/禮堂/g, 'Hall')
    .replace(/操場/g, 'Playground')
    .replace(/有蓋操場/g, 'Covered Playground')
    .replace(/溫室/g, 'Greenhouse')
    .replace(/家政室/g, 'Home Economics Room')
    .replace(/會議室/g, 'Conference Room')
    .replace(/Little Britain/g, 'Little Britain')
    .replace(/CAL\s*室/g, 'CAL Room')
    .replace(/Bio\s*Lab/g, 'Bio Lab')
    .replace(/Phy\s*Lab/g, 'Phy Lab')
    .replace(/IS\s*Lab/g, 'IS Lab')
    .replace(/AI\s*Lab/g, 'AI Lab');
}
