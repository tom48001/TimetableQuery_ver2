<template>
  <div>
    <h1>上課與空堂時間表<br>(可選一人或多人)</h1>
    <div class="teacher-grid">
      <label v-for="teacher in teachers" :key="teacher.teacher_id"
        :class="['teacher-option', selectedTeacherId.includes(teacher.teacher_id) ? 'selected' : '']">
        <input type="checkbox" name="teacher" :value="teacher.teacher_id" v-model="selectedTeacherId" />
        {{ teacher.teacher_name }}
      </label>
    </div>
    <button @click="goNext">下一步</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      teachers: [],
      selectedTeacherId: []
    };
  },
  methods: {
    async fetchTeachers() {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/teachers/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.teachers = res.data;
    },
    goNext() {
      if (this.selectedTeacherId.length === 0) {
        alert('請選擇一位老師');
        return;
      }
      // 跳轉到下一頁或 fetch class 列表
      this.$router.push({ name: 'TeacherTimetableResult', query: { teacherId: this.selectedTeacherId } });
    }
  },
  mounted() {
    this.fetchTeachers();
  }
};
</script>

<style scoped>
h1 {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 1rem;
  text-align: center;
}

.teacher-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin: 20px 0;
}

.teacher-option {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: 8px;
  border: 2px solid #dcdcdc;
  background-color: #f9f9f9;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  min-width: 180px;
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.05);
}

.teacher-option:hover {
  background-color: #eaf3ff;
  border-color: #7ab8f5;
}

.teacher-option.selected {
  background-color: #007bff;
  color: white;
  border-color: #0056b3;
}

.teacher-option input[type="radio"] {
  margin-right: 8px;
  accent-color: #007bff;
}

button {
  display: block;
  margin: 30px auto;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}

@media (max-width: 600px) {
  .teacher-option {
    flex: 1 1 100%;
    justify-content: center;
  }
}
</style>
