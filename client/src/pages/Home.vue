<template>
  <div class="schedule-container">
    <h1>{{ $t('home.title') }}</h1>
    <table class="timetable">
      <thead>
        <tr>
          <th>{{ $t('common.dayPeriod') }}</th>
          <th v-for="day in days" :key="day">{{ dayLabel(day) }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(label, index) in periodLabels" :key="index" :class="periodRowClass(index + 1)">
          <th v-html="label"></th>
          <td v-for="day in days" :key="day">
            <div
              v-for="item in getCell(day, index + 1)"
              :key="item.teacher_id + '-' + item.period_name"
              class="cell-entry"
              :class="{ 'red-entry': item.period_name === 'Period 11' || item.period_name === 'Period 12' }"
            >
              <span class="teacher-line">{{ $t('common.lessonTeacher') }}: {{ item.teacher_name }}</span>
              <strong class="lesson-line">{{ item.class_name }} | {{ displaySubject(item) }}</strong>
              <span class="room-line">{{ displayRoom(item.room_name) }}</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';
import { roomLabel, subjectLabel } from '../utils/timetableLabels';

export default {
  name: 'Home',
  data() {
    return {
      teacherId: null,
      teachers: [],
      schedule: [],
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    };
  },
  computed: {
    periodLabels() {
      return [
        this.periodLabel(1, '08:30-09:05'),
        this.periodLabel(2, '09:05-09:40'),
        this.periodLabel(3, '09:55-10:30'),
        this.periodLabel(4, '10:30-11:05'),
        this.periodLabel(5, '11:20-11:55'),
        this.periodLabel(6, '11:55-12:30'),
        this.periodLabel(7, '13:30-14:05'),
        this.periodLabel(8, '14:05-14:40'),
        this.periodLabel(9, '14:40-15:15', '14:50-15:25'),
        this.periodLabel(10, '15:25-16:00', '15:25-16:00')
      ];
    }
  },
  methods: {
    dayLabel(day) {
      return this.$t(`day.${day}`);
    },
    displaySubject(item) {
      return subjectLabel(item, this.$lang.locale);
    },
    displayRoom(roomName) {
      return roomLabel(roomName, this.$lang.locale);
    },
    periodLabel(period, time, redTime) {
      const label = this.$lang.locale === 'en' ? `Period ${period}` : `\u7b2c${period}\u7bc0`;
      const redLine = redTime ? `<br><span class="red-time">\u7d05 (${redTime})</span>` : '';
      return `${label}<br><small>(${time})${redLine}</small>`;
    },
    periodRowClass(periodNumber) {
      return [3, 4, 7, 8, 11, 12].includes(periodNumber) ? 'period-row-blue' : 'period-row-purple';
    },
    async getTeacherId() {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const decoded = jwtDecode(token);
        const userId = decoded.id;

        const res = await axios.get(`/api/teachers/from-user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.teacherId = res.data.teacher_id;
      } catch (error) {
        console.error('Failed to load teacher id:', error);
      }
    },
    async fetchSchedule() {
      try {
        const token = localStorage.getItem('token');
        if (!this.teacherId) {
          console.warn('teacherId is missing');
          return;
        }

        const res = await axios.post(
          '/api/teachers/schedule',
          { teacherIds: [this.teacherId] },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.schedule = res.data;
      } catch (err) {
        alert(this.$t('common.loadTeacherScheduleFailed'));
        console.error(err);
      }
    },
    getCell(day, periodIndex) {
      const currentPeriod = `Period ${periodIndex}`;
      let result = this.schedule.filter(
        (item) => item.day === day && item.period_name === currentPeriod
      );

      if (periodIndex === 9) {
        const period11 = this.schedule.filter(
          (item) => item.day === day && item.period_name === 'Period 11'
        );
        result = result.concat(period11);
      }
      if (periodIndex === 10) {
        const period12 = this.schedule.filter(
          (item) => item.day === day && item.period_name === 'Period 12'
        );
        result = result.concat(period12);
      }

      return result;
    }
  },
  async mounted() {
    await this.getTeacherId();
    this.fetchSchedule();
  }
};
</script>
<style scoped>
.schedule-container {
  padding: 20px;
  max-width: 1200px;
  margin: auto;
}

.timetable {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.timetable th,
.timetable td {
  border: 1px solid #ccc;
  padding: 8px;
  vertical-align: top;
  text-align: center;
}

.timetable th {
  background-color: #f0f0f0;
}

.timetable tbody tr.period-row-purple th,
.timetable tbody tr.period-row-purple td {
  background-color: #eef4ff;
  color: var(--text);
}

.timetable tbody tr.period-row-purple .teacher-line,
.timetable tbody tr.period-row-purple .room-line {
  color: #64748b;
}

.timetable tbody tr.period-row-purple .cell-entry + .cell-entry {
  border-top-color: #64748b;
}

.timetable tbody tr.period-row-purple .red-entry {
  background-color: #eef4ff;
}

.timetable tbody tr.period-row-blue th,
.timetable tbody tr.period-row-blue td {
  background-color: #ffffff;
}

.cell-entry {
  background-color: transparent;
  padding: 8px 4px;
}

.cell-entry + .cell-entry {
  border-top: 1px dashed #64748b;
}

.teacher-line,
.lesson-line,
.room-line {
  display: block;
}

.teacher-line,
.room-line {
  color: #64748b;
}

.red-entry {
  background-color: #ffeaea;
}

.red-time {
  color: #b2352f;
}
</style>
