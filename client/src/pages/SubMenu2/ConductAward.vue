<template lang="">
  <div>
    <h1>操行獎提名</h1>
    <h1>選擇班別</h1>
    <div class="class-grid">
      <label
        v-for="cls in classList"
        :key="cls.class_id"
        class="class-option"
        :class="{ selected: selectedClass.includes(cls) }"
      >
        <input type="checkbox" :value="cls.class_id" v-model="selectedClass" />
        {{ cls.class_name }}
      </label>
    </div>
    <div class="button-container">
      <button @click="goNext">下一步</button>
    </div>
  </div>
</template>
<script>
import axios from 'axios';

export default {
  data() {
    return {
      classList: [],
      selectedClass: []
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
    goNext() {
      if (this.selectedClass.length === 0) {
        alert('請選擇年級');
        return;
      }
      this.selectedClass.sort((a, b) => a - b);
      this.$router.push({
        name: 'ConductAwardVote',
        query: {
          selectedClass: JSON.stringify(this.selectedClass)
        }
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
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 1rem;
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
