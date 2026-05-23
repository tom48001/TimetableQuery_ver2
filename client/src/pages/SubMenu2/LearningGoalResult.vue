<template>
  <main class="print-page">
    <h1>學習目標獎勵計劃結果（上學期）</h1>

    <div class="table-wrap">
      <table v-if="results.length" class="print-table">
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
            <td>{{ row.student_ch_name }}</td>
            <td class="center">{{ row.completed_goals }}</td>
            <td class="center">{{ row.award }}</td>
            <td class="center">{{ row.merit_offset_count }}</td>
          </tr>
        </tbody>
      </table>

      <p v-if="searched && results.length === 0" class="empty-state">
        沒有學習目標獎勵計劃結果
      </p>
    </div>
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
.print-page {
  box-sizing: border-box;
  min-height: calc(100vh - 126px);
  padding: 24px 20px 56px;
  background: #fff;
  color: #000;
}

h1 {
  margin: 0 0 38px;
  text-align: center;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 0;
}

.table-wrap {
  max-width: 760px;
  margin: 0 auto;
  overflow-x: auto;
}

.print-table {
  width: 100%;
  border: 1px solid #444;
  border-collapse: separate;
  border-spacing: 2px;
  background: #fff;
}

.print-table th,
.print-table td {
  border: 1px solid #666;
  padding: 4px 6px;
  font-size: 16px;
  line-height: 1.35;
  vertical-align: middle;
}

.print-table th {
  font-weight: 800;
  text-align: center;
}

.class-col {
  width: 74px;
}

.number-col {
  width: 70px;
}

.name-col {
  width: 120px;
}

.goals-col {
  width: 110px;
}

.award-col {
  width: 112px;
}

.offset-col {
  width: 112px;
}

.center {
  text-align: center;
}

.empty-state {
  margin-top: 28px;
  text-align: center;
}

@media print {
  .print-page {
    min-height: 0;
    padding: 0;
  }
}
</style>
