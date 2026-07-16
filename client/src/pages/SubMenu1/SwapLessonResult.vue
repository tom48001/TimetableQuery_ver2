<template>
  <main class="result-page">
    <div class="page-shell">
      <div class="result-layout">
        <section class="result-content">
          <div class="request-summary">
            <div class="summary-details">
              <span class="summary-label">{{ tr('Teacher to swap', '需要調課老師') }}</span>
              <strong class="summary-name">{{ $route.query.teacherName || '-' }}</strong>
              <ul class="lesson-summary-list">
                <li v-for="(lesson, index) in selectedLessons" :key="lesson.timetableId || index">
                  {{ lessonLabel(lesson) }}
                </li>
              </ul>
            </div>
          </div>

          <p v-if="loading" class="empty-message">{{ tr('Loading...', '載入中...') }}</p>
          <div v-else-if="filteredTeachers.length" class="teacher-list">
            <article v-for="teacher in filteredTeachers" :key="teacher.teacher_id" class="teacher-card">
              <div class="teacher-card-top">
                <span class="reason-row">
                  <small v-for="reason in reasonParts(teacher.match_reason)" :key="reason" class="reason-badge" :class="reasonClass(reason)">{{ reason }}</small>
                </span>
              </div>
              <strong class="teacher-name">{{ teacher.teacher_name }}</strong>
              <span class="teacher-description">{{ reasonParts(teacher.match_reason).join('、') }}</span>
            </article>
          </div>
          <p v-else class="empty-message">{{ tr('No teachers found', '找不到老師') }}</p>
        </section>

        <aside class="filter-panel">
          <h2><span class="filter-icon">☰</span>{{ tr('Filters', '篩選條件') }}</h2>
          <span class="filter-label">{{ tr('Status', '狀態') }}</span>
          <label><input v-model="filters.available" type="checkbox" /> {{ tr('Available', '空堂') }} (Available)</label>
          <label><input v-model="filters.sameSubject" type="checkbox" /> {{ tr('Same-subject teacher', '同科老師') }}</label>
          <label><input v-model="filters.sameClass" type="checkbox" /> {{ tr('Same-class teacher', '同班老師') }}</label>
          <button type="button" class="reset-button" @click="resetFilters">{{ tr('Reset all filters', '重置所有篩選') }}</button>
        </aside>
      </div>
    </div>
  </main>
</template>

<script>
import axios from 'axios';
import { subjectLabel as formatSubjectLabel } from '../../utils/timetableLabels';

const DAY_LABELS = {
  Mon: '\u661f\u671f\u4e00',
  Tue: '\u661f\u671f\u4e8c',
  Wed: '\u661f\u671f\u4e09',
  Thu: '\u661f\u671f\u56db',
  Fri: '\u661f\u671f\u4e94',
  Sat: '\u661f\u671f\u516d'
};

function sortTeachersByName(teachers) {
  return [...teachers].sort((a, b) =>
    String(a.teacher_name || '').localeCompare(String(b.teacher_name || ''), 'en', { sensitivity: 'base' })
  );
}

export default {
  name: 'SwapLessonResult',
  data() {
    return {
      availableTeachers: [],
      loading: true,
      searchText: '',
      filters: { available: true, sameSubject: false, sameClass: false }
    };
  },
  computed: {
    filteredTeachers() {
      const keyword = this.searchText.toLowerCase();
      const matchFilters = [];
      if (this.filters.available) matchFilters.push('free');
      if (this.filters.sameSubject) matchFilters.push('same-subject');
      if (this.filters.sameClass) matchFilters.push('same-class');

      return sortTeachersByName(this.availableTeachers.filter(teacher => {
        if (keyword && !String(teacher.teacher_name || '').toLowerCase().includes(keyword)) return false;
        return matchFilters.some(type => this.hasReason(teacher, type));
      }));
    },
    selectedLessons() {
      try {
        const lessons = JSON.parse(this.$route.query.lessons || '[]');
        if (Array.isArray(lessons) && lessons.length) return lessons;
      } catch (error) {
        console.error('Failed to parse selected lessons:', error);
      }

      return [{
        day: this.$route.query.day,
        period: this.$route.query.period,
        classId: this.$route.query.classId,
        className: this.$route.query.className,
        subject: this.$route.query.subject,
        subjectId: this.$route.query.subjectId,
        subjectNameZh: this.$route.query.subjectNameZh,
        subjectNameEn: this.$route.query.subjectNameEn
      }];
    }
  },
  async mounted() {
    const teacherId = this.$route.query.teacherId;
    const token = localStorage.getItem('token');

    try {
      const responses = await Promise.all(this.selectedLessons.map(lesson =>
        axios.post('/api/swap/substitute-candidates', {
          day: lesson.day,
          period: lesson.period,
          classId: lesson.classId,
          subjectId: lesson.subjectId,
          teacherId
        }, {
          headers: { Authorization: `Bearer ${token}` }
        })
      ));

      const candidateLists = responses.map(response => Array.isArray(response.data) ? response.data : []);
      const firstList = candidateLists[0] || [];
      this.availableTeachers = sortTeachersByName(firstList
        .filter(teacher => candidateLists.every(list =>
          list.some(candidate => Number(candidate.teacher_id) === Number(teacher.teacher_id))
        ))
        .map(teacher => {
          const reasons = candidateLists.flatMap(list => {
            const candidate = list.find(item => Number(item.teacher_id) === Number(teacher.teacher_id));
            return candidate ? this.reasonParts(candidate.match_reason) : [];
          });
          return {
            ...teacher,
            match_reason: Array.from(new Set(reasons)).join(' / ')
          };
        }));
    } catch (err) {
      console.error('Failed to load substitute teachers:', err);
      alert(this.tr('Failed to load available teachers.', '載入可供調課老師失敗。'));
    } finally {
      this.loading = false;
    }
  },
  methods: {
    teacherInitials(name) {
      const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
      if (!parts.length) return '--';
      return parts.length === 1 ? parts[0].slice(0, 2).toUpperCase() : (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    },
    hasReason(teacher, type) {
      return this.reasonParts(teacher.match_reason).some(reason => this.reasonClass(reason) === `reason-${type}`);
    },
    resetFilters() {
      this.filters = { available: true, sameSubject: false, sameClass: false };
    },
    dayLabel(day) {
      const en = { Mon: 'Mon', Tue: 'Tue', Wed: 'Wed', Thu: 'Thu', Fri: 'Fri', Sat: 'Sat' }[day] || day || '-';
      return this.$lang.locale === 'en' ? en : (DAY_LABELS[day] || day || '-');
    },
    tr(en, zh) {
      return this.$lang.locale === 'en' ? en : zh;
    },
    lessonSubjectLabel(lesson) {
      return formatSubjectLabel({
        subject_id: lesson.subjectId,
        subject_name: lesson.subject || '-',
        subject_name_zh: lesson.subjectNameZh,
        subject_name_en: lesson.subjectNameEn
      }, this.$lang.locale);
    },
    lessonLabel(lesson) {
      const day = this.dayLabel(lesson.day);
      const period = lesson.period || '-';
      const periodLabel = this.$lang.locale === 'en' ? 'Period ' + period : '\u7b2c' + period + '\u7bc0';
      return day + ' ' + periodLabel + ' ' + (lesson.className || '-') + ' ' + this.lessonSubjectLabel(lesson);
    },
    reasonLabel(reason) {
      const text = String(reason || '');
      if (this.$lang.locale !== 'en') return text;

      const labels = {
        '\u540c\u73ed': 'Same class',
        '\u540c\u79d1': 'Same subject',
        '\u7a7a\u5802': 'Free'
      };

      return text
        .split('/')
        .map(part => labels[part.trim()] || part.trim())
        .filter(Boolean)
        .join(' / ');
    },
    reasonParts(reason) {
      return this.reasonLabel(reason)
        .split('/')
        .map(part => part.trim())
        .filter(Boolean);
    },
    reasonClass(reason) {
      const text = String(reason || '').toLowerCase();
      if (text.includes('same class') || reason.includes('\u540c\u73ed')) return 'reason-same-class';
      if (text.includes('same subject') || reason.includes('\u540c\u79d1')) return 'reason-same-subject';
      return 'reason-free';
    },
    teacherCardClass(reason) {
      const parts = this.reasonParts(reason);
      const hasClass = parts.some(part => this.reasonClass(part) === 'reason-same-class');
      const hasSubject = parts.some(part => this.reasonClass(part) === 'reason-same-subject');

      if (hasClass && hasSubject) return 'teacher-chip-combo';
      if (hasClass) return 'teacher-chip-class';
      if (hasSubject) return 'teacher-chip-subject';
      return 'teacher-chip-free';
    }
  }
};
</script>
<style scoped>
.result-page {
  min-height: calc(100vh - 126px);
  box-sizing: border-box;
  padding: 44px 20px 64px;
}

.result-panel {
  max-width: 900px;
  margin: 0 auto;
  border: 1px solid #cfdde3;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 38px rgba(25, 54, 69, 0.12);
  box-sizing: border-box;
  padding: 26px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

h1 {
  color: #122635;
  font-size: 32px;
  letter-spacing: 0;
  margin: 0;
}

.count-badge,
.request-summary {
  border: 1px solid #b8cad3;
  border-radius: 6px;
  background: #f3f8fa;
  color: #27485b;
  font-weight: 700;
}

.count-badge {
  padding: 9px 12px;
}

.request-summary {
  display: grid;
  gap: 8px;
  margin-top: 20px;
  padding: 14px;
}

.summary-label {
  color: #0b7285;
  margin-right: 6px;
}

.lesson-summary-list {
  display: grid;
  gap: 4px;
  margin: 6px 0 0;
  padding-left: 22px;
}

.search-input {
  width: 100%;
  height: 44px;
  border: 1px solid #b8cad3;
  border-radius: 6px;
  background: #fff;
  box-sizing: border-box;
  font-size: 15px;
  margin-top: 22px;
  padding: 0 12px;
}

.search-input:focus {
  border: 2px solid #4f6f52;
}

.teacher-list {
  max-height: 440px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 7px;
  overflow-y: auto;
  border: 1px solid #cfdde3;
  border-radius: 8px;
  background: #f3f8fa;
  margin-top: 18px;
  padding: 10px;
}

.teacher-chip {
  display: grid;
  gap: 3px;
  border: 1px solid #cfdde3;
  border-radius: 6px;
  background: #fff;
  color: #183447;
  font-size: 13px;
  font-weight: 700;
  overflow: hidden;
  padding: 9px 10px 9px 12px;
  position: relative;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.teacher-chip::before {
  content: "";
  position: absolute;
  inset: 0 auto 0 0;
  width: 4px;
}

.teacher-chip-class {
  border-color: #9bc5ee;
  background: #f0f7ff;
}

.teacher-chip-class::before {
  background: #3a8fd8;
}

.teacher-chip-subject {
  border-color: #9bd6bf;
  background: #effaf5;
}

.teacher-chip-subject::before {
  background: #2a9b66;
}

.teacher-chip-free {
  border-color: #d5c4ee;
  background: #f7f3fd;
}

.teacher-chip-free::before {
  background: #8a6ac0;
}

.teacher-chip-combo {
  border-color: #78c9d2;
  background: linear-gradient(135deg, #edf7ff 0%, #effaf5 100%);
}

.teacher-chip-combo::before {
  background: linear-gradient(180deg, #3a8fd8 0%, #2a9b66 100%);
}

.reason-row {
  display: flex;
  flex-wrap: wrap;
  gap: 5px;
  min-width: 0;
}

.reason-badge {
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 10px;
  font-weight: 700;
  line-height: 1;
  padding: 4px 7px;
  white-space: nowrap;
}

.reason-same-class {
  border-color: #9bc5ee;
  background: #e7f2ff;
  color: #145a91;
}

.reason-same-subject {
  border-color: #9bd6bf;
  background: #e8f8f0;
  color: #17643e;
}

.reason-free {
  border-color: #d5c4ee;
  background: #f2edfb;
  color: #60408c;
}

.teacher-chip:hover {
  box-shadow: 0 6px 14px rgba(25, 54, 69, 0.12);
  transform: translateY(-1px);
}

.empty-message {
  border: 1px dashed #b8cad3;
  border-radius: 8px;
  color: #607683;
  margin: 22px 0 0;
  padding: 28px;
  text-align: center;
}

@media (max-width: 720px) {
  .result-panel {
    padding: 20px;
  }

  .page-header,
  .request-summary {
    align-items: stretch;
    flex-direction: column;
  }

  .teacher-list {
    grid-template-columns: 1fr;
  }
}

/* Card layout for the available-teacher result. */
.result-page {
  background: #f8fafc;
  padding: 6px 0 28px;
}

.page-shell {
  max-width: 1120px;
  margin: 0 auto;
}

.breadcrumb {
  color: #475569;
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 14px;
}

.breadcrumb span {
  margin: 0 10px;
}

.breadcrumb strong {
  color: #0757c9;
}

.page-header {
  align-items: center;
  margin-bottom: 42px;
}

.count-badge {
  border: 0;
  border-radius: 999px;
  background: #eef4ff;
  color: #0757c9;
}

.result-layout {
  display: grid;
  grid-template-columns: minmax(0, 3fr) minmax(260px, 1.08fr);
  gap: 28px;
  align-items: start;
}

.request-summary {
  min-height: 194px;
  display: flex;
  align-items: flex-start;
  border: 0;
  border-radius: 22px;
  background: #eef4ff;
  box-shadow: 0 4px 8px rgba(15, 23, 42, 0.12);
  color: #172033;
  box-sizing: border-box;
  margin: 0 0 36px;
  padding: 32px 30px;
}

.summary-avatar {
  width: 120px;
  height: 120px;
  flex: 0 0 120px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.22);
  font-size: 30px;
  font-weight: 800;
}

.summary-details {
  min-width: 0;
}

.summary-label {
  display: block;
  color: #475569;
  font-size: 12px;
  font-weight: 600;
  margin: 0 0 10px;
}

.summary-name {
  display: block;
  font-size: clamp(24px, 2.5vw, 32px);
  line-height: 1.15;
  overflow-wrap: anywhere;
}

.lesson-summary-list {
  gap: 7px;
  list-style: none;
  margin: 24px 0 0;
  padding: 0;
  font-size: 15px;
  font-weight: 800;
}

.teacher-list {
  max-height: none;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
  overflow: visible;
  border: 0;
  background: transparent;
  margin: 0;
  padding: 0;
}

.teacher-card {
  min-height: 128px;
  border: 1px solid #e5e7eb;
  border-radius: 10px;
  background: #fff;
  box-shadow: 0 2px 3px rgba(15, 23, 42, 0.09);
  box-sizing: border-box;
  padding: 20px 22px;
}

.teacher-card-top {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 10px;
  margin-bottom: 18px;
}

.teacher-avatar {
  width: 52px;
  height: 52px;
  display: grid;
  place-items: center;
  border-radius: 6px;
  background: #dbeafe;
  color: #0757c9;
  font-size: 18px;
  font-weight: 800;
}

.teacher-name,
.teacher-description {
  display: block;
}

.teacher-name {
  color: #0f172a;
  font-size: 16px;
  overflow-wrap: anywhere;
}

.teacher-description {
  color: #94a3b8;
  font-size: 13px;
  margin-top: 5px;
}

.reason-row {
  justify-content: flex-start;
}

.reason-badge {
  border: 0;
  border-radius: 3px;
  padding: 5px 7px;
}

.reason-same-class { background: #f3e8ff; color: #9333ea; }
.reason-same-subject { background: #eafbf0; color: #16a34a; }
.reason-free { background: #eef4ff; color: #2563eb; }

.filter-panel {
  display: grid;
  gap: 16px;
  border: 1px solid #cbd5e1;
  border-radius: 22px;
  background: #fff;
  box-shadow: 0 2px 4px rgba(15, 23, 42, 0.08);
  padding: 28px 28px;
}

.filter-panel h2 {
  display: flex;
  align-items: center;
  gap: 14px;
  color: #0f172a;
  font-size: 20px;
  margin: 0 0 6px;
}

.filter-icon { color: #0757c9; transform: rotate(180deg); }
.filter-label { color: #64748b; font-size: 13px; font-weight: 800; }

.filter-panel label {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #334155;
  cursor: pointer;
}

.filter-panel input {
  width: 20px;
  height: 20px;
  accent-color: #0757c9;
}

.reset-button {
  height: 50px;
  border: 0;
  border-radius: 10px;
  background: #0f7f8d;
  color: #fff;
  font-size: 15px;
  margin-top: 6px;
  font-weight: 800;
}

@media (max-width: 980px) {
  .result-layout { grid-template-columns: 1fr; }
  .filter-panel { grid-row: 1; border-radius: 18px; }
}

@media (max-width: 720px) {
  .result-page { padding: 12px 14px 48px; }
  .page-header { margin-bottom: 24px; }
  .request-summary { min-height: 0; align-items: flex-start; border-radius: 18px; padding: 24px 20px; }
  .summary-avatar { width: 64px; height: 64px; flex-basis: 64px; border-radius: 12px; font-size: 18px; }
  .teacher-list { grid-template-columns: 1fr; }
  .filter-panel { padding: 24px 20px; }
}
</style>
