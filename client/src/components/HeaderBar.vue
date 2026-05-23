<template>
  <header class="header">
    <div class="top-row">
      <h1>
        <router-link to="/home">聖公會聖馬利亞堂莫慶堯中學行政管理系統</router-link>
      </h1>

      <div class="account-info">
        <span v-if="displayUserName" class="user-badge">用戶名稱: {{ displayUserName }}</span>
        <span v-if="showRoleBadge" class="role-badge">Role: {{ displayRole }}</span>
        <router-link
          v-if="userRole === 'teacher'"
          to="/change-password"
          class="account-link"
        >
          更改密碼
        </router-link>
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </div>

    <hr />

    <div class="menu">
      <span class="main-menu" @mouseover="switchMenu('SubMenu1', $event)" @mouseout="hideMenu">
        時間表應用
        <span class="arrow">&#9660;</span>
        <ul id="SubMenu1" class="sub-menu" style="display: none;">
          <li><router-link to="/TeacherTimetable">老師上課與空堂時間表</router-link></li>
          <li><router-link to="/ClassObservation">觀課課堂</router-link></li>
          <li><router-link to="/SwapLesson">調課搜尋</router-link></li>
          <li><router-link to="/FreeTeacher">空堂老師 / 課堂總表</router-link></li>
          <li><router-link to="/ClassTimetable">各班上課時間表</router-link></li>
          <li><router-link to="/RoomTimetable">各房間上課時間表</router-link></li>
          <li><router-link to="/Electives">高中選修名單</router-link></li>
          <li><router-link to="/StdTimetable">學生上課時間表</router-link></li>
        </ul>
      </span>

      <span class="main-menu" @mouseover="switchMenu('SubMenu2', $event)" @mouseout="hideMenu">
        提名學生
        <span class="arrow">&#9660;</span>
        <ul id="SubMenu2" class="sub-menu" style="display: none;">
          <li><router-link to="/BLA">最佳學習態度提名</router-link></li>
          <li><router-link to="/BLAResult">最佳學習態度提名結果</router-link></li>
          <li><router-link to="/ConductAward">操行獎提名</router-link></li>
          <li><router-link to="/ConductAwardResult">操行獎提名統計結果</router-link></li>
          <li><router-link to="/LearningGoalEntry">輸入完成學習目標數目</router-link></li>
          <li><router-link to="/LearningGoalResult">學習目標獎勵計劃結果</router-link></li>
          <li><router-link to="/PrefectNomination">紀律領袖生提名</router-link></li>
          <li><router-link to="/PrefectNominationResult">紀律領袖生提名統計結果</router-link></li>
        </ul>
      </span>

      <span
        v-if="userRole === 'manager'"
        class="main-menu"
        @mouseover="switchMenu('SubMenu3', $event)"
        @mouseout="hideMenu"
      >
        使用者管理
        <span class="arrow">&#9660;</span>
        <ul id="SubMenu3" class="sub-menu" style="display: none;">
          <li><router-link to="/editTeacher">管理用戶</router-link></li>
          <li><router-link to="/ImportTeacher">導入時間表</router-link></li>
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
      return this.userRole.charAt(0).toUpperCase() + this.userRole.slice(1);
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
      } catch (error) {
        console.error('Error parsing user data:', error);
      }
    }
  },
  methods: {
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
        await fetch('http://localhost:3000/api/auth/logout', {
          method: 'POST',
          credentials: 'include'
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
  padding: 12px 24px 0;
}

.top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

h1 {
  color: var(--text);
  font-size: 24px;
  margin: 0;
}

h1 a {
  color: var(--text);
}

.account-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-badge,
.user-badge {
  border: 1px solid var(--border);
  border-radius: 6px;
  color: var(--primary-dark);
  background: var(--primary-soft);
  padding: 6px 10px;
  font-weight: 600;
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
  padding: 8px 12px;
  font-weight: 600;
}

.account-link:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.menu {
  display: flex;
  justify-content: center;
  gap: 12px;
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
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
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
</style>
