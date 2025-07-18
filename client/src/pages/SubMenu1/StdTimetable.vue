<template lang="">
  <div>
    <h1>查閱學生上課時間表</h1>
    <h3>選擇年級：</h3>
    <div class="class-grid">
      <label v-for="cls in classList" :key="cls" class="class-option">
        <input type="radio" :value="cls" v-model="selectedClass" />
        {{ cls.class_name }}
      </label>
    </div>
    <div class="text-center">
      <button @click="searchStudents">
        查詢學生
      </button>
    </div>
  </div>
</template>
<script>
import axios from 'axios';

export default {
  data() {
    return {
      // classList: ['1M', '1A', '1R', '1Y', '2M', '2A', '2R', '2Y', '3M', '3A', '3R', '3Y', '4M', '4A', '4R', '4Y', '5M', '5A', '5R', '5Y', '6M', '6A', '6R', '6Y'],
      classList: [],
      selectedClass: ''
    };
  },
  methods: {
    async fetchClasses() {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.classList = res.data;
    },
    searchStudents() {
      if (!this.selectedClass) {
        alert('請選擇一個班級');
        return;
      }
      this.$router.push({
        name: 'StudentSelector',
        query: { selectedClass: this.selectedClass }
      });
    }
  },
  mounted() {
    this.fetchClasses();
  }
}
</script>
<style scoped>
h1 {
  text-align: center;
  margin-top: 50px;
}

h3 {
  font-size: 20px;
  color: #34495e;
  margin-bottom: 0.5rem;
  text-align: center;
}

.class-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 16px;
  max-width: 800px;
  margin: 40px auto;
  padding: 0 16px;
}

.class-option {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  border: 2px solid #dcdcdc;
  border-radius: 8px;
  background-color: #f9f9f9;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  box-shadow: 1px 1px 6px rgba(0, 0, 0, 0.05);
}

.class-option:hover {
  background-color: #eaf3ff;
  border-color: #7ab8f5;
}

.class-option.selected {
  background-color: #007bff;
  color: white;
  border-color: #0056b3;
}

.class-option input[type="radio"] {
  margin-right: 8px;
  accent-color: #007bff;
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
