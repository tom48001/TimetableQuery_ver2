<template>
  <div class="admin-panel">
    <h2>User Management</h2>

    <section class="add-section">
      <h3>Add User</h3>
      <input v-model="newTeacher.user_name" placeholder="Name" />
      <input v-model="newTeacher.email" placeholder="Email" />
      <input v-model="newTeacher.password" type="password" placeholder="Password" />
      <select v-model="newTeacher.role">
        <option value="teacher">Teacher</option>
        <option value="staff">Staff</option>
      </select>
      <button @click="addTeacher">Add</button>
    </section>

    <section class="table-section">
      <h3>All Users</h3>
      <button @click="fetchTeachers">Refresh</button>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Role</th>
            <th>New Password</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="teacher in teachers" :key="teacher.user_id">
            <td><input v-model="teacher.user_name" /></td>
            <td><input v-model="teacher.email" /></td>
            <td>
              <select v-model="teacher.role">
                <option value="teacher">Teacher</option>
                <option value="staff">Staff</option>
              </select>
            </td>
            <td><input v-model="teacher.newPassword" placeholder="Enter new password" /></td>
            <td>
              <button @click="updateTeacher(teacher)">Save</button>
              <button @click="deleteTeacher(teacher.user_id)">Delete</button>
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
      newTeacher: { user_name: '', email: '', password: '', role: 'teacher' }
    };
  },
  methods: {
    async fetchTeachers() {
      try {
        const token = localStorage.getItem('token');
        const res = await axios.get('http://localhost:3000/api/teachers/getAllTeachers', {
          headers: { Authorization: `Bearer ${token}` }
        });
        this.teachers = res.data.map(t => ({
          ...t,
          role: t.role ? t.role.trim().toLowerCase() : 'teacher',
          newPassword: ''
        }));
      } catch (err) {
        alert('Failed to load users.');
      }
    },
    async updateTeacher(teacher) {
      try {
        const token = localStorage.getItem('token');
        await axios.put(`http://localhost:3000/api/teachers/${teacher.user_id}`, {
          user_name: teacher.user_name,
          email: teacher.email,
          role: teacher.role,
          newPassword: teacher.newPassword || null
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert(teacher.newPassword ? 'Saved and password reset.' : 'Saved successfully.');
        teacher.newPassword = '';
      } catch (err) {
        alert('Save failed.');
      }
    },
    async addTeacher() {
      try {
        const token = localStorage.getItem('token');
        await axios.post('http://localhost:3000/api/teachers', this.newTeacher, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('User added successfully.');
        this.newTeacher = { user_name: '', email: '', password: '', role: 'teacher' };
        this.fetchTeachers();
      } catch (err) {
        alert('Add failed. Please check the email, password, and role.');
      }
    },
    async deleteTeacher(id) {
      if (!confirm('Are you sure you want to delete this user?')) return;

      try {
        const token = localStorage.getItem('token');
        await axios.delete(`http://localhost:3000/api/teachers/${id}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        alert('Deleted successfully.');
        this.fetchTeachers();
      } catch (err) {
        alert('Delete failed.');
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

input,
select {
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

th,
td {
  border: 1px solid #ddd;
  padding: 10px;
  text-align: left;
}
</style>
