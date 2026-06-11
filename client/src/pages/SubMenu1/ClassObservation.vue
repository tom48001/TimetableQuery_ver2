<template>
  <main class="observation-page">
    <section class="observation-panel">
      <header class="page-header"><div><h1>{{ tr('Class Observation Timetable', '可觀課課表') }}</h1></div><span class="count-badge">{{ observerIds.length }} {{ tr('selected', '已選') }}</span></header>
      <section class="selector-card">
        <div class="section-title"><h2>{{ tr('Observer teachers', '觀課老師') }}</h2><button type="button" class="secondary-btn" @click="clearObservers">{{ tr('Clear', '清除') }}</button></div>
        <input v-model.trim="observerSearch" class="search-input" type="text" :placeholder="tr('Search observer...', '搜尋觀課老師...')" />
        <div class="selected-strip" v-if="observerTeachers.length"><button v-for="teacher in observerTeachers" :key="teacher.teacher_id" type="button" class="selected-chip" @click="toggleObserver(teacher.teacher_id)">{{ teacher.teacher_name }} <span aria-hidden="true">x</span></button></div>
        <div class="teacher-list"><label v-for="teacher in filteredObservers" :key="teacher.teacher_id" class="teacher-row" :class="{ selected: observerIds.includes(teacher.teacher_id) }"><input type="checkbox" :value="teacher.teacher_id" v-model="observerIds" /><span>{{ teacher.teacher_name }}</span></label></div>
      </section>
      <section class="selector-card">
        <div class="section-title"><h2>{{ tr('Target teacher', '被觀課老師') }}</h2></div>
        <input v-model.trim="targetSearch" class="search-input" type="text" :placeholder="tr('Search target teacher...', '搜尋被觀課老師...')" />
        <div class="teacher-list target-list"><label v-for="teacher in filteredTargets" :key="teacher.teacher_id" class="teacher-row" :class="{ selected: targetId === teacher.teacher_id }"><input type="radio" name="targetTeacher" :value="teacher.teacher_id" v-model="targetId" /><span>{{ teacher.teacher_name }}</span></label></div>
      </section>
      <footer class="footer-actions"><button type="button" class="primary-btn" @click="searchSchedule">{{ tr('Search Timetable', '搜尋課表') }}</button></footer>
    </section>
  </main>
</template>
<script>
import axios from 'axios';
export default {
  data() { return { teachers: [], observerIds: [], targetId: null, observerSearch: '', targetSearch: '' }; },
  computed: { filteredObservers() { return this.filterTeachers(this.observerSearch); }, filteredTargets() { return this.filterTeachers(this.targetSearch); }, observerTeachers() { return this.teachers.filter(teacher => this.observerIds.includes(teacher.teacher_id)); } },
  methods: {
    tr(en, zh) { return this.$lang.locale === 'en' ? en : zh; },
    filterTeachers(keyword) { const text = keyword.toLowerCase(); if (!text) return this.teachers; return this.teachers.filter(teacher => String(teacher.teacher_name || '').toLowerCase().includes(text)); },
    async fetchTeachers() { try { const token = localStorage.getItem('token'); const res = await axios.get('http://localhost:3000/api/teachers/list', { headers: { Authorization: `Bearer ${token}` } }); this.teachers = res.data; } catch (err) { console.error('Failed to load teachers:', err); alert(this.tr('Failed to load teachers.', '載入老師列表失敗。')); } },
    toggleObserver(teacherId) { const index = this.observerIds.indexOf(teacherId); if (index >= 0) this.observerIds.splice(index, 1); else this.observerIds.push(teacherId); },
    clearObservers() { this.observerIds = []; },
    searchSchedule() { if (this.observerIds.length === 0) { alert(this.tr('Please select observer teachers.', '請選擇觀課老師。')); return; } if (!this.targetId) { alert(this.tr('Please select a target teacher.', '請選擇被觀課老師。')); return; } this.$router.push({ name: 'ClassObservationResult', query: { observers: this.observerIds, target: this.targetId } }); }
  },
  mounted() { this.fetchTeachers(); }
};
</script>
<style scoped>
.observation-page {
  min-height: calc(100vh - 126px);
  box-sizing: border-box;
  padding: 44px 20px 64px;
}

.observation-panel {
  max-width: 1080px;
  margin: 0 auto;
  border: 1px solid #d1e0e5;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 38px rgba(25, 54, 69, 0.12);
  box-sizing: border-box;
  padding: 26px;
}

.page-header,
.section-title,
.footer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
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

.count-badge,
.muted {
  border: 1px solid #b8cad3;
  border-radius: 6px;
  background: #f7fafb;
  color: #27485b;
  font-weight: 700;
  padding: 9px 12px;
}

.selector-card {
  border: 1px solid #d6e2e6;
  border-radius: 8px;
  background: #f7fafb;
  margin-top: 22px;
  padding: 18px;
}

.search-input {
  width: 100%;
  height: 44px;
  border: 1px solid #b8cad3;
  border-radius: 6px;
  background: #fff;
  box-sizing: border-box;
  font-size: 15px;
  margin-top: 14px;
  padding: 0 12px;
}

.search-input:focus {
  border: 2px solid #0b7285;
}

button {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
}

.secondary-btn {
  height: 40px;
  border: 1px solid #b8cad3;
  background: #fff;
  color: #244152;
  padding: 0 14px;
}

.secondary-btn:hover,
.selected-chip:hover {
  border-color: #0b7285;
  color: #0b7285;
}

.selected-strip {
  max-height: 78px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  overflow-y: auto;
  margin-top: 12px;
}

.selected-chip {
  border: 1px solid #b8cad3;
  background: #fff;
  color: #244152;
  padding: 8px 10px;
}

.selected-chip span {
  color: #8799a4;
  margin-left: 6px;
}

.teacher-list {
  max-height: 300px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 7px;
  overflow-y: auto;
  margin-top: 14px;
}

.target-list {
  max-height: 240px;
}

.teacher-row {
  min-height: 36px;
  display: flex;
  align-items: center;
  gap: 7px;
  border: 1px solid #d7e2e7;
  border-radius: 6px;
  background: #fff;
  color: #243f51;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  padding: 5px 8px;
}

.teacher-row span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.teacher-row:hover {
  border-color: #86adba;
  background: #eef7f8;
}

.teacher-row.selected {
  border-color: #0b7285;
  background: #e0f1f2;
  color: #0a5260;
}

.teacher-row input {
  flex: 0 0 auto;
  accent-color: #0b7285;
}

.footer-actions {
  color: #607683;
  margin-top: 20px;
}

.primary-btn {
  min-height: 48px;
  background: #0b7285;
  color: #fff;
  font-size: 15px;
  padding: 0 22px;
}

.primary-btn:hover {
  background: #085c6b;
}

@media (max-width: 720px) {
  .observation-panel {
    padding: 20px;
  }

  .page-header,
  .section-title,
  .footer-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .teacher-list {
    grid-template-columns: 1fr;
  }

  .primary-btn,
  .secondary-btn {
    width: 100%;
  }
}
</style>
