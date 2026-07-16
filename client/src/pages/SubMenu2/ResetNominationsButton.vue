<template>
  <button v-if="isManager" type="button" class="reset-button" :disabled="resetting" @click="resetAll">
    {{ resetting ? tr('Resetting...', '重設中...') : tr('Reset annual nominations', '重設所有年度提名') }}
  </button>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return { resetting: false };
  },
  computed: {
    isManager() {
      try {
        const user = JSON.parse(localStorage.getItem('user') || '{}');
        return String(user.role || '').toLowerCase() === 'manager';
      } catch (error) {
        return false;
      }
    }
  },
  methods: {
    tr(en, zh) {
      return this.$lang.locale === 'en' ? en : zh;
    },
    async resetAll() {
      const firstWarning = this.tr(
        'Reset all annual nomination records? This includes Conduct Award, Prefect, Best Learning Attitude and Learning Goal records.',
        '確定重設所有年度提名？這包括操行獎、紀律領袖生、最佳學習態度及學習目標記錄。'
      );
      if (!confirm(firstWarning)) return;
      if (!confirm(this.tr('This cannot be undone. Confirm reset?', '此操作無法復原，請再次確認重設。'))) return;

      this.resetting = true;
      try {
        const token = localStorage.getItem('token');
        await axios.delete('/api/nominations/reset-all', { headers: { Authorization: `Bearer ${token}` } });
        alert(this.tr('All annual nominations have been reset.', '所有年度提名已重設。'));
        this.$emit('reset');
      } catch (error) {
        const message = error.response && error.response.data && (error.response.data.error || error.response.data.message);
        alert(message || this.tr('Failed to reset nominations.', '重設提名失敗。'));
      } finally {
        this.resetting = false;
      }
    }
  }
};
</script>

<style scoped>
.reset-button {
  min-height: 40px;
  border: 1px solid #b91c1c;
  border-radius: 8px;
  background: #fff;
  color: #b91c1c;
  cursor: pointer;
  font-weight: 800;
  padding: 8px 14px;
}

.reset-button:hover:not(:disabled) {
  background: #fff1f1;
}

.reset-button:disabled {
  cursor: wait;
  opacity: 0.65;
}
</style>
