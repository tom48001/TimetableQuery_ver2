<template>
  <main class="teacher-page">
    <section class="teacher-panel">
      <header class="page-header">
        <div>
          <h1>老師上課時間表</h1>
        </div>
        <span class="count-badge">{{ selectedTeacherId.length }} 老師</span>
      </header>

      <div class="toolbar">
        <label class="search-box">
          <span>搜尋老師</span>
          <input
            v-model.trim="searchText"
            type="text"
            placeholder="輸入老師名稱..."
          />
        </label>

        <div class="toolbar-actions">
          <button type="button" class="secondary-btn" @click="selectVisibleTeachers">
            選擇目前顯示
          </button>
          <button type="button" class="secondary-btn" @click="clearSelection">
            清除
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
          :class="{ selected: selectedTeacherId.includes(teacher.teacher_id), empty: !lessonCount(teacher) }"
        >
          <input
            type="checkbox"
            :value="teacher.teacher_id"
            v-model="selectedTeacherId"
          />
          <span class="teacher-name">{{ teacher.teacher_name }}</span>
          <span class="lesson-badge" :class="{ empty: !lessonCount(teacher) }">
            {{ lessonCount(teacher) ? `${lessonCount(teacher)}堂` : '未有課表' }}
          </span>
        </label>
      </div>

      <p v-else class="empty-message">找不到老師</p>

      <footer class="footer-actions">
        <button type="button" class="primary-btn" @click="goNext">
          查看時間表
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
    },
    teachersWithLessons() {
      return this.teachers.filter(teacher => this.lessonCount(teacher) > 0);
    }
  },
  methods: {
    lessonCount(teacher) {
      return Number(teacher.lesson_count) || 0;
    },
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
      this.filteredTeachers
        .filter(teacher => this.lessonCount(teacher) > 0)
        .forEach(teacher => {
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
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--shadow);
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
  color: var(--primary);
  font-size: 13px;
  font-weight: 800;
  margin: 0 0 8px;
  text-transform: uppercase;
}

h1 {
  color: var(--text);
  font-size: 32px;
  letter-spacing: 0;
  margin: 0;
}

.count-badge {
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  background: var(--surface-soft);
  color: var(--text-muted);
  font-weight: 800;
  padding: 9px 14px;
}

.toolbar {
  margin-top: 24px;
}

.search-box {
  flex: 1;
  display: grid;
  gap: 7px;
  color: var(--text-muted);
  font-weight: 800;
}

.search-box input {
  height: 44px;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  background: #fff;
  box-sizing: border-box;
  color: var(--text);
  font-size: 15px;
  padding: 0 12px;
}

.search-box input:focus {
  border-color: var(--primary);
  box-shadow: 0 0 0 3px rgba(11, 114, 133, 0.13);
  outline: none;
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
  font-weight: 800;
}

.secondary-btn {
  height: 44px;
  border: 1px solid var(--border-strong);
  background: #fff;
  color: var(--text);
  padding: 0 14px;
}

.secondary-btn:hover,
.selected-chip:hover {
  border-color: var(--primary);
  color: var(--primary);
}

.selected-strip {
  max-height: 88px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-soft);
  margin-top: 18px;
  padding: 10px;
}

.selected-chip {
  border: 1px solid var(--border-strong);
  background: #fff;
  color: var(--text);
  padding: 8px 10px;
}

.selected-chip span {
  color: #8799a4;
  margin-left: 6px;
}

.teacher-list {
  max-height: 460px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(190px, 1fr));
  gap: 8px;
  overflow-y: auto;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-soft);
  margin-top: 18px;
  padding: 10px;
}

.teacher-row {
  min-height: 44px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #fff;
  color: var(--text);
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  padding: 7px 9px;
}

.teacher-row.empty {
  color: #7b8a93;
}

.teacher-name {
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.teacher-row:hover,
.teacher-row.selected {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: #0a5260;
}

.teacher-row input {
  flex: 0 0 auto;
  accent-color: var(--primary);
}

.lesson-badge {
  border-radius: 999px;
  background: #e7f4f6;
  color: #0a5260;
  font-size: 12px;
  padding: 4px 7px;
  white-space: nowrap;
}

.lesson-badge.empty {
  background: #eef2f4;
  color: #7b8a93;
}

.empty-message {
  border: 1px dashed var(--border-strong);
  border-radius: 8px;
  color: var(--text-muted);
  margin: 18px 0 0;
  padding: 28px;
  text-align: center;
}

.footer-actions {
  color: var(--text-muted);
  margin-top: 18px;
}

.primary-btn {
  height: 48px;
  background: var(--primary);
  color: #fff;
  font-size: 15px;
  padding: 0 22px;
}

.primary-btn:hover {
  background: var(--primary-dark);
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
