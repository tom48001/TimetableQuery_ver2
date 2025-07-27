<template>
  <div class="container">
    <h2>請選擇要調的課堂</h2>
    <ul class="lesson-list">
      <li v-for="lesson in lessons" :key="lesson.timetable_id">
        <button @click="selectLesson(lesson)">
          {{ lesson.day }} 第{{ lesson.period }}節 - {{ lesson.class_name }} - {{ lesson.subject }}
        </button>
      </li>
    </ul>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      lessons: []
    };
  },
  async mounted() {
    const token = localStorage.getItem('token');
    const teacherId = this.$route.query.teacherId;

    try {
      const res = await axios.get(`http://localhost:3000/api/swap/teacher-lessons/${teacherId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('拿到課堂資料:', res.data);
      this.lessons = res.data;
    } catch (err) {
      console.error('載入課堂失敗:', err);
    }
  },
  methods: {
    selectLesson(lesson) {
      this.$router.push({
        name: 'SwapLessonResult',
        query: {
          teacherId: this.$route.query.teacherId,
          day: lesson.day,
          period: lesson.period,
          subjectId: lesson.subject_id
        }
      });
    }
  }
};
</script>

<style scoped>
.container {
  max-width: 800px;
  margin: 0 auto;
  padding: 24px;
  text-align: center;
}

h2 {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 1.5rem;
}

.lesson-list {
  list-style: none;
  padding: 0;
}

.lesson-list li {
  margin: 10px 0;
}

.lesson-list button {
  width: 100%;
  padding: 12px 20px;
  font-size: 16px;
  font-weight: 500;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.lesson-list button:hover {
  background-color: #0056b3;
}

@media (max-width: 600px) {
  .lesson-list button {
    font-size: 14px;
    padding: 10px 16px;
  }
}
</style>
