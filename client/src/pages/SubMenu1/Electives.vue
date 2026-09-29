<template>
  <main class="elective-page">
    <section class="elective-panel">
      <header class="page-header"><div><h1>{{ tr('Elective Timetable', '選修科時間表') }}</h1></div></header>
      <section class="selector-section form-section">
        <h2>{{ tr('Form', '級別') }}</h2>
        <div class="form-grid">
          <label v-for="formLevel in ['F4', 'F5', 'F6']" :key="formLevel" class="option-card" :class="{ selected: form === formLevel }">
            <input type="radio" :value="formLevel" v-model="form" />{{ formLevel }}
          </label>
        </div>
      </section>

      <section class="selector-section">
        <h2>{{ tr('Elective group', '選修組別') }}</h2>
        <div class="block-tabs" role="tablist" :aria-label="tr('Elective group', '選修組別')">
          <button
            v-for="block in electiveBlocks"
            :key="block"
            type="button"
            role="tab"
            class="block-tab"
            :class="{ active: activeBlock === block, chosen: selectedBlock === block && selectedSubject }"
            :aria-selected="activeBlock === block ? 'true' : 'false'"
            @click="activeBlock = block"
          >
            {{ block }}
          </button>
        </div>

        <input v-model.trim="searchText" class="search-input" type="text" :placeholder="tr('Search subject...', '搜尋科目...')" />

        <div class="subject-heading">
          <h3>{{ activeBlock }} {{ tr('elective subjects', '選修科目') }}</h3>
          <span>{{ tr(`${currentSubjects.length} subjects`, `${currentSubjects.length} 個科目`) }}</span>
        </div>

        <div v-if="currentSubjects.length" class="subject-grid">
          <label
            v-for="subject in currentSubjects"
            :key="`${activeBlock}-${subject.subject_id}`"
            class="subject-row"
            :class="{ selected: selectedBlock === activeBlock && selectedSubject === subject.subject_id }"
          >
            <input
              type="radio"
              name="electiveSubject"
              :value="subject.subject_id"
              v-model="selectedSubject"
              @change="selectedBlock = activeBlock"
            />
            <span :title="subjectLabel(subject)">{{ subjectLabel(subject) }}</span>
          </label>
        </div>
        <p v-else class="empty-message">{{ emptySubjectMessage }}</p>
      </section>

      <button type="button" class="primary-btn" @click="goNext">{{ tr('Submit', '提交') }}</button>
    </section>
  </main>
</template>
<script>
import axios from 'axios';
import { subjectLabel as formatSubjectLabel } from '../../utils/timetableLabels';
export default {
  data() {
    return {
      subjects: [],
      electiveBlocks: ['X1', 'X2', 'X3'],
      activeBlock: 'X1',
      selectedSubject: '',
      selectedBlock: '',
      form: '',
      searchText: ''
    };
  },
  computed: {
    subjectsByBlock() {
      return this.electiveBlocks.reduce((groups, block) => {
        groups[block] = this.subjects.filter(subject => this.subjectBlocks(subject).includes(block));
        return groups;
      }, {});
    },
    currentSubjects() {
      const keyword = this.searchText.toLowerCase();
      const subjects = this.subjectsByBlock[this.activeBlock] || [];
      if (!keyword) return subjects;
      return subjects.filter(subject => (
        `${subject.subject_name || ''} ${this.subjectLabel(subject)}`.toLowerCase().includes(keyword)
      ));
    },
    emptySubjectMessage() {
      if (this.searchText) {
        return this.tr(
          `No ${this.activeBlock} subjects match "${this.searchText}"`,
          `找不到符合「${this.searchText}」的 ${this.activeBlock} 科目`
        );
      }
      return this.tr(`No subjects in ${this.activeBlock}`, `${this.activeBlock} 暫時沒有科目`);
    }
  },
  methods: {
    tr(en, zh) { return this.$lang.locale === 'en' ? en : zh; },
    subjectLabel(subject) { return formatSubjectLabel(subject, this.$lang.locale); },
    subjectBlocks(subject) {
      if (Array.isArray(subject.elective_blocks) && subject.elective_blocks.length) return subject.elective_blocks;
      const match = String(subject.subject_name || '').match(/(?:^|[-_\s])(?:X|B)([123])$/i);
      return match ? [`X${match[1]}`] : [];
    },
    async fetchSubjects() { const token = localStorage.getItem('token'); const res = await axios.get('/api/subjects/findElective', { headers: { Authorization: `Bearer ${token}` } }); this.subjects = res.data; },
    goNext() {
      if (!this.form) { alert(this.tr('Please select a form.', '請選擇級別。')); return; }
      if (!this.selectedSubject || !this.selectedBlock) { alert(this.tr('Please select an elective subject.', '請選擇一個選修科目。')); return; }
      this.$router.push({ name: 'ElectivesResult', query: { form: this.form, subject: this.selectedSubject, block: this.selectedBlock } });
    }
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
  max-width: 1060px;
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

.form-section {
  padding-bottom: 16px;
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

.block-tabs {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
  margin-top: 14px;
}

.block-tab {
  min-height: 42px;
  border: 1px solid #b8cad3;
  border-radius: 6px;
  background: #fff;
  color: #27485b;
  cursor: pointer;
  font-size: 15px;
  font-weight: 800;
}

.block-tab:hover,
.block-tab.active {
  border-color: #0b7285;
  background: #0b7285;
  color: #fff;
}

.block-tab.chosen:not(.active)::after {
  content: ' ✓';
  color: #0b7285;
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

.subject-grid {
  max-height: 360px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  overflow-y: auto;
  scrollbar-gutter: stable;
  margin-top: 10px;
  padding-right: 4px;
}

.subject-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #607683;
  margin-top: 18px;
}

.subject-heading h3 {
  color: #122635;
  font-size: 17px;
  margin: 0;
}

.subject-heading span {
  font-size: 13px;
  font-weight: 700;
}

.empty-message {
  color: #607683;
  margin: 16px 0 0;
  text-align: center;
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
  .subject-grid {
    grid-template-columns: 1fr;
  }

  .primary-btn {
    width: 100%;
  }
}
</style>
