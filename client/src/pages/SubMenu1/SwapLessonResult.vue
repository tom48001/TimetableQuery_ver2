<template>
  <main class="result-page">
    <section class="result-panel">
      <header class="page-header">
        <div>
          <h1>&#x53EF;&#x4F9B;&#x8ABF;&#x8AB2;&#x7684;&#x8001;&#x5E2B;</h1>
        </div>
        <span class="count-badge">{{ filteredTeachers.length }} 位老師</span>
      </header>

      <div class="request-summary">
        <div>
          <span class="summary-label">&#x9700;&#x8981;&#x8ABF;&#x8AB2;&#x8001;&#x5E2B;&#xFF1A;</span>
          <strong>{{ $route.query.teacherName || '-' }}</strong>
        </div>
        <div>
          <span class="summary-label">&#x9700;&#x8981;&#x8ABF;&#x8AB2;&#x8AB2;&#x7BC0;&#xFF1A;</span>
          <strong>{{ $route.query.lessonLabel || fallbackLessonLabel }}</strong>
        </div>
      </div>

      <p v-if="loading" class="empty-message">Loading...</p>

      <template v-else>
        <input
          v-if="availableTeachers.length"
          v-model.trim="searchText"
          class="search-input"
          type="text"
          placeholder="Search teacher..."
        />

        <div v-if="filteredTeachers.length" class="teacher-list">
          <span
            v-for="teacher in filteredTeachers"
            :key="teacher.teacher_id"
            class="teacher-chip"
          >
            {{ teacher.teacher_name }}
          </span>
        </div>

        <p v-else class="empty-message">
          &#x6C92;&#x6709;&#x53EF;&#x4F9B;&#x8ABF;&#x8AB2;&#x7684;&#x8001;&#x5E2B;&#x3002;
        </p>
      </template>
    </section>
  </main>
</template>

<script>
import axios from 'axios';

const DAY_LABELS = {
  Mon: '\u661f\u671f\u4e00',
  Tue: '\u661f\u671f\u4e8c',
  Wed: '\u661f\u671f\u4e09',
  Thu: '\u661f\u671f\u56db',
  Fri: '\u661f\u671f\u4e94',
  Sat: '\u661f\u671f\u516d'
};

export default {
  name: 'SwapLessonResult',
  data() {
    return {
      availableTeachers: [],
      loading: true,
      searchText: ''
    };
  },
  computed: {
    filteredTeachers() {
      const keyword = this.searchText.toLowerCase();
      if (!keyword) return this.availableTeachers;

      return this.availableTeachers.filter(teacher =>
        String(teacher.teacher_name || '').toLowerCase().includes(keyword)
      );
    },
    fallbackLessonLabel() {
      const day = DAY_LABELS[this.$route.query.day] || this.$route.query.day || '-';
      const period = this.$route.query.period || '-';
      return `${day} \u7b2c${period}\u7bc0`;
    }
  },
  async mounted() {
    const { day, period } = this.$route.query;
    const token = localStorage.getItem('token');
    try {
      const res = await axios.post('http://localhost:3000/api/swap/substitute-candidates',
        { day, period },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      this.availableTeachers = res.data;
    } catch (err) {
      console.error('Failed to load substitute teachers:', err);
      alert('Failed to load available teachers.');
    } finally {
      this.loading = false;
    }
  }
};
</script>

<style scoped>
.result-page {
  min-height: calc(100vh - 126px);
  box-sizing: border-box;
  padding: 44px 20px 64px;
}

.result-panel {
  max-width: 900px;
  margin: 0 auto;
  border: 1px solid #ded7c5;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 38px rgba(73, 61, 35, 0.12);
  box-sizing: border-box;
  padding: 26px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

.page-header p {
  color: #6f5d12;
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

.count-badge,
.request-summary {
  border: 1px solid #ded0a1;
  border-radius: 6px;
  background: #fffaf0;
  color: #4b4637;
  font-weight: 700;
}

.count-badge {
  padding: 9px 12px;
}

.request-summary {
  display: grid;
  gap: 8px;
  margin-top: 20px;
  padding: 14px;
}

.summary-label {
  color: #6f5d12;
  margin-right: 6px;
}

.search-input {
  width: 100%;
  height: 44px;
  border: 1px solid #b8cad3;
  border-radius: 6px;
  background: #fff;
  box-sizing: border-box;
  font-size: 15px;
  margin-top: 22px;
  padding: 0 12px;
}

.search-input:focus {
  border: 2px solid #4f6f52;
}

.teacher-list {
  max-height: 440px;
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 7px;
  overflow-y: auto;
  border: 1px solid #ded7c5;
  border-radius: 8px;
  background: #faf7ef;
  margin-top: 18px;
  padding: 10px;
}

.teacher-chip {
  border: 1px solid #ded7c5;
  border-radius: 6px;
  background: #fff;
  color: #2f3e36;
  font-size: 13px;
  font-weight: 700;
  overflow: hidden;
  padding: 8px 10px;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.teacher-chip:hover {
  border-color: #b9a665;
  background: #fffdf3;
}

.empty-message {
  border: 1px dashed #b8cad3;
  border-radius: 8px;
  color: #607683;
  margin: 22px 0 0;
  padding: 28px;
  text-align: center;
}

@media (max-width: 720px) {
  .result-panel {
    padding: 20px;
  }

  .page-header,
  .request-summary {
    align-items: stretch;
    flex-direction: column;
  }

  .teacher-list {
    grid-template-columns: 1fr;
  }
}
</style>
