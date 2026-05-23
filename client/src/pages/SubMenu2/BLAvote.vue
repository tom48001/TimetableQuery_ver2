<template>
  <main class="student-page">
    <h1>選擇學生</h1>

    <div class="table-wrap">
      <table v-if="studentRows.length" class="student-table">
        <tbody>
          <tr v-for="(row, rowIndex) in studentRows" :key="rowIndex">
            <td v-for="cellIndex in columns" :key="cellIndex">
              <label v-if="row[cellIndex - 1]" class="student-option">
                <input
                  type="checkbox"
                  :value="row[cellIndex - 1].student_id"
                  v-model="selectedStudents[row[cellIndex - 1].class_id]"
                />
                <span>{{ studentNumber(row[cellIndex - 1]) }} {{ row[cellIndex - 1].student_name }}</span>
              </label>
            </td>
          </tr>
        </tbody>
      </table>

      <p v-else class="state-text">載入中...</p>
    </div>

    <button type="button" @click="submitNomination">Submit</button>
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
      columns: 5,
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
    studentRows() {
      const rows = [];
      for (let index = 0; index < this.allStudents.length; index += this.columns) {
        rows.push(this.allStudents.slice(index, index + this.columns));
      }
      return rows;
    }
  },
  methods: {
    studentNumber(student) {
      return String(student.class_number || '').padStart(2, '0');
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
        alert('提交失敗。');
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
  padding: 14px 20px 48px;
  background: #fff;
  color: #000;
}

h1 {
  margin: 0 0 28px;
  text-align: center;
  font-size: 32px;
  font-weight: 800;
  letter-spacing: 0;
}

.table-wrap {
  max-width: 1010px;
  margin: 0 auto;
  overflow-x: auto;
}

.student-table {
  width: 100%;
  border: 1px solid #444;
  border-collapse: separate;
  border-spacing: 2px;
  background: #fff;
}

.student-table td {
  width: 20%;
  border: 1px solid #666;
  height: 24px;
  padding: 2px 6px;
  font-size: 16px;
  line-height: 1.25;
  vertical-align: middle;
}

.student-option {
  display: flex;
  align-items: center;
  gap: 4px;
  cursor: pointer;
  white-space: nowrap;
}

.student-option input {
  width: 13px;
  height: 13px;
  margin: 0;
}

.state-text {
  border: 1px solid #777;
  margin: 0;
  padding: 24px;
  text-align: center;
}

button {
  display: block;
  border: 1px solid #555;
  border-radius: 4px;
  background: #f4f4f4;
  color: #000;
  cursor: pointer;
  font-size: 14px;
  margin: 18px auto 0;
  padding: 3px 10px;
}

button:hover {
  background: #e7e7e7;
}

@media (max-width: 760px) {
  .student-table {
    min-width: 920px;
  }
}
</style>
