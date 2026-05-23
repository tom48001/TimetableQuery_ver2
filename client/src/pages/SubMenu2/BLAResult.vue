<template>
  <main class="result-page">
    <section class="page-panel">
      <header class="page-header">
        <div>
          <h1>最佳學習態度學生提名結果</h1>
        </div>
        <span class="summary-pill">{{ BLAResults.length }} 名學生</span>
      </header>

      <div class="table-wrap">
        <table v-if="BLAResults.length" class="result-table">
          <thead>
            <tr>
              <th class="code-col">編號</th>
              <th class="name-col">姓名</th>
              <th>獲提名科目</th>
              <th class="count-col">科數</th>
              <th class="award-col">獲獎</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in BLAResults" :key="row.student_id">
              <td>{{ row.student_id }}</td>
              <td class="name">{{ row.student_ch_name || row.student_id }}</td>
              <td>{{ row.subject_names }}</td>
              <td class="center">
                <span class="count-badge">{{ row.subject_count }} 科</span>
              </td>
              <td class="center">
                <span v-if="row.award" class="award-badge">{{ row.award }}</span>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-if="searched && BLAResults.length === 0" class="empty-state">
          沒有提名結果
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
      BLAResults: [],
      searched: false
    };
  },
  methods: {
    async fetchBLA() {
      const token = localStorage.getItem('token');

      try {
        const res = await axios.get('http://localhost:3000/api/bla/results', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.BLAResults = res.data;
        this.searched = true;
      } catch (err) {
        console.error('Failed to load BLA results:', err);
        this.BLAResults = [];
        this.searched = true;
      }
    }
  },
  mounted() {
    this.fetchBLA();
  }
};
</script>

<style scoped>
@import './result-theme.css';

.table-wrap {
  max-width: 1040px;
}

.code-col {
  width: 90px;
}

.name-col {
  width: 130px;
}

.count-col,
.award-col {
  width: 110px;
}
</style>
