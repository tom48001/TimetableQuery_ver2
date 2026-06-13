<template>
  <main class="user-admin-page">
    <section class="admin-panel">
      <header class="page-header">
        <div>
          <h1>{{ tr('User Management', '使用者管理') }}</h1>
        </div>
        <span class="summary-pill">{{ filteredTeachers.length }} / {{ teachers.length }} {{ tr('users', '使用者') }}</span>
      </header>

      <details class="permission-help">
        <summary>{{ tr('Permission Guide', '權限說明') }}</summary>
        <div class="permission-guide-grid">
          <span v-for="permission in permissionOptions" :key="permission.key">
            <strong>{{ permission.shortLabel }}</strong> {{ permission.description }}
          </span>
        </div>
      </details>

      <section class="add-section">
        <div class="section-toolbar">
          <h2>{{ tr('Add User', '新增使用者') }}</h2>
        </div>
        <div class="form-grid">
          <input v-model.trim="newTeacher.user_name" :placeholder="tr('Name', '姓名')" />
          <input v-model.trim="newTeacher.email" placeholder="Email" />
          <input v-model="newTeacher.password" type="password" :placeholder="tr('Password', '密碼')" />
          <select v-model="newTeacher.role" @change="applyDefaultPermissions(newTeacher)">
            <option v-for="role in roleOptions" :key="role.value" :value="role.value">{{ role.label }}</option>
          </select>
          <button class="primary-btn" @click="addTeacher">{{ tr('Add', '新增') }}</button>
        </div>
        <p v-if="newTeacher.role === 'manager'" class="manager-permission-note">{{ tr('Managers always have all permissions.', 'Manager 會自動擁有所有權限。') }}</p>
        <div class="permission-toggle-grid compact">
          <label v-for="permission in permissionOptions" :key="permission.key" class="permission-toggle" :class="{ active: newTeacher.permissions[permission.key], locked: newTeacher.role === 'manager' }">
            <input type="checkbox" v-model="newTeacher.permissions[permission.key]" :disabled="newTeacher.role === 'manager'" />
            <span class="permission-mark"></span>
            <span>{{ permission.shortLabel }}</span>
          </label>
        </div>
      </section>

      <section class="table-section">
        <div class="section-toolbar">
          <div>
            <h2>{{ tr('Existing Users', '現有使用者') }}</h2>
            <p class="section-note">{{ tr('Search, filter and edit users.', '可搜尋、篩選，再逐個使用者修改。') }}</p>
          </div>
          <button class="secondary-btn" @click="fetchTeachers">{{ tr('Reload', '重新載入') }}</button>
        </div>

        <div class="filter-panel">
          <input v-model.trim="searchText" :placeholder="tr('Search name or email...', '搜尋姓名或 email...')" />
          <select v-model="selectedRole">
            <option value="">{{ tr('All roles', '全部角色') }}</option>
            <option v-for="role in roleOptions" :key="role.value" :value="role.value">{{ role.label }}</option>
          </select>
          <select v-model="selectedPermission">
            <option value="">{{ tr('All permissions', '全部權限') }}</option>
            <option v-for="permission in permissionOptions" :key="permission.key" :value="permission.key">
              {{ permission.label }}
            </option>
          </select>
          <button class="secondary-btn" @click="clearFilters">{{ tr('Clear', '清除') }}</button>
        </div>
        <div class="list-status">
        </div>

        <div class="table-wrap">
          <table v-if="paginatedTeachers.length">
            <thead>
              <tr>
                <th class="name-col">{{ tr('Name', '姓名') }}</th>
                <th class="email-col">Email</th>
                <th class="role-col">Role</th>
                <th>{{ tr('Permissions', '權限') }}</th>
                <th class="password-col">{{ tr('New password', '新密碼') }}</th>
                <th class="actions-col">{{ tr('Actions', '操作') }}</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="teacher in paginatedTeachers" :key="teacher.user_id">
                <td><input v-model.trim="teacher.user_name" /></td>
                <td><input v-model.trim="teacher.email" /></td>
                <td>
                  <select v-model="teacher.role" @change="applyDefaultPermissions(teacher)">
                    <option v-for="role in roleOptions" :key="role.value" :value="role.value">{{ role.label }}</option>
                  </select>
                </td>
                <td class="permission-cell">
                  <span v-if="teacher.role === 'manager'" class="manager-permission-note table-note">{{ tr('Manager has all permissions', 'Manager 已有全部權限') }}</span>
                  <label v-for="permission in permissionOptions" :key="permission.key" class="permission-toggle table-toggle" :class="{ active: teacher.permissions[permission.key], locked: teacher.role === 'manager' }" :title="permission.label">
                    <input type="checkbox" v-model="teacher.permissions[permission.key]" :disabled="teacher.role === 'manager'" />
                    <span class="permission-mark"></span>
                    <span>{{ permission.shortLabel }}</span>
                  </label>
                </td>
                <td><input v-model="teacher.newPassword" :placeholder="tr('Optional', '可留空')" /></td>
                <td class="actions-cell">
                  <button class="primary-btn small" @click="updateTeacher(teacher)">{{ tr('Save', '儲存') }}</button>
                  <button class="danger-btn small" @click="deleteTeacher(teacher.user_id)">{{ tr('Delete', '刪除') }}</button>
                </td>
              </tr>
            </tbody>
          </table>
          <p v-else class="empty-state">{{ tr('No users found.', '\u6c92\u6709\u7b26\u5408\u7684\u4f7f\u7528\u8005\u3002') }}</p>
        </div>

        <div class="pagination-bar" v-if="filteredTeachers.length">
          <button class="secondary-btn small" :disabled="currentPage === 1" @click="currentPage -= 1">
            {{ tr('Previous', '上一頁') }}
          </button>
          <span>{{ currentPage }} / {{ totalPages }}</span>
          <button class="secondary-btn small" :disabled="currentPage === totalPages" @click="currentPage += 1">
            {{ tr('Next', '下一頁') }}
          </button>
        </div>
      </section>
    </section>
  </main>
</template>

<script>
import axios from 'axios';

const PERMISSION_KEYS = ['timetable', 'nominations', 'changePassword', 'manageUsers', 'manageStudents', 'importTimetable'];

const DEFAULT_PERMISSIONS = {
  teacher: {
    timetable: true,
    nominations: true,
    changePassword: true,
    manageUsers: false,
    manageStudents: false,
    importTimetable: false
  },
  staff: {
    timetable: true,
    nominations: true,
    changePassword: false,
    manageUsers: true,
    manageStudents: false,
    importTimetable: false
  },
  manager: {
    timetable: true,
    nominations: true,
    changePassword: true,
    manageUsers: true,
    manageStudents: true,
    importTimetable: true
  }
};

export default {
  name: 'AdminTeacherPanel',
  data() {
    return {
      teachers: [],
      currentUserRole: 'teacher',
      searchText: '',
      selectedRole: '',
      selectedPermission: '',
      currentPage: 1,
      pageSize: 30,
      newTeacher: {
        user_name: '',
        email: '',
        password: '',
        role: 'teacher',
        permissions: this.defaultPermissions('teacher')
      }
    };
  },
  computed: {
    roleOptions() {
      const roles = [
        { value: 'teacher', label: 'Teacher' },
        { value: 'staff', label: 'Staff' }
      ];
      if (this.currentUserRole === 'manager') roles.push({ value: 'manager', label: 'Manager' });
      return roles;
    },
    permissionOptions() {
      return [
        {
          key: 'timetable',
          shortLabel: this.tr('Timetable', '時間表'),
          label: this.tr('Timetable', '時間表'),
          description: this.tr('View timetable pages.', '可使用時間表相關功能。')
        },
        {
          key: 'nominations',
          shortLabel: this.tr('Nomination', '提名'),
          label: this.tr('Student Nomination', '提名學生'),
          description: this.tr('Use nomination pages.', '可使用學生提名功能。')
        },
        {
          key: 'changePassword',
          shortLabel: this.tr('Password', '密碼'),
          label: this.tr('Change Password', '更改密碼'),
          description: this.tr('User may change own password.', '可自行更改密碼。')
        },
        {
          key: 'manageUsers',
          shortLabel: this.tr('Users', '用戶'),
          label: this.tr('User Management', '使用者管理'),
          description: this.tr('Add, edit and delete users.', '可新增、修改及刪除使用者。')
        },
        {
          key: 'manageStudents',
          shortLabel: this.tr('Students', '學生'),
          label: this.tr('Student Management', '學生管理'),
          description: this.tr('Add and delete students.', '可新增及刪除學生。')
        },
        {
          key: 'importTimetable',
          shortLabel: this.tr('Import', '導入'),
          label: this.tr('Import Timetable', '導入時間表'),
          description: this.tr('Import timetable Excel files.', '可導入時間表 Excel。')
        }
      ];
    },
    filteredTeachers() {
      const keyword = this.searchText.trim().toLowerCase();
      return this.teachers.filter(teacher => {
        const haystack = `${teacher.user_name || ''} ${teacher.email || ''}`.toLowerCase();
        const matchesKeyword = !keyword || haystack.includes(keyword);
        const matchesRole = !this.selectedRole || teacher.role === this.selectedRole;
        const matchesPermission = !this.selectedPermission || Boolean(teacher.permissions && teacher.permissions[this.selectedPermission]);
        return matchesKeyword && matchesRole && matchesPermission;
      });
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredTeachers.length / this.pageSize));
    },
    paginatedTeachers() {
      const page = Math.min(this.currentPage, this.totalPages);
      const start = (page - 1) * this.pageSize;
      return this.filteredTeachers.slice(start, start + this.pageSize);
    },
    pageRangeLabel() {
      if (this.filteredTeachers.length === 0) return this.tr('No records', '\u6c92\u6709\u8cc7\u6599');
      const page = Math.min(this.currentPage, this.totalPages);
      const start = (page - 1) * this.pageSize + 1;
      const end = Math.min(start + this.pageSize - 1, this.filteredTeachers.length);
      return this.tr(`Showing ${start}-${end}`, `\u986f\u793a\u7b2c ${start}-${end} \u4f4d`);
    }
  },
  watch: {
    searchText() {
      this.currentPage = 1;
    },
    selectedRole() {
      this.currentPage = 1;
    },
    selectedPermission() {
      this.currentPage = 1;
    }
  },
  methods: {
    tr(en, zh) {
      return this.$lang.locale === 'en' ? en : zh;
    },
    defaultPermissions(role) {
      return { ...(DEFAULT_PERMISSIONS[role] || DEFAULT_PERMISSIONS.teacher) };
    },
    normalizePermissions(permissions, role) {
      const base = this.defaultPermissions(role);
      const incoming = permissions && typeof permissions === 'object' ? permissions : {};
      PERMISSION_KEYS.forEach(key => {
        if (Object.prototype.hasOwnProperty.call(incoming, key)) base[key] = Boolean(incoming[key]);
      });
      return base;
    },
    applyDefaultPermissions(user) {
      this.$set(user, 'permissions', this.defaultPermissions(user.role));
    },
    clearFilters() {
      this.searchText = '';
      this.selectedRole = '';
      this.selectedPermission = '';
      this.currentPage = 1;
    },
    authHeaders() {
      const token = localStorage.getItem('token');
      return { Authorization: `Bearer ${token}` };
    },
    loadCurrentUserRole() {
      const rawUser = localStorage.getItem('user');
      if (!rawUser) return;
      try {
        const user = JSON.parse(rawUser);
        this.currentUserRole = user.role ? user.role.trim().toLowerCase() : 'teacher';
      } catch (error) {
        this.currentUserRole = 'teacher';
      }
    },
    async fetchTeachers() {
      try {
        const res = await axios.get('/api/teachers/getAllTeachers', {
          headers: this.authHeaders()
        });
        this.teachers = res.data.map(t => ({
          ...t,
          role: t.role ? t.role.trim().toLowerCase() : 'teacher',
          permissions: this.normalizePermissions(t.permissions, t.role),
          newPassword: ''
        }));
        this.currentPage = 1;
      } catch (err) {
        const status = err.response ? err.response.status : 0;
        const message = status === 403
          ? this.tr('You do not have permission to manage users.', '你沒有權限管理使用者。')
          : this.tr('Failed to load users.', '載入使用者失敗。');
        alert(message);
      }
    },
    async updateTeacher(teacher) {
      try {
        await axios.put(`/api/teachers/${teacher.user_id}`, {
          user_name: teacher.user_name,
          email: teacher.email,
          role: teacher.role,
          permissions: teacher.permissions,
          newPassword: teacher.newPassword || null
        }, {
          headers: this.authHeaders()
        });
        alert(teacher.newPassword ? this.tr('User and password updated.', '使用者及密碼已更新。') : this.tr('User updated.', '使用者已更新。'));
        teacher.newPassword = '';
      } catch (err) {
        const status = err.response ? err.response.status : 0;
        alert(status === 403
          ? this.tr('You do not have permission to update users.', '你沒有權限修改使用者。')
          : this.tr('Failed to update user.', '修改使用者失敗。'));
      }
    },
    async addTeacher() {
      try {
        await axios.post('/api/teachers', this.newTeacher, {
          headers: this.authHeaders()
        });
        alert(this.tr('User added.', '使用者已新增。'));
        this.newTeacher = {
          user_name: '',
          email: '',
          password: '',
          role: 'teacher',
          permissions: this.defaultPermissions('teacher')
        };
        this.fetchTeachers();
      } catch (err) {
        const status = err.response ? err.response.status : 0;
        alert(status === 403
          ? this.tr('You do not have permission to add users.', '你沒有權限新增使用者。')
          : this.tr('Failed to add user.', '新增使用者失敗。'));
      }
    },
    async deleteTeacher(id) {
      if (!confirm(this.tr('Delete this user?', '確定刪除這個使用者？'))) return;

      try {
        await axios.delete(`/api/teachers/${id}`, {
          headers: this.authHeaders()
        });
        alert(this.tr('User deleted.', '使用者已刪除。'));
        this.fetchTeachers();
      } catch (err) {
        const status = err.response ? err.response.status : 0;
        alert(status === 403
          ? this.tr('You do not have permission to delete users.', '你沒有權限刪除使用者。')
          : this.tr('Failed to delete user.', '刪除使用者失敗。'));
      }
    }
  },
  mounted() {
    this.loadCurrentUserRole();
    this.fetchTeachers();
  }
};
</script>

<style scoped>
.user-admin-page {
  min-height: calc(100vh - 126px);
  box-sizing: border-box;
  padding: 34px 18px 56px;
}

.admin-panel {
  max-width: 1240px;
  margin: 0 auto;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--shadow);
  box-sizing: border-box;
  padding: 24px;
}

.page-header,
.section-toolbar,
.pagination-bar,
.list-status {
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
  font-size: 21px;
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

.permission-help,
.add-section,
.table-section {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-soft);
  margin-top: 18px;
  padding: 16px;
}

.permission-help summary {
  color: var(--text);
  cursor: pointer;
  font-weight: 800;
}

.permission-guide-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(160px, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.permission-guide-grid span {
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #fff;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 700;
  padding: 9px 10px;
}

.permission-guide-grid strong {
  color: var(--primary);
  margin-right: 6px;
}

.section-note {
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 700;
  margin: 6px 0 0;
}

.form-grid,
.filter-panel {
  display: grid;
  gap: 10px;
  margin-top: 14px;
}

.form-grid {
  grid-template-columns: minmax(120px, 1fr) minmax(180px, 1.2fr) minmax(130px, 1fr) minmax(120px, 0.7fr) auto;
}

.filter-panel {
  grid-template-columns: minmax(260px, 1.6fr) minmax(150px, 0.7fr) minmax(210px, 1fr) auto;
}

.permission-toggle-grid {
  display: grid;
  grid-template-columns: repeat(6, minmax(96px, 1fr));
  gap: 8px;
  margin-top: 12px;
}

.permission-toggle {
  display: inline-flex;
  align-items: center;
  justify-content: flex-start;
  gap: 7px;
  border: 1px solid #cbdfea;
  border-radius: 999px;
  background: #fff;
  color: var(--text-muted);
  cursor: pointer;
  font-size: 12px;
  font-weight: 900;
  min-height: 32px;
  padding: 5px 10px;
  transition: background 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease;
  user-select: none;
  white-space: nowrap;
}

.permission-toggle:hover {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(11, 114, 133, 0.08);
}

.manager-permission-note {
  color: var(--primary-dark);
  background: var(--primary-soft);
  border: 1px solid var(--border);
  border-radius: 6px;
  font-size: 13px;
  font-weight: 900;
  margin: 12px 0 0;
  padding: 9px 11px;
}

.table-note {
  grid-column: 1 / -1;
  margin: 0 0 2px;
  text-align: center;
}

.permission-toggle.locked {
  cursor: default;
  opacity: 0.92;
}

.permission-toggle.locked:hover {
  box-shadow: none;
}
.permission-toggle input {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.permission-toggle.active {
  border-color: var(--primary);
  background: var(--primary);
  color: #fff;
}

.permission-mark {
  width: 14px;
  height: 14px;
  border: 2px solid currentColor;
  border-radius: 50%;
  box-sizing: border-box;
  display: inline-block;
  flex: 0 0 auto;
  position: relative;
}

.permission-toggle.active .permission-mark::after {
  content: "";
  position: absolute;
  left: 3px;
  top: 0px;
  width: 4px;
  height: 8px;
  border: solid currentColor;
  border-width: 0 2px 2px 0;
  transform: rotate(45deg);
}

input,
select {
  width: 100%;
  height: 40px;
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
  height: 40px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 800;
  padding: 0 14px;
}

.primary-btn {
  background: var(--primary);
  color: #fff;
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

.small {
  height: 32px;
  padding: 0 10px;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.primary-btn:hover {
  background: var(--primary-dark);
}

.secondary-btn:hover:not(:disabled) {
  border-color: var(--primary);
  color: var(--primary);
}

.danger-btn:hover {
  background: #9f302b;
}

.list-status {
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 800;
  margin: 12px 0 8px;
}

.table-wrap {
  overflow-x: auto;
  margin-top: 14px;
}

table {
  width: 100%;
  min-width: 1120px;
  border-collapse: collapse;
  background: #fff;
}

th,
td {
  border: 1px solid var(--border);
  padding: 8px;
  text-align: left;
  vertical-align: top;
}

th {
  background: #f3f8fa;
  color: var(--text);
  font-weight: 800;
}

.name-col {
  width: 160px;
}

.email-col {
  width: 230px;
}

.role-col {
  width: 120px;
}

.password-col {
  width: 150px;
}

.actions-col {
  width: 140px;
}

td input,
td select {
  height: 34px;
}

.permission-cell {
  display: grid;
  grid-template-columns: repeat(3, minmax(82px, 1fr));
  gap: 6px;
  min-width: 330px;
}

.table-toggle {
  justify-content: center;
  min-height: 30px;
  padding: 4px 8px;
}

.actions-cell {
  white-space: nowrap;
}

.empty-state {
  border: 1px dashed var(--border-strong);
  border-radius: 8px;
  color: var(--text-muted);
  font-weight: 800;
  margin: 0;
  padding: 28px;
  text-align: center;
}

.pagination-bar {
  justify-content: center;
  margin-top: 14px;
}

.pagination-bar span {
  color: var(--text);
  font-weight: 900;
  min-width: 70px;
  text-align: center;
}

@media (max-width: 980px) {
  .permission-guide-grid,
  .permission-toggle-grid,
  .form-grid,
  .filter-panel {
    grid-template-columns: 1fr;
  }

  .page-header,
  .section-toolbar,
  .list-status {
    align-items: stretch;
    flex-direction: column;
  }

  .primary-btn,
  .secondary-btn {
    width: 100%;
  }
}
</style>
