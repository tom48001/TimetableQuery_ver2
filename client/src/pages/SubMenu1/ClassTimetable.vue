<template>
  <div class="container">
    <h1>各班上課時間表</h1>
    <label for="classSelect">選擇班別：</label>
    <select v-model="selectedClass">
      <option disabled value="">請選擇</option>
      <option v-for="cls in classList" :key="cls.class_id" :value="cls.class_id">
        {{ cls.class_name }}
      </option>
    </select>
    <button @click="goToResult" :disabled="!selectedClass">查詢</button>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      classList: [],
      selectedClass: ''
    };
  },
  mounted() {
    this.loadClassList();
  },
  methods: {
    async loadClassList() {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.classList = res.data;
    },
    goToResult() {
      this.$router.push({
        name: 'ClassTimetableResult',
        query: { classId: this.selectedClass }
      });
    }
  }
};
</script>

<style scoped>
.container {
  text-align: center;
  margin: 30px auto;
  max-width: 500px;
}
select {
  margin: 10px;
  padding: 6px;
}
button {
  padding: 8px 16px;
  font-size: 16px;
}
</style>
