<template>
  <div class="electives-container">
    <h1>{{ tr('Elective Timetable', '選修科時間表') }}</h1>
    <table class=electives-Result>
      <thead>
        <tr>
          <th>{{ tr('Class', '班別') }}</th>
          <th>{{ tr('No.', '編號') }}</th>
          <th>{{ tr('Name', '姓名') }}</th>
          <th>{{ tr('Mon', '星期一') }}</th>
          <th>{{ tr('Tue', '星期二') }}</th>
          <th>{{ tr('Wed', '星期三') }}</th>
          <th>{{ tr('Thu', '星期四') }}</th>
          <th>{{ tr('Fri', '星期五') }}</th>
        </tr>
      </thead>
      <tbody>
        <tr v-for="(data, index) in stuedntElectives" :key="data.student_id">
          <td>{{ index + 1 }}</td>
          <td>{{ data.class_name }}</td>
          <td>{{ data.student_id }}</td>
          <td>{{ data.class_name }}{{ data.student_id }}</td>
          <td>{{ data.student_ch_name }}</td>
          <td>{{ data.student_eng_name }}</td>
          <td>{{ data.sex }}</td>
          <td>{{ subjectLabel({ subject_id: $route.query.subject, subject_name: electineName }) }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';
import { subjectLabel as formatSubjectLabel } from '../../utils/timetableLabels';
export default {
  data() {
    return {
      stuedntElectives: [],
      electineName: ''
    };
  },
  methods: {
    tr(en, zh) {
      return this.$lang.locale === 'en' ? en : zh;
    },
    subjectLabel(subject) {
      return formatSubjectLabel(subject, this.$lang.locale);
    },
    async fetchElectives() {
      const token = localStorage.getItem('token');
      const form = this.$route.query.form;
      const subject = this.$route.query.subject;

      const res = await axios.post('http://localhost:3000/api/subjects/list', {
        form: form,
        subject: subject
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('?豯止齒??:', res.data);
      this.stuedntElectives = await res.data;
    },
    async getElectives() {
      const token = localStorage.getItem('token');
      const subject = this.$route.query.subject;

      const res = await axios.post('http://localhost:3000/api/subjects/electiveName', {
        subject: subject
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });
      console.log('?豯止齒??:', res.data.subject_name);
      this.electineName = await res.data.subject_name;
    }
  },
  mounted() {
    this.fetchElectives();
    this.getElectives();
  }
}
</script>

<style scoped>
h1 {
  text-align: center;
  margin-top: 50px;
}

.electives-container {
  padding: 20px;
  max-width: 1200px;
  margin: auto;
}

.electives-Result {
  width: 100%;
  border-collapse: collapse;
}

.electives-Result th,
.electives-Result td {
  border: 1px solid #ccc;
  padding: 8px;
  vertical-align: top;
  text-align: center;
}

.electives-Result th {
  background-color: #f0f0f0;
}
</style>
