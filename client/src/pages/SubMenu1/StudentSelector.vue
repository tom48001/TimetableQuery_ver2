<template>
  <main class="page-shell">
    <section class="page-panel placeholder-panel">
      <h1>{{ tr('Please Select Student', '請選擇學生') }}</h1>
    </section>
  </main>
</template>

<script>
export default {
  methods: {
    tr(en, zh) {
      return this.$lang.locale === 'en' ? en : zh;
    }
  }
};
</script>

<style scoped>
.placeholder-panel {
  padding: 34px;
}
</style>
