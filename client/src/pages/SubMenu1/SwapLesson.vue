<template>
  <main class="swap-page">
    <section class="swap-panel">
      <header class="page-header"><div><h1>{{ tr('Teacher to Swap', '需要調課老師') }}</h1></div><span class="count-badge">{{ teachers.length }} {{ tr('teachers', '老師') }}</span></header>
      <label class="search-box"><span>{{ tr('Search teacher', '搜尋老師') }}</span><input v-model.trim="searchText" type="text" :placeholder="tr('Enter teacher name...', '輸入老師名稱...')" /></label>
      <div class="teacher-list" v-if="filteredTeachers.length">
        <label v-for="teacher in filteredTeachers" :key="teacher.teacher_id" class="teacher-row" :class="{ selected: selectedTeacherId === teacher.teacher_id }">
          <input type="radio" name="teacher" :value="teacher.teacher_id" v-model="selectedTeacherId" /><span>{{ teacher.teacher_name }}</span>
        </label>
      </div>
      <p v-else class="empty-message">{{ tr('No teachers found', '找不到老師') }}</p>
      <footer class="footer-actions"><button type="button" class="primary-btn" @click="goNext">{{ tr('Next', '下一頁') }}</button></footer>
    </section>
  </main>
</template>
<script>
import axios from 'axios';
function sortTeachersByName(teachers) { return [...teachers].sort((a, b) => String(a.teacher_name || '').localeCompare(String(b.teacher_name || ''), 'en', { sensitivity: 'base' })); }
export default {
  data() { return { teachers: [], selectedTeacherId: null, searchText: '' }; },
  computed: {
    filteredTeachers() { const keyword = this.searchText.toLowerCase(); if (!keyword) return this.teachers; return this.teachers.filter(teacher => String(teacher.teacher_name || '').toLowerCase().includes(keyword)); },
    selectedTeacherName() { const selected = this.teachers.find(teacher => teacher.teacher_id === this.selectedTeacherId); return selected ? selected.teacher_name : ''; }
  },
  methods: {
    tr(en, zh) { return this.$lang.locale === 'en' ? en : zh; },
    async fetchTeachers() { try { const token = localStorage.getItem('token'); const res = await axios.get('/api/teachers/list', { headers: { Authorization: `Bearer ${token}` } }); this.teachers = sortTeachersByName(res.data); } catch (err) { console.error('Failed to load teachers:', err); alert(this.tr('Failed to load teachers.', '載入老師列表失敗。')); } },
    goNext() { if (!this.selectedTeacherId) { alert(this.tr('Please select a teacher.', '請選擇老師。')); return; } this.$router.push({ name: 'SwapLessonPick', query: { teacherId: this.selectedTeacherId, teacherName: this.selectedTeacherName } }); }
  },
  mounted() { this.fetchTeachers(); }
};
</script>
<style scoped>
.swap-page {
  min-height: calc(100vh - 126px);
  box-sizing: border-box;
  padding: 44px 20px 64px;
}

.swap-panel {
  max-width: 940px;
  margin: 0 auto;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--shadow);
  box-sizing: border-box;
  padding: 26px;
}

.page-header,
.footer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.page-header p {
  color: var(--primary);
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 8px;
  text-transform: uppercase;
}

h1 {
  color: var(--text);
  font-size: 32px;
  letter-spacing: 0;
  margin: 0;
}

.count-badge {
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  background: var(--surface-soft);
  color: var(--text-muted);
  font-weight: 700;
  padding: 9px 14px;
  white-space: nowrap;
}

.search-box {
  display: grid;
  gap: 7px;
  color: var(--text-muted);
  font-weight: 700;
  margin-top: 24px;
}

.search-box input {
  height: 44px;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  background: #fff;
  box-sizing: border-box;
  font-size: 15px;
  padding: 0 12px;
}

.search-box input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(11, 114, 133, 0.13);
  outline: none;
}

.teacher-list {
  max-height: 460px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(128px, 1fr));
  gap: 8px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-soft);
  margin-top: 18px;
  padding: 10px;
}

.teacher-row {
  min-height: 38px;
  display: flex;
  align-items: center;
  gap: 7px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #fff;
  color: var(--text);
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  padding: 5px 8px;
}

.teacher-row span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.teacher-row:hover,
.teacher-row.selected {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: #0a5260;
}

.teacher-row input {
  accent-color: var(--primary);
}

.empty-message {
  border: 1px dashed var(--border-strong);
  border-radius: 8px;
  color: var(--text-muted);
  margin: 18px 0 0;
  padding: 28px;
  text-align: center;
}

.footer-actions {
  color: var(--text-muted);
  margin-top: 18px;
}

button {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
}

.primary-btn {
  height: 48px;
  background: var(--primary);
  color: #fff;
  font-size: 15px;
  padding: 0 22px;
}

.primary-btn:hover {
  background: var(--primary-dark);
}

@media (max-width: 720px) {
  .swap-panel {
    padding: 20px;
  }

  .page-header,
  .footer-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .teacher-list {
    grid-template-columns: 1fr;
    max-height: 520px;
  }

  .primary-btn {
    width: 100%;
  }
}
</style>
