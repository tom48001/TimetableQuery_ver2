<template>
  <div class="container">
    <h1>可供調課的老師</h1>

    <div v-if="loading">載入中...</div>

    <table v-if="availableTeachers.length > 0">
      <thead>
        <tr>
          <th>老師名稱</th>
          <th>科目</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="teacher in availableTeachers" :key="teacher.teacher_id">
          <td>{{ teacher.teacher_name }}</td>
          <td>{{ teacher.subject_name }}</td>
        </tr>
      </tbody>
    </table>

    <div v-else-if="!loading">
      <p>此時段暫無可調課老師。</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'SwapLessonResult',
  data() {
    return {
      availableTeachers: [],
      loading: true
    };
  },
  async mounted() {
    const { day, period, subjectId } = this.$route.query;
    const token = localStorage.getItem('token');
    console.log('送出參數:', { day, period, subjectId });
    try {
      const res = await axios.post('http://localhost:3000/api/swap/substitute-candidates',
        {
          day,
          period,
          subjectId: parseInt(subjectId)
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );

      this.availableTeachers = res.data;
    } catch (err) {
      console.error('載入可調課老師失敗', err);
      alert('無法載入可調課老師，請稍後再試');
    } finally {
      this.loading = false;
    }
  }
};
</script>

<style scoped>
.container {
  padding: 20px;
  max-width: 800px;
  margin: auto;
  text-align: center;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 20px;
}

th,
td {
  border: 1px solid #ccc;
  padding: 10px;
}
</style>
