<template>
  <div class="import-page">
    <h1>匯入 Timetable Excel</h1>

    <section class="format-box">
      <h2>Excel 格式</h2>
      <p>檔案必須是 .xlsx，並包含一個名為 Timetable 的工作表。</p>
      <p>第一行欄位名稱必須完全是：teacher, subject, class, room, day, period</p>
    </section>

    <input type="file" @change="handleFile" accept=".xlsx" />

    <button @click="uploadFile" :disabled="!file">
      上載並匯入
    </button>

    <pre v-if="message" class="message">{{ message }}</pre>
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
      this.message = '';
    },
    formatList(title, values) {
      if (!values || values.length === 0) return '';
      return `${title}:\n${values.join(', ')}`;
    },
    formatInvalidRows(rows) {
      if (!rows || rows.length === 0) return '';
      return `資料不完整或格式錯誤的列:\n${rows.map(row => `第 ${row.row} 列`).join(', ')}`;
    },
    buildErrorMessage(data) {
      const parts = [
        data.message || '匯入失敗',
        this.formatList('缺少老師 teacher_code', data.missingTeachers),
        this.formatList('缺少科目 subject', data.missingSubjects),
        this.formatList('缺少班別 class', data.missingClasses),
        this.formatList('缺少課室 room', data.missingRooms),
        this.formatList('缺少節次 period', data.missingPeriods),
        this.formatList('缺少欄位', data.missingColumns),
        this.formatInvalidRows(data.invalidRows)
      ].filter(Boolean);

      return parts.join('\n\n');
    },
    async uploadFile() {
      if (!this.file) {
        alert('請先選擇 Excel 檔案');
        return;
      }

      const formData = new FormData();
      const token = localStorage.getItem('token');
      formData.append('file', this.file);

      try {
        const res = await axios.post(
          'http://localhost:3000/api/import/excel',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        this.message = [
          res.data.message,
          `成功匯入堂數: ${res.data.insertedTimetable}`,
          `略過列數: ${res.data.skippedRows}`
        ].join('\n');
      } catch (err) {
        console.error('Import failed:', err);

        if (err.response && err.response.data) {
          this.message = this.buildErrorMessage(err.response.data);
          alert(this.message);
        } else {
          alert('匯入失敗，請稍後再試');
        }
      }
    }
  }
};
</script>

<style scoped>
.import-page {
  max-width: 760px;
  margin: 40px auto;
  padding: 24px;
}

h1 {
  text-align: center;
}

.format-box {
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  margin: 24px 0;
  background: #f9fbfd;
}

input {
  display: block;
  margin: 20px auto;
}

button {
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
}

button:disabled {
  background-color: #aaa;
  cursor: not-allowed;
}

.message {
  white-space: pre-wrap;
  border: 1px solid #ddd;
  border-radius: 8px;
  padding: 16px;
  background: #fff;
}
</style>
