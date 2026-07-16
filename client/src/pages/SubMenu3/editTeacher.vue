<template>
  <main class="user-admin-page">
    <section class="admin-panel">
      <header class="page-header">
        <div>
          <h1>{{ tr('User Management', '使用者管理') }}</h1>
        </div>
        <div class="header-tools">
          <label class="header-search">
            <span class="ui-icon icon-search"></span>
            <input
              ref="userSearchInput"
              v-model.trim="searchText"
              type="search"
              name="user-management-search"
              autocomplete="new-password"
              spellcheck="false"
              data-lpignore="true"
              data-form-type="other"
              :readonly="searchReadonly"
              @focus="searchReadonly = false"
              :placeholder="tr('Search name, email or role...', '搜尋姓名、Email或角色...')"
            />
          </label>
        </div>
      </header>

      <section class="add-section">
        <div class="add-header">
          <div class="card-title">
            <span class="title-icon ui-icon icon-person-add"></span>
            <h2>{{ tr('Add User', '新增使用者') }}</h2>
          </div>
        </div>

        <div class="form-grid">
          <label>
            <span>{{ tr('Name', '姓名') }}</span>
            <input v-model.trim="newTeacher.user_name" :placeholder="tr('Enter name', '輸入姓名')" />
          </label>
          <label>
            <span>Email</span>
            <input
              ref="newUserEmailInput"
              v-model.trim="newTeacher.email"
              name="new-user-email-field"
              autocomplete="new-password"
              data-lpignore="true"
              data-form-type="other"
              placeholder="email@school.edu"
            />
          </label>
          <label>
            <span>{{ tr('Role', '角色') }}</span>
            <select v-model="newTeacher.role" @change="applyDefaultPermissions(newTeacher)">
              <option v-for="role in roleOptions" :key="role.value" :value="role.value">{{ role.label }}</option>
            </select>
          </label>
          <label>
            <span>{{ tr('Password', '密碼') }}</span>
            <input v-model="newTeacher.password" type="password" placeholder="••••••••" />
          </label>
        </div>
        <p v-if="newTeacher.role === 'manager'" class="manager-permission-note">{{ tr('Managers always have all permissions.', 'Manager 會自動擁有所有權限。') }}</p>

        <div class="permission-save-row">
          <div>
            <h3>{{ tr('Permission Assignment', '權限分配') }}</h3>
            <div class="permission-toggle-grid compact">
              <label v-for="permission in visiblePermissionOptions" :key="permission.key" class="permission-toggle" :class="{ active: newTeacher.permissions[permission.key], locked: newTeacher.role === 'manager' }">
                <input type="checkbox" v-model="newTeacher.permissions[permission.key]" :disabled="newTeacher.role === 'manager'" />
                <span class="ui-icon permission-icon" :class="permission.iconClass"></span>
                <span>{{ permission.shortLabel }}</span>
              </label>
            </div>
          </div>
          <button class="primary-btn save-btn" @click="addTeacher"><span class="ui-icon icon-save"></span>{{ tr('Save', '儲存') }}</button>
        </div>
      </section>

      <section class="table-section">
        <div class="table-header">
          <h2>{{ tr('Teacher', '老師') }}</h2>
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
              <tr v-for="teacher in paginatedTeachers" :key="teacher.user_id" :class="{ 'editing-row': isEditingTeacher(teacher) }">
                <template v-if="isEditingTeacher(teacher)">
                  <td><input v-model.trim="teacher.user_name" /></td>
                  <td><input v-model.trim="teacher.email" /></td>
                  <td>
                    <select v-model="teacher.role" @change="applyDefaultPermissions(teacher)">
                      <option v-for="role in roleOptions" :key="role.value" :value="role.value">{{ role.label }}</option>
                    </select>
                  </td>
                  <td class="permission-cell">
                    <span v-if="teacher.role === 'manager'" class="manager-permission-note table-note">{{ tr('Manager has all permissions', 'Manager 已有全部權限') }}</span>
                    <label v-for="permission in visiblePermissionOptions" :key="permission.key" class="permission-toggle table-toggle" :class="{ active: teacher.permissions[permission.key], locked: teacher.role === 'manager' }" :title="permission.label">
                      <input type="checkbox" v-model="teacher.permissions[permission.key]" :disabled="teacher.role === 'manager'" />
                      <span class="ui-icon permission-icon" :class="permission.iconClass"></span>
                      <span>{{ permission.shortLabel }}</span>
                    </label>
                  </td>
                  <td><input v-model="teacher.newPassword" :placeholder="tr('Optional', '可留空')" /></td>
                  <td class="actions-cell">
                    <button class="primary-btn small" @click="saveTeacherRow(teacher)"><span class="ui-icon icon-save"></span>{{ tr('Save', '儲存') }}</button>
                    <button class="secondary-btn small" @click="cancelEditTeacher">{{ tr('Cancel', '取消') }}</button>
                    <button class="icon-btn delete-icon-btn" :aria-label="tr('Delete', '刪除')" :title="tr('Delete', '刪除')" @click="deleteTeacher(teacher.user_id)"><span class="ui-icon icon-delete"></span></button>
                  </td>
                </template>
                <template v-else>
                  <td>
                    <div class="user-name-text">{{ teacher.user_name || '-' }}</div>
                  </td>
                  <td>
                    <div class="muted-text">{{ teacher.email || '-' }}</div>
                  </td>
                  <td>
                    <span class="role-badge" :class="`role-${teacher.role}`">{{ roleLabel(teacher.role) }}</span>
                  </td>
                  <td class="permission-cell readonly">
                    <span v-if="teacher.role === 'manager'" class="manager-permission-note table-note">{{ tr('Manager has all permissions', 'Manager 已有全部權限') }}</span>
                    <span
                      v-for="permission in visiblePermissionOptions"
                      :key="permission.key"
                      class="permission-toggle table-toggle readonly-chip"
                      :class="{ active: permissionEnabled(teacher, permission.key), inactive: !permissionEnabled(teacher, permission.key) }"
                      :title="permission.label"
                      :aria-label="permission.label"
                    >
                      <span class="ui-icon permission-icon" :class="permission.iconClass"></span>
                      <span>{{ permission.shortLabel }}</span>
                    </span>
                  </td>
                  <td><span class="password-placeholder">••••••••</span></td>
                  <td class="actions-cell">
                    <button class="icon-btn edit-icon-btn" :aria-label="tr('Edit', '編輯')" :title="tr('Edit', '編輯')" @click="startEditTeacher(teacher)"><span class="ui-icon icon-edit"></span></button>
                    <button class="icon-btn delete-icon-btn" :aria-label="tr('Delete', '刪除')" :title="tr('Delete', '刪除')" @click="deleteTeacher(teacher.user_id)"><span class="ui-icon icon-delete"></span></button>
                  </td>
                </template>
              </tr>
            </tbody>
          </table>
          <p v-else class="empty-state">{{ tr('No users found.', '\u6c92\u6709\u7b26\u5408\u7684\u4f7f\u7528\u8005\u3002') }}</p>
        </div>

        <div class="pagination-bar" v-if="filteredTeachers.length">
          <span class="page-range">{{ pageRangeLabel }}，{{ tr('total', '共') }} {{ filteredTeachers.length }} {{ tr('users', '位使用者') }}</span>
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
      showFilters: false,
      searchReadonly: true,
      editingTeacherId: null,
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
          iconClass: 'icon-schedule',
          shortLabel: this.tr('Timetable', '時間表'),
          label: this.tr('Timetable', '時間表'),
          description: this.tr('View timetable pages.', '可使用時間表相關功能。')
        },
        {
          key: 'nominations',
          iconClass: 'icon-nomination',
          shortLabel: this.tr('Nomination', '提名'),
          label: this.tr('Student Nomination', '提名學生'),
          description: this.tr('Use nomination pages.', '可使用學生提名功能。')
        },
        {
          key: 'changePassword',
          iconClass: 'icon-lock',
          shortLabel: this.tr('Password', '密碼'),
          label: this.tr('Change Password', '更改密碼'),
          description: this.tr('User may change own password.', '可自行更改密碼。')
        },
        {
          key: 'manageUsers',
          iconClass: 'icon-users',
          shortLabel: this.tr('Users', '用戶'),
          label: this.tr('User Management', '使用者管理'),
          description: this.tr('Add, edit and delete users.', '可新增、修改及刪除使用者。')
        },
        {
          key: 'manageStudents',
          iconClass: 'icon-school',
          shortLabel: this.tr('Students', '學生'),
          label: this.tr('Student Management', '學生管理'),
          description: this.tr('Add and delete students.', '可新增及刪除學生。')
        },
        {
          key: 'importTimetable',
          iconClass: 'icon-upload',
          shortLabel: this.tr('Import', '導入'),
          label: this.tr('Import Timetable', '導入時間表'),
          description: this.tr('Import timetable CSV files.', '可導入時間表 CSV。')
        }
      ];
    },
    visiblePermissionOptions() {
      return this.permissionOptions.filter(permission => permission.key !== 'timetable');
    },
    filteredTeachers() {
      const keyword = this.searchText.trim().toLowerCase();
      return this.teachers.filter(teacher => {
        const haystack = `${teacher.user_name || ''} ${teacher.email || ''} ${teacher.role || ''} ${this.roleLabel(teacher.role)}`.toLowerCase();
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
    roleLabel(role) {
      const match = this.roleOptions.find(option => option.value === role);
      return match ? match.label : role || '-';
    },
    enabledPermissions(teacher) {
      return this.permissionOptions.filter(permission => teacher.permissions && teacher.permissions[permission.key]);
    },
    permissionEnabled(teacher, permissionKey) {
      return Boolean(teacher.permissions && teacher.permissions[permissionKey]);
    },
    userInitial(teacher) {
      const source = String((teacher && (teacher.user_name || teacher.email)) || '').trim();
      return source ? source.charAt(0).toUpperCase() : '?';
    },
    isEditingTeacher(teacher) {
      return this.editingTeacherId === teacher.user_id;
    },
    startEditTeacher(teacher) {
      this.editingTeacherId = teacher.user_id;
    },
    cancelEditTeacher() {
      this.editingTeacherId = null;
    },
    clearFilters() {
      this.searchText = '';
      this.selectedRole = '';
      this.selectedPermission = '';
      this.currentPage = 1;
    },
    clearSearchAutofill() {
      this.searchText = '';
      this.$nextTick(() => {
        const input = this.$refs.userSearchInput;
        if (input) input.value = '';
      });
      window.setTimeout(() => {
        this.searchText = '';
        const input = this.$refs.userSearchInput;
        if (input) input.value = '';
      }, 250);
      window.setTimeout(() => {
        this.searchText = '';
        const input = this.$refs.userSearchInput;
        if (input) input.value = '';
      }, 1000);
    },
    clearNewUserAutofill() {
      this.newTeacher.email = '';
      this.$nextTick(() => {
        const input = this.$refs.newUserEmailInput;
        if (input) input.value = '';
      });
      window.setTimeout(() => {
        this.newTeacher.email = '';
        const input = this.$refs.newUserEmailInput;
        if (input) input.value = '';
      }, 250);
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
        this.editingTeacherId = null;
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
        return true;
      } catch (err) {
        const status = err.response ? err.response.status : 0;
        alert(status === 403
          ? this.tr('You do not have permission to update users.', '你沒有權限修改使用者。')
          : this.tr('Failed to update user.', '修改使用者失敗。'));
        return false;
      }
    },
    async saveTeacherRow(teacher) {
      const saved = await this.updateTeacher(teacher);
      if (saved) this.editingTeacherId = null;
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
    this.clearSearchAutofill();
    this.clearNewUserAutofill();
    this.fetchTeachers();
  }
};
</script>

<style scoped>
.user-admin-page {
  box-sizing: border-box;
  min-height: calc(100vh - 126px);
  padding: 24px 20px 56px;
  background: #f8f9ff;
  font-family: "Hanken Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
}

.admin-panel {
  max-width: 1500px;
  margin: 0 auto;
}

.page-header {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 12px;
  margin-bottom: 34px;
}

h1,
h2,
h3,
p {
  margin: 0;
}

h1 {
  color: #0b1c30;
  font-size: 28px;
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1.12;
}

.ui-icon {
  align-items: center;
  display: inline-flex;
  flex: 0 0 auto;
  font-size: 15px;
  font-style: normal;
  font-weight: 900;
  height: 18px;
  justify-content: center;
  line-height: 1;
  width: 18px;
}

.ui-icon::before {
  display: block;
}

.icon-search::before { content: "⌕"; }
.icon-filter::before { content: "≡"; }
.icon-person-add::before { content: "+"; }
.icon-save::before {
  background: currentColor;
  content: "";
  height: 22px;
  width: 22px;
  -webkit-mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.3' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z'/%3E%3Cpath d='M17 21v-8H7v8'/%3E%3Cpath d='M7 3v5h8'/%3E%3C/svg%3E") center / contain no-repeat;
  mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.3' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2Z'/%3E%3Cpath d='M17 21v-8H7v8'/%3E%3Cpath d='M7 3v5h8'/%3E%3C/svg%3E") center / contain no-repeat;
}
.icon-edit::before { content: "✎"; }
.icon-delete::before { content: "×"; }
.icon-schedule::before { content: "○"; }
.icon-nomination::before,
.icon-lock::before,
.icon-users::before,
.icon-school::before,
.icon-upload::before {
  background: currentColor;
  content: "";
  height: 18px;
  width: 18px;
}

.icon-nomination::before {
  -webkit-mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='9.5' cy='7' r='4'/%3E%3Cpath d='m16 11 2 2 4-5'/%3E%3C/svg%3E") center / contain no-repeat;
  mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='9.5' cy='7' r='4'/%3E%3Cpath d='m16 11 2 2 4-5'/%3E%3C/svg%3E") center / contain no-repeat;
}

.icon-lock::before {
  -webkit-mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='5' y='10' width='14' height='11' rx='2'/%3E%3Cpath d='M8 10V7a4 4 0 0 1 8 0v3'/%3E%3Cpath d='M12 15v2'/%3E%3C/svg%3E") center / contain no-repeat;
  mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Crect x='5' y='10' width='14' height='11' rx='2'/%3E%3Cpath d='M8 10V7a4 4 0 0 1 8 0v3'/%3E%3Cpath d='M12 15v2'/%3E%3C/svg%3E") center / contain no-repeat;
}

.icon-users::before {
  -webkit-mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='9' cy='7' r='4'/%3E%3Cpath d='M22 21v-2a4 4 0 0 0-3-3.87'/%3E%3Cpath d='M16 3.13a4 4 0 0 1 0 7.75'/%3E%3C/svg%3E") center / contain no-repeat;
  mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2'/%3E%3Ccircle cx='9' cy='7' r='4'/%3E%3Cpath d='M22 21v-2a4 4 0 0 0-3-3.87'/%3E%3Cpath d='M16 3.13a4 4 0 0 1 0 7.75'/%3E%3C/svg%3E") center / contain no-repeat;
}

.icon-school::before {
  -webkit-mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m22 10-10-5-10 5 10 5 10-5Z'/%3E%3Cpath d='M6 12v5c3 2 9 2 12 0v-5'/%3E%3Cpath d='M22 10v6'/%3E%3C/svg%3E") center / contain no-repeat;
  mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='m22 10-10-5-10 5 10 5 10-5Z'/%3E%3Cpath d='M6 12v5c3 2 9 2 12 0v-5'/%3E%3Cpath d='M22 10v6'/%3E%3C/svg%3E") center / contain no-repeat;
}

.icon-upload::before {
  -webkit-mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z'/%3E%3Cpath d='M14 2v6h6'/%3E%3Cpath d='M12 18v-7'/%3E%3Cpath d='m9 14 3-3 3 3'/%3E%3C/svg%3E") center / contain no-repeat;
  mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.2' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z'/%3E%3Cpath d='M14 2v6h6'/%3E%3Cpath d='M12 18v-7'/%3E%3Cpath d='m9 14 3-3 3 3'/%3E%3C/svg%3E") center / contain no-repeat;
}

.header-tools {
  align-items: center;
  display: flex;
  flex: 1;
  justify-content: flex-end;
  margin-left: 46px;
}

.header-search {
  align-items: center;
  background: #eff4ff;
  border: 1px solid #dfe7f1;
  border-radius: 999px;
  box-shadow: 0 2px 7px rgba(13, 35, 52, 0.06) inset, 0 1px 2px rgba(13, 35, 52, 0.04);
  display: flex;
  gap: 12px;
  height: 54px;
  min-width: 420px;
  padding: 0 24px;
}

.header-search input {
  appearance: none;
  background: transparent !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  color: #0b1c30;
  flex: 1;
  font-size: 16px;
  font-weight: 700;
  height: 100%;
  outline: 0;
  padding: 0;
  width: 100%;
}

.header-search input:focus,
.header-search input:focus-visible {
  background: transparent !important;
  border: 0 !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  outline: 0;
}

.header-search input::-webkit-search-decoration,
.header-search input::-webkit-search-cancel-button {
  appearance: none;
}

.header-search input:-webkit-autofill,
.header-search input:-webkit-autofill:hover,
.header-search input:-webkit-autofill:focus {
  -webkit-text-fill-color: #0b1c30;
  box-shadow: 0 0 0 1000px transparent inset !important;
  transition: background-color 9999s ease-out 0s;
}

.header-search .ui-icon {
  color: #6e7979;
  font-size: 24px;
  height: 24px;
  width: 24px;
}

.header-search input::placeholder {
  color: #6e7979;
  font-weight: 700;
}

.add-section,
.table-section {
  background: #ffffff;
  border: 1px solid rgba(190, 201, 200, 0.42);
  border-radius: 18px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.04);
  overflow: hidden;
}

.add-section {
  padding: 32px 38px;
}

.table-section {
  margin-top: 26px;
}

.add-header,
.table-header,
.permission-save-row,
.pagination-bar {
  align-items: center;
  display: flex;
  justify-content: space-between;
  gap: 12px;
}

.card-title {
  align-items: center;
  display: flex;
  gap: 10px;
}

.title-icon {
  align-items: center;
  background: #a0f0f0;
  border-radius: 10px;
  color: #004f50;
  display: inline-flex;
  font-weight: 900;
  font-size: 22px;
  height: 50px;
  justify-content: center;
  width: 50px;
}

h2 {
  color: #0b1c30;
  font-size: 24px;
  font-weight: 900;
  line-height: 1.15;
}

.form-grid {
  display: grid;
  gap: 28px;
  grid-template-columns: repeat(4, minmax(150px, 1fr));
  margin-top: 32px;
}

.form-grid label {
  color: #4e616f;
  display: grid;
  font-size: 14px;
  font-weight: 900;
  gap: 10px;
}

input,
select {
  background: #eff4ff;
  border: 1px solid transparent;
  border-radius: 10px;
  box-sizing: border-box;
  color: #0b1c30;
  font-size: 16px;
  height: 52px;
  outline: none;
  padding: 0 16px;
  width: 100%;
}

input:focus,
select:focus {
  border-color: #005454;
  box-shadow: 0 0 0 3px rgba(0, 84, 84, 0.14);
}

.permission-save-row {
  align-items: end;
  margin-top: 28px;
}

.permission-save-row h3 {
  color: #4e616f;
  font-size: 15px;
  font-weight: 900;
  margin-bottom: 12px;
}

.permission-toggle-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.permission-toggle {
  align-items: center;
  background: #eff4ff;
  border: 1px solid transparent;
  border-radius: 999px;
  color: #4e616f;
  cursor: pointer;
  display: inline-flex;
  font-size: 15px;
  font-weight: 900;
  gap: 12px;
  min-height: 40px;
  padding: 0 16px;
  user-select: none;
  white-space: nowrap;
}

.permission-toggle input {
  opacity: 0;
  pointer-events: none;
  position: absolute;
}

.permission-toggle.active {
  background: #005454;
  color: #ffffff;
}

.permission-toggle:not(.active):hover {
  background: #e5eeff;
}

.permission-icon {
  font-size: 13px;
}

.permission-toggle.locked {
  cursor: default;
  opacity: 0.9;
}

.manager-permission-note {
  background: #eff4ff;
  border-radius: 10px;
  color: #004f50;
  display: inline-block;
  font-size: 12px;
  font-weight: 700;
  margin-top: 16px;
  padding: 9px 12px;
}

.primary-btn,
.secondary-btn,
.danger-btn {
  align-items: center;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  display: inline-flex;
  gap: 8px;
  justify-content: center;
  font-weight: 900;
  font-size: 15px;
  height: 42px;
  padding: 0 16px;
}

.primary-btn {
  background: #005454;
  color: #ffffff;
}

.primary-btn:hover {
  background: #0d6e6e;
}

.save-btn {
  align-items: center;
  border-radius: 10px;
  display: inline-flex;
  font-size: 18px;
  gap: 10px;
  height: 52px;
  justify-content: center;
  line-height: 1;
  min-width: 180px;
  padding: 0 28px;
  text-align: center;
}

.save-btn .ui-icon {
  height: 22px;
  margin-top: 1px;
  width: 22px;
}

.secondary-btn {
  background: #eff4ff;
  color: #364956;
}

.secondary-btn:hover:not(:disabled) {
  background: #e5eeff;
}

.danger-btn {
  background: #ffdad6;
  color: #93000a;
}

.danger-btn:hover {
  background: #ffe2e2;
}

.small {
  border-radius: 10px;
  font-size: 14px;
  height: 38px;
  padding: 0 12px;
}

button:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.table-header {
  padding: 28px 38px;
}

.table-wrap {
  overflow-x: auto;
}

table {
  background: #ffffff;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 1380px;
  width: 100%;
}

th,
td {
  border-left: 0 !important;
  border-right: 0 !important;
  border-bottom: 1px solid #edf2f7;
  border-top: 0;
  color: #0b1c30;
  padding: 24px 34px;
  text-align: left;
  vertical-align: middle;
}

th {
  background: #eff4ff;
  color: #4e616f;
  font-size: 13px;
  font-weight: 900;
  letter-spacing: 0.05em;
  height: 58px;
  text-transform: uppercase;
}

tbody td {
  height: 72px;
}

tbody tr {
  transition: background 0.15s ease;
}

tbody tr:hover {
  background: #f1f5f9;
}

tbody tr.editing-row {
  background: #f8f9ff;
}

td input,
td select {
  background: transparent;
  border-color: transparent;
  border-radius: 8px;
  height: 34px;
  padding: 0;
}

td input:focus,
td select:focus {
  background: #eff4ff;
  padding: 0 10px;
}

.name-col {
  width: 260px;
}

.email-col {
  width: 320px;
}

.role-col {
  width: 180px;
}

.email-col,
.role-col,
tbody td:nth-child(2),
tbody td:nth-child(3) {
  text-align: center;
}

.password-col {
  width: 180px;
}

.actions-col {
  width: 150px;
}

.user-name-text {
  color: #0b1c30;
  font-size: 18px;
  font-weight: 900;
  line-height: 1.2;
}

.muted-text {
  color: #4e616f;
  font-size: 15px;
  font-weight: 600;
  white-space: nowrap;
}

.password-placeholder {
  color: #4e616f;
  font-size: 16px;
  font-weight: 900;
  letter-spacing: 0.08em;
}

.role-badge {
  border-radius: 999px;
  display: inline-flex;
  font-size: 12px;
  font-weight: 900;
  line-height: 1;
  padding: 8px 12px;
}

.role-teacher {
  background: #a0f0f0;
  color: #004f50;
}

.role-staff {
  background: #d1e5f6;
  color: #364956;
}

.role-manager {
  background: #e1e3e4;
  color: #191c1d;
}

.permission-cell {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  min-width: 260px;
}

.table-toggle {
  justify-content: center;
  min-height: 24px;
  padding: 0 8px;
}

.permission-cell.readonly {
  align-items: center;
}

.readonly-chip {
  cursor: default;
  font-size: 0;
  min-height: 24px;
  padding: 0;
  width: 24px;
}

.readonly-chip.active,
.readonly-chip.inactive {
  background: transparent;
}

.readonly-chip.active {
  color: #005454;
}

.readonly-chip.inactive {
  color: #d8e0e2;
}

.readonly-chip .permission-icon {
  font-size: 12px;
}

.table-note {
  margin: 0;
}

.actions-cell {
  align-items: center;
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  white-space: nowrap;
}

.icon-btn {
  align-items: center;
  border: none;
  border-radius: 999px;
  cursor: pointer;
  display: inline-flex;
  height: 38px;
  justify-content: center;
  width: 38px;
}

.icon-btn .ui-icon {
  font-size: 24px;
  height: 24px;
  width: 24px;
}

.edit-icon-btn {
  background: transparent;
  color: #005454;
}

.edit-icon-btn:hover {
  background: #eff4ff;
}

.delete-icon-btn {
  background: transparent;
  color: #ba1a1a;
}

.delete-icon-btn:hover {
  background: #ffdad6;
}

.empty-state {
  color: #4e616f;
  font-weight: 900;
  margin: 0;
  padding: 34px;
  text-align: center;
}

.pagination-bar {
  background: #eff4ff;
  color: #364956;
  font-size: 13px;
  font-weight: 900;
  padding: 18px 38px;
}

.page-range {
  margin-right: auto;
}

.pagination-bar > span:not(.page-range) {
  color: #0b1c30;
  min-width: 72px;
  text-align: center;
}

@media (max-width: 980px) {
  .page-header,
  .add-header,
  .permission-save-row,
  .table-header,
  .pagination-bar {
    align-items: stretch;
    flex-direction: column;
  }

  .header-tools,
  .header-search,
  .save-btn {
    width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  th,
  td {
    padding: 10px 16px;
  }
}
</style>
