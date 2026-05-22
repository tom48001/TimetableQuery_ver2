<template>
  <div class="nomination-page">
    <h1>風紀提名</h1>

    <div v-for="classItem in selectedClass" :key="classItem" class="class-section">
      <h3>{{ className(classItem) }}</h3>

      <div v-if="studentsByClass[classItem]" class="student-grid">
        <label
          v-for="student in studentsByClass[classItem]"
          :key="student.student_id"
          class="student-option"
          :class="{ selected: selectedStudents[classItem].includes(student.student_id) }"
        >
          <input
            type="checkbox"
            :value="student.student_id"
            v-model="selectedStudents[classItem]"
          />
          {{ student.student_name }}
        </label>
      </div>
      <div v-else class="loading">載入中...</div>
    </div>

    <button @click="submitNomination">提交</button>
  </div>
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
      teacher_id: null
    };
  },
  created() {
    if (!this.selectedClass.length) {
      this.$router.push({ name: 'PrefectNomination' });
    }
  },
  methods: {
    className(classId) {
      return this.classTable[classId - 1] || `Class ${classId}`;
    },
    async getTeacherId() {
      const token = localStorage.getItem('token');
      if (!token) return;

      const decoded = jwtDecode(token);
      const res = await axios.get(`http://localhost:3000/api/teachers/from-user/${decoded.id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });

      this.teacher_id = res.data.teacher_id;
    },
    async fetchStudentsForClasses() {
      const token = localStorage.getItem('token');
      if (!token) return;

      await Promise.all(this.selectedClass.map(async classId => {
        this.$set(this.selectedStudents, classId, []);

        try {
          const res = await axios.get(`http://localhost:3000/api/students/by-class/${classId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });
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
        const res = await axios.get('http://localhost:3000/api/prefect/students', {
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
        console.error('Failed to load selected prefect nominations:', err);
      }
    },
    submitNomination() {
      const token = localStorage.getItem('token');
      if (!token || !this.teacher_id) return;

      const teacherId = this.teacher_id;
      const selectedStudentIds = Object.values(this.selectedStudents).flat();

      axios.post('http://localhost:3000/api/prefect/insert', {
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
            axios.delete('http://localhost:3000/api/prefect/delete', {
              data: {
                teacherId,
                removed
              },
              headers: { Authorization: `Bearer ${token}` }
            }).catch(err => {
              console.error('Failed to delete prefect nominations:', err);
            });
          }
        }

        this.$router.push({ name: 'PrefectNomination' });
      }).catch(err => {
        console.error('Failed to submit prefect nominations:', err);
        this.$router.push({ name: 'PrefectNomination' });
      });
    }
  },
  async mounted() {
    try {
      await this.getTeacherId();
      await this.fetchStudentsForClasses();
      await this.loadSelectedStudents();
    } catch (err) {
      console.error('Failed to prepare prefect nomination page:', err);
    }
  }
};
</script>

<style scoped>
h1,
h3 {
  text-align: center;
}

.class-section {
  margin-bottom: 20px;
}

.student-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin: 20px 0;
}

.student-option {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: 8px;
  border: 2px solid #dcdcdc;
  background-color: #f9f9f9;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  min-width: 180px;
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.05);
}

.student-option:hover {
  background-color: #eaf3ff;
  border-color: #7ab8f5;
}

.student-option.selected {
  background-color: #007bff;
  color: white;
  border-color: #0056b3;
}

.student-option input[type="checkbox"] {
  margin-right: 8px;
  accent-color: #007bff;
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
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}
</style>
