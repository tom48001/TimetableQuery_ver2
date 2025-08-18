<template lang="">
  <div>
    <h1>操行獎提名統計結果</h1>
    <div class="electives-container">
      <table class=electives-Result>
        <thead>
          <tr>
            <th>姓名</th>
            <th>提名老師</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="n in nominationResults" :key="n.nomination_id">
            <td>{{ n.student_ch_name || n.student_id }}</td>
            <td>{{ n.teacher_names }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      nominationResults: [],
      searched: false,
      teacher_id: null
    };
  },
  methods: {
    async fetchconduct() {
      const token = localStorage.getItem('token');
      try {
        const res = await axios.get('http://localhost:3000/api/conduct/results', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.nominationResults = res.data;
        this.searched = true;
      } catch (err) {
        console.error('查詢提名結果失敗', err);
        this.nominationResults = [];
        this.searched = true;
      }
    }
  },
  async mounted() {
    await this.fetchconduct();
  }
}
</script>
<style scoped>
h1{
  text-align: center;
  margin-top: 50px;
}

h3{
  text-align: center;
}

.text-center {
  text-align: center;
  margin: 15px 0;
}

.subject-container {
  padding: 20px;
  max-width: 1200px;
  text-align: center;
  margin: auto;
}

select {
  margin: 10px;
  padding: 6px;
}

.subject-grid {
  margin: 10px 0;
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

button {
  display: block;
  margin: 30px auto;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  font-size: 16px;
  border-radius: 6px;
  border: none;
  cursor: pointer;
  transition: background-color 0.3s ease;
}

button:hover {
  background-color: #0056b3;
}
</style>
