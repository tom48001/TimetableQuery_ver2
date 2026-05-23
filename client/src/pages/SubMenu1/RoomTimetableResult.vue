<template>
  <main class="schedule-page">
    <section class="schedule-panel">
      <header class="page-header">
        <div>
          <p>Room Timetable</p>
          <h1>各房間上課時間表</h1>
        </div>
      </header>

      <div class="table-wrap">
        <table class="timetable">
          <thead>
            <tr>
              <th class="period-col">課節</th>
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
                >
                  <span class="class-pill">{{ item.class_name }}</span>
                  <strong>{{ item.subject_name }}</strong>
                  <small>{{ item.teacher_name }}</small>
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

const DAY_LABELS = {
  Mon: '\u661f\u671f\u4e00',
  Tue: '\u661f\u671f\u4e8c',
  Wed: '\u661f\u671f\u4e09',
  Thu: '\u661f\u671f\u56db',
  Fri: '\u661f\u671f\u4e94',
  Sat: '\u661f\u671f\u516d'
};

export default {
  data() {
    return {
      schedule: [],
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      periodLabels: [
        '\u7b2c1\u7bc0<br><small>08:30-09:05</small>',
        '\u7b2c2\u7bc0<br><small>09:05-09:40</small>',
        '\u7b2c3\u7bc0<br><small>09:55-10:30</small>',
        '\u7b2c4\u7bc0<br><small>10:30-11:05</small>',
        '\u7b2c5\u7bc0<br><small>11:20-11:55</small>',
        '\u7b2c6\u7bc0<br><small>11:55-12:30</small>',
        '\u7b2c7\u7bc0<br><small>13:30-14:05</small>',
        '\u7b2c8\u7bc0<br><small>14:05-14:40</small>',
        '\u7b2c9\u7bc0<br><small>14:40-15:15</small>',
        '\u7b2c10\u7bc0<br><small>15:25-16:00</small>'
      ]
    };
  },
  mounted() {
    this.fetchSchedule();
  },
  methods: {
    dayLabel(day) {
      return DAY_LABELS[day] || day;
    },
    async fetchSchedule() {
      try {
        const token = localStorage.getItem('token');
        const roomId = this.$route.query.roomId;
        const res = await axios.get(`http://localhost:3000/api/rooms/schedule/${roomId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.schedule = res.data;
      } catch (err) {
        alert('\u8f09\u5165\u623f\u9593\u6642\u9593\u8868\u5931\u6557\u3002');
      }
    },
    getCell(day, periodIndex) {
      const periodNumber = periodIndex + 1;
      const currentPeriod = `Period ${periodNumber}`;

      return this.schedule.filter(
        item => item.day_of_week === day && item.period_name === currentPeriod
      );
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
  margin-bottom: 20px;
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
  padding: 8px;
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
  width: 96px;
  background: #f8fbfc;
  color: var(--text-muted);
  font-weight: 800;
  line-height: 1.35;
  text-align: center;
}

.period-col small {
  color: #6b8391;
  font-size: 11px;
  font-weight: 600;
}

.cell-entry {
  display: grid;
  gap: 4px;
  border: 1px solid #d9e7eb;
  border-radius: 6px;
  background: #fbfdfd;
  margin-bottom: 6px;
  padding: 7px;
  text-align: left;
}

.cell-entry:last-child {
  margin-bottom: 0;
}

.class-pill {
  justify-self: start;
  border-radius: 999px;
  background: #e7f4f6;
  color: #0a5260;
  font-size: 12px;
  font-weight: 800;
  line-height: 1;
  padding: 5px 8px;
}

.cell-entry strong {
  color: var(--text);
  font-size: 13px;
  line-height: 1.2;
}

.cell-entry small {
  color: var(--text-muted);
  font-size: 12px;
  line-height: 1.2;
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
