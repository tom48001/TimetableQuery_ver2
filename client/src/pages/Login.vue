<template>
  <div class="wrapper">
    <div class="login-language-switch">
      <button
        type="button"
        :class="{ active: $lang.locale === 'zh' }"
        @click="$setLocale('zh')"
      >
        {{ $t('common.languageZh') }}
      </button>
      <button
        type="button"
        :class="{ active: $lang.locale === 'en' }"
        @click="$setLocale('en')"
      >
        EN
      </button>
    </div>

    <div class="inner">
      <div class="image-holder">
        <img src="../assets/smcc1.jpg" alt="">
      </div>

      <div class="login">
        <h2>{{ $t('login.title') }}</h2>

        <form @submit.prevent="handleLogin">
          <div>
            <label for="email">{{ $t('login.email') }}</label>
            <input v-model="email" type="text" id="email" :placeholder="$t('login.email')">
          </div>
          <div>
            <label for="password">{{ $t('login.password') }}</label>
            <input v-model="password" type="password" id="password" :placeholder="$t('login.password')">
          </div>
          <button type="submit">{{ $t('login.submit') }}</button>
        </form>

        <a href="http://localhost:3000/auth/google" class="google-login-link">
          <img :src="require('@/assets/google-icon.png')" alt="Google Icon" class="google-icon" />
          <span>{{ $t('login.google') }}</span>
        </a>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

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
            role: res.data.user.role ? res.data.user.role.trim().toLowerCase() : 'teacher',
            permissions: res.data.user.permissions || {}
          };
          localStorage.setItem('token', res.data.token);
          localStorage.setItem('user', JSON.stringify(cleanedUser));

          this.$router.push('/home');
          window.location.reload();
        } else {
          alert(this.$t('login.noUser'));
        }
      } catch (err) {
        console.error('Login failed:', err);
        const data = err.response && err.response.data ? err.response.data : {};
        const status = err.response ? err.response.status : 0;
        const fallback = status === 400 || status === 401
          ? this.$t('login.invalidCredentials')
          : this.$t('login.serverUnavailable');
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
  position: relative;
}

.login-language-switch {
  position: absolute;
  top: 20px;
  right: 20px;
  display: inline-flex;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #fff;
  overflow: hidden;
}

.login-language-switch button {
  min-width: 56px;
  height: 36px;
  border: none;
  border-radius: 0 !important;
  background: #fff !important;
  color: var(--text) !important;
  cursor: pointer;
  font-size: 13px;
  font-weight: 800;
  padding: 0 10px;
}

.login-language-switch button.active {
  background: var(--primary) !important;
  color: #fff !important;
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
  .wrapper {
    align-items: flex-start;
    padding-top: 78px;
  }

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
