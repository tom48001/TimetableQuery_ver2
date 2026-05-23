<template>
  <div class="wrapper">
    <div class="inner">
      <div class="image-holder">
        <img src="../assets/smcc1.jpg" alt="">
      </div>

      <div class="login">
        <h2>行政管理系統</h2>

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
          window.location.reload();
        } else {
          alert(TEXT.noUser);
        }
      } catch (err) {
        console.error('Login failed:', err);
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

<style scoped>
.wrapper {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 24px;
  background:
    linear-gradient(180deg, var(--app-bg-soft) 0%, var(--app-bg) 100%);
}

.inner {
  width: min(900px, 100%);
  display: flex;
  overflow: hidden;
}

.image-holder {
  width: 50%;
  min-height: 430px;
  background: var(--surface-soft);
}

.image-holder img {
  width: 100%;
  height: 100%;
  display: block;
  object-fit: cover;
}

.login {
  width: 50%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 20px;
  padding: 44px;
}

.login h2 {
  color: var(--text);
  font-size: 30px;
  margin: 0;
  text-align: center;
}

.login form {
  display: grid;
  gap: 16px;
}

.login form div {
  display: grid;
  gap: 8px;
}

.login label {
  color: var(--text);
  font-weight: 700;
}

.login input {
  width: 100%;
  height: 46px;
  padding: 0 12px;
}

button {
  width: 100%;
  height: 48px;
  margin-top: 8px;
}

.google-login-link {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #fff;
  color: var(--text);
  cursor: pointer;
  font-weight: 700;
  padding: 12px 20px;
  transition: background-color 0.2s ease;
}

.google-login-link:hover {
  background: var(--surface-soft);
}

.google-icon {
  width: 20px;
  height: 20px;
}

@media (max-width: 760px) {
  .inner {
    display: block;
  }

  .image-holder,
  .login {
    width: 100%;
  }

  .image-holder {
    min-height: 180px;
  }

  .login {
    padding: 28px;
  }
}
</style>
