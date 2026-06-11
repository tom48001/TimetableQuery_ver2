<template>
  <main class="matrix-page">
    <section class="page-panel">
      <header class="page-header">
        <div>
          <h1>{{ tr('Best Learning Attitude Nomination', '\u6700\u4f73\u5b78\u7fd2\u614b\u5ea6\u63d0\u540d') }}</h1>
        </div>
      </header>

      <div class="table-wrap">
        <table class="choice-table">
          <thead>
            <tr>
              <th class="subject-col">{{ tr('Subject', '\u79d1\u76ee') }}</th>
              <th v-for="cls in visibleClassList" :key="cls.class_id">{{ cls.class_name }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="subject in subjects" :key="subject.subject_id">
              <th class="subject-col">{{ subjectLabel(subject) }}</th>
              <td v-for="cls in visibleClassList" :key="`${subject.subject_id}-${cls.class_id}`" :class="{ unavailable: !isAvailable(subject.subject_id, cls.class_id) }">
                <label v-if="isAvailable(subject.subject_id, cls.class_id)" class="choice-cell" :class="{ selected: selectedChoice === choiceValue(subject, cls) }">
                  <input type="radio" name="subjectClass" :value="choiceValue(subject, cls)" v-model="selectedChoice" />
                  <span>{{ countFor(subject.subject_id, cls.class_id) }}</span>
                </label>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <footer class="actions">
        <button type="button" :disabled="!selectedChoice" @click="goNext">{{ tr('Next', '\u4e0b\u4e00\u6b65') }}</button>
      </footer>
    </section>
  </main>
</template>

<script>
import axios from 'axios';

const SUBJECT_LABELS = {
  1: 'Chinese Language',
  2: 'English Language',
  3: 'Mathematics',
  4: 'Citizenship and Social Development',
  5: 'Chinese Literature',
  6: 'Biology',
  7: 'Health Management and Social Care',
  8: 'Chinese History',
  9: 'Chemistry',
  10: 'Integrated Science',
  11: 'Visual Arts',
  12: 'Physics',
  13: 'Citizenship, Economics and Society',
  14: 'Economics',
  15: 'Information and Communication Technology',
  16: 'Technology and Living',
  17: 'History',
  18: 'Geography',
  19: 'Music',
  20: 'Physical Education'
};
export default {
  data() { return { subjects: [], classList: [], counts: {}, selectedChoice: '' }; },
  computed: {
    visibleClassList() {
      const classIds = new Set(Object.keys(this.counts).map(key => Number(key.split('-')[1])));
      return this.classList.filter(cls => classIds.has(Number(cls.class_id)));
    },
    selectedSubject() { if (!this.selectedChoice) return null; const subjectId = Number(this.selectedChoice.split('-')[0]); return this.subjects.find(subject => Number(subject.subject_id) === subjectId); },
    selectedClassId() { if (!this.selectedChoice) return null; return Number(this.selectedChoice.split('-')[1]); }
  },
  methods: {
    tr(en, zh) { return this.$lang.locale === 'en' ? en : zh; },
    subjectLabel(subject) { return this.$lang.locale === 'en' ? (SUBJECT_LABELS[Number(subject.subject_id)] || subject.subject_name) : subject.subject_name; },
    choiceValue(subject, cls) { return `${subject.subject_id}-${cls.class_id}`; },
    countKey(subjectId, classId) { return `${subjectId}-${classId}`; },
    isAvailable(subjectId, classId) { return this.counts[this.countKey(subjectId, classId)] !== undefined; },
    countFor(subjectId, classId) { const value = this.counts[this.countKey(subjectId, classId)]; return value === undefined ? '' : value; },
    async fetchSubjects() { const token = localStorage.getItem('token'); const res = await axios.get('http://localhost:3000/api/subjects', { headers: { Authorization: `Bearer ${token}` } }); this.subjects = res.data; },
    async fetchClasses() { const token = localStorage.getItem('token'); const res = await axios.get('http://localhost:3000/api/classes', { headers: { Authorization: `Bearer ${token}` } }); this.classList = res.data; },
    async fetchCounts() {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/subjects/class-counts', { headers: { Authorization: `Bearer ${token}` } });
      const nextCounts = {};
      res.data.forEach(row => { nextCounts[this.countKey(row.subject_id, row.class_id)] = Number(row.student_count) || 0; });
      this.counts = nextCounts;
    },
    goNext() {
      if (!this.selectedSubject || !this.selectedClassId) { alert(this.tr('Please select a class and subject.', '\u8acb\u9078\u64c7\u73ed\u5225\u8207\u79d1\u76ee\u3002')); return; }
      this.$router.push({ name: 'BLAvote', query: { selectedSubject: JSON.stringify(this.selectedSubject), selectedClass: JSON.stringify([this.selectedClassId]) } });
    }
  },
  mounted() { this.fetchSubjects(); this.fetchClasses(); this.fetchCounts(); }
};
</script>
<style scoped>
.matrix-page {
  min-height: calc(100vh - 126px);
  padding: 34px 20px 56px;
}

.page-panel {
  max-width: 1260px;
  margin: 0 auto;
  padding: 26px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 22px;
}

.page-header p {
  color: var(--primary);
  font-size: 13px;
  font-weight: 800;
  margin: 0 0 8px;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  text-align: left;
}

.summary-pill {
  border: 1px solid var(--border);
  border-radius: 999px;
  background: var(--primary-soft);
  color: var(--primary-dark);
  font-weight: 800;
  padding: 8px 13px;
  white-space: nowrap;
}

.table-wrap {
  overflow-x: auto;
}

.choice-table {
  width: 100%;
  min-width: 1100px;
  border-collapse: separate;
  border-spacing: 0;
}

.choice-table th,
.choice-table td {
  border-bottom: 1px solid var(--border);
  padding: 8px 6px;
  text-align: center;
  vertical-align: middle;
}

.choice-table thead th {
  position: sticky;
  top: 0;
  z-index: 1;
  background: var(--surface-soft);
  color: var(--muted);
  font-size: 13px;
}

.choice-table tbody tr:hover {
  background: #fbfdfe;
}

.subject-col {
  width: 154px;
  min-width: 154px;
  color: var(--text);
  font-weight: 800;
  text-align: left !important;
}

.choice-cell {
  min-width: 44px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 5px;
  border: 1px solid var(--border);
  border-radius: 999px;
  background: #fff;
  cursor: pointer;
  padding: 5px 9px;
}

.choice-cell input {
  margin: 0;
}

.choice-cell span {
  color: var(--primary-dark);
  font-weight: 800;
}

.choice-cell.selected {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.unavailable {
  background: repeating-linear-gradient(
    -45deg,
    #f8fafb,
    #f8fafb 6px,
    #eef3f5 6px,
    #eef3f5 12px
  );
}

.actions {
  display: flex;
  justify-content: center;
  margin-top: 22px;
}

.actions button {
  min-width: 120px;
  height: 44px;
}

@media (max-width: 720px) {
  .page-panel {
    padding: 20px;
  }

  .page-header {
    display: block;
  }

  .summary-pill {
    display: inline-block;
    margin-top: 14px;
  }
}
</style>
