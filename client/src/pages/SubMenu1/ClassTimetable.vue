<template>
  <div class="schedule-container">
    <h1>各班上課時間表</h1>

    <div class="selector">
      <label for="classSelect">選擇班別：</label>
      <select id="classSelect" v-model="selectedClass" @change="fetchTimetable">
        <option disabled value="">請選擇</option>
        <option v-for="cls in classList" :key="cls.class_id" :value="cls.class_id">
          {{ cls.class_name }}
        </option>
      </select>
    </div>

    <table class="timetable" v-if="timetable.length > 0">
      <thead>
        <tr>
          <th>老師名稱</th>
          <th>班別</th>
          <th>班房</th>
          <th>科目</th>
          <th>星期</th>
          <th>節次</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="item in timetable" :key="item.timetable_id">
          <td>{{ item.teacher_name }}</td>
          <td>{{ item.class_name }}</td>
          <td>{{ item.room_name }}</td>
          <td>{{ item.subject_name }}</td>
          <td>{{ item.day_of_week }}</td>
          <td>{{ item.period_name }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'ClassTimetable',
  data() {
    return {
      classList: [],
      selectedClass: '',
      timetable: []
    };
  },
  mounted() {
    this.loadClassList();
  },
  methods: {
    async loadClassList() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/api/classes', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        this.classList = res.data;
      } catch (err) {
        console.error('無法取得班別清單', err);
      }
    },
    async fetchTimetable() {
      if (!this.selectedClass) return;
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get(
          `http://localhost:3000/api/classes/schedule/${this.selectedClass}`,
          {
            headers: {
              Authorization: `Bearer ${token}`
            }
          }
        );
        this.timetable = res.data;
      } catch (err) {
        console.error('取得課表錯誤', err);
      }
    }
  }
};
</script>

<style scoped>
.schedule-container {
  padding: 20px;
  max-width: 1000px;
  margin: auto;
}

.selector {
  margin-bottom: 20px;
}

select {
  padding: 6px;
  font-size: 16px;
}

table.timetable {
  width: 100%;
  border-collapse: collapse;
}

table th,
table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
}
</style>
