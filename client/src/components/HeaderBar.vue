<template>
  <header class="header">
    <div class="top-row">
      <h1>
        <router-link to="/home">{{ $t('app.title') }}</router-link>
      </h1>

      <div class="account-info">
        <div class="language-switch" :aria-label="$t('common.languageEn')">
          <button
            type="button"
            :class="{ active: $lang.locale === 'zh' }"
            @click="$setLocale('zh')"
          >
            {{ $t('common.languageZh') }}
          </button>
          <button
            type="button"
            :class="{ active: $lang.locale === 'en' }"
            @click="$setLocale('en')"
          >
            EN
          </button>
        </div>

        <span v-if="displayUserName" class="user-badge">{{ $t('common.username') }}: {{ displayUserName }}</span>
        <span v-if="showRoleBadge" class="role-badge">{{ $t('common.role') }}: {{ displayRole }}</span>
        <router-link
          v-if="hasPermission('changePassword')"
          to="/change-password"
          class="account-link"
        >
          {{ $t('nav.changePassword') }}
        </router-link>
        <button @click="handleLogout" class="logout-btn">{{ $t('common.logout') }}</button>
      </div>
    </div>

    <hr />

    <div class="menu">
      <span v-if="hasPermission('timetable')" class="main-menu" @mouseover="switchMenu('SubMenu1', $event)" @mouseout="hideMenu">
        {{ $t('nav.timetable') }}
        <span class="arrow">&#9660;</span>
        <ul id="SubMenu1" class="sub-menu" style="display: none;">
          <li><router-link to="/TeacherTimetable">{{ $t('nav.teacherTimetable') }}</router-link></li>
          <li><router-link to="/ClassObservation">{{ $t('nav.classObservation') }}</router-link></li>
          <li><router-link to="/SwapLesson">{{ $t('nav.swapLesson') }}</router-link></li>
          <li><router-link to="/FreeTeacher">{{ $t('nav.freeTeacher') }}</router-link></li>
          <li><router-link to="/ClassTimetable">{{ $t('nav.classTimetable') }}</router-link></li>
          <li><router-link to="/RoomTimetable">{{ $t('nav.roomTimetable') }}</router-link></li>
          <li><router-link to="/Electives">{{ $t('nav.electives') }}</router-link></li>
          <li><router-link to="/StdTimetable">{{ $t('nav.studentTimetable') }}</router-link></li>
        </ul>
      </span>

      <span v-if="hasPermission('nominations')" class="main-menu" @mouseover="switchMenu('SubMenu2', $event)" @mouseout="hideMenu">
        {{ $t('nav.nominations') }}
        <span class="arrow">&#9660;</span>
        <ul id="SubMenu2" class="sub-menu" style="display: none;">
          <li><router-link to="/BLA">{{ $t('nav.bla') }}</router-link></li>
          <li><router-link to="/BLAResult">{{ $t('nav.blaResult') }}</router-link></li>
          <li><router-link to="/ConductAward">{{ $t('nav.conductAward') }}</router-link></li>
          <li><router-link to="/ConductAwardResult">{{ $t('nav.conductAwardResult') }}</router-link></li>
          <li><router-link to="/LearningGoalEntry">{{ $t('nav.learningGoalEntry') }}</router-link></li>
          <li><router-link to="/LearningGoalResult">{{ $t('nav.learningGoalResult') }}</router-link></li>
          <li><router-link to="/PrefectNomination">{{ $t('nav.prefectNomination') }}</router-link></li>
          <li><router-link to="/PrefectNominationResult">{{ $t('nav.prefectNominationResult') }}</router-link></li>
        </ul>
      </span>

      <span
        v-if="canShowManagementMenu"
        class="main-menu"
        @mouseover="switchMenu('SubMenu3', $event)"
        @mouseout="hideMenu"
      >
        {{ $t('nav.userManagement') }}
        <span class="arrow">&#9660;</span>
        <ul id="SubMenu3" class="sub-menu" style="display: none;">
          <li><router-link to="/editTeacher">{{ $t('nav.editTeacher') }}</router-link></li>
          <li v-if="canManageStudents"><router-link to="/StudentManagement">{{ $t('nav.studentManagement') }}</router-link></li>
          <li v-if="canImportTimetable || canManageStudents"><router-link to="/ImportTeacher">{{ $t('nav.importTeacher') }}</router-link></li>
        </ul>
      </span>
    </div>
  </header>
</template>

<script>
export default {
  data() {
    return {
      userRole: null,
      userName: '',
      userEmail: '',
      permissions: {},
      visibleMenu: ''
    };
  },
  computed: {
    displayUserName() {
      if (this.userName) return this.userName;
      if (this.userEmail) return this.userEmail.split('@')[0];
      return '';
    },
    showRoleBadge() {
      return this.userRole === 'staff' || this.userRole === 'manager';
    },
    displayRole() {
      if (!this.userRole) return '';
      return this.$t(`roles.${this.userRole}`);
    },
    canShowManagementMenu() {
      return this.canManageUsers || this.canManageStudents || this.canImportTimetable;
    },
    canManageUsers() {
      return this.hasPermission('manageUsers');
    },
    canManageStudents() {
      return this.hasPermission('manageStudents');
    },
    canImportTimetable() {
      return this.hasPermission('importTimetable');
    }
  },
  mounted() {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsedUser = JSON.parse(user);
        this.userRole = parsedUser.role ? parsedUser.role.trim().toLowerCase() : 'teacher';
        this.userName = parsedUser.user_name || parsedUser.userName || '';
        this.userEmail = parsedUser.email || '';
        this.permissions = parsedUser.permissions || {};
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  },
  methods: {
    hasPermission(permission) {
      if (this.userRole === 'manager') return true;
      return Boolean(this.permissions && this.permissions[permission]);
    },
    switchMenu(subMenuId, event) {
      this.hideMenu();

      const subMenuEl = this.$el.querySelector(`#${subMenuId}`);
      if (!subMenuEl) return;

      subMenuEl.style.minWidth = `${event.currentTarget.clientWidth}px`;
      subMenuEl.style.display = 'block';
      this.visibleMenu = subMenuId;
    },
    hideMenu() {
      if (this.visibleMenu) {
        const oldMenuEl = this.$el.querySelector(`#${this.visibleMenu}`);
        if (oldMenuEl) {
          oldMenuEl.style.display = 'none';
        }
      }
      this.visibleMenu = '';
    },
    async handleLogout() {
      try {
        const token = localStorage.getItem('token');
        await fetch('/api/auth/logout', {
          method: 'POST',
          credentials: 'include',
          headers: token ? { Authorization: `Bearer ${token}` } : {}
        });
      } catch (error) {
        console.error('Logout failed:', error);
      } finally {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        this.$router.push('/login');
      }
    }
  }
};
</script>

<style scoped>
.header {
  position: sticky;
  top: 0;
  z-index: 20;
  border-bottom: 1px solid var(--border);
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 8px 22px rgba(23, 48, 64, 0.08);
  backdrop-filter: blur(10px);
  padding: 10px 18px 0;
}

.top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
  max-width: 1440px;
  margin: 0 auto;
}

h1 {
  color: var(--text);
  flex: 0 0 auto;
  font-size: 21px;
  line-height: 1.2;
  margin: 0;
  white-space: nowrap;
}

h1 a {
  color: var(--text);
}

.account-info {
  display: flex;
  align-items: center;
  flex: 1 1 auto;
  flex-wrap: nowrap;
  justify-content: flex-end;
  gap: 8px;
  min-width: 0;
}

.language-switch {
  display: inline-flex;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #fff;
  overflow: hidden;
}

.language-switch button {
  min-width: 42px;
  height: 32px;
  border: none;
  border-radius: 0 !important;
  background: #fff !important;
  color: var(--text) !important;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  padding: 0 10px;
}

.language-switch button.active {
  background: var(--primary) !important;
  color: #fff !important;
}

.role-badge,
.user-badge {
  border: 1px solid var(--border);
  border-radius: 6px;
  box-sizing: border-box;
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
  min-height: 32px;
  padding: 9px 10px;
  white-space: nowrap;
}

.role-badge {
  color: var(--primary-dark);
  background: var(--primary-soft);
}

.user-badge {
  background: #fff;
  color: var(--text);
}

.account-link {
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  color: var(--text);
  background: #fff;
  box-sizing: border-box;
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
  min-height: 32px;
  padding: 9px 12px;
  white-space: nowrap;
}

.account-link:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.menu {
  display: flex;
  justify-content: center;
  gap: 12px;
  max-width: 1440px;
  margin: 0 auto;
  background: transparent;
  padding: 8px 0 10px;
}

.main-menu {
  color: var(--muted);
  background: transparent;
  border-radius: 6px;
  padding: 8px 12px;
  margin: 0;
  cursor: pointer;
  display: inline-block;
  font-weight: 700;
}

.main-menu:hover {
  color: var(--primary-dark);
  background: var(--primary-soft);
}

.arrow {
  font-size: 9px;
}

.sub-menu {
  color: var(--text);
  background: #fff;
  margin: 8px -12px;
  padding: 6px;
  list-style-type: none;
  position: absolute;
  display: none;
  border: 1px solid var(--border);
  border-radius: 8px;
  box-shadow: var(--shadow);
}

.sub-menu li {
  padding: 0;
  text-align: left;
}

.sub-menu li:hover {
  color: var(--primary-dark);
  background: var(--primary-soft);
  border-radius: 6px;
}

.sub-menu a {
  text-align: left;
  display: block;
  text-decoration: none;
  color: inherit;
  padding: 8px 10px;
  white-space: nowrap;
}

.sub-menu a:hover {
  color: var(--primary-dark);
  background: transparent;
  text-decoration: none;
}

.logout-btn {
  background: var(--danger);
  color: white;
  box-sizing: border-box;
  min-height: 32px;
  padding: 8px 14px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  white-space: nowrap;
}

.logout-btn:hover {
  background: #9f302b;
}

.router-link-active {
  text-decoration: none;
  color: black;
}

a {
  text-decoration: none;
  color: black;
}

@media (max-width: 900px) {
  .top-row {
    align-items: flex-start;
    flex-direction: column;
  }

  .account-info,
  .menu {
    justify-content: flex-start;
  }

  .account-info,
  .menu {
    flex-wrap: wrap;
  }
}
</style>
