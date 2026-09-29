<template>
  <main class="settings-page">
    <section class="settings-shell">
      <header><h1>{{ tr('Semester & Junior Subject Settings', '學期及初中科目設定') }}</h1></header>

      <section class="settings-card">
        <h2>{{ tr('Current semester', '目前學期設定') }}</h2>
        <div class="settings-grid">
          <label>
            <span>{{ tr('Academic year', '目前學年') }}</span>
            <input v-model.trim="settings.academic_year" placeholder="2026-2027" />
          </label>
          <label>
            <span>{{ tr('Current semester', '目前學期') }}</span>
            <select v-model.number="settings.current_semester">
              <option :value="1">{{ tr('First Semester', '上學期') }}</option>
              <option :value="2">{{ tr('Second Semester', '下學期') }}</option>
            </select>
          </label>
          <div class="automatic-status">
            <span>{{ tr('Automatic semester switching', '自動切換學期') }}</span>
            <strong>{{ tr('Off', '關閉') }}</strong>
          </div>
        </div>
        <button type="button" class="primary-btn" :disabled="savingSettings" @click="saveSettings">
          {{ savingSettings ? tr('Saving...', '儲存中...') : tr('Save settings', '儲存設定') }}
        </button>
      </section>

      <section class="settings-card">
        <div class="rules-header">
          <div><h2>{{ tr('Junior subject allocation rules', '初中科目分組規則') }}</h2><p>{{ tr('A = odd, B = even, continuing by class letter.', 'A 為單數組、B 為雙數組，按班別字母順序類推。') }}</p></div>
          <button type="button" class="secondary-btn" @click="addRule">{{ tr('Add rule', '新增規則') }}</button>
        </div>

        <div v-if="rules.length" class="rule-list">
          <div v-for="(rule, index) in rules" :key="rule.localKey" class="rule-row">
            <select v-model="rule.grade"><option v-for="grade in grades" :key="grade" :value="grade">{{ grade }}</option></select>
            <select v-model.number="rule.semester">
              <option :value="1">{{ tr('First Semester', '上學期') }}</option>
              <option :value="2">{{ tr('Second Semester', '下學期') }}</option>
            </select>
            <select v-model.number="rule.subject_id">
              <option value="">{{ tr('Select subject', '選擇科目') }}</option>
              <option v-for="subject in subjects" :key="subject.subject_id" :value="subject.subject_id">{{ subjectLabel(subject) }}</option>
            </select>
            <select v-model="rule.class_group">
              <option value="odd">{{ tr('Odd', '單數') }}</option>
              <option value="even">{{ tr('Even', '雙數') }}</option>
              <option value="all">{{ tr('All classes', '全班') }}</option>
              <option value="disabled">{{ tr('Disabled', '停用') }}</option>
            </select>
            <button type="button" class="remove-btn" @click="rules.splice(index, 1)">{{ tr('Delete', '刪除') }}</button>
          </div>
        </div>
        <p v-else class="empty-state">{{ tr('No rules yet. Add a rule to begin.', '尚未設定規則，請新增規則。') }}</p>
        <button type="button" class="primary-btn" :disabled="savingRules" @click="saveRules">
          {{ savingRules ? tr('Saving...', '儲存中...') : tr('Save rules', '儲存規則') }}
        </button>
      </section>
    </section>
  </main>
</template>

<script>
import axios from 'axios';
import { subjectLabel as formatSubjectLabel } from '../../utils/timetableLabels';

export default {
  data() {
    return {
      settings: { academic_year: '', current_semester: 1 },
      subjects: [],
      rules: [],
      grades: ['F1', 'F2', 'F3'],
      nextKey: 1,
      savingSettings: false,
      savingRules: false
    };
  },
  methods: {
    tr(en, zh) { return this.$lang.locale === 'en' ? en : zh; },
    subjectLabel(subject) { return formatSubjectLabel(subject, this.$lang.locale); },
    headers() { return { Authorization: `Bearer ${localStorage.getItem('token')}` }; },
    normalizedRule(rule) {
      return { grade: rule.grade, semester: Number(rule.semester), subject_id: Number(rule.subject_id), class_group: rule.class_group };
    },
    addRule() {
      this.rules.push({ localKey: `new-${this.nextKey++}`, grade: 'F1', semester: 1, subject_id: '', class_group: 'disabled' });
    },
    async load() {
      try {
        const { data } = await axios.get('/api/system-settings/semester', { headers: this.headers() });
        this.settings = data.settings;
        this.subjects = data.subjects;
        this.rules = data.rules.map(rule => ({ ...rule, localKey: `saved-${rule.rule_id}` }));
      } catch (error) {
        console.error(error);
        alert(this.tr('Failed to load settings.', '載入設定失敗。'));
      }
    },
    async saveSettings() {
      this.savingSettings = true;
      try {
        const { data } = await axios.put('/api/system-settings/semester', this.settings, { headers: this.headers() });
        this.settings = data;
        alert(this.tr('Settings saved.', '設定已儲存。'));
      } catch (error) {
        alert((error.response && error.response.data && error.response.data.error) || this.tr('Failed to save settings.', '儲存設定失敗。'));
      } finally { this.savingSettings = false; }
    },
    async saveRules() {
      if (this.rules.some(rule => !rule.subject_id)) { alert(this.tr('Please select a subject for every rule.', '請為每項規則選擇科目。')); return; }
      this.savingRules = true;
      try {
        await axios.put('/api/system-settings/junior-subject-rules', { rules: this.rules.map(this.normalizedRule) }, { headers: this.headers() });
        await this.load();
        alert(this.tr('Rules saved.', '規則已儲存。'));
      } catch (error) {
        alert((error.response && error.response.data && error.response.data.error) || this.tr('Failed to save rules.', '儲存規則失敗。'));
      } finally { this.savingRules = false; }
    }
  },
  mounted() { this.load(); }
};
</script>

<style scoped>
.settings-page { min-height: calc(100vh - 126px); padding: 38px 20px 60px; box-sizing: border-box; }
.settings-shell { max-width: 1080px; margin: auto; }
h1, h2 { color: #122635; margin: 0; }
h1 { font-size: 30px; }
h2 { font-size: 20px; }
.settings-card { background: #fff; border: 1px solid #d1e0e5; border-radius: 8px; box-shadow: 0 12px 30px rgba(25,54,69,.09); margin-top: 20px; padding: 22px; }
.settings-grid { display: grid; grid-template-columns: repeat(3, minmax(0,1fr)); gap: 14px; margin-top: 18px; }
label, .automatic-status { display: flex; flex-direction: column; gap: 7px; color: #355465; font-size: 13px; font-weight: 800; }
input, select { border: 1px solid #b8cad3; border-radius: 6px; background: #fff; box-sizing: border-box; color: #243f51; height: 42px; padding: 0 10px; }
.automatic-status { border: 1px solid #d7e2e7; border-radius: 6px; justify-content: center; padding: 0 12px; }
.automatic-status strong { color: #9d3028; }
.rules-header { align-items: center; display: flex; justify-content: space-between; gap: 16px; }
.rules-header p { color: #607683; font-size: 13px; margin: 6px 0 0; }
.rule-list { display: grid; gap: 9px; margin-top: 18px; }
.rule-row { display: grid; grid-template-columns: 90px 150px minmax(220px,1fr) 130px 70px; gap: 9px; }
.primary-btn, .secondary-btn, .remove-btn { border: 0; border-radius: 6px; cursor: pointer; font-weight: 800; min-height: 40px; padding: 0 16px; }
.primary-btn { background: #0b7285; color: #fff; margin-top: 18px; }
.secondary-btn { background: #e0f1f2; color: #0a5260; }
.remove-btn { background: #fbe5e3; color: #9d3028; }
button:disabled { cursor: not-allowed; opacity: .55; }
.empty-state { color: #607683; margin: 20px 0 0; }
@media (max-width: 760px) { .settings-grid, .rule-row { grid-template-columns: 1fr; } .rules-header { align-items: stretch; flex-direction: column; } }
</style>
