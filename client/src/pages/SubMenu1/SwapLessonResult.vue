<template>
  <main class="result-page">
    <section class="result-panel">
      <header class="page-header">
        <div>
          <h1>{{ tr('Available Swap Teachers', '可供調課的老師') }}</h1>
        </div>
        <span class="count-badge">{{ filteredTeachers.length }} {{ tr('teachers', '老師') }}</span>
      </header>

      <div class="request-summary">
        <div>
          <span class="summary-label">{{ tr('Teacher to swap', '需要調課老師') }}</span>
          <strong>{{ $route.query.teacherName || '-' }}</strong>
        </div>
        <div>
          <span class="summary-label">{{ tr('Lesson to swap', '需要調課課節') }}</span>
          <strong>{{ lessonLabel }}</strong>
        </div>
        <div>
          <span class="summary-label">{{ tr('Class', '班別') }}</span>
          <strong>{{ $route.query.className || '-' }}</strong>
        </div>
        <div>
          <span class="summary-label">{{ tr('Subject', '科目') }}</span>
          <strong>{{ subjectLabel }}</strong>
        </div>
      </div>

      <p v-if="loading" class="empty-message">{{ tr('Loading...', '載入中...') }}</p>

      <template v-else>
        <input
          v-if="availableTeachers.length"
          v-model.trim="searchText"
          class="search-input"
          type="text"
          :placeholder="tr('Search teacher...', '搜尋老師...')"
        />

        <div v-if="filteredTeachers.length" class="teacher-list">
          <span
            v-for="teacher in filteredTeachers"
            :key="teacher.teacher_id"
            class="teacher-chip"
          >
            <span>{{ teacher.teacher_name }}</span>
            <small>{{ reasonLabel(teacher.match_reason) }}</small>
          </span>
        </div>

        <p v-else class="empty-message">
          {{ tr('No teachers found', '找不到老師') }}
        </p>
      </template>
    </section>
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

export default {
  name: 'SwapLessonResult',
  data() {
    return {
      availableTeachers: [],
      loading: true,
      searchText: ''
    };
  },
  computed: {
    filteredTeachers() {
      const keyword = this.searchText.toLowerCase();
      if (!keyword) return this.availableTeachers;

      return this.availableTeachers.filter(teacher =>
        String(teacher.teacher_name || '').toLowerCase().includes(keyword)
      );
    },
    subjectLabel() {
      return formatSubjectLabel({ subject_id: this.$route.query.subjectId, subject_name: this.$route.query.subject || '-' }, this.$lang.locale);
    },
    lessonLabel() {
      const day = this.dayLabel(this.$route.query.day);
      const period = this.$route.query.period || '-';
      const periodLabel = this.$lang.locale === 'en' ? 'Period ' + period : '\u7b2c' + period + '\u7bc0';
      const className = this.$route.query.className || '-';
      return day + ' ' + periodLabel + ' ' + className + ' ' + this.subjectLabel;
    },
    fallbackLessonLabel() {
      const zhDay = DAY_LABELS[this.$route.query.day] || this.$route.query.day || '-';
      const enDay = { Mon: 'Mon', Tue: 'Tue', Wed: 'Wed', Thu: 'Thu', Fri: 'Fri', Sat: 'Sat' }[this.$route.query.day] || this.$route.query.day || '-';
      const day = this.$lang.locale === 'en' ? enDay : zhDay;
      const period = this.$route.query.period || '-';
      const periodLabel = this.$lang.locale === 'en' ? 'Period ' + period : '\u7b2c' + period + '\u7bc0';
      return day + ' ' + periodLabel;
    }
  },
  async mounted() {
    const { day, period, classId, subjectId, teacherId } = this.$route.query;
    const token = localStorage.getItem('token');

    try {
      const res = await axios.post('http://localhost:3000/api/swap/substitute-candidates',
        { day, period, classId, subjectId, teacherId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      this.availableTeachers = Array.isArray(res.data) ? res.data : [];
      console.log('Swap candidates:', this.availableTeachers.length, { day, period, classId, subjectId, teacherId });
    } catch (err) {
      console.error('Failed to load substitute teachers:', err);
      alert(this.tr('Failed to load available teachers.', '載入可供調課老師失敗。'));
    } finally {
      this.loading = false;
    }
  },
  methods: {
    dayLabel(day) {
      const en = { Mon: 'Mon', Tue: 'Tue', Wed: 'Wed', Thu: 'Thu', Fri: 'Fri', Sat: 'Sat' }[day] || day || '-';
      return this.$lang.locale === 'en' ? en : (DAY_LABELS[day] || day || '-');
    },
    tr(en, zh) {
      return this.$lang.locale === 'en' ? en : zh;
    },
    reasonLabel(reason) {
      if (this.$lang.locale !== 'en') return reason;
      return String(reason || '')
        .replace('??', 'Same class')
        .replace('??', 'Same subject')
        .replace('??', 'Free');
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
  padding: 8px 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.teacher-chip small {
  color: #0b7285;
  font-size: 11px;
  font-weight: 700;
}

.teacher-chip:hover {
  border-color: #86adba;
  background: #eef7f8;
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
</style>
