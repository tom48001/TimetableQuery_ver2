<template>
  <div class="schedule-container">
    <h1>{{ tr('Room Timetable', '\u623f\u9593\u6642\u9593\u8868') }}</h1>
    <table class="timetable">
      <thead>
        <tr>
          <th>{{ tr('Period / Day', '\u8ab2\u7bc0 / \u661f\u671f') }}</th>
          <th v-for="day in days" :key="day">{{ dayLabel(day) }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(label, index) in periodLabels" :key="index">
          <th v-html="label"></th>
          <td v-for="day in days" :key="day">
            <div
              v-for="item in getCell(day, index + 1)"
              :key="`${item.teacher_name}-${item.period_name}-${item.class_name}`"
              class="cell-entry"
              :class="{ 'red-entry': isElectivePeriod(item) }"
            >
              <strong>{{ tr('Teacher', '\u8001\u5e2b') }}: {{ item.teacher_name }}</strong><br />
              {{ item.class_name }} | {{ subjectLabel(item) }}<br />
              {{ roomDisplayName }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>
  </div>
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
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    };
  },
  computed: {
    roomDisplayName() {
      return this.$route.query.roomName || this.tr('Room', '\u623f\u9593');
    },
    periodLabels() {
      return [
        this.periodLabel(1, PERIOD_TIMES[1]),
        this.periodLabel(2, PERIOD_TIMES[2]),
        this.periodLabel(3, PERIOD_TIMES[3]),
        this.periodLabel(4, PERIOD_TIMES[4]),
        this.periodLabel(5, PERIOD_TIMES[5]),
        this.periodLabel(6, PERIOD_TIMES[6]),
        this.periodLabel(7, PERIOD_TIMES[7]),
        this.periodLabel(8, PERIOD_TIMES[8]),
        this.periodLabel(9, PERIOD_TIMES[9], PERIOD_TIMES[11]),
        this.periodLabel(10, PERIOD_TIMES[10], PERIOD_TIMES[12])
      ];
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
    periodLabel(period, time, electiveTime) {
      const label = this.$lang.locale === 'en' ? 'Period ' + period : '\u7b2c' + period + '\u7bc0';
      const elective = electiveTime ? '<br><span class="red-time">' + this.tr('Elective', '\u9078\u4fee') + ' ' + electiveTime + '</span>' : '';
      return label + '<br><small>' + time + elective + '</small>';
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
    getCell(day, periodNumber) {
      const currentPeriod = `Period ${periodNumber}`;
      let result = this.schedule.filter(
        item => item.day_of_week === day && (
          item.period_name === currentPeriod ||
          Number(item.period_id) === periodNumber ||
          Number(item.period) === periodNumber ||
          Number(String(item.period_name || '').replace('Period ', '')) === periodNumber
        )
      );

      if (periodNumber === 9) {
        result = result.concat(this.schedule.filter(item => item.day_of_week === day && this.itemPeriodNumber(item) === 11));
      }

      if (periodNumber === 10) {
        result = result.concat(this.schedule.filter(item => item.day_of_week === day && this.itemPeriodNumber(item) === 12));
      }

      return result;
    },
    itemPeriodNumber(item) {
      return Number(item.period_id) || Number(item.period) || Number(String(item.period_name || '').replace('Period ', ''));
    },
    isElectivePeriod(item) {
      const periodNumber = this.itemPeriodNumber(item);
      return periodNumber >= 11;
    }
  }
};
</script>

<style scoped>
.schedule-container {
  padding: 20px;
  max-width: 1200px;
  margin: auto;
}

h1 {
  color: var(--text);
  margin: 0 0 22px;
  text-align: center;
}

.timetable {
  width: 100%;
  border-collapse: collapse;
  table-layout: fixed;
}

.timetable th,
.timetable td {
  border: 1px solid #cfdde3;
  padding: 8px;
  vertical-align: top;
  text-align: center;
}

.timetable th {
  background-color: #f3f8fa;
  font-weight: 800;
}

.cell-entry {
  background-color: #eef6ff;
  margin-bottom: 6px;
  padding: 7px 4px;
  border-radius: 4px;
  line-height: 1.35;
}

.cell-entry:last-child {
  margin-bottom: 0;
}

.red-entry {
  background-color: #ffeaea;
}

.red-time {
  color: var(--text);
  font-weight: 800;
}
</style>
