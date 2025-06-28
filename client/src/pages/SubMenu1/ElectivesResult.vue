<template>
  <div class="electives-container">
    <h1>高中選修名單</h1>
    <table class=electives-Result>
      <thead>
        <tr>
          <th>序號</th>
          <th>班別</th>
          <th>學號</th>
          <th>編號</th>
          <th>姓名</th>
          <th>英名姓名</th>
          <th>性別</th>
          <th>科目</th>
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
          <td>{{ electineName }}</td>
        </tr>
      </tbody>
    </table>
  </div>
</template>

<script>
import axios from 'axios';
export default {
  data() {
    return {
      stuedntElectives: [],
      electineName: ''
    };
  },
  methods: {
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
      console.log('回傳資料:', res.data);
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
      console.log('回傳資料:', res.data.subject_name);
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
