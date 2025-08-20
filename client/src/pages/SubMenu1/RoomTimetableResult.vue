<template>
  <div class="schedule-container">
    <h1>房間課表</h1>

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
              :key="item.timetable_id"
              class="cell-entry"
            >
              <strong>{{ item.teacher_name }}</strong><br />
              {{ item.class_name }}｜{{ item.subject_name }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      schedule: [],
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      periodLabels: [
        '第1節<br><small>(08:30-09:05)</small>',
        '第2節<br><small>(09:05-09:40)</small>',
        '第3節<br><small>(09:55-10:30)</small>',
        '第4節<br><small>(10:30-11:05)</small>',
        '第5節<br><small>(11:20-11:55)</small>',
        '第6節<br><small>(11:55-12:30)</small>',
        '第7節<br><small>(13:30-14:05)</small>',
        '第8節<br><small>(14:05-14:40)</small>',
        '第9節<br><small>(14:40-15:15)</small>',
        '第10節<br><small>(15:25-16:00)</small>'
      ]
    };
  },
  mounted() {
    this.fetchSchedule();
  },
  methods: {
    async fetchSchedule() {
      try {
        const token = localStorage.getItem('token');
        const roomId = this.$route.query.roomId;
        const res = await axios.get(`http://localhost:3000/api/rooms/schedule/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.schedule = res.data;
      } catch (err) {
        alert('載入房間課表失敗');
      }
    },
    getCell(day, periodIndex) {
      const period = `Period ${periodIndex}`;
      return this.schedule.filter(item => item.day_of_week === day && item.period_name === period);
    }
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
.cell-entry {
  background-color: #eef6ff;
  margin-bottom: 6px;
  padding: 4px;
  border-radius: 4px;
}
</style>
