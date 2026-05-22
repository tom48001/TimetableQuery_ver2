<template>
  <div class="learning-goal-page">
    <h1>&#x5B78;&#x7FD2;&#x76EE;&#x6A19;&#x734E;&#x52F5;&#x8A08;&#x5283;</h1>

    <section class="class-section">
      <h2>&#x9078;&#x64C7;&#x73ED;&#x5225;</h2>
      <div class="class-grid">
        <label
          v-for="cls in classList"
          :key="cls.class_id"
          class="class-option"
          :class="{ selected: selectedClassIds.includes(cls.class_id) }"
        >
          <input type="checkbox" :value="cls.class_id" v-model="selectedClassIds" />
          {{ cls.class_name }}
        </label>
      </div>
    </section>

    <section class="student-section">
      <div v-for="classId in selectedClassIds" :key="classId" class="class-students">
        <h3>{{ className(classId) }}</h3>
        <div v-if="studentsByClass[classId]" class="student-list">
          <label
            v-for="student in studentsByClass[classId]"
            :key="student.student_id"
            class="student-row"
          >
            <span>{{ student.student_name || student.student_ch_name }}</span>
            <input
              type="number"
              min="0"
              step="1"
              v-model.number="goalCounts[student.student_id]"
              placeholder="0"
            />
          </label>
        </div>
        <p v-else class="loading">&#x8F09;&#x5165;&#x4E2D;...</p>
      </div>

      <button
        type="button"
        :disabled="!selectedClassIds.length"
        @click="saveGoals"
      >
        &#x63D0;&#x4EA4;
      </button>
    </section>
  </div>
</template>

<script>
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

const TEXT = {
  loginFirst: '\u8acb\u5148\u767b\u5165\u3002',
  chooseStudents: '\u8acb\u5148\u9078\u64c7\u73ed\u5225\u53ca\u5b78\u751f\u3002',
  saved: '\u5df2\u5132\u5b58\u5b78\u7fd2\u76ee\u6a19\u8cc7\u6599\u3002',
  saveFailed: '\u5132\u5b58\u5931\u6557\u3002'
};

export default {
  data() {
    return {
      classList: [],
      selectedClassIds: [],
      studentsByClass: {},
      goalCounts: {},
      teacher_id: null
    };
  },
  watch: {
    selectedClassIds() {
      this.selectedClassIds.sort((a, b) => a - b);
      this.fetchStudentsForSelectedClasses();
    }
  },
  methods: {
    className(classId) {
      const foundClass = this.classList.find(cls => cls.class_id === classId);
      return foundClass ? foundClass.class_name : `Class ${classId}`;
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
    async fetchStudentsForSelectedClasses() {
      const token = localStorage.getItem('token');
      if (!token) return;

      await Promise.all(this.selectedClassIds.map(async classId => {
        if (this.studentsByClass[classId]) return;

        try {
          const res = await axios.get(`http://localhost:3000/api/students/by-class/${classId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          this.$set(this.studentsByClass, classId, res.data);
          res.data.forEach(student => {
            if (this.goalCounts[student.student_id] === undefined) {
              this.$set(this.goalCounts, student.student_id, 0);
            }
          });
        } catch (err) {
          console.error(`Failed to load students for class ${classId}:`, err);
          this.$set(this.studentsByClass, classId, []);
        }
      }));
    },
    async saveGoals() {
      const token = localStorage.getItem('token');
      if (!token) {
        alert(TEXT.loginFirst);
        return;
      }

      const selectedStudentIds = this.selectedClassIds.flatMap(classId =>
        (this.studentsByClass[classId] || []).map(student => student.student_id)
      );

      if (selectedStudentIds.length === 0) {
        alert(TEXT.chooseStudents);
        return;
      }

      const records = selectedStudentIds.map(studentId => ({
        student_id: studentId,
        completed_goals: Math.max(0, Number(this.goalCounts[studentId]) || 0)
      }));

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
.learning-goal-page {
  padding: 20px;
}

h1,
h2,
h3 {
  text-align: center;
}

.class-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  max-width: 800px;
  margin: 30px auto;
}

.class-option {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  border: 2px solid #dcdcdc;
  border-radius: 8px;
  background-color: #f9f9f9;
  cursor: pointer;
}

.class-option:hover,
.class-option.selected {
  border-color: #007bff;
  background-color: #eaf3ff;
}

.student-section {
  max-width: 900px;
  margin: 0 auto;
}

.class-students {
  margin-bottom: 28px;
}

.student-list {
  display: grid;
  grid-template-columns: repeat(2, minmax(240px, 1fr));
  gap: 12px;
}

.student-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 10px 14px;
  border: 1px solid #ddd;
  border-radius: 8px;
  background: #fff;
}

.student-row input {
  width: 80px;
  padding: 6px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

.loading {
  text-align: center;
}

button {
  display: block;
  margin: 30px auto;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
}

button:hover {
  background-color: #0056b3;
}

button:disabled {
  background-color: #b8c2cc;
  cursor: not-allowed;
}
</style>
