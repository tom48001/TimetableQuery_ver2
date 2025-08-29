<template>
  <div class="schedule-container">
    <h1>可觀課課表</h1>

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
                :key="item.teacher_id + '-' + item.period_name"
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
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      schedule: [],
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
      periodLabels: [
        '第1節<br><small>(08:30-09:05)</small>',
        '第2節<br><small>(09:05-09:40)</small>',
        '第3節<br><small>(09:55-10:30)</small>',
        '第4節<br><small>(10:30-11:05)</small>',
        '第5節<br><small>(11:20-11:55)</small>',
        '第6節<br><small>(11:55-12:30)</small>',
        '第7節<br><small>(13:30-14:05)</small>',
        '第8節<br><small>(14:05-14:40)</small>',
        '第9節<br><small>(14:40-15:15)<br>紅(14:50-15:25)</small>',
        '第10節<br><small>(15:25-16:00)<br>紅(15:25-16:00)</small>'
      ]
    };
  },
  methods: {
    async fetchSchedule() {
      try {
        const token = localStorage.getItem('token');
        const teacherIds = this.$route.query.observers;
        const ids = Array.isArray(teacherIds) ? teacherIds : [teacherIds];
        const id = this.$route.query.target;

        const res = await axios.post('http://localhost:3000/api/observation/observe/schedule', {
          observerIds: ids,
          targetId: id
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.schedule = Array.isArray(res.data.targetSchedule) ? res.data.targetSchedule : [];
      } catch (err) {
        alert('載入課表失敗(client)');
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

.cell-entry {
  background-color: #eef6ff;
  margin-bottom: 6px;
  padding: 4px;
  border-radius: 4px;
}

.red-entry {
  background-color: #ffeaea;
}
</style>
