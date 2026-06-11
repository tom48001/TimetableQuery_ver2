<template>
  <main class="result-page">
    <section class="result-panel">
      <header class="result-header">
        <h1>{{ date }} ({{ displayWeekday }})</h1>
        <h2>{{ periodLabel }} {{ tr('Free Teachers', '空堂老師') }}</h2>
      </header>

      <div class="table-wrap">
        <table v-if="freeTeachers.length" class="free-table">
          <thead>
            <tr>
              <th class="teacher-col">{{ tr('Teacher', '老師') }}</th>
              <th v-for="periodNumber in periodNumbers" :key="periodNumber">
                {{ periodText(periodNumber) }}
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="teacher in freeTeachers" :key="teacher.teacher_id">
              <th class="teacher-col">{{ teacher.teacher_name }}</th>
              <td v-for="periodNumber in periodNumbers" :key="periodNumber">
                <span v-if="classAt(teacher, periodNumber)" class="class-pill">
                  {{ classAt(teacher, periodNumber) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-else-if="loaded" class="empty-message">{{ tr('No free teachers found.', '找不到空堂老師。') }}</p>
        <p v-else class="empty-message">{{ tr('Loading...', '載入中...') }}</p>
      </div>
    </section>
  </main>
</template>

<script>
import axios from 'axios';

const WEEKDAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_LABELS = {
  zh: ['\u661f\u671f\u65e5', '\u661f\u671f\u4e00', '\u661f\u671f\u4e8c', '\u661f\u671f\u4e09', '\u661f\u671f\u56db', '\u661f\u671f\u4e94', '\u661f\u671f\u516d'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
};

export default {
  data() {
    return {
      teachers: [],
      periodNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      loaded: false
    };
  },
  computed: {
    date() {
      return this.$route.query.date || '';
    },
    weekday() {
      return this.$route.query.weekday || '';
    },
    weekdayLabel() {
      return this.$route.query.weekdayLabel || '';
    },
    displayWeekday() {
      const locale = this.$lang.locale === 'en' ? 'en' : 'zh';
      const fromDate = this.weekdayFromDate();
      const keyIndex = WEEKDAY_KEYS.indexOf(this.weekday);
      if (fromDate !== '') return fromDate;
      if (keyIndex >= 0) return WEEKDAY_LABELS[locale][keyIndex];
      return this.weekdayLabel || this.weekday || '';
    },
    periods() {
      return String(this.$route.query.period || '')
        .split(',')
        .map(value => Number(value))
        .filter(Boolean);
    },
    periodLabel() {
      return this.periods.map(period => this.periodText(period)).join(this.$lang.locale === 'en' ? ', ' : '\u3001');
    },
    freeTeachers() {
      return this.teachers.filter(teacher => (
        this.periods.length > 0 &&
        this.periods.every(periodNumber => !this.classAt(teacher, periodNumber))
      ));
    }
  },
  methods: {
    tr(en, zh) {
      return this.$lang.locale === 'en' ? en : zh;
    },
    weekdayFromDate() {
      if (!this.date) return '';
      const parsed = new Date(this.date + 'T00:00:00');
      if (Number.isNaN(parsed.getTime())) return '';
      const locale = this.$lang.locale === 'en' ? 'en' : 'zh';
      return WEEKDAY_LABELS[locale][parsed.getDay()];
    },
    periodText(periodNumber) {
      return this.$lang.locale === 'en' ? 'Period ' + periodNumber : '\u7b2c' + periodNumber + '\u7bc0';
    },
    classAt(teacher, periodNumber) {
      const lesson = (teacher.lessons || []).find(item => Number(item.period_id) === Number(periodNumber));
      return lesson ? lesson.class_name : '';
    },
    async fetchDaySchedule() {
      const token = localStorage.getItem('token');

      try {
        const res = await axios.post('http://localhost:3000/api/teachers/free-teachers-day', {
          weekday: this.weekday
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.teachers = res.data;
      } catch (err) {
        console.error('Failed to load free teacher day schedule:', err);
        alert(this.tr('Failed to load free teachers.', '載入空堂老師失敗。'));
      } finally {
        this.loaded = true;
      }
    }
  },
  mounted() {
    if (!this.date || !this.weekday || this.periods.length === 0) {
      this.$router.push({ name: 'FreeTeacher' });
      return;
    }

    this.fetchDaySchedule();
  }
};
</script>

<style scoped>
.result-page {
  min-height: calc(100vh - 126px);
  box-sizing: border-box;
  padding: 34px 20px 56px;
}

.result-panel {
  max-width: 1180px;
  margin: 0 auto;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--shadow);
  padding: 24px;
}

.result-header {
  margin-bottom: 22px;
  text-align: center;
}

.result-header p {
  color: var(--primary);
  font-size: 13px;
  font-weight: 800;
  margin: 0 0 8px;
  text-transform: uppercase;
}

h1,
h2 {
  color: var(--text);
  margin: 0;
  text-align: center;
}

h1 {
  font-size: 32px;
}

h2 {
  color: var(--text-muted);
  font-size: 24px;
  margin-top: 8px;
}

.table-wrap {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow-x: auto;
}

.free-table {
  width: 100%;
  min-width: 960px;
  border-collapse: collapse;
  table-layout: fixed;
}

.free-table th,
.free-table td {
  border-bottom: 1px solid var(--border);
  border-left: 1px solid var(--border);
  height: 42px;
  padding: 7px 8px;
  text-align: center;
}

.free-table th:first-child,
.free-table td:first-child {
  border-left: none;
}

.free-table tr:last-child th,
.free-table tr:last-child td {
  border-bottom: none;
}

.free-table thead th {
  background: var(--surface-soft);
  color: var(--text);
  font-weight: 800;
  white-space: nowrap;
}

.free-table tbody tr:hover th,
.free-table tbody tr:hover td {
  background: #fbfdfd;
}

.teacher-col {
  width: 120px;
  color: var(--text);
  text-align: left !important;
  white-space: nowrap;
}

.class-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 42px;
  border-radius: 999px;
  background: #e7f4f6;
  color: #0a5260;
  font-weight: 800;
  padding: 4px 9px;
}

.empty-message {
  color: var(--text-muted);
  margin: 0;
  padding: 32px;
  text-align: center;
}
</style>
