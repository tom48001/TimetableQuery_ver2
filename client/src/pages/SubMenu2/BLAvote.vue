<template>
  <div class="nomination-page">
    <h2>提名學生 - 科目：{{ selectedSubject.subject_name }}</h2>

    <div v-for="classItem in selectedClass" :key="classItem" class="class-section">
      <h3>{{ classTable[classItem - 1] }} 班</h3>

      <div v-if="studentsByClass[classItem]">
        <label
          v-for="student in studentsByClass[classItem]"
          :key="student.student_id"
          :value="student.student_id"
          class="student-checkbox"
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
  name: 'NominateStudentsPage',
  data() {
    return {
      classTable: ['1M', '1A', '1R', '1Y', '2M', '2A', '2R', '2Y', '3M', '3A', '3R', '3Y', '4M', '4A', '4R', '4Y', '5M', '5A', '5R', '5Y', '6M', '6A', '6R', '6Y'],
      selectedSubject: this.$route.query.selectedSubject || '',
      selectedClass: JSON.parse(this.$route.query.selectedClass || '[]'),
      studentsByClass: {},
      selectedStudents: {}
    }
  },
  created() {
    if (!this.selectedSubject || !this.selectedClass.length) {
      this.$router.push({ name: 'BLA' })
      return
    }
    console.log('已選擇科目:', this.selectedSubject)
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
    submitNomination() {
      const token = localStorage.getItem('token');
      if (!token) {
        console.error('未登入');
        return;
      }
      const teacherId = this.teacher_id
      const subjectId = this.selectedSubject.subject_id
      const selectedStudentIds = Object.values(this.selectedStudents).flat()

      axios.post('http://localhost:3000/api/bla/insert', {
        teacher_id: teacherId,
        subject_id: subjectId,
        student_ids: selectedStudentIds
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      }).then(res => {
        console.log('投票成功', res.data)
      }).catch(err => {
        console.error('投票失敗', err)
      })
    }
  },
  async mounted() {
    await this.getTeacherId();
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
</style>
