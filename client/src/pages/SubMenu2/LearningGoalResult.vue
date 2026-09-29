<template>
  <main class="result-page">
    <section class="page-panel">
      <header class="page-header">
        <div>
          <h1>{{ tr(`Learning Goal Award Scheme Results (${termLabel})`, `學習目標獎勵計劃結果（${termLabel}）`) }}</h1>
        </div>
        <div class="header-actions">
          <select v-model="selectedSemester" class="term-select" @change="fetchResults">
            <option value="first">{{ tr('First Term', '上學期') }}</option>
            <option value="second">{{ tr('Second Term', '下學期') }}</option>
          </select>
          <span class="summary-pill">{{ results.length }} {{ tr('records', '項記錄') }}</span>
          <button v-if="isManager" type="button" class="settings-button" @click="showRuleSettings = !showRuleSettings">
            {{ tr('Reward rules', '獎勵規則設定') }}
          </button>
          <ResetNominationsButton @reset="fetchResults" />
        </div>
      </header>

      <section v-if="isManager && showRuleSettings" class="rule-settings">
        <div class="rule-settings-heading">
          <div>
            <h2>{{ tr('Reward rules', '獎勵規則設定') }}</h2>
            <p>{{ tr('The current defaults follow the supplied scheme. You can change them later.', '目前預設跟隨圖片內的計劃，日後可隨時修改。') }}</p>
          </div>
          <button type="button" class="add-rule-button" @click="addRule">{{ tr('Add rule', '新增規則') }}</button>
        </div>

        <div class="rule-table-wrap">
          <table class="rule-table">
            <thead>
              <tr>
                <th>{{ tr('Minimum goals', '最少目標') }}</th>
                <th>{{ tr('Maximum goals', '最多目標') }}</th>
                <th>{{ tr('Award name', '獎項名稱') }}</th>
                <th>{{ tr('Prize', '獎品') }}</th>
                <th>{{ tr('Merits / offsets', '優點／抵銷缺點') }}</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="(rule, index) in rewardRules" :key="rule.rule_id || `new-${index}`">
                <td><input v-model.number="rule.min_goals" type="number" min="0" max="8" /></td>
                <td><input v-model.number="rule.max_goals" type="number" min="0" max="8" /></td>
                <td><input v-model.trim="rule.award_name" type="text" /></td>
                <td><input v-model="rule.has_prize" type="checkbox" /></td>
                <td><input v-model.number="rule.merit_offset_count" type="number" min="0" /></td>
                <td><button type="button" class="remove-rule-button" @click="removeRule(index)">{{ tr('Remove', '刪除') }}</button></td>
              </tr>
            </tbody>
          </table>
        </div>

        <div class="rule-actions">
          <button type="button" class="settings-button" :disabled="savingRules" @click="saveRewardRules">
            {{ savingRules ? tr('Saving...', '儲存中...') : tr('Save rules', '儲存規則') }}
          </button>
        </div>
      </section>

      <div class="table-wrap">
        <table v-if="results.length" class="result-table">
          <thead>
            <tr>
              <th class="sid-col">SID</th>
              <th class="class-col">{{ tr('Class', '班別') }}</th>
              <th class="number-col">{{ tr('No.', '學號') }}</th>
              <th class="name-col">{{ tr('Chinese Name', '中文姓名') }}</th>
              <th class="name-col">{{ tr('English Name', '英文姓名') }}</th>
              <th class="sex-col">{{ tr('Sex', '性別') }}</th>
              <th class="elective-col">{{ tr('Elective (Senior Forms)', '選修科（高中）') }}</th>
              <th class="goals-col">{{ tr('Completed Goals', '完成目標總數') }}</th>
              <th class="award-col">{{ tr('Award', '獲獎') }}</th>
              <th class="prize-col">{{ tr('Prize', '獎品') }}</th>
              <th class="offset-col">{{ tr('Merits / Demerits Offset', '優點／抵銷缺點') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="row in results" :key="row.student_id">
              <td>{{ row.sid }}</td>
              <td class="center">{{ row.class_name }}</td>
              <td class="center">{{ row.class_number }}</td>
              <td class="name">{{ row.student_ch_name || '—' }}</td>
              <td class="name">{{ row.student_eng_name || '—' }}</td>
              <td class="center">{{ row.sex || '—' }}</td>
              <td>{{ row.electives && row.electives.length ? row.electives.join('、') : '—' }}</td>
              <td class="center">
                <span class="count-badge">{{ row.completed_goals }}</span>
              </td>
              <td class="center">
                <span v-if="row.award" class="award-badge">{{ awardLabel(row.award) }}</span>
              </td>
              <td class="center">{{ row.prize ? tr('Yes', '有') : '—' }}</td>
              <td class="center">
                {{ row.merit_offset_count
                  ? tr(
                    `${row.merit_offset_count} merit(s) / offset ${row.merit_offset_count} demerit(s)`,
                    `${row.merit_offset_count} 個優點／抵銷 ${row.merit_offset_count} 個缺點`
                  )
                  : '—'
                }}
              </td>
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
import ResetNominationsButton from './ResetNominationsButton.vue';

const AWARD_LABELS = {
  '紀念品': 'Souvenir',
  '銅獎': 'Bronze Award',
  '銀獎': 'Silver Award',
  '金獎': 'Gold Award',
  '未獲獎': 'No Award'
};

export default {
  components: { ResetNominationsButton },
  data() {
    return {
      results: [],
      selectedSemester: 'first',
      rewardRules: [],
      showRuleSettings: false,
      savingRules: false,
      searched: false
    };
  },
  computed: {
    isManager() {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return String(user.role || '').toLowerCase() === 'manager';
      } catch (error) {
        return false;
      }
    },
    termLabel() {
      if (this.selectedSemester === 'second') return this.tr('Second Term', '下學期');
      return this.tr('First Term', '上學期');
    }
  },
  methods: {
    tr(en, zh) {
      return this.$lang.locale === 'en' ? en : zh;
    },
    awardLabel(award) {
      if (this.$lang.locale !== 'en') return award;
      return AWARD_LABELS[award] || award;
    },
    authHeaders() {
      return { Authorization: `Bearer ${localStorage.getItem('token')}` };
    },
    async fetchRewardRules() {
      try {
        const res = await axios.get('/api/learning-goals/reward-rules', {
          headers: this.authHeaders()
        });
        this.rewardRules = res.data.map(rule => ({ ...rule }));
      } catch (error) {
        console.error('Failed to load reward rules:', error);
      }
    },
    addRule() {
      this.rewardRules.push({
        min_goals: 0,
        max_goals: 0,
        award_name: '',
        has_prize: false,
        merit_offset_count: 0
      });
    },
    removeRule(index) {
      this.rewardRules.splice(index, 1);
    },
    async saveRewardRules() {
      this.savingRules = true;
      try {
        const res = await axios.put('/api/learning-goals/reward-rules', {
          rules: this.rewardRules
        }, {
          headers: this.authHeaders()
        });
        this.rewardRules = res.data.rules.map(rule => ({ ...rule }));
        await this.fetchResults();
        alert(this.tr('Reward rules saved.', '獎勵規則已儲存。'));
      } catch (error) {
        const data = error.response && error.response.data;
        alert((data && (data.error || data.message)) || this.tr('Failed to save reward rules.', '儲存獎勵規則失敗。'));
      } finally {
        this.savingRules = false;
      }
    },
    async fetchResults() {
      const token = localStorage.getItem('token');

      try {
        const res = await axios.get('/api/learning-goals/results', {
          params: { semester: this.selectedSemester },
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
    this.fetchRewardRules();
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

.sid-col {
  width: 110px;
}

.name-col {
  width: 190px;
}

.sex-col {
  width: 70px;
}

.elective-col {
  min-width: 210px;
}

.goals-col,
.award-col,
.prize-col,
.offset-col {
  width: 140px;
}

.offset-col {
  width: 230px;
}

.term-select {
  min-height: 38px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fff;
  color: var(--text);
  font: inherit;
  font-weight: 700;
  padding: 7px 11px;
}

.settings-button,
.add-rule-button {
  min-height: 40px;
  border: 1px solid var(--primary);
  border-radius: 8px;
  background: var(--primary);
  color: #fff;
  cursor: pointer;
  font-weight: 800;
  padding: 8px 14px;
}

.rule-settings {
  border: 1px solid var(--border);
  border-radius: 10px;
  background: var(--surface-soft);
  margin-bottom: 22px;
  padding: 18px;
}

.rule-settings-heading {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 14px;
}

.rule-settings h2,
.rule-settings p {
  margin: 0;
}

.rule-settings p {
  color: var(--muted);
  margin-top: 5px;
}

.rule-table-wrap {
  overflow-x: auto;
}

.rule-table {
  width: 100%;
  border-collapse: collapse;
}

.rule-table th,
.rule-table td {
  border-bottom: 1px solid var(--border);
  padding: 9px;
  text-align: left;
}

.rule-table input[type='number'],
.rule-table input[type='text'] {
  box-sizing: border-box;
  width: 100%;
  min-width: 90px;
  border: 1px solid var(--border);
  border-radius: 6px;
  padding: 8px;
}

.remove-rule-button {
  border: 0;
  background: transparent;
  color: #b91c1c;
  cursor: pointer;
  font-weight: 800;
}

.rule-actions {
  display: flex;
  justify-content: flex-end;
  margin-top: 14px;
}
</style>
