<template>
  <main class="free-page">
    <section class="free-panel">
      <header class="page-header">
        <div>
          <p>Timetable</p>
          <h1>Free Teacher</h1>
        </div>
        <span class="count-badge">{{ teachers.length }} free</span>
      </header>

      <section class="filters">
        <label>
          <span>Day</span>
          <select v-model="weekday">
            <option disabled value="">Choose day</option>
            <option v-for="day in days" :key="day" :value="day">{{ day }}</option>
          </select>
        </label>

        <div class="period-section">
          <div class="section-title">
            <span>Period</span>
            <button type="button" class="secondary-btn" @click="period = []">Clear</button>
          </div>
          <div class="period-grid">
            <label
              v-for="periodLevel in 12"
              :key="periodLevel"
              class="period-option"
              :class="{ selected: period.includes(periodLevel) }"
            >
              <input type="checkbox" :value="periodLevel" v-model="period" />
              {{ periodLevel }}
            </label>
          </div>
        </div>

        <button type="button" class="primary-btn" @click="fetchFreeTeachers">
          Search
        </button>
      </section>

      <section class="results" v-if="searched">
        <div class="results-header">
          <h2>Available Teachers</h2>
          <input
            v-model.trim="teacherSearch"
            type="text"
            placeholder="Search results..."
          />
        </div>

        <div v-if="filteredTeachers.length" class="teacher-list">
          <span
            v-for="teacher in filteredTeachers"
            :key="teacher.teacher_id"
            class="teacher-chip"
          >
            {{ teacher.teacher_name }}
          </span>
        </div>

        <p v-else class="empty-message">No teacher found.</p>
      </section>
    </section>
  </main>
</template>

<script>
import axios from 'axios';

const TEXT = {
  chooseFilters: '\u8acb\u9078\u64c7\u65e5\u671f\u53ca\u81f3\u5c11\u4e00\u500b\u7bc0\u6578\u3002',
  searchFailed: '\u641c\u5c0b\u5931\u6557\u3002'
};

export default {
  data() {
    return {
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      weekday: '',
      period: [],
      teachers: [],
      teacherSearch: '',
      searched: false
    };
  },
  computed: {
    filteredTeachers() {
      const keyword = this.teacherSearch.toLowerCase();
      if (!keyword) return this.teachers;

      return this.teachers.filter(teacher =>
        String(teacher.teacher_name || '').toLowerCase().includes(keyword)
      );
    }
  },
  methods: {
    async fetchFreeTeachers() {
      if (!this.weekday || this.period.length === 0) {
        alert(TEXT.chooseFilters);
        return;
      }

      try {
        const token = localStorage.getItem('token');
        const res = await axios.post('http://localhost:3000/api/teachers/free-teachers', {
          weekday: this.weekday,
          period: this.period
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.teachers = res.data;
        this.teacherSearch = '';
        this.searched = true;
      } catch (err) {
        console.error('Failed to search free teachers:', err);
        alert(TEXT.searchFailed);
      }
    }
  }
};
</script>

<style scoped>
.free-page {
  min-height: calc(100vh - 126px);
  box-sizing: border-box;
  padding: 44px 20px 64px;
}

.free-panel {
  max-width: 980px;
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
.results-header {
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
  font-size: 22px;
}

.count-badge {
  border: 1px solid #b8cad3;
  border-radius: 6px;
  background: #f7fafb;
  color: #27485b;
  font-weight: 700;
  padding: 9px 12px;
}

.filters {
  display: grid;
  gap: 20px;
  margin-top: 24px;
}

label,
.section-title span {
  color: #27485b;
  font-weight: 700;
}

select,
.results-header input {
  height: 44px;
  border: 1px solid #b8cad3;
  border-radius: 6px;
  background: #fff;
  box-sizing: border-box;
  color: #122635;
  font-size: 15px;
  padding: 0 12px;
}

select {
  display: block;
  margin-top: 8px;
  min-width: 220px;
}

select:focus,
.results-header input:focus {
  border: 2px solid #0b7285;
}

.period-section,
.results {
  border: 1px solid #d6e2e6;
  border-radius: 8px;
  background: #f7fafb;
  padding: 12px;
}

.period-grid {
  display: grid;
  grid-template-columns: repeat(12, minmax(38px, 1fr));
  gap: 6px;
  margin-top: 12px;
}

.period-option {
  min-height: 34px;
  display: flex;
  align-items: center;
  gap: 5px;
  border: 1px solid #d7e2e7;
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  font-size: 13px;
  justify-content: center;
}

.period-option:hover,
.period-option.selected {
  border-color: #0b7285;
  background: #e0f1f2;
  color: #0a5260;
}

.period-option input {
  accent-color: #0b7285;
}

button {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
}

.secondary-btn {
  height: 38px;
  border: 1px solid #b8cad3;
  background: #fff;
  color: #244152;
  padding: 0 14px;
}

.primary-btn {
  width: 180px;
  height: 48px;
  background: #0b7285;
  color: #fff;
  font-size: 15px;
}

.primary-btn:hover {
  background: #085c6b;
}

.results {
  margin-top: 22px;
}

.results-header input {
  width: min(280px, 100%);
}

.teacher-list {
  max-height: 360px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 7px;
  overflow-y: auto;
  margin-top: 16px;
}

.teacher-chip {
  border: 1px solid #d7e2e7;
  border-radius: 6px;
  background: #fff;
  color: #243f51;
  font-size: 13px;
  font-weight: 700;
  overflow: hidden;
  padding: 8px 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.empty-message {
  border: 1px dashed #b8cad3;
  border-radius: 8px;
  color: #607683;
  margin: 16px 0 0;
  padding: 28px;
  text-align: center;
}

@media (max-width: 720px) {
  .free-panel {
    padding: 20px;
  }

  .page-header,
  .section-title,
  .results-header {
    align-items: stretch;
    flex-direction: column;
  }

  .period-grid {
    grid-template-columns: repeat(6, minmax(38px, 1fr));
  }

  select,
  .primary-btn,
  .results-header input {
    width: 100%;
  }
}
</style>
