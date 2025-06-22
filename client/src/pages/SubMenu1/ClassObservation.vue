<template>
  <div>
    <h1>觀課時間表</h1>
    <div>
      <h3>選擇觀課老師：<br>(可選一人或多人)</h3>
      <div class="teacher-grid-observers">
        <label v-for="teacher in teachers" :key="teacher.teacher_id" class="teacher-option-observers"
          :class="{ selected: observerIds.includes(teacher.teacher_id) }">
          <input type="checkbox" :value="teacher.teacher_id" v-model="observerIds" />
          {{ teacher.teacher_name }}
        </label>
      </div>
    </div>

    <!-- 被觀課老師選擇 -->
    <div>
      <h3>選擇被觀課老師：<br>(只可選一人)</h3>
      <div class="teacher-grid">
        <label v-for="teacher in teachers" :key="teacher.teacher_id"
          :class="['teacher-option', observerIds === teacher.teacher_id ? 'selected' : '']">
          <input type="radio" name="teacher" :value="teacher.teacher_id" v-model="targetId" />
          {{ teacher.teacher_name }}
        </label>
      </div>
    </div>

    <!-- 查詢按鈕 -->
    <div class="text-center">
      <button @click="searchSchedule">
        查詢觀課時段
      </button>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      teachers: [],
      observerIds: [],
      targetId: ''
    };
  },
  methods: {
    async fetchTeachers() {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/teachers/list', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.teachers = res.data;
    },
    searchSchedule() {
      this.$router.push({
        name: 'ClassObservationResult',
        query: {
          observers: this.observerIds.join(','),
          target: this.targetId
        }
      });
    }
  },
  mounted() {
    this.fetchTeachers();
  }
};
</script>

<style scoped>
h1 {
  font-size: 24px;
  color: #2c3e50;
  margin-bottom: 1rem;
  text-align: center;
}

h3 {
  font-size: 20px;
  color: #34495e;
  margin-bottom: 0.5rem;
  text-align: center;
}

.teacher-grid-observers,
.teacher-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin: 20px 0;
}

.teacher-option-observers,
.teacher-option {
  display: flex;
  align-items: center;
  padding: 10px 16px;
  border-radius: 8px;
  border: 2px solid #dcdcdc;
  background-color: #f9f9f9;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  min-width: 180px;
  box-shadow: 1px 1px 5px rgba(0, 0, 0, 0.05);
}

.teacher-option-observers:hover,
.teacher-option:hover {
  background-color: #eaf3ff;
  border-color: #7ab8f5;
}

.teacher-option-observers.selected,
.teacher-option.selected {
  background-color: #007bff;
  color: white;
  border-color: #0056b3;
}

.teacher-option-observers input[type="checkbox"],
.teacher-option input[type="radio"] {
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

@media (max-width: 600px) {
  .teacher-option {
    flex: 1 1 100%;
    justify-content: center;
  }
}
</style>
