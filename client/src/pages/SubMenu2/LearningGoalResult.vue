<template>
  <div>
    <h1>學習目標獎勵計劃結果</h1>
    <div class="results-container">
      <table class="results-table">
        <thead>
          <tr>
            <th>班別</th>
            <th>學號</th>
            <th>姓名</th>
            <th>完成目標總數</th>
            <th>獲獎</th>
            <th>功過相抵數目</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="result in results" :key="result.student_id">
            <td>{{ result.class_name }}</td>
            <td>{{ result.class_number }}</td>
            <td>{{ result.student_ch_name }}</td>
            <td>{{ result.completed_goals }}</td>
            <td>{{ result.award }}</td>
            <td>{{ result.merit_offset_count }}</td>
          </tr>
        </tbody>
      </table>

      <p v-if="searched && results.length === 0" class="empty-state">
        暫時沒有學習目標獎勵計劃結果
      </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      results: [],
      searched: false
    };
  },
  methods: {
    async fetchResults() {
      const token = localStorage.getItem('token');

      try {
        const res = await axios.get('http://localhost:3000/api/learning-goals/results', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.results = res.data;
        this.searched = true;
      } catch (err) {
        console.error('Failed to load learning goal results:', err);
        this.results = [];
        this.searched = true;
      }
    }
  },
  mounted() {
    this.fetchResults();
  }
};
</script>

<style scoped>
h1 {
  text-align: center;
  margin-top: 50px;
}

.results-container {
  padding: 20px;
  max-width: 1200px;
  margin: auto;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
}

.results-table th,
.results-table td {
  border: 1px solid #ccc;
  padding: 8px;
  text-align: center;
}

.results-table th {
  background-color: #f0f0f0;
}

.empty-state {
  text-align: center;
  margin-top: 24px;
}
</style>
