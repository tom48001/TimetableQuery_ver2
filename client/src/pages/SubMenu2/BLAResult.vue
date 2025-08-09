<template>
  <div>
    <h1>最佳學習態度學生提名結果</h1>
    <h3>選擇科目：</h3>
    <div class="subject-grid">
      <select v-model="selectedSubject">
        <option v-for="subject in subjects" :key="subject.subject_id" :value="subject.subject_id">
          {{ subject.subject_name }}
        </option>
      </select>
    </div>
    <div class="text-center">
      <button @click="fetchBLA">查詢選修科目</button>
    </div>
    <!-- 顯示結果 -->
    <div v-if="BLAResults.length">
      <h3>提名結果：</h3>
      <ul>
        <li v-for="b in BLAResults" :key="b.BLA_id">
          學生：{{ b.student_ch_name || b.student_id }}
          學生ID: {{ b.student_id }}
          提名老師ID: {{ b.teacher_name }}
        </li>
      </ul>
    </div>
    <p v-else-if="searched">查無提名結果</p>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      subjects: [],
      selectedSubject: '',
      BLAResults: [],
      searched: false,
      teacher_id: null
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
    async fetchBLA() {
      if (!this.selectedSubject) {
        alert('請選擇科目');
        return;
      }
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:3000/api/bla/results', {
          params: {
            subject_id: this.selectedSubject
          },
          headers: { Authorization: `Bearer ${token}` }
        });
        this.BLAResults = res.data;
        this.searched = true;
      } catch (err) {
        console.error('查詢提名結果失敗', err);
        this.BLAResults = [];
        this.searched = true;
      }
    }
  },
  async mounted() {
    await this.fetchSubjects();
  }
};
</script>

<style>
h1 {
  text-align: center;
  margin-top: 50px;
}
.text-center {
  text-align: center;
  margin: 15px 0;
}
.subject-grid {
  margin: 10px 0;
}
</style>
