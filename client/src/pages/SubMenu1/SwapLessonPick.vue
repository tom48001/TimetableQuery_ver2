<template>
  <div>
    <h2>請選擇要調的課堂</h2>
    <ul>
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

    const res = await axios.get(`http://localhost:3000/api/swap/teacher-lessons/${teacherId}`, {
      headers: { Authorization: `Bearer ${token}` }
    });

    this.lessons = res.data;
  },
  methods: {
    selectLesson(lesson) {
      this.$router.push({
        name: 'SwapLessonResult',
        query: {
          teacherId: this.$route.query.teacherId,
          day: lesson.day,
          period: lesson.period,
          subjectId: lesson.subject_id // 請記得你的後端有提供 subject_id
        }
      });
    }
  }
};
</script>
