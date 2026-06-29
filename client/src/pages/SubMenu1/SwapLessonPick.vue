<template>
  <main class="pick-page">
    <section class="pick-panel">
      <header class="page-header">
        <div>
          <p>{{ teacherName || tr('Teacher', '老師') }}</p>
          <h1>{{ tr('Choose Lesson to Swap', '調課選堂') }}</h1>
        </div>
        <span class="count-badge">{{ tr('Grouped lessons and senior electives are excluded', '不包括分組課堂或高中選修科') }}</span>
      </header>

      <div class="table-wrap">
        <table class="lesson-table">
          <thead>
            <tr>
              <th class="period-col">{{ tr('Period / Day', '課節 / 星期') }}</th>
              <th v-for="day in days" :key="day">{{ dayLabel(day) }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="period in periodNumbers" :key="period">
              <th class="period-col">{{ periodText(period) }}</th>
              <td
                v-for="day in days"
                :key="`${day}-${period}`"
                :class="{ available: getLesson(day, period) }"
              >
                <label
                  v-if="getLesson(day, period)"
                  class="lesson-card"
                  :class="{ selected: isSelected(getLesson(day, period)) }"
                >
                  <input
                    type="checkbox"
                    :value="getLesson(day, period).timetable_id"
                    v-model="selectedLessonIds"
                  />
                  <span class="lesson-info">
                    <span class="class-pill">{{ getLesson(day, period).class_name }}</span>
                    <span class="subject-name">{{ subjectLabel(getLesson(day, period)) }}</span>
                  </span>
                </label>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="selection-summary">
        {{ selectedLessons.length }} {{ tr('lessons selected', '堂已選課堂') }}
      </div>

      <button type="button" class="primary-btn" :disabled="selectedLessons.length === 0" @click="goNext">
        {{ tr('Next', '下一頁') }}
      </button>
    </section>
  </main>
</template>

<script>
import axios from 'axios';
import { subjectLabel as formatSubjectLabel } from '../../utils/timetableLabels';

const DAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DAY_LABELS = {
  Mon: '\u661f\u671f\u4e00',
  Tue: '\u661f\u671f\u4e8c',
  Wed: '\u661f\u671f\u4e09',
  Thu: '\u661f\u671f\u56db',
  Fri: '\u661f\u671f\u4e94',
  Sat: '\u661f\u671f\u516d'
};

export default {
  data() {
    return {
      lessons: [],
      selectedLessonIds: []
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
    selectedLessons() {
      return this.lessons.filter(lesson =>
        this.selectedLessonIds.some(id => Number(id) === Number(lesson.timetable_id))
      );
    }
  },
  async mounted() {
    const token = localStorage.getItem('token');
    const teacherId = this.$route.query.teacherId;

    try {
      const res = await axios.get(`/api/swap/teacher-lessons/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.lessons = res.data;
    } catch (err) {
      console.error('Failed to load lessons:', err);
    }
  },
  methods: {
    tr(en, zh) {
      return this.$lang.locale === 'en' ? en : zh;
    },
    periodText(period) {
      return this.$lang.locale === 'en' ? 'Period ' + period : '\u7b2c' + period + '\u7bc0';
    },
    dayLabel(day) {
      const en = { Mon: 'Mon', Tue: 'Tue', Wed: 'Wed', Thu: 'Thu', Fri: 'Fri', Sat: 'Sat' }[day] || day;
      return this.$lang.locale === 'en' ? en : (DAY_LABELS[day] || day);
    },
    getLesson(day, period) {
      return this.lessons.find(lesson =>
        lesson.day === day && Number(lesson.period) === Number(period)
      );
    },
    subjectLabel(lesson) {
      return formatSubjectLabel(lesson, this.$lang.locale);
    },
    isSelected(lesson) {
      return this.selectedLessonIds.some(id => Number(id) === Number(lesson.timetable_id));
    },
    goNext() {
      if (this.selectedLessons.length === 0) {
        alert(this.tr('Please select at least one lesson.', '請至少選擇一堂課。'));
        return;
      }

      this.$router.push({
        name: 'SwapLessonResult',
        query: {
          teacherId: this.$route.query.teacherId,
          teacherName: this.$route.query.teacherName,
          lessons: JSON.stringify(this.selectedLessons.map(lesson => ({
            timetableId: lesson.timetable_id,
            day: lesson.day,
            period: lesson.period,
            classId: lesson.class_id,
            className: lesson.class_name,
            subject: lesson.subject || lesson.subject_name,
            subjectId: lesson.subject_id,
            subjectNameZh: lesson.subject_name_zh,
            subjectNameEn: lesson.subject_name_en
          })))
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
  width: fit-content;
  max-width: 100%;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  background: var(--surface-soft);
  color: var(--text);
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
  margin: 0 0 12px;
  padding: 8px 12px;
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
  height: 64px;
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
  width: 112px;
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

.lesson-card {
  min-height: 44px;
  display: grid;
  grid-template-columns: auto 1fr;
  align-items: center;
  gap: 9px;
  border: 1px solid #c7dbe3;
  border-radius: 7px;
  background: #f6fbfd;
  color: var(--text);
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.25;
  padding: 8px 10px;
  position: relative;
}

.lesson-card:hover,
.lesson-card.selected {
  border-color: var(--primary);
  background: var(--primary-soft);
  box-shadow: 0 4px 10px rgba(11, 114, 133, 0.12);
}

.lesson-card input {
  margin: 0;
  accent-color: var(--primary);
}

.lesson-info {
  min-width: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  overflow: hidden;
}

.class-pill {
  flex: 0 0 auto;
  border-radius: 999px;
  background: #dff3f6;
  color: #0a5260;
  font-size: 12px;
  padding: 4px 8px;
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

.selection-summary {
  color: var(--text-muted);
  font-weight: 800;
  margin-top: 18px;
  text-align: center;
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
