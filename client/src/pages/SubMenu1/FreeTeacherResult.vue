<template>
  <main class="result-page">
    <section class="result-panel">
      <header class="result-header">
        <h1>{{ date }}（{{ weekdayLabel }}）</h1>
        <h2>第{{ period }}節空堂老師</h2>
      </header>

      <div class="table-wrap">
        <table v-if="freeTeachers.length" class="free-table">
          <thead>
            <tr>
              <th class="teacher-col">老師</th>
              <th v-for="periodNumber in periodNumbers" :key="periodNumber">
                第{{ periodNumber }}節
              </th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="teacher in freeTeachers" :key="teacher.teacher_id">
              <th class="teacher-col">{{ teacher.teacher_name }}</th>
              <td v-for="periodNumber in periodNumbers" :key="periodNumber">
                <span v-if="classAt(teacher, periodNumber)" class="class-pill">
                  {{ classAt(teacher, periodNumber) }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>

        <p v-else-if="loaded" class="empty-message">
          這一節沒有空堂老師
        </p>
        <p v-else class="empty-message">
          載入中...
        </p>
      </div>
    </section>
  </main>
</template>

<script>
import axios from 'axios';

const TEXT = {
  loadFailed: '\u8f09\u5165\u7a7a\u5802\u8001\u5e2b\u5931\u6557\u3002'
};

export default {
  data() {
    return {
      teachers: [],
      periodNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12],
      loaded: false
    };
  },
  computed: {
    date() {
      return this.$route.query.date || '';
    },
    weekday() {
      return this.$route.query.weekday || '';
    },
    weekdayLabel() {
      return this.$route.query.weekdayLabel || '';
    },
    period() {
      return Number(this.$route.query.period) || 0;
    },
    freeTeachers() {
      return this.teachers.filter(teacher => !this.classAt(teacher, this.period));
    }
  },
  methods: {
    classAt(teacher, periodNumber) {
      const lesson = (teacher.lessons || []).find(item => Number(item.period_id) === Number(periodNumber));
      return lesson ? lesson.class_name : '';
    },
    async fetchDaySchedule() {
      const token = localStorage.getItem('token');

      try {
        const res = await axios.post('http://localhost:3000/api/teachers/free-teachers-day', {
          weekday: this.weekday
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.teachers = res.data;
      } catch (err) {
        console.error('Failed to load free teacher day schedule:', err);
        alert(TEXT.loadFailed);
      } finally {
        this.loaded = true;
      }
    }
  },
  mounted() {
    if (!this.date || !this.weekday || !this.period) {
      this.$router.push({ name: 'FreeTeacher' });
      return;
    }

    this.fetchDaySchedule();
  }
};
</script>

<style scoped>
.result-page {
  min-height: calc(100vh - 126px);
  box-sizing: border-box;
  padding: 34px 20px 56px;
}

.result-panel {
  max-width: 1180px;
  margin: 0 auto;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--shadow);
  padding: 24px;
}

.result-header {
  margin-bottom: 22px;
  text-align: center;
}

.result-header p {
  color: var(--primary);
  font-size: 13px;
  font-weight: 800;
  margin: 0 0 8px;
  text-transform: uppercase;
}

h1,
h2 {
  color: var(--text);
  margin: 0;
  text-align: center;
}

h1 {
  font-size: 32px;
}

h2 {
  color: var(--text-muted);
  font-size: 24px;
  margin-top: 8px;
}

.table-wrap {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow-x: auto;
}

.free-table {
  width: 100%;
  min-width: 960px;
  border-collapse: collapse;
  table-layout: fixed;
}

.free-table th,
.free-table td {
  border-bottom: 1px solid var(--border);
  border-left: 1px solid var(--border);
  height: 42px;
  padding: 7px 8px;
  text-align: center;
}

.free-table th:first-child,
.free-table td:first-child {
  border-left: none;
}

.free-table tr:last-child th,
.free-table tr:last-child td {
  border-bottom: none;
}

.free-table thead th {
  background: var(--surface-soft);
  color: var(--text);
  font-weight: 800;
  white-space: nowrap;
}

.free-table tbody tr:hover th,
.free-table tbody tr:hover td {
  background: #fbfdfd;
}

.teacher-col {
  width: 120px;
  color: var(--text);
  text-align: left !important;
  white-space: nowrap;
}

.class-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 42px;
  border-radius: 999px;
  background: #e7f4f6;
  color: #0a5260;
  font-weight: 800;
  padding: 4px 9px;
}

.empty-message {
  color: var(--text-muted);
  margin: 0;
  padding: 32px;
  text-align: center;
}
</style>
