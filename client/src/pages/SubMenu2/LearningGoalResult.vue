<template>
  <main class="result-page">
    <section class="page-panel">
      <header class="page-header">
        <div>
          <h1>{{ tr('Learning Goal Award Scheme Results (First Term)', '學習目標獎勵計劃結果（上學期）') }}</h1>
        </div>
        <span class="summary-pill">{{ results.length }} {{ tr('records', '項記錄') }}</span>
      </header>

      <div class="table-wrap">
        <table v-if="results.length" class="result-table">
          <thead>
            <tr>
              <th class="class-col">{{ tr('Class', '班別') }}</th>
              <th class="number-col">{{ tr('No.', '學號') }}</th>
              <th class="name-col">{{ tr('Name', '姓名') }}</th>
              <th class="goals-col">{{ tr('Completed Goals', '完成目標總數') }}</th>
              <th class="award-col">{{ tr('Award', '獲獎') }}</th>
              <th class="offset-col">{{ tr('Merit Offset Count', '功過相抵數目') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in results" :key="row.student_id">
              <td class="center">{{ row.class_name }}</td>
              <td class="center">{{ row.class_number }}</td>
              <td class="name">
                {{ row.student_ch_name || row.student_id }}
                <small v-if="row.student_eng_name">{{ row.student_eng_name }}</small>
              </td>
              <td class="center">
                <span class="count-badge">{{ row.completed_goals }}</span>
              </td>
              <td class="center">
                <span v-if="row.award" class="award-badge">{{ awardLabel(row.award) }}</span>
              </td>
              <td class="center">{{ row.merit_offset_count }}</td>
            </tr>
          </tbody>
        </table>

        <p v-if="searched && results.length === 0" class="empty-state">
          {{ tr('No records found.', '沒有記錄。') }}
        </p>
      </div>
    </section>
  </main>
</template>

<script>
import axios from 'axios';

const AWARD_LABELS = {
  '紀念品': 'Souvenir',
  '銅章獎': 'Bronze Award',
  '銀章獎': 'Silver Award',
  '金章獎': 'Gold Award'
};

export default {
  data() {
    return {
      results: [],
      searched: false
    };
  },
  methods: {
    tr(en, zh) {
      return this.$lang.locale === 'en' ? en : zh;
    },
    awardLabel(award) {
      if (this.$lang.locale !== 'en') return award;
      return AWARD_LABELS[award] || award;
    },
    async fetchResults() {
      const token = localStorage.getItem('token');

      try {
        const res = await axios.get('/api/learning-goals/results', {
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
  width: 190px;
}

.goals-col,
.award-col,
.offset-col {
  width: 140px;
}
</style>
