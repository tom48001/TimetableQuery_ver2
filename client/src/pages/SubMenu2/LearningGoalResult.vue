<template>
  <main class="result-page">
    <section class="page-panel">
      <header class="page-header">
        <div>
          <p>Result</p>
          <h1>學習目標獎勵計劃結果（上學期）</h1>
        </div>
        <span class="summary-pill">{{ results.length }} 名學生</span>
      </header>

      <div class="table-wrap">
        <table v-if="results.length" class="result-table">
          <thead>
            <tr>
              <th class="class-col">班別</th>
              <th class="number-col">學號</th>
              <th class="name-col">姓名</th>
              <th class="goals-col">完成目標總數</th>
              <th class="award-col">獲獎</th>
              <th class="offset-col">功過相抵數目</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in results" :key="row.student_id">
              <td class="center">{{ row.class_name }}</td>
              <td class="center">{{ row.class_number }}</td>
              <td class="name">{{ row.student_ch_name }}</td>
              <td class="center">
                <span class="count-badge">{{ row.completed_goals }}</span>
              </td>
              <td class="center">
                <span v-if="row.award" class="award-badge">{{ row.award }}</span>
              </td>
              <td class="center">{{ row.merit_offset_count }}</td>
            </tr>
          </tbody>
        </table>

        <p v-if="searched && results.length === 0" class="empty-state">
          沒有學習目標獎勵計劃結果
        </p>
      </div>
    </section>
  </main>
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
@import './result-theme.css';

.table-wrap {
  max-width: 980px;
}

.class-col,
.number-col {
  width: 90px;
}

.name-col {
  width: 150px;
}

.goals-col,
.award-col,
.offset-col {
  width: 140px;
}
</style>
