<template>
  <div class="schedule-container">
    <h1>老師課表</h1>
    <table class="timetable">
      <thead>
        <tr>
          <th>節次 / 星期</th>
          <th v-for="day in days" :key="day">{{ day }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(label, index) in periodLabels" :key="index">
          <th v-html="label"></th>
          <td v-for="day in days" :key="day">
            <div
              v-for="item in getCell(day, index + 1)"
              :key="`${item.teacher_id}-${item.period_name}-${item.class_name}`"
              class="cell-entry"
              :class="{ 'red-entry': item.period_name === 'Period 11' || item.period_name === 'Period 12' }"
            >
              <strong>教師: {{ item.teacher_name }}</strong><br />
              {{ item.class_name }}｜{{ item.subject_name }}<br />
              {{ item.room_name }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="loaded && schedule.length === 0" class="empty-message">
      這些老師暫時沒有課表資料。請確認已成功匯入 timetable。
    </p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      loaded: false,
      schedule: [],
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      periodLabels: [
        '\u7b2c1\u7bc0<br><small>08:30-09:05</small>',
        '\u7b2c2\u7bc0<br><small>09:05-09:40</small>',
        '\u7b2c3\u7bc0<br><small>09:55-10:30</small>',
        '\u7b2c4\u7bc0<br><small>10:30-11:05</small>',
        '\u7b2c5\u7bc0<br><small>11:20-11:55</small>',
        '\u7b2c6\u7bc0<br><small>11:55-12:30</small>',
        '\u7b2c7\u7bc0<br><small>13:30-14:05</small>',
        '\u7b2c8\u7bc0<br><small>14:05-14:40</small>',
        '\u7b2c9\u7bc0<br><small>14:40-15:15<br>選修 14:50-15:25</small>',
        '\u7b2c10\u7bc0<br><small>15:25-16:00<br>選修 15:25-16:00</small>'
      ]
    };
  },
  methods: {
    normalizeTeacherIds(value) {
      const ids = Array.isArray(value) ? value : [value];
      return ids
        .flatMap(item => String(item || '').split(','))
        .map(item => item.trim())
        .filter(Boolean);
    },
    async fetchSchedule() {
      try {
        const token = localStorage.getItem('token');
        const ids = this.normalizeTeacherIds(this.$route.query.teacherId);

        const res = await axios.post('http://localhost:3000/api/teachers/schedule', {
          teacherIds: ids
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.schedule = res.data;
      } catch (err) {
        alert('\u8f09\u5165\u8ab2\u8868\u5931\u6557\u3002');
        console.error(err);
      } finally {
        this.loaded = true;
      }
    },
    getCell(day, periodIndex) {
      const currentPeriod = `Period ${periodIndex}`;
      let result = this.schedule.filter(
        item => item.day === day && item.period_name === currentPeriod
      );

      if (periodIndex === 9) {
        result = result.concat(
          this.schedule.filter(item => item.day === day && item.period_name === 'Period 11')
        );
      }

      if (periodIndex === 10) {
        result = result.concat(
          this.schedule.filter(item => item.day === day && item.period_name === 'Period 12')
        );
      }

      return result;
    }
  },
  mounted() {
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

h1 {
  color: var(--text);
  margin: 0 0 22px;
  text-align: center;
}

.timetable {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.timetable th,
.timetable td {
  border: 1px solid #cfdde3;
  padding: 8px;
  vertical-align: top;
  text-align: center;
}

.timetable th {
  background-color: #f3f8fa;
  font-weight: 800;
}

.cell-entry {
  background-color: #eef6ff;
  margin-bottom: 6px;
  padding: 7px 4px;
  border-radius: 4px;
  line-height: 1.35;
}

.cell-entry:last-child {
  margin-bottom: 0;
}

.red-entry {
  background-color: #ffeaea;
}

.empty-message {
  color: var(--text-muted);
  margin: 18px 0 0;
  padding: 28px;
  text-align: center;
}
</style>
