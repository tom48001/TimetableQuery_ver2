<template>
  <main class="elective-page">
    <section class="elective-panel">
      <header class="page-header"><div><h1>{{ tr('Elective Timetable', '選修科時間表') }}</h1></div></header>
      <section class="selector-section"><h2>{{ tr('Form', '級別') }}</h2><div class="form-grid"><label v-for="formLevel in ['F4', 'F5', 'F6']" :key="formLevel" class="option-card" :class="{ selected: form === formLevel }"><input type="radio" :value="formLevel" v-model="form" />{{ formLevel }}</label></div></section>
      <section class="selector-section"><h2>{{ tr('Subject', '科目') }}</h2><input v-model.trim="searchText" class="search-input" type="text" :placeholder="tr('Search subject...', '搜尋科目...')" /><div class="subject-list"><label v-for="subject in filteredSubjects" :key="subject.subject_id" class="subject-row" :class="{ selected: selectedSubject === subject.subject_id }"><input type="radio" :value="subject.subject_id" v-model="selectedSubject" /><span>{{ subjectLabel(subject) }}</span></label></div></section>
      <button type="button" class="primary-btn" @click="goNext">{{ tr('Submit', '提交') }}</button>
    </section>
  </main>
</template>
<script>
import axios from 'axios';
import { subjectLabel as formatSubjectLabel } from '../../utils/timetableLabels';
export default {
  data() { return { subjects: [], selectedSubject: '', form: '', searchText: '' }; },
  computed: { filteredSubjects() { const keyword = this.searchText.toLowerCase(); if (!keyword) return this.subjects; return this.subjects.filter(subject => (String(subject.subject_name || '') + ' ' + this.subjectLabel(subject)).toLowerCase().includes(keyword)); } },
  methods: {
    tr(en, zh) { return this.$lang.locale === 'en' ? en : zh; },
    subjectLabel(subject) { return formatSubjectLabel(subject, this.$lang.locale); },
    async fetchSubjects() { const token = localStorage.getItem('token'); const res = await axios.get('http://localhost:3000/api/subjects/findElective', { headers: { Authorization: `Bearer ${token}` } }); this.subjects = res.data; },
    goNext() { if (!this.form) { alert(this.tr('Please select a form.', '請選擇級別。')); return; } if (!this.selectedSubject) { alert(this.tr('Please select a subject.', '請選擇科目。')); return; } this.$router.push({ name: 'ElectivesResult', query: { form: this.form, subject: this.selectedSubject } }); }
  },
  mounted() { this.fetchSubjects(); }
};
</script>
<style scoped>
.elective-page {
  min-height: calc(100vh - 126px);
  box-sizing: border-box;
  padding: 44px 20px 64px;
}

.elective-panel {
  max-width: 900px;
  margin: 0 auto;
  border: 1px solid #d1e0e5;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 38px rgba(25, 54, 69, 0.12);
  box-sizing: border-box;
  padding: 26px;
}

.page-header p {
  color: #0d6b78;
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 8px;
  text-transform: uppercase;
}

h1,
h2 {
  color: #122635;
  letter-spacing: 0;
  margin: 0;
}

h1 {
  font-size: 32px;
}

h2 {
  font-size: 21px;
}

.selector-section {
  border: 1px solid #d6e2e6;
  border-radius: 8px;
  background: #f7fafb;
  margin-top: 22px;
  padding: 16px;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(80px, 1fr));
  gap: 8px;
  margin-top: 14px;
}

.option-card,
.subject-row {
  min-height: 40px;
  display: flex;
  align-items: center;
  gap: 7px;
  border: 1px solid #d7e2e7;
  border-radius: 6px;
  background: #fff;
  color: #243f51;
  cursor: pointer;
  font-size: 14px;
  font-weight: 700;
  padding: 6px 9px;
}

.option-card:hover,
.option-card.selected,
.subject-row:hover,
.subject-row.selected {
  border-color: #0b7285;
  background: #e0f1f2;
  color: #0a5260;
}

.search-input {
  width: 100%;
  height: 44px;
  border: 1px solid #b8cad3;
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 15px;
  margin-top: 14px;
  padding: 0 12px;
}

.subject-list {
  max-height: 360px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 8px;
  overflow-y: auto;
  margin-top: 14px;
}

.subject-row span {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

input {
  accent-color: #0b7285;
}

.primary-btn {
  height: 48px;
  border: none;
  border-radius: 6px;
  background: #0b7285;
  color: #fff;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  margin-top: 22px;
  padding: 0 22px;
}

@media (max-width: 720px) {
  .elective-panel {
    padding: 20px;
  }

  .form-grid,
  .subject-list {
    grid-template-columns: 1fr;
  }

  .primary-btn {
    width: 100%;
  }
}
</style>
