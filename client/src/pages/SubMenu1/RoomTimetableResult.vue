<template>
  <main class="schedule-page">
    <section class="schedule-panel">
      <header class="page-header">
        <div>
          <p>{{ roomDisplayName }}</p>
          <h1>{{ tr('Room Timetable', '\u623f\u9593\u6642\u9593\u8868') }}</h1>
        </div>
      </header>

      <div class="table-wrap">
        <table class="timetable">
          <thead>
            <tr>
              <th class="period-col">{{ tr('Period / Day', '\u8ab2\u7bc0 / \u661f\u671f') }}</th>
              <th v-for="day in days" :key="day">{{ dayLabel(day) }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="(label, index) in periodLabels" :key="index">
              <th class="period-col" v-html="label"></th>
              <td v-for="day in days" :key="day">
                <div
                  v-for="item in getCell(day, index)"
                  :key="`${item.teacher_name}-${item.period_name}-${item.class_name}`"
                  class="cell-entry"
                  :class="{ elective: isElectivePeriod(item, index) }"
                >
                  <small>{{ tr('Teacher:', '\u8001\u5e2b:') }} <strong>{{ item.teacher_name }}</strong></small>
                  <span>{{ item.class_name }} | {{ subjectLabel(item) }}</span>
                  <span>{{ roomDisplayName }}</span>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </section>
  </main>
</template>

<script>
import axios from 'axios';
import { subjectLabel as formatSubjectLabel } from '../../utils/timetableLabels';

const DAY_LABELS = {
  Mon: '\u661f\u671f\u4e00',
  Tue: '\u661f\u671f\u4e8c',
  Wed: '\u661f\u671f\u4e09',
  Thu: '\u661f\u671f\u56db',
  Fri: '\u661f\u671f\u4e94',
  Sat: '\u661f\u671f\u516d'
};

const PERIOD_TIMES = {
  1: '08:30-09:05',
  2: '09:05-09:40',
  3: '09:55-10:30',
  4: '10:30-11:05',
  5: '11:20-11:55',
  6: '11:55-12:30',
  7: '13:30-14:05',
  8: '14:05-14:40',
  9: '14:40-15:15',
  10: '15:25-16:00',
  11: '14:50-15:25',
  12: '15:25-16:00'
};

export default {
  data() {
    return {
      schedule: [],
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']
    };
  },
  computed: {
    roomDisplayName() {
      return this.$route.query.roomName || this.tr('Room', '\u623f\u9593');
    },
    periodLabels() {
      return Array.from({ length: 12 }, (value, index) => index + 1).map(period => {
        const label = this.$lang.locale === 'en' ? 'Period ' + period : '\u7b2c' + period + '\u7bc0';
        return label + '<br><small>' + PERIOD_TIMES[period] + '</small>';
      });
    }
  },
  mounted() {
    this.fetchSchedule();
  },
  methods: {
    tr(en, zh) {
      return this.$lang.locale === 'en' ? en : zh;
    },
    subjectLabel(item) {
      return formatSubjectLabel(item, this.$lang.locale);
    },
    dayLabel(day) {
      const zh = DAY_LABELS[day] || day;
      const en = { Mon: 'Mon', Tue: 'Tue', Wed: 'Wed', Thu: 'Thu', Fri: 'Fri', Sat: 'Sat' }[day] || day;
      return this.$lang.locale === 'en' ? en : zh;
    },
    async fetchSchedule() {
      try {
        const token = localStorage.getItem('token');
        const roomId = this.$route.query.roomId;
        const res = await axios.get(`/api/rooms/schedule/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.schedule = res.data;
      } catch (err) {
        alert(this.tr('Failed to load room timetable.', '\u8f09\u5165\u623f\u9593\u6642\u9593\u8868\u5931\u6557\u3002'));
      }
    },
    getCell(day, periodIndex) {
      const periodNumber = periodIndex + 1;
      const currentPeriod = `Period ${periodNumber}`;

      return this.schedule.filter(
        item => item.day_of_week === day && (
          item.period_name === currentPeriod ||
          Number(item.period_id) === periodNumber ||
          Number(item.period) === periodNumber ||
          Number(String(item.period_name || '').replace('Period ', '')) === periodNumber
        )
      );
    },
    isElectivePeriod(item, periodIndex) {
      const periodNumber = Number(item.period_id) || Number(item.period) || Number(String(item.period_name || '').replace('Period ', '')) || periodIndex + 1;
      return periodNumber >= 11;
    }
  }
};
</script>

<style scoped>
.schedule-page {
  min-height: calc(100vh - 126px);
  box-sizing: border-box;
  padding: 34px 20px 56px;
}

.schedule-panel {
  max-width: 1220px;
  margin: 0 auto;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--shadow);
  padding: 24px;
}

.page-header {
  display: flex;
  justify-content: center;
  margin-bottom: 20px;
  text-align: center;
}

.page-header p {
  width: fit-content;
  max-width: 100%;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  background: var(--surface-soft);
  color: var(--primary);
  font-size: 13px;
  font-weight: 800;
  line-height: 1;
  margin: 0 auto 12px;
  padding: 8px 14px;
}

h1 {
  color: var(--text);
  font-size: 32px;
  letter-spacing: 0;
  margin: 0;
}

.table-wrap {
  border: 1px solid var(--border);
  border-radius: 8px;
  overflow-x: auto;
}

.timetable {
  width: 100%;
  min-width: 980px;
  border-collapse: collapse;
  table-layout: fixed;
}

.timetable th,
.timetable td {
  border-bottom: 1px solid var(--border);
  border-left: 1px solid var(--border);
  height: 74px;
  padding: 10px;
  vertical-align: top;
}

.timetable th:first-child,
.timetable td:first-child {
  border-left: none;
}

.timetable tr:last-child th,
.timetable tr:last-child td {
  border-bottom: none;
}

.timetable thead th {
  background: var(--surface-soft);
  color: var(--text);
  font-weight: 800;
  text-align: center;
}

.period-col {
  width: 128px;
  background: #f8fbfc;
  color: var(--text-muted);
  font-weight: 800;
  line-height: 1.35;
  text-align: center;
}

.period-col small {
  display: block;
  color: #6b8391;
  font-size: 12px;
  font-weight: 700;
  line-height: 1.45;
  margin-top: 4px;
}

.cell-entry {
  display: grid;
  gap: 4px;
  justify-items: center;
  border: 1px solid #d8e8f5;
  border-radius: 6px;
  background: #eaf4ff;
  margin-bottom: 6px;
  padding: 10px 8px;
  text-align: center;
}

.cell-entry:last-child {
  margin-bottom: 0;
}

.cell-entry.elective {
  border-color: #f1d1d1;
  background: #fde7e7;
}

.cell-entry span,
.cell-entry small {
  color: var(--text);
  font-size: 13px;
  line-height: 1.3;
}

.cell-entry small strong {
  color: var(--text);
  font-size: 13px;
  font-weight: 900;
}

@media (max-width: 760px) {
  .schedule-panel {
    padding: 18px;
  }

  h1 {
    font-size: 28px;
  }
}
</style>
