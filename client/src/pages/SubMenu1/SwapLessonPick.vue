<template>
  <main class="pick-page">
    <section class="pick-panel">
      <header class="page-header">
        <div>
          <p>Swap Lesson</p>
          <h1>&#x8ABF;&#x8AB2;&#x9078;&#x5802;</h1>
        </div>
        <span class="count-badge">&#x5DF2;&#x6392;&#x9664;&#x5206;&#x7D44;&#x8AB2;&#x5802;&#x548C;&#x9AD8;&#x4E2D;&#x9078;&#x4FEE;&#x79D1;</span>
      </header>

      <div class="table-wrap">
        <table class="lesson-table">
          <thead>
            <tr>
              <th class="period-col"></th>
              <th v-for="day in days" :key="day">{{ day }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="period in periodNumbers" :key="period">
              <th class="period-col">P{{ period }}</th>
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
                  <span>{{ getLesson(day, period).class_name }} {{ getLesson(day, period).subject }}</span>
                </label>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <button type="button" class="primary-btn" :disabled="!selectedLesson" @click="goNext">
        &#x4E0B;&#x4E00;&#x6B65;
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
  max-width: 1040px;
  margin: 0 auto;
  border: 1px solid #d1e0e5;
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
  margin-bottom: 22px;
}

.page-header p {
  color: #6f5d12;
  font-size: 13px;
  font-weight: 700;
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
  border: 1px solid #ded0a1;
  border-radius: 6px;
  background: #fffaf0;
  color: #6f5d12;
  font-size: 13px;
  font-weight: 700;
  padding: 9px 12px;
}

.table-wrap {
  border: 1px solid #ded7c5;
  border-radius: 8px;
  background: #faf7ef;
  overflow-x: auto;
  padding: 10px;
}

.lesson-table {
  width: 100%;
  min-width: 900px;
  border-collapse: separate;
  border-spacing: 6px;
  background: transparent;
  table-layout: fixed;
}

.lesson-table th,
.lesson-table td {
  border: 1px solid #ded7c5;
  border-radius: 6px;
  height: 42px;
  padding: 4px 8px;
  text-align: left;
  vertical-align: middle;
}

.lesson-table thead th {
  border-color: transparent;
  background: #4f6f52;
  color: #fff;
  font-size: 14px;
  letter-spacing: 0;
  text-align: center;
}

.period-col {
  width: 64px;
  border-color: transparent;
  background: #efe9d8;
  color: #4b4637;
  font-weight: 700;
  text-align: center;
  white-space: nowrap;
}

.lesson-table tbody td {
  background: #fff;
}

.lesson-table td.available {
  background: #fffdf3;
  border-color: #d8c88d;
}

.lesson-cell {
  min-height: 34px;
  display: flex;
  align-items: center;
  gap: 7px;
  color: #2f3e36;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.15;
}

.lesson-cell input {
  margin: 0;
}

.lesson-cell span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.lesson-cell.selected span {
  color: #2d5935;
  font-weight: 700;
}

.primary-btn {
  display: block;
  border: none;
  border-radius: 6px;
  background: #4f6f52;
  color: #fff;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  height: 46px;
  margin: 22px auto 0;
  padding: 0 22px;
}

.primary-btn:disabled {
  background: #d8d0bd;
  color: #776f61;
  cursor: not-allowed;
}

.primary-btn:not(:disabled):hover {
  background: #3f5e43;
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
