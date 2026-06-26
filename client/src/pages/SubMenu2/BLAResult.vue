<template>
  <main class="result-page">
    <section class="page-panel">
      <header class="page-header">
        <div>
          <h1>{{ tr('Best Learning Attitude Results', '最佳學習態度學生提名結果') }}</h1>
        </div>
        <span class="summary-pill">{{ BLAResults.length }} {{ tr('records', '項記錄') }}</span>
      </header>

      <div class="table-wrap">
        <table v-if="BLAResults.length" class="result-table">
          <thead>
            <tr>
              <th class="class-col">{{ tr('Class', '班別') }}</th>
              <th class="code-col">{{ tr('No.', '編號') }}</th>
              <th class="name-col">{{ tr('Name', '姓名') }}</th>
              <th>{{ tr('Nominated Subjects', '獲提名科目') }}</th>
              <th class="count-col">{{ tr('Subject Count', '科目數') }}</th>
              <th class="award-col">{{ tr('Award', '獲獎') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in BLAResults" :key="row.student_id">
              <td class="center">{{ row.class_name }}</td>
              <td>{{ row.student_id }}</td>
              <td class="name">
                {{ row.student_ch_name || row.student_id }}
                <small v-if="row.student_eng_name">{{ row.student_eng_name }}</small>
              </td>
              <td>{{ subjectNames(row) }}</td>
              <td class="center">
                <span class="count-badge">{{ row.subject_count }} {{ tr('subjects', '\u79d1') }}</span>
              </td>
              <td class="center">
                <span v-if="row.award" class="award-badge">{{ row.award }}</span>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-if="searched && BLAResults.length === 0" class="empty-state">
          {{ tr('No nomination records.', '沒有提名記錄。') }}
        </p>
      </div>
    </section>
  </main>
</template>

<script>
import axios from 'axios';
import { subjectLabel as formatSubjectLabel } from '../../utils/timetableLabels';

export default {
  data() {
    return {
      BLAResults: [],
      searched: false
    };
  },
  methods: {
    tr(en, zh) {
      return this.$lang.locale === 'en' ? en : zh;
    },
    subjectLabel(subject) {
      return formatSubjectLabel(subject, this.$lang.locale);
    },
    subjectNames(row) {
      if (!row) return '';

      const ids = String(row.subject_ids || '').split(',').map(id => id.trim()).filter(Boolean);
      const names = String(row.subject_names || '').split(/[\u3001,]/);
      const subjects = names.map((name, index) => ({
        subject_id: ids[index],
        subject_name: name
      }));

      if (subjects.length === 0) return '';
      return subjects.map(subject => this.subjectLabel(subject)).join(this.$lang.locale === 'en' ? ', ' : '\u3001');
    },
    async fetchBLA() {
      const token = localStorage.getItem('token');

      try {
        const res = await axios.get('/api/bla/results', {
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
  width: 180px;
}

.count-col,
.award-col {
  width: 110px;
}
</style>
