<template>
  <div class="p-6">
    <h1 class="text-xl font-bold mb-4">匯入老師 Excel</h1>
    <input type="file" @change="handleFile" accept=".xlsx,.csv" />

    <button
      @click="uploadFile"
      :disabled="!file"
      class="mt-4 bg-blue-500 text-white px-4 py-2 rounded">
      上傳並更新
    </button>
    <div v-if="message" class="mt-4">
      <p>{{ message }}</p>
    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  data() {
    return {
      file: null,
      message: ''
    };
  },
  methods: {
    handleFile(event) {
      this.file = event.target.files[0];
    },
    async uploadFile() {
      if (!this.file) return;
      const formData = new FormData();
      formData.append('file', this.file);
      try {
        const res = await axios.post('http://localhost:3000/api/import/excel', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        this.message = `匯入成功：新增 ${res.data.added}，更新 ${res.data.updated}，標記離職 ${res.data.inactive}`;
      } catch (err) {
        console.error('前端捕捉錯誤：', err);
        this.message = '匯入失敗：' +
    ((err.response && err.response.data && err.response.data.message) ||
      err.message ||
      '未知錯誤');
      }
    }
  }
};
</script>
