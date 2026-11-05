<template>
  <main class="forbidden-page">
    <section class="forbidden-panel">
      <div class="status-code">403</div>
      <h1>{{ $t('forbidden.title') }}</h1>
      <p>{{ $t('forbidden.message') }}</p>
      <router-link to="/home" class="home-link">{{ $t('forbidden.backHome') }}</router-link>
    </section>
  </main>
</template>

<script>
export default {
  name: 'Forbidden'
}
</script>

<style scoped>
.forbidden-page {
  min-height: calc(100vh - 126px);
  display: grid;
  place-items: center;
  padding: 40px 20px;
}

.forbidden-panel {
  width: min(560px, 100%);
  padding: 42px;
  text-align: center;
}

.status-code {
  color: var(--primary);
  font-size: 64px;
  font-weight: 900;
  line-height: 1;
}

h1 {
  margin: 14px 0 10px;
}

p {
  color: var(--muted);
  margin: 0 0 26px;
}

.home-link {
  display: inline-flex;
  border-radius: 6px;
  background: var(--primary);
  color: #fff;
  font-weight: 800;
  padding: 12px 22px;
}
</style>
