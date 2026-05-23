<template>
  <main class="swap-page">
    <section class="swap-panel">
      <header class="page-header">
        <div>
          <p>Timetable</p>
          <h1>Swap Lesson</h1>
        </div>
        <span class="count-badge">{{ selectedTeacherName || 'No teacher selected' }}</span>
      </header>

      <label class="search-box">
        <span>Search teacher</span>
        <input
          v-model.trim="searchText"
          type="text"
          placeholder="Type teacher name..."
        />
      </label>

      <div class="teacher-list" v-if="filteredTeachers.length">
        <label
          v-for="teacher in filteredTeachers"
          :key="teacher.teacher_id"
          class="teacher-row"
          :class="{ selected: selectedTeacherId === teacher.teacher_id }"
        >
          <input
            type="radio"
            name="teacher"
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
          Next
        </button>
      </footer>
    </section>
  </main>
</template>

<script>
import axios from 'axios';

const TEXT = {
  chooseTeacher: '\u8acb\u9078\u64c7\u4e00\u4f4d\u8001\u5e2b\u3002',
  loadFailed: '\u8f09\u5165\u8001\u5e2b\u5217\u8868\u5931\u6557\u3002'
};

export default {
  data() {
    return {
      teachers: [],
      selectedTeacherId: null,
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
    selectedTeacherName() {
      const selected = this.teachers.find(teacher => teacher.teacher_id === this.selectedTeacherId);
      return selected ? selected.teacher_name : '';
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
    goNext() {
      if (!this.selectedTeacherId) {
        alert(TEXT.chooseTeacher);
        return;
      }

      this.$router.push({
        name: 'SwapLessonPick',
        query: {
          teacherId: this.selectedTeacherId,
          teacherName: this.selectedTeacherName
        }
      });
    }
  },
  mounted() {
    this.fetchTeachers();
  }
};
</script>

<style scoped>
.swap-page {
  min-height: calc(100vh - 126px);
  box-sizing: border-box;
  padding: 44px 20px 64px;
}

.swap-panel {
  max-width: 860px;
  margin: 0 auto;
  border: 1px solid #d1e0e5;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 38px rgba(25, 54, 69, 0.12);
  box-sizing: border-box;
  padding: 26px;
}

.page-header,
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
  max-width: 260px;
  overflow: hidden;
  padding: 9px 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.search-box {
  display: grid;
  gap: 7px;
  color: #27485b;
  font-weight: 600;
  margin-top: 24px;
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

button {
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 700;
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
  .swap-panel {
    padding: 20px;
  }

  .page-header,
  .footer-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .teacher-list {
    grid-template-columns: 1fr;
    max-height: 520px;
  }

  .primary-btn {
    width: 100%;
  }
}
</style>
