<template>
  <main class="pick-page">
    <section class="pick-panel">
      <header class="page-header">
        <div>
          <p>{{ teacherName || 'Swap Lesson' }}</p>
          <h1>調課選堂</h1>
        </div>
        <span class="count-badge">不包括分組課堂或高中選修科</span>
      </header>

      <div class="table-wrap">
        <table class="lesson-table">
          <thead>
            <tr>
              <th class="period-col">課節</th>
              <th v-for="day in days" :key="day">{{ dayLabel(day) }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="period in periodNumbers" :key="period">
              <th class="period-col">第{{ period }}節</th>
              <td
                v-for="day in days"
                :key="`${day}-${period}`"
                :class="{ available: getLesson(day, period) }"
              >
                <label
                  v-if="getLesson(day, period)"
                  class="lesson-cell"
                  :class="{ selected: selectedLessonId === getLesson(day, period).timetable_id }"
                >
                  <input
                    type="radio"
                    name="lesson"
                    :value="getLesson(day, period).timetable_id"
                    v-model="selectedLessonId"
                  />
                  <span class="class-pill">{{ getLesson(day, period).class_name }}</span>
                  <span class="subject-name">{{ getLesson(day, period).subject }}</span>
                </label>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <button type="button" class="primary-btn" :disabled="!selectedLesson" @click="goNext">
        下一步
      </button>
    </section>
  </main>
</template>

<script>
import axios from 'axios';

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAY_LABELS = {
  Mon: '\u661f\u671f\u4e00',
  Tue: '\u661f\u671f\u4e8c',
  Wed: '\u661f\u671f\u4e09',
  Thu: '\u661f\u671f\u56db',
  Fri: '\u661f\u671f\u4e94',
  Sat: '\u661f\u671f\u516d'
};
const TEXT = {
  chooseLesson: '\u8acb\u9078\u64c7\u8981\u8abf\u7684\u8ab2\u5802\u3002'
};

export default {
  data() {
    return {
      lessons: [],
      selectedLessonId: null
    };
  },
  computed: {
    teacherName() {
      return this.$route.query.teacherName || '';
    },
    days() {
      const lessonDays = this.lessons.map(lesson => lesson.day);
      return DAY_ORDER.filter(day => lessonDays.includes(day) || day !== 'Sat');
    },
    periodNumbers() {
      const periods = this.lessons
        .map(lesson => Number(lesson.period))
        .filter(period => period > 0 && period <= 12);

      if (periods.length === 0) return [1, 2, 3, 4, 5, 6, 7, 8, 9];

      const maxPeriod = Math.max(9, Math.max(...periods));
      return Array.from({ length: maxPeriod }, (value, index) => index + 1);
    },
    selectedLesson() {
      return this.lessons.find(lesson => lesson.timetable_id === this.selectedLessonId);
    }
  },
  async mounted() {
    const token = localStorage.getItem('token');
    const teacherId = this.$route.query.teacherId;

    try {
      const res = await axios.get(`http://localhost:3000/api/swap/teacher-lessons/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.lessons = res.data;
    } catch (err) {
      console.error('Failed to load lessons:', err);
    }
  },
  methods: {
    dayLabel(day) {
      return DAY_LABELS[day] || day;
    },
    getLesson(day, period) {
      return this.lessons.find(lesson =>
        lesson.day === day && Number(lesson.period) === Number(period)
      );
    },
    formatLessonLabel(lesson) {
      const dayLabel = DAY_LABELS[lesson.day] || lesson.day;
      return `${dayLabel} \u7b2c${lesson.period}\u7bc0 ${lesson.class_name} ${lesson.subject}`;
    },
    goNext() {
      if (!this.selectedLesson) {
        alert(TEXT.chooseLesson);
        return;
      }

      this.$router.push({
        name: 'SwapLessonResult',
        query: {
          teacherId: this.$route.query.teacherId,
          teacherName: this.$route.query.teacherName,
          day: this.selectedLesson.day,
          period: this.selectedLesson.period,
          lessonLabel: this.formatLessonLabel(this.selectedLesson),
          subjectId: this.selectedLesson.subject_id
        }
      });
    }
  }
};
</script>

<style scoped>
.pick-page {
  min-height: calc(100vh - 126px);
  box-sizing: border-box;
  padding: 44px 20px 64px;
}

.pick-panel {
  max-width: 1120px;
  margin: 0 auto;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--shadow);
  box-sizing: border-box;
  padding: 26px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.page-header p {
  color: var(--primary);
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 8px;
  text-transform: uppercase;
}

h1 {
  color: var(--text);
  font-size: 32px;
  letter-spacing: 0;
  margin: 0;
}

.count-badge {
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  background: var(--surface-soft);
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 700;
  padding: 9px 14px;
  white-space: nowrap;
}

.table-wrap {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fff;
  overflow-x: auto;
}

.lesson-table {
  width: 100%;
  min-width: 900px;
  border-collapse: collapse;
  table-layout: fixed;
}

.lesson-table th,
.lesson-table td {
  border-bottom: 1px solid var(--border);
  border-left: 1px solid var(--border);
  height: 54px;
  padding: 8px;
  text-align: left;
  vertical-align: middle;
}

.lesson-table th:first-child,
.lesson-table td:first-child {
  border-left: none;
}

.lesson-table tr:last-child th,
.lesson-table tr:last-child td {
  border-bottom: none;
}

.lesson-table thead th {
  background: var(--surface-soft);
  color: var(--text);
  font-size: 14px;
  font-weight: 800;
  text-align: center;
}

.period-col {
  width: 76px;
  background: #f8fbfc;
  color: var(--text-muted);
  font-weight: 800;
  text-align: center !important;
  white-space: nowrap;
}

.lesson-table tbody td {
  background: #fff;
}

.lesson-table td.available {
  background: #fbfdfd;
}

.lesson-cell {
  min-height: 38px;
  display: flex;
  align-items: center;
  gap: 7px;
  border: 1px solid transparent;
  border-radius: 6px;
  color: var(--text);
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.2;
  padding: 4px 6px;
}

.lesson-cell:hover,
.lesson-cell.selected {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.lesson-cell input {
  flex: 0 0 auto;
  margin: 0;
  accent-color: var(--primary);
}

.class-pill {
  flex: 0 0 auto;
  border-radius: 999px;
  background: #e7f4f6;
  color: #0a5260;
  font-size: 12px;
  padding: 4px 7px;
}

.subject-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.primary-btn {
  display: block;
  border: none;
  border-radius: 6px;
  background: var(--primary);
  color: #fff;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  height: 46px;
  margin: 22px auto 0;
  padding: 0 24px;
}

.primary-btn:disabled {
  background: #c7d2d8;
  color: #607683;
  cursor: not-allowed;
}

.primary-btn:not(:disabled):hover {
  background: var(--primary-dark);
}

@media (max-width: 720px) {
  .pick-panel {
    padding: 20px;
  }

  .page-header {
    align-items: stretch;
    flex-direction: column;
  }
}
</style>
