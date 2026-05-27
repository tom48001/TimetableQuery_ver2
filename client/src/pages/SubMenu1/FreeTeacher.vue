<template>
  <main class="free-page">
    <section class="free-panel">
      <header class="page-header">
        <div>
          <h1>搜尋空堂老師</h1>
        </div>
      </header>

      <section class="filters">
        <label>
          <span>日期：</span>
          <input type="date" v-model="selectedDate" />
        </label>

        <p v-if="selectedDate" class="date-preview">
          {{ selectedDate }} <strong>({{ weekdayLabel }})</strong>
          <small>(yyyy-mm-dd)</small>
        </p>

        <label>
          <span>課節：</span>
          <select v-model.number="period">
            <option disabled value="">請選擇課節</option>
            <option v-for="periodNumber in periodNumbers" :key="periodNumber" :value="periodNumber">
              第{{ periodNumber }}節
            </option>
          </select>
        </label>

        <button type="button" class="primary-btn" @click="goResult">
          搜尋
        </button>
      </section>
    </section>
  </main>
</template>

<script>
const TEXT = {
  chooseFilters: '\u8acb\u9078\u64c7\u65e5\u671f\u53ca\u8ab2\u7bc0\u3002'
};

const WEEKDAY_LABELS = ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'];
const WEEKDAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function todayString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export default {
  data() {
    return {
      selectedDate: todayString(),
      period: '',
      periodNumbers: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]
    };
  },
  computed: {
    selectedDateObject() {
      if (!this.selectedDate) return null;
      return new Date(`${this.selectedDate}T00:00:00`);
    },
    weekdayIndex() {
      return this.selectedDateObject ? this.selectedDateObject.getDay() : 0;
    },
    weekdayLabel() {
      return WEEKDAY_LABELS[this.weekdayIndex];
    },
    weekdayKey() {
      return WEEKDAY_KEYS[this.weekdayIndex];
    }
  },
  methods: {
    goResult() {
      if (!this.selectedDate || !this.period) {
        alert(TEXT.chooseFilters);
        return;
      }

      this.$router.push({
        name: 'FreeTeacherResult',
        query: {
          date: this.selectedDate,
          weekday: this.weekdayKey,
          weekdayLabel: this.weekdayLabel,
          period: this.period
        }
      });
    }
  }
};
</script>

<style scoped>
.free-page {
  min-height: calc(100vh - 126px);
  box-sizing: border-box;
  padding: 44px 20px 64px;
}

.free-panel {
  max-width: 620px;
  margin: 0 auto;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--shadow);
  box-sizing: border-box;
  padding: 28px;
}

.page-header {
  margin-bottom: 24px;
}

.page-header p {
  color: var(--primary);
  font-size: 13px;
  font-weight: 800;
  margin: 0 0 8px;
  text-transform: uppercase;
}

h1 {
  margin: 0;
  text-align: left;
}

.filters {
  display: grid;
  gap: 18px;
}

label {
  display: grid;
  gap: 8px;
  color: var(--text);
  font-weight: 800;
}

input,
select {
  height: 46px;
  font-size: 16px;
  padding: 0 12px;
}

.date-preview {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-soft);
  color: var(--text);
  font-size: 18px;
  margin: 0;
  padding: 14px;
  text-align: center;
}

.date-preview small {
  display: block;
  color: var(--muted);
  font-size: 13px;
  margin-top: 4px;
}

.primary-btn {
  width: 160px;
  height: 46px;
}

@media (max-width: 640px) {
  .free-panel {
    padding: 22px;
  }

  .primary-btn {
    width: 100%;
  }
}
</style>
