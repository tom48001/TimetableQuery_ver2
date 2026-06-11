<template>
  <main class="free-page">
    <section class="free-panel">
      <header class="page-header">
        <div>
          <h1>{{ tr('Search Free Teachers', '搜尋空堂老師') }}</h1>
        </div>
      </header>

      <section class="filters">
        <label>
          <span>{{ tr('Date', '日期') }}</span>
          <input type="date" v-model="selectedDate" />
        </label>

        <p v-if="selectedDate" class="date-preview">
          {{ selectedDate }} <strong>({{ weekdayLabel }})</strong>
        </p>

        <div class="period-block">
          <span>{{ tr('Periods', '課節') }}</span>
          <div class="period-grid">
            <label
              v-for="periodNumber in periodNumbers"
              :key="periodNumber"
              class="period-option"
              :class="{ selected: selectedPeriods.includes(periodNumber) }"
            >
              <input type="checkbox" :value="periodNumber" v-model="selectedPeriods" />
              {{ periodLabel(periodNumber) }}
            </label>
          </div>
        </div>

        <button type="button" class="primary-btn" @click="goResult">
          {{ tr('Search', '搜尋') }}
        </button>
      </section>
    </section>
  </main>
</template>

<script>
const WEEKDAY_KEYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const WEEKDAY_LABELS = {
  zh: ['星期日', '星期一', '星期二', '星期三', '星期四', '星期五', '星期六'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
};

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
      selectedPeriods: [],
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
      const locale = this.$lang && this.$lang.locale === 'en' ? 'en' : 'zh';
      return WEEKDAY_LABELS[locale][this.weekdayIndex];
    },
    weekdayKey() {
      return WEEKDAY_KEYS[this.weekdayIndex];
    }
  },
  methods: {
    tr(en, zh) {
      return this.$lang.locale === 'en' ? en : zh;
    },
    periodLabel(periodNumber) {
      return this.$lang.locale === 'en' ? `Period ${periodNumber}` : `第${periodNumber}節`;
    },
    goResult() {
      if (!this.selectedDate || this.selectedPeriods.length === 0) {
        alert(this.tr('Please select a date and at least one period.', '請選擇日期及最少一個課節。'));
        return;
      }
      const periods = this.selectedPeriods.slice().sort((a, b) => a - b);
      this.$router.push({
        name: 'FreeTeacherResult',
        query: {
          date: this.selectedDate,
          weekday: this.weekdayKey,
          weekdayLabel: this.weekdayLabel,
          period: periods.join(',')
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

h1 {
  margin: 0;
  color: var(--text);
  font-size: 30px;
  text-align: left;
}

.filters {
  display: grid;
  gap: 18px;
}

label,
.period-block {
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

.period-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(112px, 1fr));
  gap: 8px;
}

.period-option {
  min-height: 42px;
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #fff;
  cursor: pointer;
  padding: 0 10px;
}

.period-option input {
  height: auto;
  margin: 0;
  padding: 0;
}

.period-option.selected {
  border-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary-dark);
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
