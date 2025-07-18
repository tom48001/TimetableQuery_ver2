<template>
  <div class="container">
    <h1>查閱學生上課時間表</h1>

    <div>
      <label>選擇班別：</label>
      <select v-model="selectedClass" @change="fetchStudents">
        <option disabled value="">請選擇</option>
        <option v-for="cls in classes" :key="cls.class_id" :value="cls.class_id">
          {{ cls.class_name }}
        </option>
      </select>
    </div>

    <div v-if="students.length > 0">
      <label>選擇學生：</label>
      <select v-model="selectedStudent">
        <option disabled value="">請選擇</option>
        <option v-for="student in students" :key="student.student_id" :value="student.student_id">
          {{ student.student_name }}
        </option>
      </select>
    </div>

    <button @click="goToResult" :disabled="!selectedStudent">
      查閱時間表
    </button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'StudentTimetable',
  data() {
    return {
      classes: [],
      selectedClass: '',
      students: [],
      selectedStudent: ''
    };
  },
  async mounted() {
    const token = localStorage.getItem('token');
    const res = await axios.get('http://localhost:3000/api/classes', {
      headers: { Authorization: `Bearer ${token}` }
    });
    this.classes = res.data;
  },
  methods: {
    async fetchStudents() {
      if (!this.selectedClass) return;
      const token = localStorage.getItem('token');
      const res = await axios.get(`http://localhost:3000/api/students/by-class/${this.selectedClass}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.students = res.data;
    },
    goToResult() {
      this.$router.push({
        name: 'StdTimetableResult',
        query: { studentId: this.selectedStudent }
      });
    }
  }
};
</script>

<style scoped>
.container {
  text-align: center;
  margin: 30px auto;
  max-width: 500px;
}
select {
  margin: 10px;
  padding: 6px;
}
button {
  padding: 8px 16px;
  font-size: 16px;
}
</style>
