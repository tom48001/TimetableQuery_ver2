<template>
  <div class="redirect-page">{{ $lang && $lang.locale === 'en' ? 'Signing in with Google...' : '\u6b63\u5728\u4f7f\u7528 Google \u767b\u5165...' }}</div>
</template>

<script>
import { refreshSession } from '../config/session';
export default {
  async mounted() {
    const user = await refreshSession();
    this.$router.replace(user ? '/home' : '/login');
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
