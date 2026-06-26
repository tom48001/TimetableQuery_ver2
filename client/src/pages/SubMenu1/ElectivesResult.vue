<template>
  <div class="electives-container">
    <h1>{{ tr('Elective Timetable', '選修科時間表') }}</h1>

    <div class="summary-card">
      <span>{{ tr('Form', '級別') }}: {{ selectedForm }}</span>
      <span>{{ tr('Subject', '科目') }}: {{ subjectLabel(electiveSubject) }}</span>
      <span>{{ tr('Students', '學生') }}: {{ groupedStudents.length }}</span>
    </div>

    <div class="table-wrap">
      <table class="electives-result">
        <thead>
          <tr>
            <th>{{ tr('Class', '班別') }}</th>
            <th>{{ tr('No.', '編號') }}</th>
            <th>{{ tr('Name', '姓名') }}</th>
            <th v-for="day in days" :key="day">{{ dayLabel(day) }}</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="student in groupedStudents" :key="student.student_id">
            <td>{{ student.class_name }}</td>
            <td>{{ student.class_number }}</td>
            <td class="name-cell">
              {{ studentName(student) }}
              <small v-if="$lang.locale !== 'en' && student.student_eng_name">{{ student.student_eng_name }}</small>
            </td>
            <td v-for="day in days" :key="`${student.student_id}-${day}`">
              <div v-if="student.schedule[day] && student.schedule[day].length">
                <div v-for="lesson in student.schedule[day]" :key="lesson.key" class="lesson-chip">
                  <strong>{{ periodLabel(lesson.period_name) }}</strong>
                  <span>{{ lesson.teacher_name || '-' }}</span>
                  <span>{{ roomLabel(lesson.room_name) }}</span>
                  <small v-if="lesson.timetable_class_name && lesson.timetable_class_name !== student.class_name">
                    {{ lesson.timetable_class_name }}
                  </small>
                </div>
              </div>
              <span v-else class="empty-cell">—</span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <p v-if="loaded && groupedStudents.length === 0" class="empty-message">
      {{ tr('No students selected this elective, or X1/X2/X3 has not been imported yet.', '未有學生修讀此選修科，或 X1/X2/X3 尚未成功匯入。') }}
    </p>

    <p v-else-if="loaded && !hasAnyLesson" class="empty-message">
      {{ tr('Students were found, but no matching timetable lessons were found for this elective.', '已找到修讀此科的學生，但未找到對應的選修科時間表課堂。') }}
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
      studentElectives: [],
      electiveSubject: {},
      days: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri']
    };
  },
  computed: {
    selectedForm() {
      return this.$route.query.form || '';
    },
    groupedStudents() {
      const students = new Map();

      this.studentElectives.forEach(row => {
        if (!students.has(row.student_id)) {
          students.set(row.student_id, {
            student_id: row.student_id,
            class_name: row.class_name,
            class_number: row.class_number,
            student_ch_name: row.student_ch_name,
            student_eng_name: row.student_eng_name,
            sex: row.sex,
            schedule: {
              Mon: [],
              Tue: [],
              Wed: [],
              Thu: [],
              Fri: []
            }
          });
        }

        if (row.timetable_id && row.day_of_week) {
          const student = students.get(row.student_id);
          const day = student.schedule[row.day_of_week] ? row.day_of_week : null;
          if (day) {
            student.schedule[day].push({
              key: `${row.timetable_id}-${row.period_id || row.period_name}`,
              period_name: row.period_name,
              period_id: row.period_id,
              teacher_name: row.teacher_name,
              room_name: row.room_name,
              timetable_class_name: row.timetable_class_name
            });
          }
        }
      });

      return Array.from(students.values()).map(student => {
        this.days.forEach(day => {
          student.schedule[day].sort((a, b) => Number(a.period_id || 0) - Number(b.period_id || 0));
        });
        return student;
      });
    },
    hasAnyLesson() {
      return this.groupedStudents.some(student => (
        this.days.some(day => student.schedule[day] && student.schedule[day].length)
      ));
    }
  },
  methods: {
    tr(en, zh) {
      return this.$lang.locale === 'en' ? en : zh;
    },
    authHeaders() {
      return { Authorization: `Bearer ${localStorage.getItem('token')}` };
    },
    subjectLabel(subject) {
      return formatSubjectLabel(subject, this.$lang.locale);
    },
    roomLabel(roomName) {
      return formatRoomLabel(roomName, this.$lang.locale);
    },
    studentName(student) {
      if (this.$lang.locale === 'en') {
        return student.student_eng_name || student.student_ch_name || '';
      }
      return student.student_ch_name || student.student_eng_name || '';
    },
    dayLabel(day) {
      const labels = {
        Mon: this.tr('Mon', '星期一'),
        Tue: this.tr('Tue', '星期二'),
        Wed: this.tr('Wed', '星期三'),
        Thu: this.tr('Thu', '星期四'),
        Fri: this.tr('Fri', '星期五')
      };
      return labels[day] || day;
    },
    periodLabel(periodName) {
      if (!periodName) return '-';
      const number = String(periodName).replace(/[^0-9]/g, '');
      if (!number) return periodName;
      return this.$lang.locale === 'en' ? `P${number}` : `第${number}節`;
    },
    async fetchElectives() {
      const res = await axios.post('/api/subjects/list', {
        form: this.$route.query.form,
        subject: this.$route.query.subject
      }, {
        headers: this.authHeaders()
      });
      this.studentElectives = res.data;
    },
    async getElectives() {
      const res = await axios.post('/api/subjects/electiveName', {
        subject: this.$route.query.subject
      }, {
        headers: this.authHeaders()
      });
      this.electiveSubject = res.data || {};
    },
    async loadData() {
      try {
        await Promise.all([this.fetchElectives(), this.getElectives()]);
      } catch (err) {
        alert(this.tr('Failed to load elective timetable.', '載入選修科時間表失敗。'));
        console.error(err);
      } finally {
        this.loaded = true;
      }
    }
  },
  mounted() {
    this.loadData();
  }
};
</script>

<style scoped>
.electives-container {
  box-sizing: border-box;
  margin: auto;
  max-width: 1220px;
  padding: 32px 20px;
}

h1 {
  color: var(--text);
  margin: 0 0 22px;
  text-align: center;
}

.summary-card {
  align-items: center;
  background: rgba(255, 255, 255, 0.95);
  border: 1px solid #d1e0e5;
  border-radius: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px 18px;
  font-weight: 800;
  margin-bottom: 14px;
  padding: 12px 14px;
}

.table-wrap {
  overflow-x: auto;
}

.electives-result {
  border-collapse: collapse;
  min-width: 980px;
  width: 100%;
}

.electives-result th,
.electives-result td {
  border: 1px solid #cfdde3;
  padding: 8px;
  text-align: center;
  vertical-align: top;
}

.electives-result th {
  background-color: #f3f8fa;
  color: var(--text);
  font-weight: 800;
}

.name-cell {
  font-weight: 800;
  min-width: 150px;
  text-align: left;
}

.name-cell small {
  color: var(--text-muted);
  display: block;
  font-size: 12px;
  font-weight: 700;
  margin-top: 3px;
}

.lesson-chip {
  background: #e7f5f7;
  border: 1px solid #b8dce2;
  border-radius: 8px;
  color: #06283a;
  display: grid;
  gap: 3px;
  line-height: 1.25;
  margin-bottom: 6px;
  padding: 7px 6px;
}

.lesson-chip:last-child {
  margin-bottom: 0;
}

.lesson-chip span,
.lesson-chip small {
  font-size: 12px;
  font-weight: 700;
}

.lesson-chip small {
  color: #526b7a;
}

.empty-cell {
  color: #9aaab3;
}

.empty-message {
  background: #fff8e7;
  border: 1px solid #f1d89a;
  border-radius: 8px;
  color: #72510b;
  font-weight: 800;
  margin: 16px 0 0;
  padding: 18px;
  text-align: center;
}
</style>
