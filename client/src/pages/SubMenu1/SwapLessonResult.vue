<template>
  <main class="result-page">
    <section class="result-panel">
      <header class="page-header">
        <div>
          <p>{{ tr('Substitute lesson', '\u4ee3\u8ab2\u8ab2\u5802') }}</p>
          <h1>{{ tr('Available Substitute Teachers', '\u53ef\u4f9b\u8abf\u8ab2\u7684\u8001\u5e2b') }}</h1>
        </div>
        <span class="count-badge">{{ filteredTeachers.length }} {{ tr('teachers', '\u8001\u5e2b') }}</span>
      </header>

      <section class="lesson-panel" aria-label="selected lesson">
        <div class="lesson-primary">
          <span class="lesson-icon">T</span>
          <div>
            <small>{{ tr('Original teacher', '\u539f\u4efb\u8001\u5e2b') }}</small>
            <strong>{{ $route.query.teacherName || '-' }}</strong>
          </div>
        </div>
        <div class="lesson-detail">
          <small>{{ tr('Day', '\u661f\u671f') }}</small>
          <strong>{{ dayLabel($route.query.day) }}</strong>
        </div>
        <div class="lesson-detail">
          <small>{{ tr('Period', '\u8ab2\u7bc0') }}</small>
          <strong>{{ periodLabel }}</strong>
        </div>
        <div class="lesson-detail">
          <small>{{ tr('Time', '\u6642\u9593') }}</small>
          <strong>{{ lessonTime }}</strong>
        </div>
        <div class="lesson-detail">
          <small>{{ tr('Class', '\u73ed\u5225') }}</small>
          <strong>{{ $route.query.className || '-' }}</strong>
        </div>
        <div class="lesson-detail lesson-subject">
          <small>{{ tr('Subject', '\u79d1\u76ee') }}</small>
          <strong>{{ subjectLabel }}</strong>
        </div>
      </section>

      <div class="tools-row">
        <input
          v-model.trim="searchText"
          class="search-input"
          type="text"
          :placeholder="tr('Search teacher...', '\u641c\u5c0b\u8001\u5e2b...')"
        />
        <div class="filter-chips" aria-label="substitute teacher filters">
          <button
            v-for="filter in filters"
            :key="filter.value"
            type="button"
            :class="{ active: selectedFilter === filter.value }"
            :disabled="filter.value === 'low-workload' && !hasWorkloadData"
            @click="selectedFilter = filter.value"
          >
            {{ filter.label }}
          </button>
        </div>
      </div>

      <p v-if="loading" class="state-message">
        {{ tr('Loading available teachers...', '\u6b63\u5728\u8f09\u5165\u53ef\u4f9b\u8abf\u8ab2\u7684\u8001\u5e2b...') }}
      </p>

      <template v-else>
        <div v-if="filteredTeachers.length" class="teacher-list">
          <article
            v-for="(teacher, index) in filteredTeachers"
            :key="teacher.teacher_id"
            class="teacher-card"
            :class="teacherCardClass(teacher)"
          >
            <div class="rank-badge">#{{ index + 1 }}</div>
            <div class="teacher-main">
              <div>
                <h2>{{ teacher.teacher_name }}</h2>
                <p v-if="teacherSubject(teacher)">{{ teacherSubject(teacher) }}</p>
                <p v-else class="muted">{{ tr('Subject not provided', '\u672a\u63d0\u4f9b\u79d1\u76ee') }}</p>
              </div>
              <span class="priority-label">{{ priorityLabel(teacher) }}</span>
            </div>

            <div class="reason-row">
              <small
                v-for="reason in reasonParts(teacher)"
                :key="reason"
                class="reason-badge"
                :class="reasonClass(reason)"
              >
                {{ reason }}
              </small>
            </div>

            <div class="teacher-metrics">
              <span>
                <small>{{ tr('Workload today', '\u4eca\u65e5\u5de5\u4f5c\u91cf') }}</small>
                <strong>{{ workloadLabel(teacher) }}</strong>
              </span>
              <span>
                <small>{{ tr('Substitutions this week', '\u672c\u9031\u4ee3\u8ab2\u6b21\u6578') }}</small>
                <strong>{{ substitutionLabel(teacher) }}</strong>
              </span>
            </div>

            <button type="button" class="assign-btn" @click="openAssignModal(teacher)">
              {{ tr('Assign', '\u5b89\u6392\u4ee3\u8ab2') }}
            </button>
          </article>
        </div>

        <p v-else-if="availableTeachers.length" class="state-message">
          {{ tr('No teachers match the current search or filter.', '\u6c92\u6709\u8001\u5e2b\u7b26\u5408\u76ee\u524d\u641c\u5c0b\u6216\u7be9\u9078\u689d\u4ef6\u3002') }}
        </p>

        <p v-else class="state-message">
          {{ tr('No available substitute teachers were found for this lesson.', '\u9019\u5802\u8ab2\u66ab\u6642\u6c92\u6709\u53ef\u4f9b\u8abf\u8ab2\u7684\u8001\u5e2b\u3002') }}
        </p>
      </template>
    </section>

    <div v-if="showAssignModal" class="modal-backdrop" @click.self="closeAssignModal">
      <section class="confirm-modal" role="dialog" aria-modal="true">
        <header>
          <p>{{ tr('Confirm substitute arrangement', '\u78ba\u8a8d\u4ee3\u8ab2\u5b89\u6392') }}</p>
          <h2>{{ tr('Assign this teacher?', '\u5b89\u6392\u9019\u4f4d\u8001\u5e2b\uff1f') }}</h2>
        </header>
        <dl>
          <div>
            <dt>{{ tr('Original teacher', '\u539f\u4efb\u8001\u5e2b') }}</dt>
            <dd>{{ $route.query.teacherName || '-' }}</dd>
          </div>
          <div>
            <dt>{{ tr('Substitute teacher', '\u4ee3\u8ab2\u8001\u5e2b') }}</dt>
            <dd>{{ selectedTeacher ? selectedTeacher.teacher_name : '-' }}</dd>
          </div>
          <div>
            <dt>{{ tr('Day', '\u661f\u671f') }}</dt>
            <dd>{{ dayLabel($route.query.day) }}</dd>
          </div>
          <div>
            <dt>{{ tr('Period', '\u8ab2\u7bc0') }}</dt>
            <dd>{{ periodLabel }}</dd>
          </div>
          <div>
            <dt>{{ tr('Class', '\u73ed\u5225') }}</dt>
            <dd>{{ $route.query.className || '-' }}</dd>
          </div>
          <div>
            <dt>{{ tr('Subject', '\u79d1\u76ee') }}</dt>
            <dd>{{ subjectLabel }}</dd>
          </div>
        </dl>
        <p v-if="assignMessage" class="modal-note">{{ assignMessage }}</p>
        <footer>
          <button type="button" class="secondary-btn" @click="closeAssignModal">
            {{ tr('Cancel', '\u53d6\u6d88') }}
          </button>
          <button type="button" class="assign-btn" @click="confirmAssign">
            {{ tr('Confirm assign', '\u78ba\u8a8d\u5b89\u6392') }}
          </button>
        </footer>
      </section>
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

const PERIOD_TIMES = {
  1: '08:30-09:05',
  2: '09:05-09:40',
  3: '09:55-10:30',
  4: '10:30-11:05',
  5: '11:20-11:55',
  6: '11:55-12:30',
  7: '13:30-14:05',
  8: '14:05-14:40',
  9: '14:40-15:15',
  10: '15:25-16:00',
  11: '14:50-15:25',
  12: '15:25-16:00'
};

export default {
  name: 'SwapLessonResult',
  data() {
    return {
      availableTeachers: [],
      loading: true,
      searchText: '',
      selectedFilter: 'all',
      showAssignModal: false,
      selectedTeacher: null,
      assignMessage: ''
    };
  },
  computed: {
    filters() {
      return [
        { value: 'all', label: this.tr('All', '\u5168\u90e8') },
        { value: 'same-subject', label: this.tr('Same subject only', '\u53ea\u986f\u793a\u540c\u79d1') },
        { value: 'free', label: this.tr('Free teachers', '\u7a7a\u5802\u8001\u5e2b') },
        { value: 'low-workload', label: this.tr('Low workload', '\u8f03\u4f4e\u5de5\u4f5c\u91cf') }
      ];
    },
    hasWorkloadData() {
      return this.availableTeachers.some(teacher => this.optionalNumber(teacher, ['workload_today', 'today_workload', 'workload']) !== null);
    },
    sortedTeachers() {
      return this.availableTeachers.slice().sort((a, b) => {
        const subjectDiff = Number(this.isSameSubject(b)) - Number(this.isSameSubject(a));
        if (subjectDiff) return subjectDiff;

        const workloadDiff = this.sortOptionalNumber(a, b, ['workload_today', 'today_workload', 'workload']);
        if (workloadDiff) return workloadDiff;

        const substitutionDiff = this.sortOptionalNumber(a, b, ['substitution_count_week', 'substitute_count_week', 'substitution_count']);
        if (substitutionDiff) return substitutionDiff;

        return String(a.teacher_name || '').localeCompare(String(b.teacher_name || ''));
      });
    },
    filteredTeachers() {
      const keyword = this.searchText.toLowerCase();
      return this.sortedTeachers.filter(teacher => {
        const searchable = [
          teacher.teacher_name,
          this.teacherSubject(teacher),
          this.reasonParts(teacher).join(' ')
        ].join(' ').toLowerCase();

        if (keyword && !searchable.includes(keyword)) return false;
        if (this.selectedFilter === 'same-subject') return this.isSameSubject(teacher);
        if (this.selectedFilter === 'free') return this.isFreeTeacher(teacher);
        if (this.selectedFilter === 'low-workload') return this.isLowWorkload(teacher);
        return true;
      });
    },
    subjectLabel() {
      return formatSubjectLabel({ subject_id: this.$route.query.subjectId, subject_name: this.$route.query.subject || '-' }, this.$lang.locale);
    },
    periodLabel() {
      const period = this.$route.query.period || '-';
      return this.$lang.locale === 'en' ? 'Period ' + period : '\u7b2c' + period + '\u7bc0';
    },
    lessonTime() {
      return this.$route.query.time || PERIOD_TIMES[Number(this.$route.query.period)] || this.tr('Not provided', '\u672a\u63d0\u4f9b');
    }
  },
  async mounted() {
    const { day, period, classId, subjectId, teacherId } = this.$route.query;
    const token = localStorage.getItem('token');

    try {
      const res = await axios.post('/api/swap/substitute-candidates',
        { day, period, classId, subjectId, teacherId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      this.availableTeachers = Array.isArray(res.data) ? res.data : [];
      console.log('Swap candidates:', this.availableTeachers.length, { day, period, classId, subjectId, teacherId });
    } catch (err) {
      console.error('Failed to load substitute teachers:', err);
      alert(this.tr('Failed to load available substitute teachers. Please check the server or your permission.', '\u8f09\u5165\u53ef\u4f9b\u8abf\u8ab2\u8001\u5e2b\u5931\u6557\uff0c\u8acb\u6aa2\u67e5\u4f3a\u670d\u5668\u6216\u6b0a\u9650\u3002'));
    } finally {
      this.loading = false;
    }
  },
  methods: {
    tr(en, zh) {
      return this.$lang.locale === 'en' ? en : zh;
    },
    dayLabel(day) {
      const en = { Mon: 'Mon', Tue: 'Tue', Wed: 'Wed', Thu: 'Thu', Fri: 'Fri', Sat: 'Sat' }[day] || day || '-';
      return this.$lang.locale === 'en' ? en : (DAY_LABELS[day] || day || '-');
    },
    optionalNumber(teacher, fields) {
      for (const field of fields) {
        const value = Number(teacher[field]);
        if (Number.isFinite(value)) return value;
      }
      return null;
    },
    sortOptionalNumber(a, b, fields) {
      const aValue = this.optionalNumber(a, fields);
      const bValue = this.optionalNumber(b, fields);
      if (aValue === null && bValue === null) return 0;
      if (aValue === null) return 1;
      if (bValue === null) return -1;
      return aValue - bValue;
    },
    reasonText(teacher) {
      const parts = [];
      if (Number(teacher.same_subject)) parts.push('\u540c\u79d1');

      const raw = String(teacher.match_reason || '');
      if (raw.includes('\u540c\u79d1') && !parts.includes('\u540c\u79d1')) parts.push('\u540c\u79d1');
      if (!parts.includes('\u540c\u79d1')) parts.push('\u7a7a\u5802');
      if (Number(teacher.same_class)) parts.push('\u540c\u73ed');
      if (raw.includes('\u540c\u73ed') && !parts.includes('\u540c\u73ed')) parts.push('\u540c\u73ed');
      return parts.join(' / ');
    },
    reasonLabel(reason) {
      if (this.$lang.locale !== 'en') return reason;
      const labels = {
        '\u540c\u73ed': 'Same class',
        '\u540c\u79d1': 'Same subject',
        '\u7a7a\u5802': 'Free'
      };

      return String(reason || '')
        .split('/')
        .map(part => labels[part.trim()] || part.trim())
        .filter(Boolean)
        .join(' / ');
    },
    reasonParts(teacher) {
      return this.reasonLabel(this.reasonText(teacher))
        .split('/')
        .map(part => part.trim())
        .filter(Boolean);
    },
    reasonClass(reason) {
      const text = String(reason || '').toLowerCase();
      if (text.includes('same subject') || reason.includes('\u540c\u79d1')) return 'reason-same-subject';
      if (text.includes('same class') || reason.includes('\u540c\u73ed')) return 'reason-same-class';
      return 'reason-free';
    },
    teacherCardClass(teacher) {
      if (this.hasHeavyWorkload(teacher)) return 'teacher-card-warning';
      if (this.isSameSubject(teacher)) return 'teacher-card-subject';
      return 'teacher-card-free';
    },
    isSameSubject(teacher) {
      return Number(teacher.same_subject) === 1 || this.reasonText(teacher).includes('\u540c\u79d1');
    },
    isFreeTeacher(teacher) {
      return this.reasonText(teacher).includes('\u7a7a\u5802') || !this.isSameSubject(teacher);
    },
    isLowWorkload(teacher) {
      const value = this.optionalNumber(teacher, ['workload_today', 'today_workload', 'workload']);
      return value !== null && value <= 3;
    },
    hasHeavyWorkload(teacher) {
      const value = this.optionalNumber(teacher, ['workload_today', 'today_workload', 'workload']);
      return value !== null && value >= 7;
    },
    teacherSubject(teacher) {
      return teacher.subject_name || teacher.subject || teacher.subjects || '';
    },
    workloadLabel(teacher) {
      const value = this.optionalNumber(teacher, ['workload_today', 'today_workload', 'workload']);
      return value === null ? this.tr('N/A', '\u672a\u63d0\u4f9b') : value;
    },
    substitutionLabel(teacher) {
      const value = this.optionalNumber(teacher, ['substitution_count_week', 'substitute_count_week', 'substitution_count']);
      return value === null ? this.tr('N/A', '\u672a\u63d0\u4f9b') : value;
    },
    priorityLabel(teacher) {
      if (this.hasHeavyWorkload(teacher)) return this.tr('Check workload', '\u7559\u610f\u5de5\u4f5c\u91cf');
      if (this.isSameSubject(teacher)) return this.tr('Recommended', '\u63a8\u85a6');
      return this.tr('Available', '\u53ef\u4ee3\u8ab2');
    },
    openAssignModal(teacher) {
      this.selectedTeacher = teacher;
      this.assignMessage = '';
      this.showAssignModal = true;
    },
    closeAssignModal() {
      this.showAssignModal = false;
      this.selectedTeacher = null;
      this.assignMessage = '';
    },
    confirmAssign() {
      // TODO: Connect this to a backend endpoint when substitute assignments are stored in the database.
      this.assignMessage = this.tr('Assignment saving is not connected yet. Please add the backend endpoint before production use.', '\u5c1a\u672a\u9023\u63a5\u5132\u5b58\u4ee3\u8ab2\u5b89\u6392\u7684\u5f8c\u7aef API\uff0c\u4e0a\u7dda\u524d\u8acb\u5148\u52a0\u5165\u3002');
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
  max-width: 1120px;
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

.page-header p {
  color: #0b7285;
  font-size: 13px;
  font-weight: 800;
  margin: 0 0 8px;
  text-transform: uppercase;
}

h1 {
  color: #122635;
  font-size: 32px;
  letter-spacing: 0;
  margin: 0;
}

.count-badge {
  border: 1px solid #b8cad3;
  border-radius: 8px;
  background: #f3f8fa;
  color: #27485b;
  font-weight: 800;
  padding: 10px 14px;
  white-space: nowrap;
}

.lesson-panel {
  display: grid;
  grid-template-columns: minmax(210px, 1.4fr) repeat(5, minmax(110px, 1fr));
  gap: 10px;
  border: 1px solid #b8cad3;
  border-radius: 8px;
  background: linear-gradient(135deg, #edf7fa 0%, #f8fbfc 100%);
  margin-top: 22px;
  padding: 14px;
}

.lesson-primary,
.lesson-detail {
  display: flex;
  align-items: center;
  gap: 10px;
  border: 1px solid #d4e3e8;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.82);
  min-width: 0;
  padding: 12px;
}

.lesson-primary {
  border-left: 5px solid #0b7285;
}

.lesson-icon {
  width: 34px;
  height: 34px;
  display: inline-grid;
  place-items: center;
  border-radius: 999px;
  background: #0b7285;
  color: #fff;
  font-weight: 900;
}

.lesson-detail {
  display: grid;
  gap: 4px;
}

.lesson-subject {
  grid-column: span 2;
}

.lesson-panel small,
.teacher-metrics small,
.confirm-modal dt {
  color: #607683;
  font-size: 11px;
  font-weight: 800;
}

.lesson-panel strong {
  color: #122635;
  font-size: 15px;
}

.tools-row {
  display: grid;
  gap: 12px;
  margin-top: 22px;
}

.search-input {
  width: 100%;
  height: 44px;
  border: 1px solid #b8cad3;
  border-radius: 6px;
  background: #fff;
  box-sizing: border-box;
  color: #122635;
  font-size: 15px;
  padding: 0 12px;
}

.search-input:focus {
  border-color: #0b7285;
  box-shadow: 0 0 0 3px rgba(11, 114, 133, 0.13);
  outline: none;
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chips button {
  height: 34px;
  border: 1px solid #cfdde3;
  border-radius: 999px;
  background: #fff;
  color: #27485b;
  cursor: pointer;
  font-weight: 800;
  padding: 0 13px;
}

.filter-chips button.active {
  border-color: #0b7285;
  background: #dff3f6;
  color: #0a5260;
}

.filter-chips button:disabled {
  background: #eef3f5;
  color: #8ca0aa;
  cursor: not-allowed;
}

.teacher-list {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(245px, 1fr));
  gap: 12px;
  border: 1px solid #cfdde3;
  border-radius: 8px;
  background: #f3f8fa;
  margin-top: 18px;
  padding: 12px;
}

.teacher-card {
  display: grid;
  gap: 10px;
  border: 1px solid #cfdde3;
  border-left: 5px solid #7aa7b5;
  border-radius: 8px;
  background: #fff;
  color: #183447;
  padding: 12px;
  position: relative;
}

.teacher-card-subject {
  border-color: #9bd6bf;
  border-left-color: #2a9b66;
  background: #effaf5;
}

.teacher-card-free {
  border-color: #b9cdeb;
  border-left-color: #587eb8;
  background: #f1f6ff;
}

.teacher-card-warning {
  border-color: #e4c978;
  border-left-color: #c0911f;
  background: #fff8df;
}

.rank-badge {
  position: absolute;
  top: 10px;
  right: 10px;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  color: #607683;
  font-size: 11px;
  font-weight: 900;
  padding: 4px 7px;
}

.teacher-main {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
  padding-right: 34px;
}

.teacher-main h2 {
  color: #122635;
  font-size: 18px;
  margin: 0 0 4px;
}

.teacher-main p {
  color: #27485b;
  font-size: 13px;
  font-weight: 700;
  margin: 0;
}

.teacher-main .muted {
  color: #758b96;
}

.priority-label {
  align-self: flex-start;
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.78);
  color: #27485b;
  font-size: 11px;
  font-weight: 900;
  padding: 5px 8px;
  white-space: nowrap;
}

.reason-row {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  min-width: 0;
}

.reason-badge {
  border: 1px solid transparent;
  border-radius: 999px;
  font-size: 11px;
  font-weight: 800;
  line-height: 1;
  padding: 5px 8px;
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
  border-color: #b9cdeb;
  background: #eaf2ff;
  color: #385d96;
}

.teacher-metrics {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
}

.teacher-metrics span {
  border: 1px solid rgba(184, 202, 211, 0.75);
  border-radius: 7px;
  background: rgba(255, 255, 255, 0.62);
  padding: 8px;
}

.teacher-metrics strong {
  display: block;
  color: #122635;
  font-size: 15px;
  margin-top: 3px;
}

.assign-btn,
.secondary-btn {
  height: 38px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 900;
  padding: 0 14px;
}

.assign-btn {
  background: #0b7285;
  color: #fff;
}

.assign-btn:hover {
  background: #085c6c;
}

.secondary-btn {
  border: 1px solid #b8cad3;
  background: #fff;
  color: #27485b;
}

.state-message {
  border: 1px dashed #b8cad3;
  border-radius: 8px;
  color: #607683;
  margin: 22px 0 0;
  padding: 28px;
  text-align: center;
}

.modal-backdrop {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(18, 38, 53, 0.42);
  padding: 20px;
  z-index: 50;
}

.confirm-modal {
  width: min(520px, 100%);
  border-radius: 8px;
  background: #fff;
  box-shadow: 0 24px 60px rgba(18, 38, 53, 0.3);
  padding: 24px;
}

.confirm-modal header p {
  color: #0b7285;
  font-size: 12px;
  font-weight: 900;
  margin: 0 0 6px;
  text-transform: uppercase;
}

.confirm-modal h2 {
  color: #122635;
  font-size: 24px;
  margin: 0;
}

.confirm-modal dl {
  display: grid;
  gap: 8px;
  margin: 18px 0;
}

.confirm-modal dl div {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 12px;
  border-bottom: 1px solid #edf3f5;
  padding-bottom: 8px;
}

.confirm-modal dd {
  color: #122635;
  font-weight: 800;
  margin: 0;
}

.modal-note {
  border: 1px solid #e4c978;
  border-radius: 7px;
  background: #fff8df;
  color: #725918;
  font-weight: 700;
  padding: 10px;
}

.confirm-modal footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}

@media (max-width: 900px) {
  .lesson-panel {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .lesson-primary,
  .lesson-subject {
    grid-column: span 2;
  }
}

@media (max-width: 720px) {
  .result-panel {
    padding: 20px;
  }

  .page-header {
    align-items: stretch;
    flex-direction: column;
  }

  .lesson-panel,
  .teacher-list,
  .teacher-metrics {
    grid-template-columns: 1fr;
  }

  .lesson-primary,
  .lesson-subject {
    grid-column: auto;
  }

  .teacher-main {
    display: grid;
  }

  .confirm-modal dl div {
    grid-template-columns: 1fr;
    gap: 3px;
  }

  .confirm-modal footer {
    display: grid;
  }
}
</style>
