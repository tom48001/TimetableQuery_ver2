<template>
  <main class="entry-page">
    <h1>輸入學生完成目標總數（<br />上學期）</h1>

    <section class="class-picker">
      <label for="classSelect">班別</label>
      <select id="classSelect" v-model="selectedClassId" @change="fetchSelectedClassStudents">
        <option value="">請選擇班別</option>
        <option v-for="cls in classList" :key="cls.class_id" :value="cls.class_id">
          {{ cls.class_name }}
        </option>
      </select>
    </section>

    <form v-if="selectedClassId" class="entry-form" @submit.prevent="saveGoals">
      <table v-if="students.length" class="entry-table">
        <tbody>
          <tr v-for="student in students" :key="student.student_id">
            <td class="student-cell">
              {{ studentCode(student) }} {{ student.student_name || student.student_ch_name }}
              <span v-if="student.english_name">{{ student.english_name }}</span>
            </td>
            <td class="input-cell">
              <input
                type="number"
                min="0"
                step="1"
                v-model.number="goalCounts[student.student_id]"
                @focus="$event.target.select()"
              />
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else-if="loading" class="state-text">載入中...</p>
      <p v-else class="state-text">沒有學生資料</p>

      <button type="submit" :disabled="saving || loading || !students.length">
        {{ saving ? '提交中...' : '提交' }}
      </button>
    </form>
  </main>
</template>

<script>
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

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
    studentCode(student) {
      const className = student.class_name || '';
      const classNumber = String(student.class_number || '').padStart(2, '0');
      return `${className}${classNumber}`;
    },
    async fetchClasses() {
      const token = localStorage.getItem('token');
      if (!token) {
        alert(TEXT.loginFirst);
        return;
      }

      const res = await axios.get('http://localhost:3000/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.classList = res.data;
    },
    async getTeacherId() {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const decoded = jwtDecode(token);
        const res = await axios.get(`http://localhost:3000/api/teachers/from-user/${decoded.id}`, {
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
        const res = await axios.get('http://localhost:3000/api/learning-goals/records', {
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
        const res = await axios.get(`http://localhost:3000/api/students/by-class/${this.selectedClassId}`, {
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
        alert(TEXT.loginFirst);
        return;
      }

      if (!this.selectedClassId || this.students.length === 0) {
        alert(TEXT.chooseStudents);
        return;
      }

      const records = this.students.map(student => ({
        student_id: student.student_id,
        completed_goals: Math.max(0, Number(this.goalCounts[student.student_id]) || 0)
      }));

      this.saving = true;
      try {
        await axios.post('http://localhost:3000/api/learning-goals/records', {
          teacher_id: this.teacher_id,
          records
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        alert(TEXT.saved);
      } catch (err) {
        console.error('Failed to save learning goals:', err);
        const responseData = err.response && err.response.data ? err.response.data : {};
        const error = responseData.error || TEXT.saveFailed;
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
  padding: 4px 16px 48px;
  background: #fff;
  color: #000;
}

h1 {
  margin: 0 0 28px;
  text-align: center;
  font-size: 32px;
  font-weight: 800;
  line-height: 1.45;
  letter-spacing: 0;
}

.class-picker {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  margin: 0 auto 18px;
}

.class-picker label {
  font-size: 18px;
  font-weight: 700;
}

.class-picker select {
  min-width: 160px;
  border: 1px solid #777;
  border-radius: 4px;
  background: #fff;
  font-size: 16px;
  padding: 5px 8px;
}

.entry-form {
  max-width: 374px;
  margin: 0 auto;
}

.entry-table {
  width: 100%;
  border: 1px solid #444;
  border-collapse: separate;
  border-spacing: 2px;
  background: #fff;
}

.entry-table td {
  border: 1px solid #777;
  padding: 3px 5px;
  font-size: 16px;
  line-height: 1.25;
  vertical-align: middle;
}

.student-cell {
  width: 270px;
}

.student-cell span {
  margin-left: 4px;
}

.input-cell {
  width: 96px;
}

.input-cell input {
  width: 52px;
  height: 20px;
  border: 1px solid #888;
  border-radius: 3px;
  box-sizing: border-box;
  font-size: 15px;
  padding: 1px 4px;
}

.state-text {
  border: 1px solid #999;
  margin: 0;
  padding: 18px;
  text-align: center;
}

button {
  display: block;
  min-width: 92px;
  border: 1px solid #444;
  border-radius: 4px;
  background: #f4f4f4;
  color: #000;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  margin: 18px auto 0;
  padding: 7px 16px;
}

button:hover:not(:disabled) {
  background: #e7e7e7;
}

button:disabled {
  color: #888;
  cursor: not-allowed;
}

@media (max-width: 480px) {
  .entry-page {
    padding-left: 10px;
    padding-right: 10px;
  }

  h1 {
    font-size: 28px;
  }

  .entry-form {
    max-width: 100%;
  }

  .student-cell {
    width: auto;
  }

  .input-cell {
    width: 82px;
  }
}
</style>
