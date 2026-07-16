<template>
  <div class="schedule-container">
    <h1>{{ tr('Class Observation Timetable', '可觀課課表') }}</h1>
    <table class="timetable">
      <thead>
        <tr>
          <th>{{ tr('Period / Day', '課節 / 星期') }}</th>
          <th v-for="day in days" :key="day">{{ dayLabel(day) }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(label, index) in periodLabels" :key="index" :class="periodRowClass(index + 1)">
          <th v-html="label"></th>
          <td v-for="day in days" :key="day">
            <div
              v-for="item in getCell(day, index + 1)"
              :key="cellKey(item)"
              class="cell-entry"
              :class="{ 'red-entry': periodName(item) === 'Period 11' || periodName(item) === 'Period 12' }"
            >
              <span class="teacher-line">{{ tr('Teacher', '老師') }}: {{ item.teacher_name }}</span>
              <strong class="lesson-line">{{ item.class_name }} | {{ subjectLabel(item) }}</strong>
              <span class="room-line">{{ roomLabel(item.room_name) }}</span>
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="loaded && schedule.length === 0" class="empty-message">
      {{ tr('No timetable data.', '沒有課表資料。') }}
    </p>
  </div>
</template>

<script>
import axios from 'axios';
import { subjectLabel as formatSubjectLabel, roomLabel as formatRoomLabel } from '../../utils/timetableLabels';

export default {
  data() {
    return {
      loaded: false,
      schedule: [],
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    };
  },
  computed: {
    periodLabels() {
      return [
        this.periodLabel(1, '08:30-09:05'),
        this.periodLabel(2, '09:05-09:40'),
        this.periodLabel(3, '09:55-10:30'),
        this.periodLabel(4, '10:30-11:05'),
        this.periodLabel(5, '11:20-11:55'),
        this.periodLabel(6, '11:55-12:30'),
        this.periodLabel(7, '13:30-14:05'),
        this.periodLabel(8, '14:05-14:40'),
        this.periodLabel(9, '14:40-15:15', '14:50-15:25'),
        this.periodLabel(10, '15:25-16:00', '15:25-16:00')
      ];
    }
  },
  methods: {
    tr(en, zh) {
      return this.$lang.locale === 'en' ? en : zh;
    },
    subjectLabel(item) {
      return formatSubjectLabel(item, this.$lang.locale);
    },
    roomLabel(roomName) {
      return formatRoomLabel(roomName, this.$lang.locale);
    },
    dayLabel(day) {
      const labels = {
        Mon: this.tr('Mon', '星期一'),
        Tue: this.tr('Tue', '星期二'),
        Wed: this.tr('Wed', '星期三'),
        Thu: this.tr('Thu', '星期四'),
        Fri: this.tr('Fri', '星期五'),
        Sat: this.tr('Sat', '星期六')
      };
      return labels[day] || day;
    },
    periodLabel(period, time, electiveTime) {
      const label = this.$lang.locale === 'en' ? 'Period ' + period : '\u7b2c' + period + '\u7bc0';
      const elective = electiveTime ? '<br><span class="red-time">' + this.tr('Elective', '選修') + ' ' + electiveTime + '</span>' : '';
      return label + '<br><small>' + time + elective + '</small>';
    },
    periodName(item) {
      return item.period_name || item.period || '';
    },
    periodRowClass(periodNumber) {
      return [3, 4, 7, 8, 11, 12].includes(periodNumber) ? 'period-row-blue' : 'period-row-purple';
    },
    cellKey(item) {
      return [item.teacher_id || item.teacher_name, this.periodName(item), item.class_name, item.subject_id || item.subject_name].join('-');
    },
    async fetchSchedule() {
      try {
        const token = localStorage.getItem('token');
        const observers = this.$route.query.observers;
        const target = this.$route.query.target;
        const observerIds = Array.isArray(observers) ? observers : String(observers || '').split(',').filter(Boolean);
        const res = await axios.post('/api/observation/observe/schedule', { observerIds, targetId: target }, { headers: { Authorization: `Bearer ${token}` } });
        this.schedule = res.data;
      } catch (err) {
        alert(this.tr('Failed to load timetable.', '載入課表失敗。'));
        console.error(err);
      } finally {
        this.loaded = true;
      }
    },
    getCell(day, periodIndex) {
      const currentPeriod = 'Period ' + periodIndex;
      let result = this.schedule.filter(item => {
        const itemDay = item.day || item.day_of_week;
        return itemDay === day && this.periodName(item) === currentPeriod;
      });

      if (periodIndex === 9) {
        result = result.concat(this.schedule.filter(item => (item.day || item.day_of_week) === day && this.periodName(item) === 'Period 11'));
      }

      if (periodIndex === 10) {
        result = result.concat(this.schedule.filter(item => (item.day || item.day_of_week) === day && this.periodName(item) === 'Period 12'));
      }

      return result;
    }
  },
  mounted() {
    this.fetchSchedule();
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

.timetable tbody tr.period-row-purple th,
.timetable tbody tr.period-row-purple td {
  background-color: #eef4ff;
  color: var(--text);
}

.timetable tbody tr.period-row-purple .teacher-line,
.timetable tbody tr.period-row-purple .room-line {
  color: #64748b;
}

.timetable tbody tr.period-row-purple .cell-entry + .cell-entry {
  border-top-color: #64748b;
}

.timetable tbody tr.period-row-purple .red-entry {
  background-color: #eef4ff;
}

.timetable tbody tr.period-row-blue th,
.timetable tbody tr.period-row-blue td {
  background-color: #ffffff;
}

.cell-entry {
  background-color: transparent;
  padding: 8px 4px;
  line-height: 1.35;
}

.cell-entry + .cell-entry {
  border-top: 1px dashed #64748b;
}

.teacher-line,
.lesson-line,
.room-line {
  display: block;
}

.teacher-line,
.room-line {
  color: #64748b;
}

.red-entry {
  background-color: #ffeaea;
}

.empty-message {
  color: var(--text-muted);
  margin: 18px 0 0;
  padding: 28px;
  text-align: center;
}
</style>
