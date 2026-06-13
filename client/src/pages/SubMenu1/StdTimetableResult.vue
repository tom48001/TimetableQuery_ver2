<template>
  <div class="schedule-container">
    <h1>{{ tr('Student Timetable', '\u5b78\u751f\u4e0a\u8ab2\u6642\u9593\u8868') }}</h1>
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
              :key="cellKey(item)"
              class="cell-entry"
              :class="{ 'red-entry': periodName(item) === 'Period 11' || periodName(item) === 'Period 12' }"
            >
              <strong>{{ tr('Teacher', '\u8001\u5e2b') }}: {{ item.teacher_name }}</strong><br />
              {{ item.class_name }} | {{ subjectLabel(item) }}<br />
              {{ roomLabel(item.room_name) }}
            </div>
          </td>
        </tr>
      </tbody>
    </table>

    <p v-if="loaded && schedule.length === 0" class="empty-message">
      {{ tr('No timetable data.', '\u6c92\u6709\u8ab2\u8868\u8cc7\u6599\u3002') }}
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
        Mon: this.tr('Mon', '\u661f\u671f\u4e00'),
        Tue: this.tr('Tue', '\u661f\u671f\u4e8c'),
        Wed: this.tr('Wed', '\u661f\u671f\u4e09'),
        Thu: this.tr('Thu', '\u661f\u671f\u56db'),
        Fri: this.tr('Fri', '\u661f\u671f\u4e94')
      };
      return labels[day] || day;
    },
    periodLabel(period, time, electiveTime) {
      const label = this.$lang.locale === 'en' ? 'Period ' + period : '\u7b2c' + period + '\u7bc0';
      const elective = electiveTime ? '<br><span class="red-time">' + this.tr('Elective', '\u9078\u4fee') + ' ' + electiveTime + '</span>' : '';
      return label + '<br><small>' + time + elective + '</small>';
    },
    periodName(item) {
      return item.period_name || item.period || '';
    },
    cellKey(item) {
      return [item.teacher_id || item.teacher_name, this.periodName(item), item.class_name, item.subject_name || item.subject].join('-');
    },
    async fetchSchedule() {
      try {
        const token = localStorage.getItem('token');
        const studentId = this.$route.query.studentId;
        const res = await axios.get(`/api/students/${studentId}/timetable`, { headers: { Authorization: `Bearer ${token}` } });
        this.schedule = res.data;
      } catch (err) {
        alert(this.tr('Failed to load timetable.', '\u8f09\u5165\u8ab2\u8868\u5931\u6557\u3002'));
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

.empty-message {
  color: var(--text-muted);
  margin: 18px 0 0;
  padding: 28px;
  text-align: center;
}
</style>
