<template>
  <div>正在處理 Google 登入，請稍候...</div>
</template>

<script>
import axios from 'axios';

export default {
  async mounted() {
    try {
      const res = await axios.get('http://localhost:3000/auth/me', {
        withCredentials: true
      });

      const user = res.data;
      console.log('從 /auth/me 獲取 user：', user);

      const cleanedUser = {
        ...user,
        role: user.role ? user.role.trim().toLowerCase() : 'teacher'
      };

      localStorage.setItem('user', JSON.stringify(cleanedUser));

      // 根據角色決定導向後，再reload
      if (cleanedUser.role === 'manager') {
        this.$router.push('/editTeacher');
      } else {
        this.$router.push('/home');
      }

      // 加延遲避免router還沒完成跳轉
      setTimeout(() => {
        window.location.reload();
      }, 100);
    } catch (err) {
      console.error('無法獲取使用者資料：', err);
      this.$router.push('/login');
    }
  }
};
</script>
