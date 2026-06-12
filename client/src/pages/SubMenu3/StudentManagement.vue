<template>
  <main class="student-admin-page">
    <section class="admin-panel">
      <header class="page-header">
        <div>
          <p>{{ tr('Student Records', '學生資料') }}</p>
          <h1>{{ tr('Student Management', '學生管理') }}</h1>
        </div>
        <span class="summary-pill">{{ filteredStudents.length }} / {{ students.length }} {{ tr('students', '學生') }}</span>
      </header>

      <section class="form-section">
        <h2>{{ tr('Add Student', '新增學生') }}</h2>
        <div class="form-grid">
          <label>
            <span>{{ tr('Class', '班別') }}</span>
            <select v-model="newStudent.class_id">
              <option value="">{{ tr('Select class', '選擇班別') }}</option>
              <option v-for="classItem in classes" :key="classItem.class_id" :value="classItem.class_id">
                {{ classItem.class_name }}
              </option>
            </select>
          </label>
          <label>
            <span>{{ tr('Class No.', '學號') }}</span>
            <input v-model.trim="newStudent.class_number" maxlength="2" placeholder="01" />
          </label>
          <label>
            <span>{{ tr('Chinese Name', '中文姓名') }}</span>
            <input v-model.trim="newStudent.student_ch_name" :placeholder="tr('Chinese name', '中文姓名')" />
          </label>
          <label>
            <span>{{ tr('English Name', '英文姓名') }}</span>
            <input v-model.trim="newStudent.student_eng_name" :placeholder="tr('English name', '英文姓名')" />
          </label>
          <label>
            <span>{{ tr('Sex', '性別') }}</span>
            <select v-model="newStudent.sex">
              <option value="F">F</option>
              <option value="M">M</option>
            </select>
          </label>
        </div>
        <button type="button" class="primary-btn" @click="addStudent">{{ tr('Add', '新增') }}</button>
      </section>

      <section class="list-section">
        <div class="list-toolbar">
          <div class="filter-grid">
            <label>
              <span>{{ tr('Search', '搜尋') }}</span>
              <input v-model.trim="searchText" type="text" :placeholder="tr('Search student...', '搜尋學生...')" />
            </label>
            <label>
              <span>{{ tr('Class', '班別') }}</span>
              <select v-model="selectedClassId">
                <option value="">{{ tr('All classes', '全部班別') }}</option>
                <option v-for="classItem in classes" :key="classItem.class_id" :value="String(classItem.class_id)">
                  {{ classItem.class_name }}
                </option>
              </select>
            </label>
            <label>
              <span>{{ tr('Class No.', '學號') }}</span>
              <input v-model.trim="classNumberFilter" type="text" placeholder="01" />
            </label>
          </div>
          <button type="button" class="secondary-btn" @click="loadStudents">{{ tr('Reload', '重新載入') }}</button>
        </div>

        <div class="table-wrap">
          <table v-if="paginatedStudents.length" class="student-table">
            <thead>
              <tr>
                <th>{{ tr('Class', '班別') }}</th>
                <th>{{ tr('Class No.', '學號') }}</th>
                <th>{{ tr('Chinese Name', '中文姓名') }}</th>
                <th>{{ tr('English Name', '英文姓名') }}</th>
                <th>{{ tr('Sex', '性別') }}</th>
                <th>{{ tr('Action', '操作') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in paginatedStudents" :key="student.student_id">
                <td>{{ student.class_name || '-' }}</td>
                <td>{{ student.class_number }}</td>
                <td class="name-cell">{{ student.student_ch_name }}</td>
                <td>{{ student.student_eng_name }}</td>
                <td>{{ student.sex }}</td>
                <td><button type="button" class="danger-btn" @click="deleteStudent(student)">{{ tr('Delete', '刪除') }}</button></td>
              </tr>
            </tbody>
          </table>
          <p v-else class="empty-state">{{ tr('No students found.', '沒有符合的學生。') }}</p>
        </div>

        <div v-if="filteredStudents.length" class="pagination-bar">
          <button type="button" class="secondary-btn" :disabled="currentPage === 1" @click="currentPage -= 1">
            {{ tr('Previous', '上一頁') }}
          </button>
          <span>{{ tr('Page', '\u9801') }} {{ currentPage }} / {{ totalPages }}</span>
          <button type="button" class="secondary-btn" :disabled="currentPage === totalPages" @click="currentPage += 1">
            {{ tr('Next', '下一頁') }}
          </button>
        </div>
      </section>
    </section>
  </main>
</template>

<script>
import axios from 'axios';

export default {
  name: 'StudentManagement',
  data() {
    return {
      students: [],
      classes: [],
      searchText: '',
      selectedClassId: '',
      classNumberFilter: '',
      pageSize: 25,
      currentPage: 1,
      newStudent: {
        student_ch_name: '',
        student_eng_name: '',
        class_id: '',
        class_number: '',
        sex: 'F'
      }
    };
  },
  computed: {
    filteredStudents() {
      const keyword = this.searchText.toLowerCase();
      return this.students.filter(student => {
        const matchesClass = !this.selectedClassId || String(student.class_id) === String(this.selectedClassId);
        const matchesClassNumber = !this.classNumberFilter || String(student.class_number || '').includes(this.classNumberFilter);
        const matchesSearch = !keyword || [
          student.class_name,
          student.class_number,
          student.student_ch_name,
          student.student_eng_name,
          student.sex
        ].some(value => String(value || '').toLowerCase().includes(keyword));
        return matchesClass && matchesClassNumber && matchesSearch;
      });
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredStudents.length / this.pageSize));
    },
    paginatedStudents() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredStudents.slice(start, start + this.pageSize);
    },
    pageRangeLabel() {
      if (!this.filteredStudents.length) return this.tr('No records', '沒有記錄');
      const start = (this.currentPage - 1) * this.pageSize + 1;
      const end = Math.min(start + this.pageSize - 1, this.filteredStudents.length);
      return this.tr(`Showing ${start}-${end}`, `\u986f\u793a\u7b2c ${start}-${end} \u4f4d`);
    }
  },
  watch: {
    searchText() {
      this.currentPage = 1;
    },
    selectedClassId() {
      this.currentPage = 1;
    },
    classNumberFilter() {
      this.currentPage = 1;
    },
    filteredStudents() {
      if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    }
  },
  methods: {
    tr(en, zh) {
      return this.$lang.locale === 'en' ? en : zh;
    },
    authHeaders() {
      const token = localStorage.getItem('token');
      return { Authorization: `Bearer ${token}` };
    },
    async loadClasses() {
      const res = await axios.get('/api/classes', {
        headers: this.authHeaders()
      });
      this.classes = res.data;
    },
    async loadStudents() {
      try {
        const res = await axios.get('/api/students/admin/list', {
          headers: this.authHeaders()
        });
        this.students = res.data;
        if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
      } catch (error) {
        const status = error.response ? error.response.status : 0;
        alert(status === 403
          ? this.tr('You do not have permission to view students.', '你沒有權限查看學生資料。')
          : this.tr('Failed to load students.', '載入學生失敗。'));
      }
    },
    resetForm() {
      this.newStudent = {
        student_ch_name: '',
        student_eng_name: '',
        class_id: '',
        class_number: '',
        sex: 'F'
      };
    },
    async addStudent() {
      if (!this.newStudent.class_id || !this.newStudent.class_number || !this.newStudent.student_ch_name || !this.newStudent.student_eng_name) {
        alert(this.tr('Please fill in all required fields.', '請填寫所有必填欄位。'));
        return;
      }

      try {
        await axios.post('/api/students/admin', this.newStudent, {
          headers: this.authHeaders()
        });
        alert(this.tr('Student added.', '學生已新增。'));
        this.resetForm();
        this.loadStudents();
      } catch (error) {
        const status = error.response ? error.response.status : 0;
        alert(status === 409
          ? this.tr('Student already exists.', '學生已存在。')
          : this.tr('Failed to add student.', '新增學生失敗。'));
      }
    },
    async deleteStudent(student) {
      const label = `${student.class_name || ''}${student.class_number || ''} ${student.student_ch_name || student.student_eng_name}`.trim();
      if (!confirm(this.tr(`Delete ${label}?`, `\u78ba\u5b9a\u522a\u9664 ${label}\uff1f`))) return;

      try {
        await axios.delete(`/api/students/admin/${student.student_id}`, {
          headers: this.authHeaders()
        });
        alert(this.tr('Student deleted.', '學生已刪除。'));
        this.loadStudents();
      } catch (error) {
        alert(this.tr('Failed to delete student.', '刪除學生失敗。'));
      }
    }
  },
  mounted() {
    this.loadClasses();
    this.loadStudents();
  }
};
</script>

<style scoped>
.student-admin-page {
  min-height: calc(100vh - 126px);
  box-sizing: border-box;
  padding: 44px 20px 64px;
}

.admin-panel {
  max-width: 1120px;
  margin: 0 auto;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--shadow);
  box-sizing: border-box;
  padding: 26px;
}

.page-header,
.list-toolbar,
.pagination-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
}

.page-header p {
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
}

h1 {
  font-size: 32px;
}

h2 {
  font-size: 22px;
}

.summary-pill {
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  background: var(--surface-soft);
  color: var(--text-muted);
  font-weight: 800;
  padding: 9px 14px;
  white-space: nowrap;
}

.form-section,
.list-section {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-soft);
  margin-top: 22px;
  padding: 18px;
}

.form-grid,
.filter-grid {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.form-grid {
  grid-template-columns: repeat(5, minmax(130px, 1fr));
}

.filter-grid {
  flex: 1;
  grid-template-columns: minmax(220px, 1.6fr) minmax(150px, 0.8fr) minmax(130px, 0.6fr);
  margin-top: 0;
}

label {
  display: grid;
  gap: 6px;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 800;
}

input,
select {
  width: 100%;
  height: 42px;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  background: #fff;
  box-sizing: border-box;
  color: var(--text);
  font-size: 14px;
  padding: 0 10px;
}

input:focus,
select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(11, 114, 133, 0.13);
  outline: none;
}

.primary-btn,
.secondary-btn,
.danger-btn {
  height: 42px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 800;
  padding: 0 16px;
}

.primary-btn {
  background: var(--primary);
  color: #fff;
  margin-top: 14px;
}

.secondary-btn {
  background: #fff;
  border: 1px solid var(--border-strong);
  color: var(--text);
}

.danger-btn {
  background: var(--danger);
  color: #fff;
}

.primary-btn:hover {
  background: var(--primary-dark);
}

.secondary-btn:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.secondary-btn:disabled {
  background: #d7e1e6;
  color: #7b8d97;
  cursor: not-allowed;
}

.danger-btn:hover {
  background: #9f302b;
}

.table-wrap {
  overflow-x: auto;
  margin-top: 14px;
}

.student-table {
  width: 100%;
  min-width: 820px;
  border-collapse: collapse;
  background: #fff;
}

.student-table th,
.student-table td {
  border: 1px solid var(--border);
  padding: 10px;
  text-align: left;
}

.student-table th {
  position: sticky;
  top: 0;
  background: #f3f8fa;
  color: var(--text);
  font-weight: 800;
}

.name-cell {
  font-weight: 800;
}

.pagination-bar {
  justify-content: center;
  color: var(--text-muted);
  font-weight: 800;
  margin-top: 14px;
}

.empty-state {
  border: 1px dashed var(--border-strong);
  border-radius: 8px;
  color: var(--text-muted);
  margin: 0;
  padding: 28px;
  text-align: center;
}

@media (max-width: 900px) {
  .form-grid {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
  }

  .filter-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 640px) {
  .admin-panel {
    padding: 20px;
  }

  .page-header,
  .list-toolbar,
  .pagination-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .primary-btn,
  .secondary-btn {
    max-width: none;
    width: 100%;
  }
}
</style>
