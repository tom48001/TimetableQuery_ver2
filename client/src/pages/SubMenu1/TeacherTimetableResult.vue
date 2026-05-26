<template>
  <main class="schedule-page">
    <section class="schedule-panel">
      <header class="page-header">
        <div>
          <p>Teacher Timetable</p>
          <h1>老師課表</h1>
        </div>
        <span class="count-badge">{{ schedule.length }} lessons</span>
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
                  v-for="item in getCell(day, index + 1)"
                  :key="`${item.teacher_id}-${item.period_name}-${item.class_name}`"
                  class="cell-entry"
                >
                  <span class="teacher-pill">{{ item.teacher_name }}</span>
                  <strong>{{ item.class_name }} {{ item.subject_name }}</strong>
                  <small>{{ item.room_name }}</small>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <p v-if="loaded && schedule.length === 0" class="empty-message">
        這些老師暫時沒有課表資料。請確認已成功匯入 timetable。
      </p>
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
  Fri: '\u661f\u671f\u4e94'
};

export default {
  data() {
    return {
      loaded: false,
      schedule: [],
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'],
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
  methods: {
    dayLabel(day) {
      return DAY_LABELS[day] || day;
    },
    normalizeTeacherIds(value) {
      const ids = Array.isArray(value) ? value : [value];
      return ids
        .flatMap(item => String(item || '').split(','))
        .map(item => item.trim())
        .filter(Boolean);
    },
    async fetchSchedule() {
      try {
        const token = localStorage.getItem('token');
        const ids = this.normalizeTeacherIds(this.$route.query.teacherId);

        const res = await axios.post('http://localhost:3000/api/teachers/schedule', {
          teacherIds: ids
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.schedule = res.data;
      } catch (err) {
        alert('\u8f09\u5165\u8ab2\u8868\u5931\u6557\u3002');
        console.error(err);
      } finally {
        this.loaded = true;
      }
    },
    getCell(day, periodIndex) {
      const currentPeriod = `Period ${periodIndex}`;
      return this.schedule.filter(
        item => item.day === day && item.period_name === currentPeriod
      );
    }
  },
  mounted() {
    this.fetchSchedule();
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
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
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

.count-badge {
  border: 1px solid var(--border-strong);
  border-radius: 999px;
  background: var(--surface-soft);
  color: var(--text-muted);
  font-weight: 800;
  padding: 9px 14px;
  white-space: nowrap;
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

.teacher-pill {
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

.empty-message {
  border: 1px dashed var(--border-strong);
  border-radius: 8px;
  color: var(--text-muted);
  margin: 18px 0 0;
  padding: 28px;
  text-align: center;
}
</style>
