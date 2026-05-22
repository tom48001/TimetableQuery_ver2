<template>
  <header class="header">
    <div class="top-row">
      <h1>
        <router-link to="/home">Timetable Query System</router-link>
      </h1>

      <div class="account-info">
        <span v-if="userRole" class="role-badge">Role: {{ displayRole }}</span>
        <button @click="handleLogout" class="logout-btn">Logout</button>
      </div>
    </div>

    <hr />

    <div class="menu">
      <span class="main-menu" @mouseover="switchMenu('SubMenu1', $event)" @mouseout="hideMenu">
        Timetable
        <span class="arrow">&#9660;</span>
        <ul id="SubMenu1" class="sub-menu" style="display: none;">
          <li><router-link to="/TeacherTimetable">Teacher Timetable</router-link></li>
          <li><router-link to="/ClassObservation">Class Observation</router-link></li>
          <li><router-link to="/SwapLesson">Swap Lesson</router-link></li>
          <li><router-link to="/FreeTeacher">Free Teacher</router-link></li>
          <li><router-link to="/ClassTimetable">Class Timetable</router-link></li>
          <li><router-link to="/RoomTimetable">Room Timetable</router-link></li>
          <li><router-link to="/Electives">Electives</router-link></li>
          <li><router-link to="/StdTimetable">Student Timetable</router-link></li>
        </ul>
      </span>

      <span class="main-menu" @mouseover="switchMenu('SubMenu2', $event)" @mouseout="hideMenu">
        Students
        <span class="arrow">&#9660;</span>
        <ul id="SubMenu2" class="sub-menu" style="display: none;">
          <li><router-link to="/BLA">BLA Vote</router-link></li>
          <li><router-link to="/BLAResult">BLA Result</router-link></li>
          <li><router-link to="/ConductAward">Conduct Award Vote</router-link></li>
          <li><router-link to="/ConductAwardResult">Conduct Award Result</router-link></li>
          <li><router-link to="/LearningGoalEntry">學習目標輸入</router-link></li>
          <li><router-link to="/LearningGoalResult">學習目標獎勵結果</router-link></li>
          <li><router-link to="/PrefectNomination">風紀提名</router-link></li>
          <li><router-link to="/PrefectNominationResult">風紀提名結果</router-link></li>
        </ul>
      </span>

      <span
        v-if="userRole === 'manager'"
        class="main-menu"
        @mouseover="switchMenu('SubMenu3', $event)"
        @mouseout="hideMenu"
      >
        Management
        <span class="arrow">&#9660;</span>
        <ul id="SubMenu3" class="sub-menu" style="display: none;">
          <li><router-link to="/editTeacher">Manage Users</router-link></li>
          <li><router-link to="/ImportTeacher">Import Timetable</router-link></li>
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
      visibleMenu: ''
    };
  },
  computed: {
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
  background-color: #fff;
}

.top-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

h1 {
  color: #000;
  font-size: 24px;
  margin: 0;
}

.account-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.role-badge {
  border: 1px solid #d6e4f0;
  border-radius: 6px;
  color: #24415c;
  background: #f5f9fc;
  padding: 6px 10px;
  font-weight: 600;
}

.menu {
  display: flex;
  justify-content: space-evenly;
  background-color: #fff;
}

.main-menu {
  color: #666;
  background-color: #fff;
  padding: 5px;
  margin: 0;
  cursor: pointer;
  display: inline-block;
}

.main-menu:hover {
  color: #0069c2;
  background-color: #cfe8fd;
  border-radius: 8px;
}

.arrow {
  font-size: 9px;
}

.sub-menu {
  color: #666;
  background-color: #fff;
  margin: 5px -5px;
  padding: 0;
  list-style-type: none;
  position: absolute;
  display: none;
  border: 1px solid #ddd;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.sub-menu li {
  padding: 3px 5px;
  text-align: left;
}

.sub-menu li:hover {
  color: #fff;
  background-color: #f9f9f9;
}

.sub-menu a {
  text-align: left;
  display: block;
  text-decoration: none;
  color: #666;
}

.sub-menu a:hover {
  color: #696969;
  background-color: #f9f9fb;
  text-decoration: none;
}

.logout-btn {
  background-color: #f44336;
  color: white;
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

.logout-btn:hover {
  background-color: #d32f2f;
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
