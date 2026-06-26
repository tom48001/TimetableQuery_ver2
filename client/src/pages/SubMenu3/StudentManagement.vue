<template>
  <main class="student-admin-page">
    <section class="admin-panel">
      <header class="page-header">
        <div>
          <h1>{{ tr('Student Management', '學生管理') }}</h1>
          <p>{{ tr('Manage profiles, status and elective subjects.', '管理學生資料、狀態及選修科。') }}</p>
        </div>
        <span class="summary-pill">{{ filteredStudents.length }} / {{ students.length }}</span>
      </header>

      <section class="toolbar-card">
        <button type="button" class="secondary-btn" @click="exportStudents">
          {{ tr('Export Student List', '匯出學生名單') }}
        </button>
        <button type="button" class="secondary-btn" @click="loadStudents">
          {{ tr('Reload', '重新載入') }}
        </button>
      </section>

      <section class="form-section">
        <h2>{{ tr('Add Student', '新增學生') }}</h2>
        <div class="form-grid">
          <label><span>REGNO *</span><input v-model.trim="newStudent.regno" /></label>
          <label><span>Email</span><input v-model.trim="newStudent.email" type="email" /></label>
          <label><span>{{ tr('Chinese Name', '中文名') }} *</span><input v-model.trim="newStudent.student_ch_name" /></label>
          <label><span>{{ tr('English Name', '英文名') }} *</span><input v-model.trim="newStudent.student_eng_name" /></label>
          <label>
            <span>{{ tr('Class', '班別') }} *</span>
            <select v-model="newStudent.class_id">
              <option value="">{{ tr('Select class', '選擇班別') }}</option>
              <option v-for="item in classes" :key="item.class_id" :value="item.class_id">{{ item.class_name }}</option>
            </select>
          </label>
          <label><span>{{ tr('Class No.', '班別學號') }} *</span><input v-model.trim="newStudent.class_number" maxlength="3" /></label>
          <label>
            <span>{{ tr('Sex', '性別') }}</span>
            <select v-model="newStudent.sex"><option>F</option><option>M</option></select>
          </label>
          <label>
            <span>Status</span>
            <select v-model="newStudent.status"><option value="active">Active</option><option value="inactive">Inactive</option></select>
          </label>
          <label class="checkbox-label"><input v-model="newStudent.is_ncs" type="checkbox" /><span>NCS</span></label>
          <label v-for="slot in electiveSlots" :key="slot.key">
            <span>{{ slot.label }}</span>
            <select v-model="newStudent[slot.key]">
              <option value="">-</option>
              <option v-for="subject in electiveSubjects" :key="subject.subject_id" :value="subject.subject_id">
                {{ subject.subject_name }}
              </option>
            </select>
          </label>
        </div>
        <button type="button" class="primary-btn" @click="addStudent">{{ tr('Add Student', '新增學生') }}</button>
      </section>

      <section class="list-section">
        <div class="filter-grid">
          <label>
            <span>{{ tr('Search', '搜尋') }}</span>
            <input v-model.trim="searchText" :placeholder="tr('REGNO, student ID, name or email', 'REGNO、學號、姓名或 Email')" />
          </label>
          <label>
            <span>{{ tr('Grade', '級別') }}</span>
            <select v-model="gradeFilter">
              <option value="">{{ tr('All grades', '全部級別') }}</option>
              <option v-for="grade in gradeLevels" :key="grade">{{ grade }}</option>
            </select>
          </label>
          <label>
            <span>{{ tr('Class', '班別') }}</span>
            <select v-model="classFilter">
              <option value="">{{ tr('All classes', '全部班別') }}</option>
              <option v-for="item in filteredClasses" :key="item.class_id" :value="String(item.class_id)">{{ item.class_name }}</option>
            </select>
          </label>
          <label>
            <span>Status</span>
            <select v-model="statusFilter"><option value="">All</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
          </label>
          <label>
            <span>NCS</span>
            <select v-model="ncsFilter"><option value="">All</option><option value="yes">NCS</option><option value="no">Non-NCS</option></select>
          </label>
          <label>
            <span>{{ tr('Duplicates', '重複資料') }}</span>
            <select v-model="duplicateFilter">
              <option value="">{{ tr('All', '全部') }}</option>
              <option value="any">{{ tr('Any duplicate', '任何重複') }}</option>
              <option value="regno">REGNO</option>
              <option value="email">Email</option>
              <option value="class_number">{{ tr('Class No.', '班別學號') }}</option>
            </select>
          </label>
        </div>

        <div class="table-wrap">
          <table v-if="paginatedStudents.length" class="student-table">
            <thead>
              <tr>
                <th>REGNO</th><th>ID</th><th>{{ tr('Class', '班別') }}</th><th>{{ tr('No.', '學號') }}</th>
                <th>{{ tr('Chinese Name', '中文名') }}</th><th>{{ tr('English Name', '英文名') }}</th><th>Email</th>
                <th>Status</th><th>NCS</th><th>X1</th><th>X2</th><th>X3</th><th>{{ tr('Action', '操作') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in paginatedStudents" :key="student.student_id" :class="{ inactive: student.status === 'inactive' }">
                <template v-if="editingStudentId === student.student_id">
                  <td><input v-model.trim="editStudent.regno" /></td>
                  <td>{{ student.student_id }}</td>
                  <td><select v-model="editStudent.class_id"><option v-for="item in classes" :key="item.class_id" :value="item.class_id">{{ item.class_name }}</option></select></td>
                  <td><input v-model.trim="editStudent.class_number" /></td>
                  <td><input v-model.trim="editStudent.student_ch_name" /></td>
                  <td><input v-model.trim="editStudent.student_eng_name" /></td>
                  <td><input v-model.trim="editStudent.email" type="email" /></td>
                  <td><select v-model="editStudent.status"><option value="active">Active</option><option value="inactive">Inactive</option></select></td>
                  <td><input v-model="editStudent.is_ncs" type="checkbox" /></td>
                  <td v-for="slot in electiveSlots" :key="slot.key">
                    <select v-model="editStudent[slot.key]">
                      <option value="">-</option>
                      <option v-for="subject in electiveSubjects" :key="subject.subject_id" :value="subject.subject_id">{{ subject.subject_name }}</option>
                    </select>
                  </td>
                  <td class="actions">
                    <button type="button" class="primary-btn compact" @click="saveStudent(student)">{{ tr('Save', '儲存') }}</button>
                    <button type="button" class="secondary-btn compact" @click="cancelEdit">{{ tr('Cancel', '取消') }}</button>
                  </td>
                </template>
                <template v-else>
                  <td :class="{ duplicate: student.duplicate_regno }">{{ student.regno || '-' }}<small v-if="student.duplicate_regno">{{ tr('Duplicate', '重複') }}</small></td>
                  <td>{{ student.student_id }}</td>
                  <td>{{ student.class_name || '-' }}</td>
                  <td :class="{ duplicate: student.duplicate_class_number }">{{ student.class_number }}<small v-if="student.duplicate_class_number">{{ tr('Duplicate', '重複') }}</small></td>
                  <td class="name-cell">{{ student.student_ch_name }}</td>
                  <td>{{ student.student_eng_name }}</td>
                  <td :class="{ duplicate: student.duplicate_email }">{{ student.email || '-' }}<small v-if="student.duplicate_email">{{ tr('Duplicate', '重複') }}</small></td>
                  <td><span class="status-pill" :class="student.status">{{ student.status }}</span></td>
                  <td>{{ student.is_ncs ? 'Yes' : 'No' }}</td>
                  <td>{{ student.x1_subject_name || '-' }}</td><td>{{ student.x2_subject_name || '-' }}</td><td>{{ student.x3_subject_name || '-' }}</td>
                  <td class="actions">
                    <button type="button" class="secondary-btn compact" @click="startEdit(student)">{{ tr('Edit', '編輯') }}</button>
                    <button type="button" class="status-btn compact" @click="toggleStatus(student)">
                      {{ student.status === 'active' ? tr('Deactivate', '停用') : tr('Activate', '啟用') }}
                    </button>
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
          <p v-else class="empty-state">{{ tr('No students found.', '找不到學生。') }}</p>
        </div>

        <div v-if="filteredStudents.length" class="pagination-bar">
          <button class="secondary-btn" :disabled="currentPage === 1" @click="currentPage -= 1">{{ tr('Previous', '上一頁') }}</button>
          <span>{{ currentPage }} / {{ totalPages }}</span>
          <button class="secondary-btn" :disabled="currentPage === totalPages" @click="currentPage += 1">{{ tr('Next', '下一頁') }}</button>
        </div>
      </section>
    </section>
  </main>
</template>

<script>
import axios from 'axios';

function blankStudent() {
  return {
    regno: '',
    email: '',
    student_ch_name: '',
    student_eng_name: '',
    class_id: '',
    class_number: '',
    sex: 'F',
    status: 'active',
    is_ncs: false,
    x1_subject_id: '',
    x2_subject_id: '',
    x3_subject_id: ''
  };
}

export default {
  name: 'StudentManagement',
  data() {
    return {
      students: [],
      classes: [],
      electiveSubjects: [],
      newStudent: blankStudent(),
      editingStudentId: null,
      editStudent: null,
      searchText: '',
      gradeFilter: '',
      classFilter: '',
      statusFilter: '',
      ncsFilter: '',
      duplicateFilter: '',
      currentPage: 1,
      pageSize: 30,
      electiveSlots: [
        { key: 'x1_subject_id', label: 'X1' },
        { key: 'x2_subject_id', label: 'X2' },
        { key: 'x3_subject_id', label: 'X3' }
      ]
    };
  },
  computed: {
    gradeLevels() {
      return Array.from(new Set(this.classes.map(item => item.grade_level).filter(Boolean))).sort();
    },
    filteredClasses() {
      return this.classes.filter(item => !this.gradeFilter || item.grade_level === this.gradeFilter);
    },
    filteredStudents() {
      const keyword = this.searchText.toLowerCase();
      return this.students.filter(student => {
        const matchesSearch = !keyword || [
          student.regno, student.student_id, student.class_number, student.student_ch_name,
          student.student_eng_name, student.email
        ].some(value => String(value || '').toLowerCase().includes(keyword));
        const matchesGrade = !this.gradeFilter || student.grade_level === this.gradeFilter;
        const matchesClass = !this.classFilter || String(student.class_id) === this.classFilter;
        const matchesStatus = !this.statusFilter || student.status === this.statusFilter;
        const matchesNcs = !this.ncsFilter ||
          (this.ncsFilter === 'yes' ? Boolean(student.is_ncs) : !student.is_ncs);
        const hasAnyDuplicate = student.duplicate_regno || student.duplicate_email || student.duplicate_class_number;
        const matchesDuplicate = !this.duplicateFilter ||
          (this.duplicateFilter === 'any' && hasAnyDuplicate) ||
          (this.duplicateFilter === 'regno' && student.duplicate_regno) ||
          (this.duplicateFilter === 'email' && student.duplicate_email) ||
          (this.duplicateFilter === 'class_number' && student.duplicate_class_number);
        return matchesSearch && matchesGrade && matchesClass && matchesStatus && matchesNcs && matchesDuplicate;
      });
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredStudents.length / this.pageSize));
    },
    paginatedStudents() {
      const start = (this.currentPage - 1) * this.pageSize;
      return this.filteredStudents.slice(start, start + this.pageSize);
    }
  },
  watch: {
    searchText() { this.currentPage = 1; },
    gradeFilter() { this.classFilter = ''; this.currentPage = 1; },
    classFilter() { this.currentPage = 1; },
    statusFilter() { this.currentPage = 1; },
    ncsFilter() { this.currentPage = 1; },
    duplicateFilter() { this.currentPage = 1; }
  },
  methods: {
    tr(en, zh) { return this.$lang.locale === 'en' ? en : zh; },
    authHeaders() { return { Authorization: `Bearer ${localStorage.getItem('token')}` }; },
    async loadClasses() {
      const res = await axios.get('/api/classes', { headers: this.authHeaders() });
      this.classes = res.data;
    },
    async loadElectives() {
      const res = await axios.get('/api/students/admin/elective-subjects', { headers: this.authHeaders() });
      this.electiveSubjects = res.data;
    },
    async loadStudents() {
      const res = await axios.get('/api/students/admin/list', { headers: this.authHeaders() });
      this.students = res.data;
      if (this.currentPage > this.totalPages) this.currentPage = this.totalPages;
    },
    errorMessage(error, fallback) {
      return (error.response && error.response.data &&
        (error.response.data.error || error.response.data.message)) || fallback;
    },
    validate(student) {
      return student.regno && student.student_ch_name && student.student_eng_name &&
        student.class_id && student.class_number;
    },
    async addStudent() {
      if (!this.validate(this.newStudent)) return alert(this.tr('Please fill in all required fields.', '請填寫所有必填欄位。'));
      try {
        await axios.post('/api/students/admin', this.newStudent, { headers: this.authHeaders() });
        this.newStudent = blankStudent();
        await this.loadStudents();
      } catch (error) {
        alert(this.errorMessage(error, this.tr('Failed to add student.', '新增學生失敗。')));
      }
    },
    startEdit(student) {
      this.editingStudentId = student.student_id;
      this.editStudent = {
        regno: student.regno || '',
        email: student.email || '',
        student_ch_name: student.student_ch_name,
        student_eng_name: student.student_eng_name,
        class_id: student.class_id,
        class_number: student.class_number,
        sex: student.sex,
        status: student.status,
        is_ncs: Boolean(student.is_ncs),
        x1_subject_id: student.x1_subject_id || '',
        x2_subject_id: student.x2_subject_id || '',
        x3_subject_id: student.x3_subject_id || ''
      };
    },
    cancelEdit() { this.editingStudentId = null; this.editStudent = null; },
    async saveStudent(student) {
      if (!this.validate(this.editStudent)) return alert(this.tr('Please fill in all required fields.', '請填寫所有必填欄位。'));
      try {
        await axios.put(`/api/students/admin/${student.student_id}`, this.editStudent, { headers: this.authHeaders() });
        this.cancelEdit();
        await this.loadStudents();
      } catch (error) {
        alert(this.errorMessage(error, this.tr('Failed to update student.', '更新學生失敗。')));
      }
    },
    async toggleStatus(student) {
      const nextStatus = student.status === 'active' ? 'inactive' : 'active';
      const action = nextStatus === 'active' ? this.tr('activate', '啟用') : this.tr('deactivate', '停用');
      if (!confirm(this.tr(`${action} ${student.student_eng_name}?`, `確定${action}${student.student_ch_name}？`))) return;
      try {
        await axios.patch(`/api/students/admin/${student.student_id}/status`, { status: nextStatus }, { headers: this.authHeaders() });
        await this.loadStudents();
      } catch (error) {
        alert(this.errorMessage(error, this.tr('Failed to update status.', '更新狀態失敗。')));
      }
    },
    csvValue(value) {
      const text = String(value === null || value === undefined ? '' : value);
      return `"${text.replace(/"/g, '""')}"`;
    },
    exportStudents() {
      const headers = ['regno', 'student_id', 'student_ch_name', 'student_eng_name', 'email', 'grade', 'class', 'class_number', 'sex', 'status', 'ncs', 'x1', 'x2', 'x3'];
      const lines = this.filteredStudents.map(student => [
        student.regno, student.student_id, student.student_ch_name, student.student_eng_name,
        student.email, student.grade_level, student.class_name, student.class_number, student.sex,
        student.status, student.is_ncs ? 'Yes' : 'No', student.x1_subject_name,
        student.x2_subject_name, student.x3_subject_name
      ].map(this.csvValue).join(','));
      const blob = new Blob(['\uFEFF' + [headers.join(','), ...lines].join('\r\n')], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = 'student_list.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    }
  },
  mounted() {
    Promise.all([this.loadClasses(), this.loadElectives(), this.loadStudents()]).catch(error => {
      alert(this.errorMessage(error, this.tr('Failed to load student management data.', '載入學生管理資料失敗。')));
    });
  }
};
</script>

<style scoped>
.student-admin-page { min-height: calc(100vh - 126px); padding: 34px 20px 64px; box-sizing: border-box; }
.admin-panel { max-width: 1480px; margin: auto; padding: 26px; border: 1px solid var(--border); border-radius: 8px; background: #fff; box-shadow: var(--shadow); }
.page-header, .toolbar-card, .pagination-bar, .actions { display: flex; align-items: center; gap: 10px; }
.page-header { justify-content: space-between; }
.page-header h1, h2 { margin: 0; color: var(--text); }
.page-header p { margin: 6px 0 0; color: var(--text-muted); }
.summary-pill, .status-pill { border-radius: 999px; padding: 6px 10px; font-weight: 800; }
.summary-pill { background: var(--primary-soft); color: var(--primary-dark); }
.toolbar-card, .form-section, .list-section { margin-top: 18px; padding: 18px; border: 1px solid var(--border); border-radius: 8px; background: var(--surface-soft); }
.form-grid, .filter-grid { display: grid; gap: 10px; margin-top: 14px; }
.form-grid { grid-template-columns: repeat(4, minmax(150px, 1fr)); }
.filter-grid { grid-template-columns: minmax(260px, 2fr) repeat(5, minmax(125px, 1fr)); }
label { display: grid; gap: 5px; color: var(--text-muted); font-size: 12px; font-weight: 800; }
input, select { width: 100%; min-width: 90px; height: 40px; box-sizing: border-box; border: 1px solid var(--border-strong); border-radius: 6px; background: #fff; padding: 0 9px; }
.checkbox-label { display: flex; align-items: center; align-self: end; height: 40px; }
.checkbox-label input { width: 18px; height: 18px; }
button { border-radius: 6px; cursor: pointer; font-weight: 800; padding: 0 14px; height: 40px; }
.primary-btn { border: none; background: var(--primary); color: #fff; margin-top: 14px; }
.secondary-btn, .status-btn { border: 1px solid var(--border-strong); background: #fff; color: var(--text); }
.status-btn { color: #8c4029; }
.compact { height: 32px; margin: 0; padding: 0 9px; }
.table-wrap { margin-top: 14px; overflow: auto; max-height: 680px; }
.student-table { width: 100%; min-width: 1680px; border-collapse: collapse; background: #fff; }
.student-table th, .student-table td { border: 1px solid var(--border); padding: 8px; vertical-align: middle; }
.student-table th { position: sticky; top: 0; z-index: 1; background: #edf5f7; white-space: nowrap; }
.student-table tr.inactive { opacity: 0.62; background: #f5f5f5; }
.name-cell { font-weight: 800; }
.duplicate { background: #fff0ed; color: #9d3028; font-weight: 800; }
.duplicate small { display: block; margin-top: 3px; }
.status-pill.active { background: #e7f5ea; color: #22623a; }
.status-pill.inactive { background: #eceff1; color: #5c6870; }
.actions { flex-wrap: wrap; }
.pagination-bar { justify-content: center; margin-top: 14px; }
.empty-state { padding: 28px; text-align: center; color: var(--text-muted); }
@media (max-width: 1000px) {
  .form-grid, .filter-grid { grid-template-columns: repeat(2, minmax(150px, 1fr)); }
}
@media (max-width: 640px) {
  .admin-panel { padding: 16px; }
  .page-header, .toolbar-card { align-items: stretch; flex-direction: column; }
  .form-grid, .filter-grid { grid-template-columns: 1fr; }
}
</style>
