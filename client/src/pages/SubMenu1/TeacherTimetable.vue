<template>
  <main class="teacher-page">
    <section class="teacher-panel">
      <header class="page-header">
        <div>
          <p>Timetable</p>
          <h1>Teacher Timetable</h1>
        </div>
        <span class="count-badge">{{ selectedTeacherId.length }} selected</span>
      </header>

      <div class="toolbar">
        <label class="search-box">
          <span>Search teacher</span>
          <input
            v-model.trim="searchText"
            type="text"
            placeholder="Type teacher name..."
          />
        </label>

        <div class="toolbar-actions">
          <button type="button" class="secondary-btn" @click="selectVisibleTeachers">
            Select shown
          </button>
          <button type="button" class="secondary-btn" @click="clearSelection">
            Clear
          </button>
        </div>
      </div>

      <div class="selected-strip" v-if="selectedTeachers.length">
        <button
          v-for="teacher in selectedTeachers"
          :key="teacher.teacher_id"
          type="button"
          class="selected-chip"
          @click="toggleTeacher(teacher.teacher_id)"
        >
          {{ teacher.teacher_name }} <span aria-hidden="true">x</span>
        </button>
      </div>

      <div class="teacher-list" v-if="filteredTeachers.length">
        <label
          v-for="teacher in filteredTeachers"
          :key="teacher.teacher_id"
          class="teacher-row"
          :class="{ selected: selectedTeacherId.includes(teacher.teacher_id) }"
        >
          <input
            type="checkbox"
            :value="teacher.teacher_id"
            v-model="selectedTeacherId"
          />
          <span>{{ teacher.teacher_name }}</span>
        </label>
      </div>

      <p v-else class="empty-message">No teacher found.</p>

      <footer class="footer-actions">
        <span>{{ filteredTeachers.length }} of {{ teachers.length }} teachers shown</span>
        <button type="button" class="primary-btn" @click="goNext">
          View Timetable
        </button>
      </footer>
    </section>
  </main>
</template>

<script>
import axios from 'axios';

const TEXT = {
  chooseTeacher: '\u8acb\u9078\u64c7\u81f3\u5c11\u4e00\u4f4d\u8001\u5e2b\u3002',
  loadFailed: '\u8f09\u5165\u8001\u5e2b\u5217\u8868\u5931\u6557\u3002'
};

export default {
  data() {
    return {
      teachers: [],
      selectedTeacherId: [],
      searchText: ''
    };
  },
  computed: {
    filteredTeachers() {
      const keyword = this.searchText.toLowerCase();
      if (!keyword) return this.teachers;

      return this.teachers.filter(teacher =>
        String(teacher.teacher_name || '').toLowerCase().includes(keyword)
      );
    },
    selectedTeachers() {
      return this.teachers.filter(teacher =>
        this.selectedTeacherId.includes(teacher.teacher_id)
      );
    }
  },
  methods: {
    async fetchTeachers() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/api/teachers/list', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.teachers = res.data;
      } catch (err) {
        console.error('Failed to load teachers:', err);
        alert(TEXT.loadFailed);
      }
    },
    toggleTeacher(teacherId) {
      const index = this.selectedTeacherId.indexOf(teacherId);
      if (index >= 0) {
        this.selectedTeacherId.splice(index, 1);
      } else {
        this.selectedTeacherId.push(teacherId);
      }
    },
    selectVisibleTeachers() {
      this.filteredTeachers.forEach(teacher => {
        if (!this.selectedTeacherId.includes(teacher.teacher_id)) {
          this.selectedTeacherId.push(teacher.teacher_id);
        }
      });
    },
    clearSelection() {
      this.selectedTeacherId = [];
    },
    goNext() {
      if (this.selectedTeacherId.length === 0) {
        alert(TEXT.chooseTeacher);
        return;
      }

      this.$router.push({
        name: 'TeacherTimetableResult',
        query: { teacherId: this.selectedTeacherId }
      });
    }
  },
  mounted() {
    this.fetchTeachers();
  }
};
</script>

<style scoped>
.teacher-page {
  min-height: calc(100vh - 126px);
  box-sizing: border-box;
  padding: 44px 20px 64px;
}

.teacher-panel {
  max-width: 980px;
  margin: 0 auto;
  border: 1px solid #d1e0e5;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 38px rgba(25, 54, 69, 0.12);
  box-sizing: border-box;
  padding: 26px;
}

.page-header,
.toolbar,
.footer-actions {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 18px;
}

.page-header p {
  color: #0d6b78;
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 8px;
  text-transform: uppercase;
}

h1 {
  color: #122635;
  font-size: 32px;
  letter-spacing: 0;
  margin: 0;
}

.count-badge {
  border: 1px solid #b8cad3;
  border-radius: 6px;
  background: #f7fafb;
  color: #27485b;
  font-weight: 700;
  padding: 9px 12px;
}

.toolbar {
  margin-top: 24px;
}

.search-box {
  flex: 1;
  display: grid;
  gap: 7px;
  color: #27485b;
  font-weight: 600;
}

.search-box input {
  height: 44px;
  border: 1px solid #b8cad3;
  border-radius: 6px;
  background: #fff;
  box-sizing: border-box;
  font-size: 15px;
  padding: 0 12px;
}

.search-box input:focus {
  border: 2px solid #0b7285;
}

.toolbar-actions {
  display: flex;
  gap: 10px;
  align-self: end;
}

button {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
}

.secondary-btn {
  height: 44px;
  border: 1px solid #b8cad3;
  background: #fff;
  color: #244152;
  padding: 0 14px;
}

.secondary-btn:hover,
.selected-chip:hover {
  border-color: #0b7285;
  color: #0b7285;
}

.selected-strip {
  max-height: 88px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  overflow-y: auto;
  border: 1px solid #d6e2e6;
  border-radius: 8px;
  background: #f7fafb;
  margin-top: 18px;
  padding: 10px;
}

.selected-chip {
  border: 1px solid #b8cad3;
  background: #fff;
  color: #244152;
  padding: 8px 10px;
}

.selected-chip span {
  color: #8799a4;
  margin-left: 6px;
}

.teacher-list {
  max-height: 460px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 7px;
  overflow-y: auto;
  border: 1px solid #d6e2e6;
  border-radius: 8px;
  background: #f7fafb;
  margin-top: 18px;
  padding: 10px;
}

.teacher-row {
  min-height: 36px;
  display: flex;
  align-items: center;
  gap: 7px;
  border: 1px solid #d7e2e7;
  border-radius: 6px;
  background: #fff;
  color: #243f51;
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
  padding: 5px 8px;
}

.teacher-row span {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.teacher-row:hover {
  border-color: #86adba;
  background: #eef7f8;
}

.teacher-row.selected {
  border-color: #0b7285;
  background: #e0f1f2;
  color: #0a5260;
}

.teacher-row input {
  flex: 0 0 auto;
  accent-color: #0b7285;
}

.empty-message {
  border: 1px dashed #b8cad3;
  border-radius: 8px;
  color: #607683;
  margin: 18px 0 0;
  padding: 28px;
  text-align: center;
}

.footer-actions {
  color: #607683;
  margin-top: 18px;
}

.primary-btn {
  height: 48px;
  background: #0b7285;
  color: #fff;
  font-size: 15px;
  padding: 0 22px;
}

.primary-btn:hover {
  background: #085c6b;
}

@media (max-width: 720px) {
  .teacher-panel {
    padding: 20px;
  }

  .page-header,
  .toolbar,
  .footer-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .toolbar-actions {
    align-self: stretch;
  }

  .secondary-btn,
  .primary-btn {
    width: 100%;
  }

  .teacher-list {
    grid-template-columns: 1fr;
    max-height: 520px;
  }
}
</style>
