<template>
  <main class="entry-page">
    <section class="entry-panel">
      <header class="page-header">
        <div>
          <h1>{{ tr('Enter Learning Goal Total (First Term)', '輸入學生完成目標總數（上學期）') }}</h1>
        </div>
      </header>

      <section class="class-picker">
        <label for="classSelect">{{ tr('Class', '班別') }}</label>
        <select id="classSelect" v-model="selectedClassId" @change="fetchSelectedClassStudents">
          <option value="">{{ tr('Select class', '選擇班別') }}</option>
          <option v-for="cls in classList" :key="cls.class_id" :value="cls.class_id">
            {{ cls.class_name }}
          </option>
        </select>
      </section>

      <form v-if="selectedClassId" class="entry-form" @submit.prevent="saveGoals">
        <div v-if="students.length" class="student-list">
          <label
            v-for="student in students"
            :key="student.student_id"
            class="student-row"
          >
            <span class="student-code">{{ studentCode(student) }}</span>
            <span class="student-name">
              {{ student.student_name || student.student_ch_name }}
              <small v-if="student.english_name">{{ student.english_name }}</small>
            </span>
            <input
              type="number"
              min="0"
              step="1"
              v-model.number="goalCounts[student.student_id]"
              @focus="$event.target.select()"
            />
          </label>
        </div>

        <p v-else-if="loading" class="state-text">{{ tr('Loading students...', '載入學生中...') }}</p>
        <p v-else class="state-text">{{ tr('Please select a class.', '請選擇班別。') }}</p>

        <button type="submit" class="primary-btn" :disabled="saving || loading || !students.length">
          {{ saving ? tr('Saving...', '儲存中...') : tr('Submit', '提交') }}
        </button>
      </form>
    </section>
  </main>
</template>

<script>
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function trText(vm, en, zh) {
  return vm.$lang.locale === 'en' ? en : zh;
}

const TEXT = {
  loginFirst: '\u8acb\u5148\u767b\u5165\u3002',
  chooseStudents: '\u8acb\u5148\u9078\u64c7\u73ed\u5225\u3002',
  saved: '\u5df2\u5132\u5b58\u5b78\u7fd2\u76ee\u6a19\u8cc7\u6599\u3002',
  saveFailed: '\u5132\u5b58\u5931\u6557\u3002'
};

export default {
  data() {
    return {
      classList: [],
      selectedClassId: '',
      students: [],
      goalCounts: {},
      teacher_id: null,
      loading: false,
      saving: false
    };
  },
  methods: {
    tr(en, zh) {
      return this.$lang.locale === 'en' ? en : zh;
    },
    studentCode(student) {
      const className = student.class_name || '';
      const classNumber = String(student.class_number || '').padStart(2, '0');
      return `${className}${classNumber}`;
    },
    async fetchClasses() {
      const token = localStorage.getItem('token');
      if (!token) {
        alert(trText(this, 'Please login first.', TEXT.loginFirst));
        return;
      }

      const res = await axios.get('/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.classList = res.data;
    },
    async getTeacherId() {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const decoded = jwtDecode(token);
        const res = await axios.get(`/api/teachers/from-user/${decoded.id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.teacher_id = res.data.teacher_id;
      } catch (err) {
        console.warn('Could not load teacher id. The server will try to resolve it from the login token.', err);
      }
    },
    async fetchExistingGoals() {
      const token = localStorage.getItem('token');
      if (!token) return;

      const params = this.teacher_id ? { teacher_id: this.teacher_id } : {};

      try {
        const res = await axios.get('/api/learning-goals/records', {
          params,
          headers: { Authorization: `Bearer ${token}` }
        });

        res.data.forEach(record => {
          this.$set(this.goalCounts, record.student_id, Number(record.completed_goals) || 0);
        });
      } catch (err) {
        console.warn('Could not load existing learning goals:', err);
      }
    },
    async fetchSelectedClassStudents() {
      const token = localStorage.getItem('token');
      if (!token || !this.selectedClassId) {
        this.students = [];
        return;
      }

      this.loading = true;
      this.students = [];

      try {
        const res = await axios.get(`/api/students/by-class/${this.selectedClassId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.students = res.data;
        this.students.forEach(student => {
          if (this.goalCounts[student.student_id] === undefined) {
            this.$set(this.goalCounts, student.student_id, 0);
          }
        });
      } catch (err) {
        console.error(`Failed to load students for class ${this.selectedClassId}:`, err);
        this.students = [];
      } finally {
        this.loading = false;
      }
    },
    async saveGoals() {
      const token = localStorage.getItem('token');
      if (!token) {
        alert(trText(this, 'Please login first.', TEXT.loginFirst));
        return;
      }

      if (!this.selectedClassId || this.students.length === 0) {
        alert(trText(this, 'Please select a class first.', TEXT.chooseStudents));
        return;
      }

      const records = this.students.map(student => ({
        student_id: student.student_id,
        completed_goals: Math.max(0, Number(this.goalCounts[student.student_id]) || 0)
      }));

      this.saving = true;
      try {
        await axios.post('/api/learning-goals/records', {
          teacher_id: this.teacher_id,
          records
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        alert(trText(this, 'Learning goal data saved.', TEXT.saved));
      } catch (err) {
        console.error('Failed to save learning goals:', err);
        const responseData = err.response && err.response.data ? err.response.data : {};
        const error = responseData.error || trText(this, 'Save failed.', TEXT.saveFailed);
        const detail = responseData.detail;
        alert(detail ? `${error}\n${detail}` : error);
      } finally {
        this.saving = false;
      }
    }
  },
  async mounted() {
    try {
      await this.fetchClasses();
      await this.getTeacherId();
      await this.fetchExistingGoals();
    } catch (err) {
      console.error('Failed to prepare learning goal page:', err);
    }
  }
};
</script>

<style scoped>
.entry-page {
  box-sizing: border-box;
  min-height: calc(100vh - 126px);
  padding: 42px 20px 56px;
}

.entry-panel {
  max-width: 940px;
  margin: 0 auto;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--shadow);
  padding: 26px;
}

.page-header {
  margin-bottom: 20px;
}

.page-header p {
  color: var(--primary);
  font-size: 13px;
  font-weight: 800;
  margin: 0 0 8px;
  text-transform: uppercase;
}

h1 {
  color: var(--text);
  font-size: 32px;
  line-height: 1.25;
  letter-spacing: 0;
  margin: 0;
}

.class-picker {
  display: grid;
  grid-template-columns: 110px minmax(180px, 260px);
  align-items: center;
  gap: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-soft);
  margin-bottom: 18px;
  padding: 16px;
}

.class-picker label {
  color: var(--text-muted);
  font-weight: 800;
}

.class-picker select {
  height: 42px;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  background: #fff;
  color: var(--text);
  font-size: 15px;
  padding: 0 10px;
}

.entry-form {
  margin: 0;
}

.student-list {
  display: grid;
  gap: 8px;
}

.student-row {
  display: grid;
  grid-template-columns: 84px 1fr 96px;
  align-items: center;
  gap: 12px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fff;
  padding: 10px 12px;
}

.student-code {
  border-radius: 999px;
  background: #e7f4f6;
  color: #0a5260;
  font-weight: 800;
  justify-self: start;
  padding: 5px 9px;
}

.student-name {
  min-width: 0;
  color: var(--text);
  font-size: 16px;
  font-weight: 800;
  overflow-wrap: anywhere;
}

.student-name small {
  color: var(--text-muted);
  display: block;
  font-size: 13px;
  font-weight: 600;
  margin-top: 2px;
}

.student-row input {
  width: 100%;
  height: 38px;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  box-sizing: border-box;
  color: var(--text);
  font-size: 16px;
  font-weight: 800;
  padding: 0 10px;
}

.student-row input:focus,
.class-picker select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(11, 114, 133, 0.13);
  outline: none;
}

.state-text {
  border: 1px dashed var(--border-strong);
  border-radius: 8px;
  color: var(--text-muted);
  margin: 0;
  padding: 28px;
  text-align: center;
}

.primary-btn {
  display: block;
  min-width: 96px;
  height: 46px;
  border: none;
  border-radius: 6px;
  background: var(--primary);
  color: #fff;
  cursor: pointer;
  font-size: 15px;
  font-weight: 800;
  margin: 22px auto 0;
  padding: 0 22px;
}

.primary-btn:hover:not(:disabled) {
  background: var(--primary-dark);
}

.primary-btn:disabled {
  background: #c7d2d8;
  color: #607683;
  cursor: not-allowed;
}

@media (max-width: 640px) {
  .entry-panel {
    padding: 20px;
  }

  h1 {
    font-size: 28px;
  }

  .class-picker,
  .student-row {
    grid-template-columns: 1fr;
  }
}
</style>
