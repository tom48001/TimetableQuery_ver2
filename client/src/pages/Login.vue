<template>
  <div class="wrapper">
    <div class="inner">
      <div class="image-holder">
        <img src="../assets/smcc1.jpg" alt="">
      </div>
      <div class="login">
        <h2>行政管理系統</h2>
        <!--  手動登入 -->
        <form @submit.prevent="handleLogin">
          <div>
            <label for="email">帳號</label>
            <input v-model="email" type="text" id="email" placeholder="帳號">
          </div>
          <div>
            <label for="password">密碼</label>
            <input v-model="password" type="password" id="password" placeholder="密碼">
          </div>
          <button type="submit">登入</button>
        </form>

        <!--  Google 登入 -->
        <a href="http://localhost:3000/auth/google" class="google-login-link">
          <img :src="require('@/assets/google-icon.png')" alt="Google Icon" class="google-icon" />
          <span>使用 Google 登入</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

const TEXT = {
  noUser: '\u767b\u5165\u5931\u6557\uff0c\u7121\u6cd5\u7372\u53d6\u4f7f\u7528\u8005\u8cc7\u8a0a\u3002',
  invalidCredentials: '\u767b\u5165\u5931\u6557\uff0c\u8acb\u6aa2\u67e5\u5e33\u865f\u5bc6\u78bc\u3002',
  serverUnavailable: '\u767b\u5165\u5931\u6557\uff0c\u8acb\u6aa2\u67e5\u5f8c\u7aef\u4f3a\u670d\u5668\u662f\u5426\u5df2\u555f\u52d5\u3002'
};

export default {
  data() {
    return {
      email: '',
      password: ''
    };
  },
  methods: {
    async handleLogin() {
      try {
        const res = await axios.post('http://localhost:3000/auth/login', {
          email: this.email,
          password: this.password
        });

        if (res.data.user) {
          const cleanedUser = {
            ...res.data.user,
            role: res.data.user.role ? res.data.user.role.trim().toLowerCase() : 'teacher'
          };
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(cleanedUser));

          this.$router.push('/home');
          window.location.reload(); // 強制重新整理 UI
        } else {
          alert(TEXT.noUser);
        }
      } catch (err) {
        console.error('登入錯誤：', err);
        const data = err.response && err.response.data ? err.response.data : {};
        const status = err.response ? err.response.status : 0;
        const fallback = status === 400 || status === 401
          ? TEXT.invalidCredentials
          : TEXT.serverUnavailable;
        alert(data.error || fallback);
      }
    }
  }
};
</script>

<style>
body {
  font-family: "Poppins-Regular";
  color: #333;
  font-size: 13px;
  margin: 0;
}

input {
  border: none;
  outline: none;
  font-family: "Poppins-Regular";
  color: #333;
  background: transparent;
  border-bottom: 1px solid #ccc;
  font-size: 13px;
}

textarea,
select,
button {
  border: none;
  outline: none;
  font-family: "Poppins-Regular";
  color: #333;
  background: transparent;
  border-bottom: 1px solid #ccc;
  font-size: 13px;
  -webkit-border-radius: 5px;
  border-radius: 5px;
}

input:focus {
  border-bottom: 2px solid #000;
}

p,
h1,
h2,
h3,
h4,
h5,
h6,
ul {
  margin: 0 auto;
  padding: 0;
}

img {
  max-width: 100%;
}

a:hover {
  text-decoration: none;
}

:focus {
  outline: none;
}

.wrapper {
  min-height: 100vh;
  background-color: #f0f0f0;
  display: flex;
  align-items: center;
}

.inner {
  padding: 20px;
  background: #fff;
  max-width: 850px;
  margin: auto;
  display: flex;
}

.inner .image-holder {
  width: 50%;
  height: 50%;
}

.login {
  width: 50%;
  padding: 20px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

.login form {
  width: 150%;
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: center;
}

.login h2 {
  margin-bottom: 20px;
  text-align: center;
}

button {
  border: none;
  width: 164px;
  height: 51px;
  margin: auto;
  margin-top: 40px;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  background: #333;
  font-size: 15px;
  color: #fff;
  vertical-align: middle;
}

.google-login-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background-color: white;
  border: 1px solid #ccc;
  padding: 10px 20px;
  border-radius: 4px;
  text-decoration: none;
  color: #333;
  font-weight: bold;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.google-login-link:hover {
  background-color: #f5f5f5;
}

.google-icon {
  width: 20px;
  height: 20px;
}
</style>
