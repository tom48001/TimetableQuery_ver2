<template>
  <div class="admin-panel">
    <h2>管理員：老師帳戶管理</h2>

    <!--新增老師-->
    <section class="add-section">
      <h3>新增老師帳號</h3>
      <input v-model="newTeacher.user_name" placeholder="姓名" />
      <input v-model="newTeacher.email" placeholder="Email" />
      <input v-model="newTeacher.password" type="password" placeholder="密碼" />
      <button @click="addTeacher">新增</button>
    </section>

    <!--老師列表-->
    <section class="table-section">
      <h3>所有老師帳號</h3>
      <button @click="fetchTeachers">重新整理</button>
      <table>
        <thead>
          <tr>
            <th>姓名</th>
            <th>Email</th>
            <th>新密碼</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="teacher in teachers" :key="teacher.user_id">
            <td><input v-model="teacher.user_name" /></td>
            <td><input v-model="teacher.email" /></td>
            <td><input v-model="teacher.newPassword" placeholder="輸入新密碼" /></td>
            <td>
              <button @click="updateTeacher(teacher)">儲存</button>
              <button @click="deleteTeacher(teacher.user_id)">刪除</button>
            </td>
          </tr>
        </tbody>
      </table>
    </section>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'AdminTeacherPanel',
  data() {
    return {
      teachers: [],
      newTeacher: { user_name: '', email: '', password: '' }
    };
  },
  methods: {
    async fetchTeachers() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/api/teachers/getAllTeachers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        // 加 newPassword 欄位作為輸入欄位，不會送到後端
        this.teachers = res.data.map(t => ({ ...t, newPassword: '' }));
      } catch (err) {
        alert('獲取老師資料失敗');
      }
    },
    async updateTeacher(teacher) {
      try {
        const token = localStorage.getItem('token');
        // 傳送包含新密碼（可空值）
        await axios.put(`http://localhost:3000/api/teachers/${teacher.user_id}`, {
          user_name: teacher.user_name,
          email: teacher.email,
          newPassword: teacher.newPassword || null
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert(teacher.newPassword ? '已儲存並重設密碼' : '儲存成功');
        teacher.newPassword = ''; // 清空密碼欄
      } catch (err) {
        alert('儲存失敗');
      }
    },
    async addTeacher() {
      try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:3000/api/teachers', this.newTeacher, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('新增成功');
        this.newTeacher = { user_name: '', email: '', password: '' };
        this.fetchTeachers();
      } catch (err) {
        alert('新增失敗，請確認欄位填寫完整');
      }
    },
    async deleteTeacher(id) {
      if (!confirm('你確定要刪除這位老師帳號嗎？')) return;

      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/teachers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('刪除成功');
        this.fetchTeachers();
      } catch (err) {
        alert('刪除失敗');
      }
    }
  },
  mounted() {
    this.fetchTeachers();
  }
};
</script>

<style scoped>
.admin-panel {
  padding: 30px;
  max-width: 1000px;
  margin: auto;
  background: #fff;
}

.add-section,
.table-section {
  margin-bottom: 30px;
}

input {
  padding: 6px;
  margin-right: 10px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  padding: 6px 12px;
  margin: 2px;
  background-color: #333;
  color: #fff;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:hover {
  background-color: #555;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 10px;
}

th, td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}
</style>
