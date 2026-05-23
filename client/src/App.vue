<template>
  <div class="app-shell">
    <HeaderBar v-show="$route.meta.show"></HeaderBar>
    <router-view>
      <div id="app"></div>
    </router-view>
  </div>
</template>

<script>
import HeaderBar from '@/components/HeaderBar.vue'
// import router from './router';
export default {
  name: 'App',
  components: {
    HeaderBar
  }
}
</script>

<style>
body {
  background: #edf3f5;
}

.app-shell {
  min-height: 100vh;
  background:
    linear-gradient(180deg, #f8fbfc 0%, #eef5f6 48%, #e8f0f2 100%);
}
</style>
