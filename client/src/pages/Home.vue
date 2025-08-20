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
            <div v-for="item in getCell(day, index + 1)" :key="item.teacher_id" class="cell-entry">
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
import HeaderBar from '@/components/HeaderBar.vue'
import { jwtDecode } from 'jwt-decode';
import axios from 'axios';

export default {
  name: 'App',
  components: {
    HeaderBar
  },
  data() {
    return {
      teachers: [],
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
        '第9節<br><small>(14:40-15:15)</small>',
        '第10節<br><small>(15:25-16:00)</small>',
        '第11節<br><small>(15:25-16:00)</small>'
      ]
    };
  },
  methods: {
    async getTeacherId() {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const decoded = jwtDecode(token);
        const userId = decoded.id;

        // 呼叫後端，用 user_id 換 teacher_id
        const res = await axios.get(`http://localhost:3000/api/teachers/from-user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.teacherId = res.data.teacher_id;
        console.log('老師 ID:', this.teacherId);
      } catch (error) {
        console.error('取得 teacher_id 失敗:', error);
      }
    },
    async fetchSchedule() {
      try {
        const token = localStorage.getItem('token');
        if (!this.teacherId) {
          console.warn('teacherId 尚未設定');
          return;
        }

        const res = await axios.post(
          'http://localhost:3000/api/teachers/schedule',
          { teacherIds: [this.teacherId] },
          { headers: { Authorization: `Bearer ${token}` } }
        );

        this.schedule = res.data;
      } catch (err) {
        alert('載入課表失敗(client)');
        console.error(err);
      }
    },
    getCell(day, periodIndex) {
      const periodLabel = `Period ${periodIndex}`;
      return this.schedule.filter(
        (item) => item.day === day && item.period_name === periodLabel
      );
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

.cell-entry {
  background-color: #eef6ff;
  margin-bottom: 6px;
  padding: 4px;
  border-radius: 4px;
}
</style>
