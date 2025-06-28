<template lang="">
  <div>
    <h1>高中選修名單</h1>
    <h3>選擇年級：</h3>
    <div class="class-grid">
      <label v-for="formLevel in ['F1', 'F2', 'F3', 'F4', 'F5', 'F6']" :key="formLevel" class="form-option">
        <input type="radio" :value="formLevel" v-model="form" />
        {{ formLevel }}
      </label>
    </div>
    <h3>選擇科目：</h3>
    <div class="subject-grid">
      <select v-model="selectedSubject">
        <option v-for="subject in subjects" :key="subject.subject_id" :value="subject.subject_id">
          {{ subject.subject_name }}
        </option>
      </select>
    </div>
    <div class="text-center">
      <button @click="goNext">查詢選修科目</button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      subjects: [],
      selectedSubject: [],
      form: ''
    };
  },
  methods: {
    async fetchSubjects() {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/subjects/findElective', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.subjects = res.data;
    },
    goNext() {
      if (!this.form) {
        alert('請選擇年級');
        return;
      }
      if (this.selectedSubject.length === 0) {
        alert('請選擇科目');
        return;
      }
      // 跳轉到下一頁或 fetch class 列表
      this.$router.push({
        name: 'ElectivesResult',
        query: {
          form: this.form,
          subject: this.selectedSubject
        }
      });
    }
  },
  mounted() {
    this.fetchSubjects();
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

.subject-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin: 20px 0;
}

.class-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin: 20px 0;
}

.form-option {
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

.form-option:hover {
  background-color: #eaf3ff;
  border-color: #7ab8f5;
}

.form-option.selected {
  background-color: #007bff;
  color: white;
  border-color: #0056b3;
}

.form-option input[type="radio"] {
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
