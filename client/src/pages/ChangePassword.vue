<template>
  <main class="password-page">
    <form class="password-form" @submit.prevent="changePassword">
      <header>
        <p>Account</p>
        <h1>&#x66F4;&#x6539;&#x5BC6;&#x78BC;</h1>
      </header>

      <label>
        <span>&#x539F;&#x5BC6;&#x78BC;</span>
        <input
          v-model="currentPassword"
          type="password"
          autocomplete="current-password"
          required
        />
      </label>

      <label>
        <span>&#x65B0;&#x5BC6;&#x78BC;</span>
        <input
          v-model="newPassword"
          type="password"
          autocomplete="new-password"
          required
        />
      </label>

      <label>
        <span>&#x518D;&#x6B21;&#x8F38;&#x5165;&#x65B0;&#x5BC6;&#x78BC;</span>
        <input
          v-model="confirmPassword"
          type="password"
          autocomplete="new-password"
          required
        />
      </label>

      <p v-if="message" class="message" :class="messageType">{{ message }}</p>

      <button type="submit" :disabled="submitting">
        {{ submitting ? text.saving : text.save }}
      </button>
    </form>
  </main>
</template>

<script>
import axios from 'axios';

const TEXT = {
  save: '\u66f4\u65b0\u5bc6\u78bc',
  saving: '\u66f4\u65b0\u4e2d...',
  loginFirst: '\u8acb\u5148\u767b\u5165\u3002',
  mismatch: '\u5169\u6b21\u8f38\u5165\u7684\u65b0\u5bc6\u78bc\u4e0d\u76f8\u540c\u3002',
  failed: '\u66f4\u65b0\u5bc6\u78bc\u5931\u6557\u3002',
  saved: '\u5bc6\u78bc\u5df2\u66f4\u65b0\u3002'
};

export default {
  name: 'ChangePassword',
  data() {
    return {
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
      submitting: false,
      message: '',
      messageType: '',
      text: TEXT
    };
  },
  methods: {
    showMessage(message, type) {
      this.message = message;
      this.messageType = type;
    },
    async changePassword() {
      const token = localStorage.getItem('token');
      if (!token) {
        this.showMessage(TEXT.loginFirst, 'error');
        return;
      }

      if (this.newPassword !== this.confirmPassword) {
        this.showMessage(TEXT.mismatch, 'error');
        return;
      }

      this.submitting = true;
      this.message = '';
      this.messageType = '';

      try {
        const res = await axios.put('http://localhost:3000/auth/change-password', {
          currentPassword: this.currentPassword,
          newPassword: this.newPassword,
          confirmPassword: this.confirmPassword
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        this.currentPassword = '';
        this.newPassword = '';
        this.confirmPassword = '';
        this.showMessage(res.data.message || TEXT.saved, 'success');
      } catch (err) {
        console.error('Password change failed:', err);
        const data = err.response && err.response.data ? err.response.data : {};
        this.showMessage(data.error || TEXT.failed, 'error');
      } finally {
        this.submitting = false;
      }
    }
  }
};
</script>

<style scoped>
.password-page {
  min-height: calc(100vh - 126px);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  box-sizing: border-box;
  padding: 54px 18px;
}

.password-form {
  width: 100%;
  max-width: 440px;
  display: grid;
  gap: 18px;
  border: 1px solid #d1e0e5;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: 0 16px 38px rgba(25, 54, 69, 0.12);
  box-sizing: border-box;
  padding: 30px;
}

header p {
  color: #0d6b78;
  font-size: 13px;
  font-weight: 700;
  margin: 0 0 8px;
  text-transform: uppercase;
}

h1 {
  color: #122635;
  font-size: 30px;
  letter-spacing: 0;
  margin: 0;
}

label {
  display: grid;
  gap: 8px;
  color: #27485b;
  font-size: 15px;
  font-weight: 600;
}

input {
  height: 46px;
  border: 1px solid #b8cad3;
  border-radius: 6px;
  background: #fff;
  box-sizing: border-box;
  color: #122635;
  font-size: 16px;
  padding: 0 13px;
}

input:focus {
  border: 2px solid #0b7285;
}

.message {
  border: 1px solid #d4e0e5;
  border-radius: 6px;
  line-height: 1.5;
  margin: 0;
  padding: 12px;
}

.message.success {
  border-color: #a8d0b5;
  background: #edf8f0;
  color: #1c5634;
}

.message.error {
  border-color: #e5b6b6;
  background: #fff1f0;
  color: #8c2929;
}

button {
  width: 100%;
  height: 48px;
  border: none;
  border-radius: 6px;
  background: #0b7285;
  color: #fff;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  margin: 4px 0 0;
}

button:disabled {
  background: #c7d2d8;
  color: #607683;
  cursor: not-allowed;
}
</style>
