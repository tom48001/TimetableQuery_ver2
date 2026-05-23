<template>
  <main class="print-page">
    <h1>操行獎提名統計結果</h1>

    <div class="table-wrap">
      <table v-if="nominationResults.length" class="print-table">
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
            <td>{{ row.student_ch_name || row.student_id }}</td>
            <td>{{ row.teacher_names }}</td>
            <td class="center">{{ teacherCount(row.teacher_names) }}</td>
          </tr>
        </tbody>
      </table>

      <p v-if="searched && nominationResults.length === 0" class="empty-state">
        沒有提名結果
      </p>
    </div>
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
.print-page {
  box-sizing: border-box;
  min-height: calc(100vh - 126px);
  padding: 24px 20px 56px;
  background: #fff;
  color: #000;
}

h1 {
  margin: 0 0 42px;
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
  text-align: left;
  vertical-align: middle;
}

.print-table th {
  font-weight: 800;
}

.code-col {
  width: 58px;
}

.name-col {
  width: 96px;
}

.count-col {
  width: 48px;
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
