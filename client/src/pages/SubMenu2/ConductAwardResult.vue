<template>
  <main class="result-page">
    <section class="page-panel">
      <header class="page-header">
        <div>
          <h1>{{ tr('Conduct Award Results', '操行獎提名統計結果') }}</h1>
        </div>
        <div class="header-actions"><span class="summary-pill">{{ nominationResults.length }} {{ tr('records', '項記錄') }}</span><ResetNominationsButton @reset="fetchConductResults" /></div>
      </header>

      <div class="table-wrap">
        <table v-if="nominationResults.length" class="result-table">
          <thead>
            <tr>
              <th class="class-col">{{ tr('Class', '班別') }}</th>
              <th class="code-col">{{ tr('No.', '編號') }}</th>
              <th class="name-col">{{ tr('Name', '姓名') }}</th>
              <th>{{ tr('Nominated Teachers', '提名老師') }}</th>
              <th class="count-col">{{ tr('Nomination Count', '提名人數') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in nominationResults" :key="row.student_id">
              <td class="center">{{ row.class_name }}</td>
              <td>{{ row.student_id }}</td>
              <td class="name">
                {{ row.student_ch_name || row.student_id }}
                <small v-if="row.student_eng_name">{{ row.student_eng_name }}</small>
              </td>
              <td>{{ teacherNames(row.teacher_names) }}</td>
              <td class="center">
                <span class="count-badge">{{ teacherCount(row.teacher_names) }}</span>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-if="searched && nominationResults.length === 0" class="empty-state">
          {{ tr('No nomination records.', '沒有提名記錄。') }}
        </p>
      </div>
    </section>
  </main>
</template>

<script>
import axios from 'axios';
import ResetNominationsButton from './ResetNominationsButton.vue';

export default {
  components: { ResetNominationsButton },
  data() {
    return {
      nominationResults: [],
      searched: false
    };
  },
  methods: {
    tr(en, zh) {
      return this.$lang.locale === 'en' ? en : zh;
    },
    uniqueTeachers(names) {
      return Array.from(new Set(String(names || '').split(',').map(name => name.trim()).filter(Boolean)));
    },
    teacherNames(names) {
      return this.uniqueTeachers(names).join(', ');
    },
    teacherCount(names) {
      return this.uniqueTeachers(names).length;
    },
    async fetchConductResults() {
      const token = localStorage.getItem('token');

      try {
        const res = await axios.get('/api/conduct/results', {
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
  width: 190px;
}

.count-col {
  width: 120px;
}
</style>
