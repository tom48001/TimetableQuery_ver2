<template>
  <div>正在處理 Google 登入，請稍候...</div>
</template>

<script>
import axios from 'axios';
import { jwtDecode } from 'jwt-decode';

export default {
  async mounted() {
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');

    if (!token) {
      console.error('找不到 token');
      this.$router.push('/login');
      return;
    }

    // 存新 token，覆蓋舊的
    localStorage.setItem('token', token);
    axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;

    // 解析 JWT 取得 user 資訊
    try {
      const decoded = jwtDecode(token);
      console.log('JWT 解碼結果:', decoded);

      // 存 user 到 localStorage，供前端其他地方使用
      const cleanedUser = {
        id: decoded.id,
        role: decoded.role ? decoded.role.trim().toLowerCase() : 'teacher'
      };
      localStorage.setItem('user', JSON.stringify(cleanedUser));

      // 根據角色導向
      if (cleanedUser.role === 'manager') {
        this.$router.push('/editTeacher');
      } else {
        this.$router.push('/home');
      }
      // reload 確保 navbar 或選單刷新
      setTimeout(() => {
        window.location.reload();
      }, 200);
    } catch (err) {
      console.error('JWT 解析失敗:', err);
      this.$router.push('/login');
    }
  }
};
</script>
