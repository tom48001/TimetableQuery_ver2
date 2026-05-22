<template>
  <div>
    <h1>風紀提名結果</h1>
    <div class="results-container">
      <table class="results-table">
        <thead>
          <tr>
            <th>學生</th>
            <th>提名老師</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="n in nominationResults" :key="n.student_id">
            <td>{{ n.student_ch_name || n.student_id }}</td>
            <td>{{ n.teacher_names }}</td>
          </tr>
        </tbody>
      </table>

      <p v-if="searched && nominationResults.length === 0" class="empty-state">
        暫時沒有風紀提名結果
      </p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      nominationResults: [],
      searched: false
    };
  },
  methods: {
    async fetchPrefectResults() {
      const token = localStorage.getItem('token');

      try {
        const res = await axios.get('http://localhost:3000/api/prefect/results', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.nominationResults = res.data;
        this.searched = true;
      } catch (err) {
        console.error('Failed to load prefect nomination results:', err);
        this.nominationResults = [];
        this.searched = true;
      }
    }
  },
  mounted() {
    this.fetchPrefectResults();
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
  vertical-align: top;
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
