<template>
  <div class='p-6'>
    <h1 class='text-xl font-bold mb-4'>匯入老師 Excel</h1>
    <input type='file' @change='handleFile' accept='.xlsx,.csv' />

    <button
      @click='uploadFile'
      :disabled='!file'
      class='mt-4 bg-blue-500 text-white px-4 py-2 rounded'>
      上傳並更新
    </button>
    <div v-if='message' class='mt-4'>
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
    handleFile(e) {
      this.file = e.target.files[0];
    },

    async uploadFile() {
      if (!this.file) {
        alert('請先選擇 Excel 檔案');
        return;
      }

      const formData = new FormData();
      formData.append('file', this.file);

      try {
        const res = await axios.post(
          'http://localhost:3000/api/import/excel',
          formData,
          {
            headers: {
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        // ✅ 對齊後端（Timetable 匯入）的回傳格式
        this.message = `
${res.data.message}
新增課堂：${res.data.insertedTimetable}
刪除舊課堂：${res.data.deletedTimetable}
        `;
      } catch (err) {
        console.error('前端捕捉錯誤：', err);

        if (err.response && err.response.data) {
          const data = err.response.data;

          let msg = data.message || '匯入失敗';

          if (data.missingTeachers) {
            msg += '\n\n缺少老師：\n' + data.missingTeachers.join(', ');
          }
          if (data.missingSubjects) {
            msg += '\n\n缺少科目：\n' + data.missingSubjects.join(', ');
          }
          if (data.missingClasses) {
            msg += '\n\n缺少班別：\n' + data.missingClasses.join(', ');
          }
          if (data.missingRooms) {
            msg += '\n\n缺少房間：\n' + data.missingRooms.join(', ');
          }

          alert(msg);
        } else {
          alert('無法連線到伺服器');
        }
      }
    }
  }
};
</script>
