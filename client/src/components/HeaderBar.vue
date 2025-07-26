<template>
  <header class="header">
    <h1>
      <router-link to="/home" class="navbar navbar-expand-md navbar-dark bg-dark mb-4">聖公會聖馬利亞堂莫慶堯中學 行政管理系統</router-link>
    </h1>
    <hr />
    用戶資料
    <button @click="handleLogout" class="logout-btn">Logout</button>
    <hr />

    <div class="menu">
      <!-- 選單1 (Hover) -->
      <span class="main-menu" @mouseover="switchMenu('SubMenu1', $event)" @mouseout="hideMenu($event)">
        時間表應用
        <span style="font-size: 9px;">&#9660;</span>
        <ul id="SubMenu1" class="sub-menu" style="display: none;">
          <li><router-link to="/TeacherTimetable">老師上課與空堂時間表</router-link></li>
          <li><router-link to="/ClassObservation">觀課選堂</router-link></li>
          <li><router-link to="/SwapLesson">調課搜尋</router-link></li>
          <li><router-link to="/FreeTeacher">空堂老師 / 課堂總表</router-link></li>
          <li><router-link to="/ClassTimetable">各班上課時間表</router-link></li>
          <li><router-link to="/RoomTimetable">各房間上課時間表</router-link></li>
          <li><router-link to="/Electives">高中選修名單</router-link></li>
          <li><router-link to="/StdTimetable">學生上課時間表</router-link></li>
        </ul>
      </span>

      <!-- 選單2 (Hover) -->
      <span class="main-menu" @mouseover="switchMenu('SubMenu2', $event)" @mouseout="hideMenu($event)">
        提名學生
        <span style="font-size: 9px;">&#9660;</span>
        <ul id="SubMenu2" class="sub-menu" style="display: none;">
          <li><router-link to="/BLA">最佳學習態度提名</router-link></li>
          <li><router-link to="/BLAResult">最佳學習態度提名結果</router-link></li>
          <li><router-link to="/ConductAward">操行獎提名</router-link></li>
          <li><router-link to="/ConductAwardResult">操行獎提名統計結果</router-link></li>
        </ul>
      </span>

      <!-- 只有管理員 (manager) 才能看到這個 -->
      <span v-if="userRole === 'manager'" class="main-menu" @mouseover="switchMenu('SubMenu3', $event)"
        @mouseout="hideMenu($event)">
        管理老師帳戶
        <span style="font-size: 9px;">&#9660;</span>
        <ul id="SubMenu3" class="sub-menu" style="display: none;">
          <li><router-link to="/editTeacher">老師帳戶</router-link></li>
        </ul>
      </span>
    </div>
  </header>
</template>

<script>
export default {
  data() {
    return {
      userRole: null, // 用戶身份
      visibleMenu: '' // 記錄當前打開的選單
    };
  },
  mounted() {
    // 嘗試從 localStorage 獲取用戶資料
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
      // 取得對應的 <ul> 元素
      const subMenuEl = this.$el.querySelector(`#${subMenuId}`);
      if (!subMenuEl) return;
      // 如果目前是隱藏狀態，則顯示子選單
      if (subMenuEl.style.display === 'none') {
        // 讓子選單的最小寬度與主選單相同 (僅為了美觀)
        subMenuEl.style.minWidth = `${event.currentTarget.clientWidth}px`;
        subMenuEl.style.display = 'block';
        // 先隱藏之前的子選單
        this.hideMenu();
        // 記錄目前顯示的子選單
        this.visibleMenu = subMenuId;
      } else {
        // 隱藏子選單
        if (event.type !== 'mouseover' || this.visibleMenu !== subMenuId) {
          subMenuEl.style.display = 'none';
          this.visibleMenu = '';
        }
      }
    },
    hideMenu() {
      // 如果有記錄的子選單，就把它隱藏
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
        localStorage.removeItem('user');
        window.location.href = '/login'; // 或者使用 this.$router.push('/login') 如果你在 Vue Router 中
      } catch (error) {
        console.error('Logout failed:', error);
      }
    },
    logout() {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      this.$router.push('/login');
      window.location.reload(); // 清UI
    }
  }
};
</script>
<style scoped>
/* 主標題樣式 */
h1 {
  color: #000;
}

.menu {
  display: flex;
  justify-content: space-evenly;
  background-color: #fff;
}

/* 主選單樣式 */
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

/* 下拉清單樣式 */
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
  /* 預設隱藏 */
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
</style>
