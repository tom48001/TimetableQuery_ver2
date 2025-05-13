<template>
  <div>
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

<style></style>
