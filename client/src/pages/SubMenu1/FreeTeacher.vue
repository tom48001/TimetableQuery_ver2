<template>
  <div class="container">
    <h1>搜尋空堂老師</h1>

    <!-- 選擇查詢條件 -->
    <div class="filters">
      <label>選擇星期：
        <select v-model="weekday">
          <option disabled value="">請選擇</option>
          <option v-for="day in ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']" :key="day" :value="day">{{ day }}</option>
        </select>
      </label>

      <label>節次：
        <select v-model="period">
          <option disabled value="">請選擇</option>
          <option v-for="n in 10" :key="n" :value="n">第 {{ n }} 節</option>
        </select>
      </label>

      <button @click="fetchFreeTeachers">查詢</button>
    </div>

    <!-- 顯示結果 -->
    <div v-if="teachers.length">
      <h3>空堂老師：</h3>
      <ul>
        <li v-for="t in teachers" :key="t.teacher_id">{{ t.teacher_name }}</li>
      </ul>
    </div>

    <p v-else-if="searched">查無空堂老師</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      weekday: '',
      period: '',
      teachers: [],
      searched: false
    };
  },
  methods: {
    async fetchFreeTeachers() {
      if (!this.weekday || !this.period) {
        alert('請選擇星期和節次');
        return;
      }
      try {
        const token = localStorage.getItem('token');
        const res = await axios.post('http://localhost:3000/api/teachers/free-teachers', {
          weekday: this.weekday,
          period: this.period
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.teachers = res.data;
        this.searched = true;
      } catch (err) {
        console.error('查詢失敗：', err);
        alert('查詢錯誤');
      }
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 600px;
  margin: 40px auto;
  padding: 20px;
  background-color: #fdfdfd;
  border-radius: 10px;
  box-shadow: 0 4px 12px rgba(0,0,0,0.06);
}

h1 {
  text-align: center;
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 20px;
}

.filters {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.filters label {
  display: flex;
  flex-direction: column;
  font-weight: 500;
  color: #333;
}

select {
  margin-top: 6px;
  padding: 8px;
  font-size: 16px;
  border-radius: 6px;
  border: 1px solid #ccc;
}

button {
  margin-top: 10px;
  padding: 10px 14px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

button:hover {
  background-color: #0056b3;
}

ul {
  list-style: none;
  padding: 0;
  margin-top: 16px;
}

li {
  padding: 10px 14px;
  background-color: #f2f8ff;
  margin-bottom: 8px;
  border-radius: 6px;
  border-left: 4px solid #007bff;
  font-weight: 500;
}

p {
  text-align: center;
  color: #888;
  font-style: italic;
}

</style>
