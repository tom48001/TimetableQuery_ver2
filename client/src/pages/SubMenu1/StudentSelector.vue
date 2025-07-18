<template lang="">
  <div>
    <div>
      <h1>選擇學生並查詢課表</h1>
    </div>
    <div class="student-grid">
      <label v-for="student in studentList" :key="student.student_id" class="student-option">
        <input type="radio" :value="student" v-model="selectedStudent" />
        {{ student.student_ch_name }}
      </label>
    </div>
    <div class="text-center">
      <button @click="searchStudentsSchedule">
        查詢查詢課表
      </button>
    </div>
  </div>
</template>
<script>
import axios from 'axios';

export default {
  data() {
    return {
      studentList: [],
      selectedClass: '',
      selectedStudent: ''
    }
  },
  methods: {
    async fetchStudents() {
      const token = localStorage.getItem('token');
      const classid = this.$route.query.selectedClass.class_id
      console.log('fetching:', classid);

      const res = await axios.get(`http://localhost:3000/api/students/list-by-class/${classid}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('回傳資料:', res.data);
      this.studentList = await res.data;
    },
    searchStudentsSchedule() {
      if (!this.selectedStudent) {
        alert('請選擇一個學生');
        return;
      }
      this.$router.push({
        name: 'StudentTimetableResult',
        query: {
          studentId: this.selectedStudent.student_id
        }
      });
    }
  },
  mounted() {
    this.fetchStudents();
  }
}
</script>
<style scoped>
h1 {
  text-align: center;
  margin-top: 50px;
}

h3 {
  font-size: 20px;
  color: #34495e;
  margin-bottom: 0.5rem;
  text-align: center;
}

.student-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin: 20px 0;
}

.student-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 2px solid #dcdcdc;
  border-radius: 8px;
  background-color: #f9f9f9;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.05);
}

.student-option:hover {
  background-color: #eaf3ff;
  border-color: #7ab8f5;
}

.student-option.selected {
  background-color: #007bff;
  color: white;
  border-color: #0056b3;
}

.student-option input[type="radio"] {
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
</style>
