<template lang="">
  <div class="nomination-page">
    <div v-for="classItem in selectedClass" :key="classItem" class="class-section">
      <h3>{{ classTable[classItem - 1] }} 班</h3>

      <div v-if="studentsByClass[classItem]" class="student-grid">
        <label
          v-for="student in studentsByClass[classItem]"
          :key="student.student_id"
          :value="student.student_id"
          class="student-option"
        >
          <input
            type="checkbox"
            :value="student.student_id"
            v-model="selectedStudents[classItem]"
          />
          {{ student.student_name }}
        </label>
      </div>
      <div v-else>載入中...</div>
    </div>

    <button @click="submitNomination">送出提名</button>
  </div>
</template>
<script>
import axios from 'axios'
import { jwtDecode } from 'jwt-decode';

export default {
  data() {
    return {
      classTable: ['1M', '1A', '1R', '1Y', '2M', '2A', '2R', '2Y', '3M', '3A', '3R', '3Y', '4M', '4A', '4R', '4Y', '5M', '5A', '5R', '5Y', '6M', '6A', '6R', '6Y'],
      selectedClass: JSON.parse(this.$route.query.selectedClass || '[]'),
      studentsByClass: {},
      selectedStudents: {},
      previousSelectedStudents: {}
    }
  },
  created() {
    if (!this.selectedClass.length) {
      this.$router.push({ name: 'ConductAward' })
      return
    }
    console.log('已選擇班級:', this.selectedClass)
  },
  watch: {
    selectedClass: {
      immediate: true,
      handler(newClassList) {
        if (!Array.isArray(newClassList)) return

        const token = localStorage.getItem('token')
        if (!token) {
          console.error('未找到 token，請重新登入')
          return
        }

        for (const classid of newClassList) {
          console.log(`載入班級 ${classid} 的學生`)
          this.$set(this.selectedStudents, classid, [])
          axios.get(`http://localhost:3000/api/students/by-class/${classid}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then(res => {
              this.$set(this.studentsByClass, classid, res.data)
            })
            .catch(err => {
              console.error(`載入 ${classid} 的學生失敗:`, err)
              this.$set(this.studentsByClass, classid, [])
            })
        }
      }
    }
  },
  methods: {
    async getTeacherId() {
      const token = localStorage.getItem('token');
      if (!token) return;

      try {
        const decoded = jwtDecode(token);
        const userId = decoded.id;

        // 呼叫後端，用 user_id 換 teacher_id
        const res = await axios.get(`http://localhost:3000/api/teachers/from-user/${userId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.teacher_id = res.data.teacher_id;
        console.log('老師 ID:', this.teacher_id);
      } catch (error) {
        console.error('取得 teacher_id 失敗:', error);
      }
    },
    async loadSelectedStudents() {
      try {
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('未登入，缺少 token');
          return;
        }
        try {
          const decoded = jwtDecode(token);
          const userId = decoded.id;

          // 呼叫後端，用 user_id 換 teacher_id
          const res = await axios.get(`http://localhost:3000/api/teachers/from-user/${userId}`, {
            headers: { Authorization: `Bearer ${token}` }
          });

          this.teacher_id = res.data.teacher_id;
          console.log('老師 ID:', this.teacher_id);
        } catch (error) {
          console.error('取得 teacher_id 失敗:', error);
        }
        if (!this.teacher_id) {
          console.warn('teacher_id 尚未載入，跳過請求');
          return;
        }

        const teacherId = this.teacher_id;

        // 發送請求
        const res = await axios.get(
          `http://localhost:3000/api/conduct/students`,
          {
            params: {
              teacher_id: teacherId
            },
            headers: { Authorization: `Bearer ${token}` }
          }
        );

        // 後端返回的已選擇學生 id
        const selectedIds = res.data.map(stu => stu.student_id);
        console.log('後端已選擇學生 ID:', selectedIds);

        // 用 Vue.set / this.$set 或深拷貝方式更新，避免響應式問題
        const updatedSelected = { ...this.selectedStudents };
        for (const classId in this.studentsByClass) {
          const stuList = this.studentsByClass[classId] || [];
          updatedSelected[classId] = stuList
            .filter(stu => selectedIds.includes(stu.student_id))
            .map(stu => stu.student_id);
        }
        this.selectedStudents = updatedSelected;
        this.previousSelectedStudents = JSON.parse(JSON.stringify(updatedSelected));
        console.log('更新後的 selectedStudents:', this.selectedStudents);
      } catch (err) {
        console.error('取得已選擇學生失敗:', err);
      }
    },
    submitNomination() {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('未登入');
        return;
      }
      const teacherId = this.teacher_id
      const selectedStudentIds = Object.values(this.selectedStudents).flat()

      axios.post('http://localhost:3000/api/conduct/insert', {
        teacher_id: teacherId,
        student_ids: selectedStudentIds
      }, {
        headers: { Authorization: `Bearer ${token}` }
      }).then(res => {
        console.log('投票成功', res.data);

        // 投票成功後再刪除
        for (const classId in this.previousSelectedStudents) {
          const removed = this.previousSelectedStudents[classId].filter(
            id => !this.selectedStudents[classId].includes(id)
          );
          if (removed.length > 0) {
            axios.delete(`http://localhost:3000/api/conduct/delete`, {
              data: {
                teacherId: teacherId,
                removed: Array.isArray(removed) ? removed : [removed]
              },
              headers: { Authorization: `Bearer ${token}` }
            }).then(() => {
              console.log('刪除成功:', removed);
            }).catch(err => {
              console.error('刪除失敗:', err);
            });
          }
        }
        this.$router.push({ name: 'ConductAward' });
      }).catch(err => {
        console.error('投票失敗', err);
        this.$router.push({ name: 'ConductAward' });
      });
    }
  },
  async mounted() {
    await this.getTeacherId();
    await this.loadSelectedStudents();
  }
}
</script>
<style scoped>
.class-section {
  margin-bottom: 20px;
}

.student-checkbox {
  display: block;
  margin-left: 10px;
}

.student-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  justify-content: center;
  margin: 20px 0;
}

.student-option {
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

.student-option:hover {
  background-color: #eaf3ff;
  border-color: #7ab8f5;
}

.student-option::selection {
  background-color: #007bff;
  color: white;
  border-color: #0056b3;
}

.student-option input[type="checkbox"] {
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
