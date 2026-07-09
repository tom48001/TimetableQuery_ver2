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

      <section class="stats-grid">
        <article class="stat-card">
          <span>{{ tr('Active', '啟用') }}</span>
          <strong>{{ activeCount }}</strong>
        </article>
        <article class="stat-card muted">
          <span>{{ tr('Inactive', '停用') }}</span>
          <strong>{{ inactiveCount }}</strong>
        </article>
        <article class="stat-card warn">
          <span>{{ tr('Duplicates', '重複資料') }}</span>
          <strong>{{ duplicateCount }}</strong>
        </article>
        <article class="stat-card teal">
          <span>NCS</span>
          <strong>{{ ncsCount }}</strong>
        </article>
      </section>

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
          <label><span>ClsNo</span><input v-model.trim="newStudent.class_code" /></label>
          <label>
            <span>{{ tr('Sex', '性別') }}</span>
            <select v-model="newStudent.sex"><option>F</option><option>M</option></select>
          </label>
          <label>
            <span>Status</span>
            <select v-model="newStudent.status"><option value="active">Active</option><option value="inactive">Inactive</option></select>
          </label>
          <label>
            <span>NCS</span>
            <select v-model="newStudent.is_ncs">
              <option v-for="option in ncsOptions" :key="option" :value="option">{{ option }}</option>
            </select>
          </label>
          <label><span>{{ tr('Citizenship', '公社') }}</span><select v-model="newStudent.citizenship"><option v-for="option in citizenshipOptions" :key="option" :value="option">{{ option }}</option></select></label>
          <template v-if="usesDse(newStudent)">
            <label v-for="slot in electiveSlots" :key="slot.key">
              <span>{{ slot.label }}</span>
              <select v-model="newStudent[slot.key]">
                <option value="">-</option>
                <option v-for="subject in electiveSubjects" :key="subject.subject_id" :value="subject.subject_id">
                  {{ subject.subject_name }}
                </option>
              </select>
            </label>
          </template>
          <label><span>{{ tr('House', '社別') }}</span><select v-model="newStudent.house"><option v-for="option in houseOptions" :key="option" :value="option">{{ option }}</option></select></label>
          <label><span>{{ tr('Language Group', '語言組別') }}</span><select v-model="newStudent.language_group"><option v-for="option in languageGroupOptions" :key="option" :value="option">{{ option }}</option></select></label>
          <label><span>SUPP CLASS</span><select v-model="newStudent.supp_class"><option v-for="option in suppClassOptions" :key="option" :value="option">{{ option }}</option></select></label>
          <label><span>{{ tr('Maths', '數學/Maths') }}</span><select v-model="newStudent.maths_group"><option v-for="option in mathsOptions" :key="option" :value="option">{{ option }}</option></select></label>
          <label><span>{{ tr('Dropped Subjects', '退選科目') }}</span><input v-model.trim="newStudent.dropped_subjects" /></label>
          <label class="wide-field"><span>{{ tr('Remarks', '備註') }}</span><input v-model.trim="newStudent.remarks" /></label>
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
                <th>REGNO</th><th>ID</th><th>{{ tr('Class', '班別') }}</th><th>{{ tr('No.', '學號') }}</th><th>ClsNo</th>
                <th>{{ tr('Chinese Name', '中文名') }}</th><th>{{ tr('English Name', '英文名') }}</th><th>Email</th>
                <th>Status</th><th>NCS</th><th>X1</th><th>X2</th><th>X3</th>
                <th>{{ tr('House', '社別') }}</th><th>{{ tr('Language', '語言') }}</th><th>SUPP</th>
                <th>{{ tr('Maths', '數學') }}</th><th>{{ tr('Citizenship', '公社') }}</th>
                <th>{{ tr('Dropped', '退選') }}</th><th>{{ tr('Remarks', '備註') }}</th><th class="action-cell">{{ tr('Action', '操作') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="student in paginatedStudents" :key="student.student_id" :class="{ inactive: student.status === 'inactive' }">
                <template v-if="editingStudentId === student.student_id">
                  <td><input v-model.trim="editStudent.regno" /></td>
                  <td>{{ student.student_id }}</td>
                  <td><select v-model="editStudent.class_id"><option v-for="item in classes" :key="item.class_id" :value="item.class_id">{{ item.class_name }}</option></select></td>
                  <td><input v-model.trim="editStudent.class_number" /></td>
                  <td><input v-model.trim="editStudent.class_code" /></td>
                  <td><input v-model.trim="editStudent.student_ch_name" /></td>
                  <td><input v-model.trim="editStudent.student_eng_name" /></td>
                  <td><input v-model.trim="editStudent.email" type="email" /></td>
                  <td><select v-model="editStudent.status"><option value="active">Active</option><option value="inactive">Inactive</option></select></td>
                  <td><select v-model="editStudent.is_ncs"><option v-for="option in ncsOptions" :key="option" :value="option">{{ option }}</option></select></td>
                  <td v-for="slot in electiveSlots" :key="slot.key">
                    <select v-if="usesDse(editStudent)" v-model="editStudent[slot.key]">
                      <option value="">-</option>
                      <option v-for="subject in electiveSubjects" :key="subject.subject_id" :value="subject.subject_id">{{ subject.subject_name }}</option>
                    </select>
                    <span v-else>-</span>
                  </td>
                  <td><select v-model="editStudent.house"><option v-for="option in houseOptions" :key="option" :value="option">{{ option }}</option></select></td>
                  <td><select v-model="editStudent.language_group"><option v-for="option in languageGroupOptions" :key="option" :value="option">{{ option }}</option></select></td>
                  <td><select v-model="editStudent.supp_class"><option v-for="option in suppClassOptions" :key="option" :value="option">{{ option }}</option></select></td>
                  <td><select v-model="editStudent.maths_group"><option v-for="option in mathsOptions" :key="option" :value="option">{{ option }}</option></select></td>
                  <td><select v-model="editStudent.citizenship"><option v-for="option in citizenshipOptions" :key="option" :value="option">{{ option }}</option></select></td>
                  <td><input v-model.trim="editStudent.dropped_subjects" /></td>
                  <td><input v-model.trim="editStudent.remarks" /></td>
                  <td class="actions action-cell">
                    <button type="button" class="primary-btn compact" @click="saveStudent(student)">{{ tr('Save', '儲存') }}</button>
                    <button type="button" class="secondary-btn compact" @click="cancelEdit">{{ tr('Cancel', '取消') }}</button>
                  </td>
                </template>
                <template v-else>
                  <td :class="{ duplicate: student.duplicate_regno }">{{ student.regno || '-' }}<small v-if="student.duplicate_regno">{{ tr('Duplicate', '重複') }}</small></td>
                  <td>{{ student.student_id }}</td>
                  <td>{{ student.class_name || '-' }}</td>
                  <td :class="{ duplicate: student.duplicate_class_number }">{{ student.class_number }}<small v-if="student.duplicate_class_number">{{ tr('Duplicate', '重複') }}</small></td>
                  <td>{{ student.class_code || '-' }}</td>
                  <td class="name-cell">{{ student.student_ch_name }}</td>
                  <td>{{ student.student_eng_name }}</td>
                  <td :class="{ duplicate: student.duplicate_email }">{{ student.email || '-' }}<small v-if="student.duplicate_email">{{ tr('Duplicate', '重複') }}</small></td>
                  <td><span class="status-pill" :class="student.status">{{ student.status }}</span></td>
                  <td>{{ student.is_ncs ? 'Y' : 'N' }}</td>
                  <td>{{ student.x1_subject_name || '-' }}</td><td>{{ student.x2_subject_name || '-' }}</td><td>{{ student.x3_subject_name || '-' }}</td>
                  <td>{{ student.house || '-' }}</td><td>{{ student.language_group || '-' }}</td><td>{{ student.supp_class || '-' }}</td>
                  <td>{{ student.maths_group || '-' }}</td><td>{{ student.citizenship || '-' }}</td>
                  <td>{{ student.dropped_subjects || '-' }}</td><td>{{ student.remarks || '-' }}</td>
                  <td class="actions action-cell">
                    <button type="button" class="secondary-btn compact" @click="startEdit(student)">{{ tr('Edit', '編輯') }}</button>
                    <button type="button" class="danger-btn compact" @click="deleteStudent(student)">{{ tr('Delete', '刪除') }}</button>
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
    class_code: '',
    sex: 'F',
    status: 'active',
    is_ncs: 'N',
    x1_subject_id: '',
    x2_subject_id: '',
    x3_subject_id: '',
    house: '紅社',
    language_group: '英文組(EMI)',
    supp_class: '無',
    maths_group: '核心課程(英文)',
    citizenship: '公民、經濟與社會',
    dropped_subjects: '',
    remarks: ''
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
      ],
      languageGroupOptions: ['英文組(EMI)', '純英文組(EMI)', '中文組(CMI)'],
      houseOptions: ['紅社', '藍社', '黃社', '綠社'],
      ncsOptions: ['N', 'Y'],
      mathsOptions: ['核心課程(英文)', '核心課程(中文)'],
      citizenshipOptions: ['公民、經濟與社會', '修讀 (DSE)'],
      suppClassOptions: ['無', '中文提升班', '數學試前補底', '英文拔尖班']
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
          student.student_eng_name, student.email, student.class_code, student.house,
          student.language_group, student.supp_class, student.maths_group,
          student.citizenship, student.dropped_subjects, student.remarks
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
    },
    activeCount() {
      return this.students.filter(student => student.status === 'active').length;
    },
    inactiveCount() {
      return this.students.filter(student => student.status === 'inactive').length;
    },
    duplicateCount() {
      return this.students.filter(student => student.duplicate_regno || student.duplicate_email || student.duplicate_class_number).length;
    },
    ncsCount() {
      return this.students.filter(student => student.is_ncs).length;
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
    usesDse(student) {
      return String((student && student.citizenship) || '').trim() === '修讀 (DSE)';
    },
    ncsValue(value) {
      return value ? 'Y' : 'N';
    },
    studentPayload(student) {
      const payload = { ...student };
      if (!this.usesDse(payload)) {
        payload.x1_subject_id = '';
        payload.x2_subject_id = '';
        payload.x3_subject_id = '';
      }
      return payload;
    },
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
        await axios.post('/api/students/admin', this.studentPayload(this.newStudent), { headers: this.authHeaders() });
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
        class_code: student.class_code || '',
        sex: student.sex,
        status: student.status,
        is_ncs: this.ncsValue(student.is_ncs),
        x1_subject_id: student.x1_subject_id || '',
        x2_subject_id: student.x2_subject_id || '',
        x3_subject_id: student.x3_subject_id || '',
        house: student.house || '',
        language_group: student.language_group || '',
        supp_class: student.supp_class || '',
        maths_group: student.maths_group || '',
        citizenship: student.citizenship || '',
        dropped_subjects: student.dropped_subjects || '',
        remarks: student.remarks || ''
      };
    },
    cancelEdit() { this.editingStudentId = null; this.editStudent = null; },
    async saveStudent(student) {
      if (!this.validate(this.editStudent)) return alert(this.tr('Please fill in all required fields.', '請填寫所有必填欄位。'));
      try {
        await axios.put(`/api/students/admin/${student.student_id}`, this.studentPayload(this.editStudent), { headers: this.authHeaders() });
        this.cancelEdit();
        await this.loadStudents();
      } catch (error) {
        alert(this.errorMessage(error, this.tr('Failed to update student.', '更新學生失敗。')));
      }
    },
    async deleteStudent(student) {
      const name = this.$lang.locale === 'en'
        ? (student.student_eng_name || student.student_ch_name || student.student_id)
        : (student.student_ch_name || student.student_eng_name || student.student_id);
      if (!confirm(this.tr(
        `Delete ${name}? This cannot be undone.`,
        `確定刪除 ${name}？此操作不能復原。`
      ))) return;

      try {
        await axios.delete(`/api/students/admin/${student.student_id}`, { headers: this.authHeaders() });
        if (this.editingStudentId === student.student_id) this.cancelEdit();
        await this.loadStudents();
      } catch (error) {
        alert(this.errorMessage(error, this.tr('Failed to delete student.', '刪除學生失敗。')));
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
      const headers = [
        'regno', 'student_id', 'student_ch_name', 'student_eng_name', 'email',
        'grade', 'class', 'class_number', 'class_code', 'sex', 'status', 'ncs',
        'x1', 'x2', 'x3', 'house', 'language_group', 'supp_class',
        'maths_group', 'citizenship', 'dropped_subjects', 'remarks'
      ];
      const lines = this.filteredStudents.map(student => [
        student.regno, student.student_id, student.student_ch_name, student.student_eng_name,
        student.email, student.grade_level, student.class_name, student.class_number, student.class_code, student.sex,
        student.status, student.is_ncs ? 'Yes' : 'No', student.x1_subject_name,
        student.x2_subject_name, student.x3_subject_name, student.house,
        student.language_group, student.supp_class, student.maths_group,
        student.citizenship, student.dropped_subjects, student.remarks
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
.student-admin-page {
  box-sizing: border-box;
  min-height: calc(100vh - 126px);
  padding: 34px 20px 64px;
}

.admin-panel {
  background: linear-gradient(180deg, rgba(255, 255, 255, 0.98), rgba(248, 252, 253, 0.98));
  border: 1px solid var(--border);
  border-radius: 14px;
  box-shadow: 0 18px 45px rgba(25, 54, 69, 0.12);
  margin: auto;
  max-width: 1500px;
  padding: 26px;
}

.page-header,
.toolbar-card,
.pagination-bar,
.actions {
  align-items: center;
  display: flex;
  gap: 10px;
}

.page-header {
  justify-content: space-between;
}

.page-header h1,
h2 {
  color: var(--text);
  margin: 0;
}

.page-header h1 {
  font-size: 34px;
}

.page-header p {
  color: var(--text-muted);
  font-weight: 700;
  margin: 6px 0 0;
}

.summary-pill,
.status-pill {
  border-radius: 999px;
  font-weight: 900;
  padding: 6px 10px;
}

.summary-pill {
  background: var(--primary-soft);
  color: var(--primary-dark);
}

.stats-grid {
  display: grid;
  gap: 12px;
  grid-template-columns: repeat(4, minmax(140px, 1fr));
  margin-top: 18px;
}

.stat-card {
  background: #ffffff;
  border: 1px solid var(--border);
  border-left: 5px solid #2f855a;
  border-radius: 12px;
  box-shadow: 0 10px 24px rgba(25, 54, 69, 0.07);
  padding: 14px 16px;
}

.stat-card span {
  color: var(--text-muted);
  display: block;
  font-size: 12px;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.stat-card strong {
  color: var(--text);
  display: block;
  font-size: 30px;
  line-height: 1.1;
  margin-top: 6px;
}

.stat-card.muted { border-left-color: #718096; }
.stat-card.warn { border-left-color: #d97706; }
.stat-card.teal { border-left-color: var(--primary); }

.toolbar-card,
.form-section,
.list-section {
  background: #ffffff;
  border: 1px solid var(--border);
  border-radius: 12px;
  box-shadow: 0 8px 24px rgba(25, 54, 69, 0.06);
  margin-top: 18px;
  padding: 18px;
}

.toolbar-card {
  justify-content: flex-end;
}

.form-section {
  background: linear-gradient(180deg, #ffffff, #f8fbfc);
}

.form-grid,
.filter-grid {
  display: grid;
  gap: 12px;
  margin-top: 14px;
}

.form-grid {
  grid-template-columns: repeat(4, minmax(150px, 1fr));
}

.wide-field {
  grid-column: span 2;
}

.filter-grid {
  grid-template-columns: minmax(280px, 2fr) repeat(5, minmax(130px, 1fr));
}

label {
  color: var(--text-muted);
  display: grid;
  font-size: 12px;
  font-weight: 900;
  gap: 6px;
}

input,
select {
  background: #fff;
  border: 1px solid var(--border-strong);
  border-radius: 8px;
  box-sizing: border-box;
  height: 42px;
  min-width: 90px;
  padding: 0 10px;
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
  width: 100%;
}

input:focus,
select:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(11, 114, 133, 0.14);
  outline: none;
}

.checkbox-label {
  align-items: center;
  align-self: end;
  display: flex;
  height: 42px;
}

.checkbox-label input {
  height: 18px;
  width: 18px;
}

button {
  border-radius: 8px;
  cursor: pointer;
  font-weight: 900;
  height: 40px;
  padding: 0 14px;
}

.primary-btn {
  background: var(--primary);
  border: none;
  color: #fff;
  margin-top: 14px;
}

.primary-btn:hover {
  background: var(--primary-dark);
}

.secondary-btn,
.status-btn,
.danger-btn {
  background: #fff;
  border: 1px solid var(--border-strong);
  color: var(--text);
}

.secondary-btn:hover,
.status-btn:hover {
  background: var(--surface-soft);
}

.status-btn {
  color: #8c4029;
}

.danger-btn {
  border-color: #d48a8a;
  color: #a42d2d;
}

.danger-btn:hover {
  background: #fff1f1;
}

.compact {
  height: 32px;
  margin: 0;
  padding: 0 9px;
}

.table-wrap {
  border: 1px solid var(--border);
  border-radius: 12px;
  margin-top: 14px;
  max-height: 680px;
  overflow: auto;
}

.student-table {
  background: #fff;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 2600px;
  width: 100%;
}

.student-table th,
.student-table td {
  border-bottom: 1px solid var(--border);
  padding: 9px 10px;
  vertical-align: middle;
}

.student-table th {
  background: #edf5f7;
  box-shadow: inset 0 -1px 0 var(--border);
  color: var(--text);
  position: sticky;
  text-align: left;
  top: 0;
  white-space: nowrap;
  z-index: 1;
}

.student-table .action-cell {
  background: inherit;
  box-shadow: -8px 0 12px rgba(18, 38, 53, 0.06);
  min-width: 210px;
  position: sticky;
  right: 0;
  z-index: 2;
}

.student-table th.action-cell {
  background: #edf5f7;
  z-index: 3;
}

.student-table td.action-cell {
  background: #fff;
}

.student-table tbody tr:nth-child(even) {
  background: #fbfdfe;
}

.student-table tbody tr:nth-child(even) td.action-cell {
  background: #fbfdfe;
}

.student-table tbody tr:hover {
  background: #f0f8fa;
}

.student-table tbody tr:hover td.action-cell {
  background: #f0f8fa;
}

.student-table tr.inactive {
  background: #f5f5f5;
  opacity: 0.66;
}

.student-table tr.inactive td.action-cell {
  background: #f5f5f5;
}

.name-cell {
  color: var(--text);
  font-weight: 900;
}

.duplicate {
  background: #fff0ed;
  color: #9d3028;
  font-weight: 900;
}

.duplicate small {
  display: block;
  margin-top: 3px;
}

.status-pill {
  display: inline-flex;
  min-width: 66px;
  justify-content: center;
}

.status-pill.active {
  background: #e7f5ea;
  color: #22623a;
}

.status-pill.inactive {
  background: #eceff1;
  color: #5c6870;
}

.actions {
  flex-wrap: wrap;
  gap: 6px;
}

.pagination-bar {
  justify-content: center;
  margin-top: 14px;
}

.empty-state {
  color: var(--text-muted);
  padding: 28px;
  text-align: center;
}

@media (max-width: 1100px) {
  .stats-grid {
    grid-template-columns: repeat(2, minmax(140px, 1fr));
  }

  .form-grid,
  .filter-grid {
    grid-template-columns: repeat(2, minmax(150px, 1fr));
  }
}

@media (max-width: 640px) {
  .admin-panel {
    padding: 16px;
  }

  .page-header,
  .toolbar-card {
    align-items: stretch;
    flex-direction: column;
  }

  .stats-grid,
  .form-grid,
  .filter-grid {
    grid-template-columns: 1fr;
  }

  .wide-field {
    grid-column: auto;
  }
}
</style>
