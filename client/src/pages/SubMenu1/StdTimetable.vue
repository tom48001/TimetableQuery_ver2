<template>
  <main class="student-page">
    <section class="student-panel">
      <header class="page-header">
        <div>
          <h1>{{ tr('Student Timetable', '學生上課時間表') }}</h1>
        </div>
      </header>

      <section class="selector-section">
        <h2>{{ tr('Class', '班別') }}</h2>
        <div class="class-grid">
          <label v-for="cls in regularClasses" :key="cls.class_id" class="option-card" :class="{ selected: selectedClass === cls.class_id }">
            <input type="radio" :value="cls.class_id" v-model="selectedClass" @change="fetchStudents" />
            {{ cls.class_name }}
          </label>
        </div>
      </section>

      <section v-if="students.length > 0" class="selector-section">
        <h2>{{ tr('Student', '學生') }}</h2>
        <input v-model.trim="studentSearch" class="search-input" type="text" :placeholder="tr('Search student...', '搜尋學生...')" />

        <div class="student-list">
          <label v-for="student in filteredStudents" :key="student.student_id" class="student-row" :class="{ selected: selectedStudent === student.student_id }">
            <input type="radio" :value="student.student_id" v-model="selectedStudent" />
            <span class="student-number">{{ studentNumber(student) }}</span>
            <span class="student-name">{{ studentDisplayName(student) }}</span>
          </label>
        </div>
      </section>

      <button type="button" class="primary-btn" :disabled="!selectedStudent" @click="goToResult">
        {{ tr('View Timetable', '查看時間表') }}
      </button>
    </section>
  </main>
</template>

<script>
import axios from 'axios';

export default {
  name: 'StudentTimetable',
  data() { return { classes: [], selectedClass: '', students: [], selectedStudent: '', studentSearch: '' }; },
  computed: {
    regularClasses() {
      return this.classes.filter(cls => this.isRegularClass(cls.class_name));
    },
    filteredStudents() {
      const keyword = this.studentSearch.toLowerCase();
      const students = keyword ? this.students.filter(student => {
        const chineseName = String(student.student_name || student.student_ch_name || '').toLowerCase();
        const englishName = String(student.english_name || student.student_eng_name || '').toLowerCase();
        const number = String(student.class_number || '').toLowerCase();
        return chineseName.includes(keyword) || englishName.includes(keyword) || number.includes(keyword);
      }) : this.students;

      return students.slice().sort((a, b) => {
        const numberA = Number(a.class_number);
        const numberB = Number(b.class_number);
        if (numberA !== numberB) return numberA - numberB;
        return String(a.class_number || '').localeCompare(String(b.class_number || ''));
      });
    }
  },
  async mounted() {
    const token = localStorage.getItem('token');
    const res = await axios.get('/api/classes', { headers: { Authorization: `Bearer ${token}` } });
    this.classes = res.data;
  },
  methods: {
    tr(en, zh) { return this.$lang.locale === 'en' ? en : zh; },
    isRegularClass(className) {
      return /^[1-6][AMRY]$/.test(String(className || '').trim().toUpperCase());
    },
    studentNumber(student) { return String(student.class_number || '').padStart(2, '0'); },
    studentDisplayName(student) {
      if (this.$lang.locale === 'en') {
        return student.english_name || student.student_eng_name || student.student_name;
      }
      return student.student_name || student.student_ch_name || student.english_name;
    },
    async fetchStudents() {
      if (!this.selectedClass) return;
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/students/by-class/${this.selectedClass}`, { headers: { Authorization: `Bearer ${token}` } });
      this.students = res.data;
      this.selectedStudent = '';
      this.studentSearch = '';
    },
    goToResult() { this.$router.push({ name: 'StdTimetableResult', query: { studentId: this.selectedStudent } }); }
  }
};
</script>
<style scoped>
.student-page {
  min-height: calc(100vh - 126px);
  box-sizing: border-box;
  padding: 44px 20px 64px;
}

.student-panel {
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

.class-grid,
.student-list {
  display: grid;
  gap: 8px;
  margin-top: 14px;
}

.class-grid {
  grid-template-columns: repeat(4, minmax(0, 1fr));
}

.student-list {
  max-height: 380px;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  overflow-y: auto;
}

.option-card,
.student-row {
  min-height: 38px;
  display: flex;
  align-items: center;
  gap: 7px;
  border: 1px solid #d7e2e7;
  border-radius: 6px;
  background: #fff;
  color: #243f51;
  cursor: pointer;
  font-size: 13px;
  font-weight: 700;
  padding: 5px 8px;
}

.option-card:hover,
.option-card.selected,
.student-row:hover,
.student-row.selected {
  border-color: #0b7285;
  background: #e0f1f2;
  color: #0a5260;
}

.student-number {
  color: #0b7285;
  font-weight: 800;
  min-width: 2ch;
}

.student-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.primary-btn:disabled {
  background: #c7d2d8;
  color: #607683;
  cursor: not-allowed;
}

@media (max-width: 720px) {
  .student-panel {
    padding: 20px;
  }

  .student-list {
    grid-template-columns: 1fr;
  }

  .class-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .primary-btn {
    width: 100%;
  }
}
</style>
