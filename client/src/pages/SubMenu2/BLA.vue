<template lang="">
  <div>
    <h1>最佳學習態度提名<br>選擇科目</h1>

    <div class="subject-grid">
      <select v-model="selectedSubject">
        <option v-for="subject in subjects" :key="subject.subject_id" :value="subject.subject_id">
          {{ subject.subject_name }}
        </option>
      </select>
    </div>
    <h1>選擇班別</h1>
    <div class="class-grid">
      <label
        v-for="cls in classList"
        :key="cls"
        class="class-option"
        :class="{ selected: selectedClass.includes(cls) }"
      >
        <input type="checkbox" :value="cls" v-model="selectedClass" />
        {{ cls.class_name }}
      </label>
    </div>
  </div>
</template>
<script>
import axios from 'axios';

export default {
  data() {
    return {
      subjects: [],
      selectedSubject: '',
      classList: [],
      selectedClass: []
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
    async fetchClasses() {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.classList = res.data;
    },
    goNext() {
      if (this.selectedTeacherId.length === 0) {
        alert('請選擇');
        return;
      }
      this.$router.push({ name: 'TeacherTimetableResult', query: { teacherId: this.selectedTeacherId } });
    }
  },
  mounted() {
    this.fetchSubjects();
    this.fetchClasses();
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

.class-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  max-width: 800px;
  margin: 40px auto;
  padding: 0 16px;
}

.class-option {
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

.class-option:hover {
  background-color: #eaf3ff;
  border-color: #7ab8f5;
}

.class-option.selected {
  background-color: #007bff;
  color: white;
  border-color: #0056b3;
}

.class-option input[type="radio"] {
  margin-right: 8px;
  accent-color: #007bff;
}

.subject-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin: 20px 0;
}
</style>
