<template>
  <div class="redirect-page">甇?摰? Google ?餃...</div>
</template>

<script>
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export default {
  async mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      console.error('Missing Google login token');
      this.$router.push('/login');
      return;
    }

    localStorage.setItem('token', token);
    axios.defaults.headers.common.Authorization = `Bearer ${token}`;

    try {
      const decoded = jwtDecode(token);
      const cleanedUser = {
        id: decoded.id,
        role: decoded.role ? decoded.role.trim().toLowerCase() : 'teacher',
        user_name: decoded.user_name || '',
        email: decoded.email || '',
        permissions: decoded.permissions || {}
      };
      localStorage.setItem('user', JSON.stringify(cleanedUser));

      if (cleanedUser.role === 'manager' || cleanedUser.role === 'staff') {
        this.$router.push('/editTeacher');
      } else {
        this.$router.push('/home');
      }

      setTimeout(() => {
        window.location.reload();
      }, 200);
    } catch (err) {
      console.error('Failed to decode Google login token:', err);
      this.$router.push('/login');
    }
  }
};
</script>

<style scoped>
.redirect-page {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text);
  font-size: 18px;
  font-weight: 700;
}
</style>
