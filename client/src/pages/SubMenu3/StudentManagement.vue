<template>
  <main class="student-admin-page">
    <section class="admin-panel">
      <section class="list-section">
        <div class="list-toolbar">
          <div class="list-title-wrap">
            <h1>{{ tr('Student List', '學生列表') }}</h1>
          </div>
          <div class="list-actions">
            <button type="button" class="primary-btn compact-action" @click="$router.push({ name: 'AddStudent' })">
              {{ tr('Add Student', '新增學生') }}
            </button>
            <button type="button" class="secondary-btn compact-action" @click="exportStudents">
              {{ tr('Export', '匯出') }}
            </button>
            <button type="button" class="secondary-btn compact-action" @click="loadStudents">
              {{ tr('Reload', '重新載入') }}
            </button>
          </div>
        </div>

        <div class="filter-strip">
          <label class="filter-select">
            <span class="filter-icon">≡</span>
            <select v-model="gradeFilter">
              <option value="">{{ tr('All grades', '全部級別') }}</option>
              <option v-for="grade in gradeLevels" :key="grade">{{ grade }}</option>
            </select>
          </label>
          <label class="filter-select">
            <select v-model="classFilter">
              <option value="">{{ tr('All classes', '全部班別') }}</option>
              <option v-for="item in filteredClasses" :key="item.class_id" :value="String(item.class_id)">{{ item.class_name }}</option>
            </select>
          </label>
          <label class="filter-select small-filter">
            <select v-model="statusFilter"><option value="">{{ tr('All status', '全部狀態') }}</option><option value="active">Active</option><option value="inactive">Inactive</option></select>
          </label>
          <label class="filter-select small-filter">
            <select v-model="ncsFilter"><option value="">NCS</option><option value="yes">NCS</option><option value="no">Non-NCS</option></select>
          </label>
          <label class="filter-select duplicate-filter">
            <select v-model="duplicateFilter">
              <option value="">{{ tr('Duplicates', '重複資料') }}</option>
              <option value="any">{{ tr('Any duplicate', '任何重複') }}</option>
              <option value="regno">REGNO</option>
              <option value="email">Email</option>
              <option value="class_number">{{ tr('Class No.', '班別學號') }}</option>
            </select>
          </label>
          <label class="search-pill">
            <span class="search-icon">⌕</span>
            <input v-model.trim="searchText" :placeholder="tr('REGNO, student ID, name or Email', 'REGNO、學號、姓名或 Email')" />
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
                    <button type="button" class="edit-btn compact" @click="startEdit(student)">{{ tr('Edit', '編輯') }}</button>
                    <button type="button" class="status-btn compact" @click="toggleStatus(student)">
                      {{ student.status === 'active' ? tr('Deactivate', '停用') : tr('Activate', '啟用') }}
                    </button>
                    <button type="button" class="danger-btn compact" @click="deleteStudent(student)">{{ tr('Delete', '刪除') }}</button>
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
          <p v-else class="empty-state">{{ tr('No students found.', '找不到學生。') }}</p>
        </div>

        <div v-if="filteredStudents.length" class="pagination-bar">
          <span class="page-range">{{ pageRangeLabel }}</span>
          <button class="pager-btn" :disabled="currentPage === 1" @click="currentPage -= 1">‹</button>
          <button
            v-for="item in pageItems"
            :key="item.key"
            type="button"
            class="pager-btn"
            :class="{ active: item.page === currentPage, ellipsis: item.ellipsis }"
            :disabled="item.ellipsis"
            @click="item.page && (currentPage = item.page)"
          >
            {{ item.label }}
          </button>
          <button class="pager-btn" :disabled="currentPage === totalPages" @click="currentPage += 1">›</button>
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
      electiveSubjects: [],
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
    pageRangeLabel() {
      if (!this.filteredStudents.length) return this.tr('No students', '沒有學生');
      const start = (this.currentPage - 1) * this.pageSize + 1;
      const end = Math.min(start + this.pageSize - 1, this.filteredStudents.length);
      return this.tr(
        `Showing ${start} to ${end} of ${this.filteredStudents.length} students`,
        `顯示 ${start} 至 ${end} 名學生，共 ${this.filteredStudents.length} 名`
      );
    },
    pageItems() {
      const pages = [];
      const addPage = page => {
        if (page >= 1 && page <= this.totalPages && !pages.includes(page)) pages.push(page);
      };
      addPage(1);
      addPage(this.currentPage - 1);
      addPage(this.currentPage);
      addPage(this.currentPage + 1);
      addPage(this.totalPages);
      pages.sort((a, b) => a - b);
      const items = [];
      pages.forEach((page, index) => {
        if (index > 0 && page - pages[index - 1] > 1) {
          items.push({ key: `ellipsis-${page}`, label: '...', ellipsis: true });
        }
        items.push({ key: `page-${page}`, label: String(page), page });
      });
      return items;
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
  padding: 26px 20px 56px;
  background: #f8f9ff;
  font-family: "Hanken Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.admin-panel {
  margin: auto;
  max-width: 1500px;
}

.list-section {
  background: #ffffff;
  border: 1px solid rgba(190, 201, 200, 0.42);
  border-radius: 14px;
  box-shadow: 0 10px 28px rgba(15, 35, 52, 0.06);
  overflow: hidden;
}

.list-toolbar {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 28px 32px 12px;
}

.list-title-wrap {
  border-left: 5px solid #0b7787;
  padding-left: 14px;
}

h1 {
  color: #0b1c30;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin: 0;
}

.list-actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: flex-end;
}

.filter-strip {
  align-items: center;
  display: flex;
  gap: 10px;
  justify-content: flex-end;
  padding: 0 32px 22px;
}

.filter-select,
.search-pill {
  align-items: center;
  background: #eff4ff;
  border: 1px solid #e0e8f3;
  border-radius: 8px;
  box-sizing: border-box;
  color: #4e616f;
  display: flex;
  gap: 8px;
  height: 42px;
  min-width: 150px;
  padding: 0 12px;
}

.filter-select select,
.search-pill input {
  appearance: none;
  background: transparent;
  border: 0;
  box-shadow: none;
  color: #34495a;
  font-size: 13px;
  font-weight: 900;
  height: 100%;
  outline: 0;
  padding: 0;
  width: 100%;
}

.filter-select {
  position: relative;
}

.filter-select::after {
  color: #5d6f7d;
  content: "⌄";
  font-size: 13px;
  pointer-events: none;
}

.filter-icon,
.search-icon {
  color: #5d6f7d;
  flex: 0 0 auto;
  font-size: 15px;
  font-weight: 900;
}

.search-pill {
  min-width: 330px;
}

button {
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 900;
  height: 36px;
  padding: 0 12px;
}

.primary-btn {
  background: #00616d;
  color: #fff;
}

.primary-btn:hover {
  background: #0b7787;
}

.secondary-btn,
.edit-btn,
.status-btn,
.danger-btn {
  background: #eff4ff;
  color: #34495a;
}

.secondary-btn:hover {
  background: #e5eeff;
}

.edit-btn {
  background: #e7f5fb;
  color: #00616d;
}

.edit-btn:hover {
  background: #d9eff8;
}

.status-btn {
  background: #fff1df;
  color: #9a4f0f;
}

.status-btn:hover {
  background: #ffe7c2;
}

.danger-btn {
  background: #ffe2e2;
  color: #a42d2d;
}

.danger-btn:hover {
  background: #ffd2d2;
}

.compact-action,
.compact {
  height: 32px;
  margin: 0;
  padding: 0 9px;
}

.table-wrap {
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
  border-bottom: 1px solid #edf2f7;
  border-left: 0;
  border-right: 0;
  color: #173044;
  padding: 18px 20px;
  vertical-align: middle;
}

.student-table th {
  background: #eff4ff;
  box-shadow: inset 0 -1px 0 #dbe5ef;
  color: #35495b;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.1em;
  position: sticky;
  text-align: left;
  text-transform: uppercase;
  top: 0;
  white-space: nowrap;
  z-index: 4;
}

.student-table .action-cell {
  background: inherit;
  min-width: 210px;
  position: sticky;
  right: 0;
  z-index: 2;
}

.student-table th.action-cell {
  background: #eff4ff;
  z-index: 3;
}

.student-table input,
.student-table select {
  background: #eff4ff;
  border: 1px solid #dbe5ef;
  border-radius: 8px;
  box-sizing: border-box;
  color: #173044;
  font-size: 13px;
  font-weight: 800;
  height: 36px;
  min-width: 90px;
  outline: 0;
  padding: 0 10px;
  width: 100%;
}

.student-table input:focus,
.student-table select:focus {
  border-color: #00616d;
  box-shadow: 0 0 0 3px rgba(0, 97, 109, 0.14);
}

.student-table td.action-cell {
  background: #fff;
}

.student-table tbody tr:nth-child(even) {
  background: #ffffff;
}

.student-table tbody tr:nth-child(even) td.action-cell {
  background: #ffffff;
}

.student-table tbody tr:hover {
  background: #f7fafc;
}

.student-table tbody tr:hover td.action-cell {
  background: #f7fafc;
}

.student-table tr.inactive {
  background: #f8fafc;
  opacity: 0.66;
}

.student-table tr.inactive td.action-cell {
  background: #f8fafc;
}

.name-cell {
  color: #0b1c30;
  font-weight: 900;
}

.duplicate {
  background: transparent;
  color: #9d3028;
  font-weight: 900;
}

.duplicate small {
  background: #ffd7d7;
  border-radius: 999px;
  color: #9d3028;
  display: inline-flex;
  font-size: 10px;
  margin-left: 6px;
  padding: 2px 5px;
}

.status-pill {
  border-radius: 999px;
  display: inline-flex;
  font-size: 10px;
  font-weight: 900;
  justify-content: center;
  min-width: 54px;
  padding: 5px 8px;
  text-transform: uppercase;
}

.status-pill.active {
  background: #e8f0f1;
  color: #00616d;
}

.status-pill.inactive {
  background: #eceff1;
  color: #5c6870;
}

.actions {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.pagination-bar {
  align-items: center;
  background: #eff4ff;
  color: #34495a;
  display: flex;
  gap: 8px;
  justify-content: flex-end;
  padding: 16px 32px;
}

.page-range {
  font-size: 13px;
  font-weight: 800;
  margin-right: auto;
}

.pager-btn {
  align-items: center;
  background: transparent;
  color: #34495a;
  display: inline-flex;
  height: 34px;
  justify-content: center;
  min-width: 34px;
  padding: 0 8px;
}

.pager-btn.active {
  background: #00616d;
  color: #ffffff;
}

.pager-btn:disabled:not(.ellipsis) {
  cursor: not-allowed;
  opacity: 0.4;
}

.pager-btn.ellipsis {
  cursor: default;
}

.empty-state {
  color: #4e616f;
  font-weight: 900;
  padding: 28px;
  text-align: center;
}

@media (max-width: 1100px) {
  .list-toolbar,
  .filter-strip {
    align-items: stretch;
    flex-direction: column;
  }

  .list-actions {
    justify-content: flex-start;
  }

  .filter-select,
  .search-pill {
    width: 100%;
  }
}

@media (max-width: 640px) {
  .student-admin-page {
    padding: 16px 10px 40px;
  }
}
</style>
