<template>
  <main class="student-page">
    <section class="student-panel">
      <header class="page-header">
        <div>
          <h1>{{ tr('Select Students', '\u9078\u64c7\u5b78\u751f') }}</h1>
        </div>
        <span class="count-badge">{{ selectedCount }} {{ tr('selected', '\u5df2\u9078') }}</span>
      </header>

      <div v-if="allStudents.length" class="class-sections">
        <section v-for="classItem in selectedClass" :key="classItem" class="class-section">
          <h2>{{ className(classItem) }}</h2>

          <div v-if="studentsByClass[classItem] && studentsByClass[classItem].length" class="student-grid">
            <label
              v-for="student in studentsByClass[classItem]"
              :key="student.student_id"
              class="student-card"
              :class="{ selected: isSelected(classItem, student.student_id) }"
            >
              <input
                type="checkbox"
                :value="student.student_id"
                v-model="selectedStudents[classItem]"
              />
              <span class="student-number">{{ studentNumber(student) }}</span>
              <span class="student-name">{{ student.student_name }}</span>
            </label>
          </div>
          <p v-else class="state-message">{{ tr('No students in this class.', '\u9019\u500b\u73ed\u5225\u6c92\u6709\u5b78\u751f\u3002') }}</p>
        </section>
      </div>

      <p v-else-if="loading" class="state-message">{{ tr('Loading students...', '\u8f09\u5165\u5b78\u751f\u4e2d...') }}</p>
      <p v-else-if="loadError" class="state-message error">{{ loadError }}</p>
      <p v-else class="state-message">{{ tr('No matching students.', '\u6c92\u6709\u7b26\u5408\u7684\u5b78\u751f\u3002') }}</p>

      <button type="button" class="primary-btn" @click="submitNomination">
        {{ tr('Submit', '\u63d0\u4ea4') }}
      </button>
    </section>
  </main>
</template>

<script>
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export default {
  data() {
    return {
      classTable: ['1M', '1A', '1R', '1Y', '2M', '2A', '2R', '2Y', '3M', '3A', '3R', '3Y', '4M', '4A', '4R', '4Y', '5M', '5A', '5R', '5Y', '6M', '6A', '6R', '6Y'],
      selectedClass: JSON.parse(this.$route.query.selectedClass || '[]'),
      studentsByClass: {},
      selectedStudents: {},
      previousSelectedStudents: {},
      teacher_id: null,
      loading: false,
      loadError: ''
    };
  },
  computed: {
    allStudents() {
      return Object.values(this.studentsByClass).flat();
    },
    selectedCount() {
      return Object.values(this.selectedStudents).flat().length;
    }
  },
  created() {
    if (!this.selectedClass.length) {
      this.$router.push({ name: 'ConductAward' });
    }
  },
  methods: {
    tr(en, zh) {
      return this.$lang.locale === 'en' ? en : zh;
    },
    studentNumber(student) {
      return String(student.class_number || '').padStart(2, '0');
    },
    className(classId) {
      return this.classTable[classId - 1] || `Class ${classId}`;
    },
    isSelected(classId, studentId) {
      return (this.selectedStudents[classId] || []).includes(studentId);
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
        console.error('Failed to load teacher id:', err);
        alert(this.tr('Failed to load teacher account.', '\u8f09\u5165\u8001\u5e2b\u5e33\u6236\u5931\u6557\u3002'));
      }
    },
    async fetchStudentsForClasses() {
      const token = localStorage.getItem('token');
      if (!token) return;

      this.loading = true;
      this.loadError = '';

      try {
        await Promise.all(this.selectedClass.map(async classId => {
          this.$set(this.selectedStudents, classId, []);

          try {
            const res = await axios.get(`/api/students/by-class/${classId}`, {
              headers: { Authorization: `Bearer ${token}` }
            });
            this.$set(this.studentsByClass, classId, res.data);
          } catch (err) {
            console.error(`Failed to load students for class ${classId}:`, err);
            this.$set(this.studentsByClass, classId, []);
          }
        }));
      } catch (err) {
        this.loadError = this.tr('Failed to load students.', '\u8f09\u5165\u5b78\u751f\u5931\u6557\u3002');
      } finally {
        this.loading = false;
      }
    },
    async loadSelectedStudents() {
      const token = localStorage.getItem('token');
      if (!token || !this.teacher_id) return;

      try {
        const res = await axios.get('/api/conduct/students', {
          params: { teacher_id: this.teacher_id },
          headers: { Authorization: `Bearer ${token}` }
        });

        const selectedIds = res.data.map(stu => stu.student_id);
        const updatedSelected = { ...this.selectedStudents };

        for (const classId in this.studentsByClass) {
          const stuList = this.studentsByClass[classId] || [];
          updatedSelected[classId] = stuList
            .filter(stu => selectedIds.includes(stu.student_id))
            .map(stu => stu.student_id);
        }

        this.selectedStudents = updatedSelected;
        this.previousSelectedStudents = JSON.parse(JSON.stringify(updatedSelected));
      } catch (err) {
        console.error('Failed to load selected conduct nominations:', err);
      }
    },
    submitNomination() {
      const token = localStorage.getItem('token');
      if (!token || !this.teacher_id) {
        alert(this.tr('Please login again.', '\u8acb\u91cd\u65b0\u767b\u5165\u3002'));
        return;
      }

      const teacherId = this.teacher_id;
      const selectedStudentIds = Object.values(this.selectedStudents).flat();

      axios.post('/api/conduct/insert', {
        teacher_id: teacherId,
        student_ids: selectedStudentIds
      }, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(() => {
        for (const classId in this.previousSelectedStudents) {
          const removed = this.previousSelectedStudents[classId].filter(
            id => !this.selectedStudents[classId].includes(id)
          );

          if (removed.length > 0) {
            axios.delete('/api/conduct/delete', {
              data: {
                teacherId,
                removed
              },
              headers: { Authorization: `Bearer ${token}` }
            }).catch(err => {
              console.error('Failed to delete conduct nominations:', err);
            });
          }
        }

        this.$router.push({ name: 'ConductAward' });
      }).catch(err => {
        console.error('Failed to submit conduct nominations:', err);
        this.$router.push({ name: 'ConductAward' });
      });
    }
  },
  async mounted() {
    try {
      await this.getTeacherId();
      await this.fetchStudentsForClasses();
      await this.loadSelectedStudents();
    } catch (err) {
      console.error('Failed to prepare conduct nomination page:', err);
    }
  }
};
</script>

<style scoped>
.student-page {
  padding: 34px 20px 48px;
}

.student-panel {
  background: var(--surface);
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: var(--shadow);
  margin: 0 auto;
  max-width: 1100px;
  padding: 28px;
}

.page-header {
  align-items: flex-start;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 22px;
}

.eyebrow {
  color: var(--primary);
  font-weight: 800;
  margin: 0 0 8px;
}

h1,
h2 {
  color: var(--text);
  margin: 0;
}

h1 {
  font-size: 32px;
}

h2 {
  font-size: 20px;
  margin-bottom: 14px;
}

.count-badge {
  background: var(--soft);
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  color: var(--text);
  font-weight: 800;
  padding: 10px 16px;
  white-space: nowrap;
}

.class-section {
  background: var(--soft);
  border: 1px solid var(--border);
  border-radius: 8px;
  margin-bottom: 18px;
  padding: 16px;
}

.student-grid {
  display: grid;
  gap: 10px;
  grid-template-columns: repeat(auto-fit, minmax(190px, 1fr));
}

.student-card {
  align-items: center;
  background: #fff;
  border: 1px solid var(--border);
  border-radius: 6px;
  cursor: pointer;
  display: flex;
  gap: 8px;
  min-height: 44px;
  padding: 8px 10px;
}

.student-card:hover {
  border-color: var(--primary);
}

.student-card.selected {
  background: #e8f6f8;
  border-color: var(--primary);
}

.student-card input {
  accent-color: var(--primary);
}

.student-number {
  color: var(--primary);
  font-weight: 900;
  min-width: 2ch;
}

.student-name {
  font-weight: 700;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.state-message {
  border: 1px dashed var(--border-strong);
  border-radius: 8px;
  color: var(--text-muted);
  margin: 18px 0;
  padding: 24px;
  text-align: center;
}

.state-message.error {
  color: var(--danger);
}

.primary-btn {
  background: var(--primary);
  border: 0;
  border-radius: 6px;
  color: #fff;
  cursor: pointer;
  display: block;
  font-weight: 800;
  margin: 26px auto 0;
  padding: 13px 32px;
}

.primary-btn:hover {
  background: var(--primary-dark);
}

@media (max-width: 640px) {
  .student-panel {
    padding: 20px;
  }

  .page-header {
    flex-direction: column;
  }
}
</style>
