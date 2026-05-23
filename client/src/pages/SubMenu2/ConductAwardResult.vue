<template>
  <main class="result-page">
    <section class="page-panel">
      <header class="page-header">
        <div>
          <p>Result</p>
          <h1>操行獎提名統計結果</h1>
        </div>
        <span class="summary-pill">{{ nominationResults.length }} 名學生</span>
      </header>

      <div class="table-wrap">
        <table v-if="nominationResults.length" class="result-table">
          <thead>
            <tr>
              <th class="code-col">編號</th>
              <th class="name-col">姓名</th>
              <th>提名老師</th>
              <th class="count-col">提名人數</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in nominationResults" :key="row.student_id">
              <td>{{ row.student_id }}</td>
              <td class="name">{{ row.student_ch_name || row.student_id }}</td>
              <td>{{ row.teacher_names }}</td>
              <td class="center">
                <span class="count-badge">{{ teacherCount(row.teacher_names) }}</span>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-if="searched && nominationResults.length === 0" class="empty-state">
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
      nominationResults: [],
      searched: false
    };
  },
  methods: {
    teacherCount(names) {
      if (!names) return 0;
      return String(names).split(',').map(name => name.trim()).filter(Boolean).length;
    },
    async fetchConductResults() {
      const token = localStorage.getItem('token');

      try {
        const res = await axios.get('http://localhost:3000/api/conduct/results', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.nominationResults = res.data;
        this.searched = true;
      } catch (err) {
        console.error('Failed to load conduct award results:', err);
        this.nominationResults = [];
        this.searched = true;
      }
    }
  },
  mounted() {
    this.fetchConductResults();
  }
};
</script>

<style scoped>
@import './result-theme.css';

.table-wrap {
  max-width: 900px;
}

.code-col {
  width: 90px;
}

.name-col {
  width: 150px;
}

.count-col {
  width: 120px;
}
</style>
