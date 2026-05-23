<template>
  <main class="student-page">
    <section class="student-panel">
      <header class="page-header">
        <div>
          <h1>選擇學生</h1>
        </div>
        <span class="count-badge">{{ selectedCount }} 位已選</span>
      </header>

      <div v-if="selectedSubject.subject_name" class="context-row">
        <span>科目</span>
        <strong>{{ selectedSubject.subject_name }}</strong>
      </div>

      <div v-if="allStudents.length" class="class-sections">
        <section
          v-for="classId in selectedClass"
          :key="classId"
          class="class-section"
        >
          <h2>{{ className(classId) }}</h2>
          <div class="student-grid">
            <label
              v-for="student in studentsByClass[classId]"
              :key="student.student_id"
              class="student-card"
              :class="{ selected: isSelected(classId, student.student_id) }"
            >
              <input
                type="checkbox"
                :value="student.student_id"
                v-model="selectedStudents[classId]"
              />
              <span class="student-number">{{ studentNumber(student) }}</span>
              <span class="student-name">{{ student.student_name }}</span>
            </label>
          </div>
        </section>
      </div>

      <p v-else class="state-text">載入中...</p>

      <button type="button" class="primary-btn" @click="submitNomination">
        提交
      </button>
    </section>
  </main>
</template>

<script>
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

function parseJson(value, fallback) {
  try {
    return JSON.parse(value || '');
  } catch (err) {
    return fallback;
  }
}

export default {
  data() {
    return {
      selectedSubject: parseJson(this.$route.query.selectedSubject, {}),
      selectedClass: parseJson(this.$route.query.selectedClass, []),
      studentsByClass: {},
      selectedStudents: {},
      previousSelectedStudents: {},
      teacher_id: null
    };
  },
  computed: {
    allStudents() {
      return this.selectedClass.flatMap(classId => this.studentsByClass[classId] || []);
    },
    selectedCount() {
      return Object.values(this.selectedStudents).flat().length;
    }
  },
  methods: {
    studentNumber(student) {
      return String(student.class_number || '').padStart(2, '0');
    },
    className(classId) {
      const students = this.studentsByClass[classId] || [];
      return students[0] && students[0].class_name ? students[0].class_name : `班別 ${classId}`;
    },
    isSelected(classId, studentId) {
      return (this.selectedStudents[classId] || []).includes(studentId);
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
      } catch (error) {
        console.error('Failed to load teacher id:', error);
      }
    },
    async loadStudents() {
      const token = localStorage.getItem('token');
      if (!token) return;

      await Promise.all(this.selectedClass.map(async classId => {
        this.$set(this.selectedStudents, classId, []);

        try {
          const res = await axios.get(
            `http://localhost:3000/api/students/by-class/${classId}/subject/${this.selectedSubject.subject_id}`,
            { headers: { Authorization: `Bearer ${token}` } }
          );
          this.$set(this.studentsByClass, classId, res.data);
        } catch (err) {
          console.error(`Failed to load students for class ${classId}:`, err);
          this.$set(this.studentsByClass, classId, []);
        }
      }));
    },
    async loadSelectedStudents() {
      const token = localStorage.getItem('token');
      if (!token || !this.teacher_id) return;

      try {
        const res = await axios.get('http://localhost:3000/api/bla/students', {
          params: {
            subject_id: this.selectedSubject.subject_id,
            teacher_id: this.teacher_id
          },
          headers: { Authorization: `Bearer ${token}` }
        });

        const selectedIds = res.data.map(student => student.student_id);
        const updatedSelected = {};

        this.selectedClass.forEach(classId => {
          const classStudents = this.studentsByClass[classId] || [];
          updatedSelected[classId] = classStudents
            .filter(student => selectedIds.includes(student.student_id))
            .map(student => student.student_id);
        });

        this.selectedStudents = updatedSelected;
        this.previousSelectedStudents = JSON.parse(JSON.stringify(updatedSelected));
      } catch (err) {
        console.error('Failed to load selected students:', err);
      }
    },
    async submitNomination() {
      const token = localStorage.getItem('token');
      if (!token) return;

      const teacherId = this.teacher_id;
      const subjectId = this.selectedSubject.subject_id;
      const selectedStudentIds = Object.values(this.selectedStudents).flat();

      try {
        await axios.post('http://localhost:3000/api/bla/insert', {
          teacher_id: teacherId,
          subject_id: subjectId,
          student_ids: selectedStudentIds
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        await Promise.all(Object.keys(this.previousSelectedStudents).map(async classId => {
          const currentSelected = this.selectedStudents[classId] || [];
          const removed = (this.previousSelectedStudents[classId] || []).filter(
            studentId => !currentSelected.includes(studentId)
          );

          if (removed.length === 0) return;

          await axios.delete('http://localhost:3000/api/bla/delete', {
            data: {
              subjectId,
              teacherId,
              removed
            },
            headers: { Authorization: `Bearer ${token}` }
          });
        }));

        this.$router.push({ name: 'BLA' });
      } catch (err) {
        console.error('Failed to submit BLA nomination:', err);
        alert('\u63d0\u4ea4\u5931\u6557\u3002');
      }
    }
  },
  async mounted() {
    if (!this.selectedSubject.subject_id || !this.selectedClass.length) {
      this.$router.push({ name: 'BLA' });
      return;
    }

    await this.getTeacherId();
    await this.loadStudents();
    await this.loadSelectedStudents();
  }
};
</script>

<style scoped>
.student-page {
  box-sizing: border-box;
  min-height: calc(100vh - 126px);
  padding: 42px 20px 56px;
}

.student-panel {
  max-width: 1080px;
  margin: 0 auto;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--shadow);
  padding: 26px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 18px;
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
  letter-spacing: 0;
  margin: 0;
}

.count-badge,
.context-row {
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  background: var(--surface-soft);
  color: var(--text-muted);
  font-weight: 800;
}

.count-badge {
  padding: 9px 14px;
  white-space: nowrap;
}

.context-row {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 18px;
  padding: 8px 14px;
}

.context-row span {
  color: #6b8391;
}

.context-row strong {
  color: var(--text);
}

.class-sections {
  display: grid;
  gap: 18px;
}

.class-section {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-soft);
  padding: 16px;
}

h2 {
  color: var(--text);
  font-size: 18px;
  margin: 0 0 12px;
}

.student-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 8px;
}

.student-card {
  min-height: 42px;
  display: grid;
  grid-template-columns: auto auto 1fr;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #fff;
  color: var(--text);
  cursor: pointer;
  font-weight: 700;
  padding: 8px 10px;
}

.student-card:hover,
.student-card.selected {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.student-card input {
  accent-color: var(--primary);
}

.student-number {
  color: var(--primary);
  font-weight: 800;
}

.student-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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

.primary-btn:hover {
  background: var(--primary-dark);
}

@media (max-width: 720px) {
  .student-panel {
    padding: 20px;
  }

  .page-header {
    align-items: stretch;
    flex-direction: column;
  }

  .student-grid {
    grid-template-columns: 1fr;
  }
}
</style>
