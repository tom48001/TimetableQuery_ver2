<template>
  <main class="import-page">
    <section class="import-intro">
      <h1>{{ tr('Import Timetable', '導入時間表') }}</h1>
      <p class="intro-copy">{{ tr('Upload Excel timetable file.', '上載 Excel 時間表檔案。') }}</p>
    </section>

    <section class="import-layout">
      <div class="upload-panel">
        <input
          id="timetable-file"
          ref="fileInput"
          class="file-input"
          type="file"
          accept=".xlsx"
          @change="handleFile"
        />

        <label
          for="timetable-file"
          class="drop-zone"
          :class="{ dragging: dragging, ready: file }"
          @dragenter.prevent="dragging = true"
          @dragover.prevent="dragging = true"
          @dragleave.prevent="dragging = false"
          @drop.prevent="handleDrop"
        >
          <span class="file-mark" aria-hidden="true">XLSX</span>
          <strong v-if="file">{{ file.name }}</strong>
          <strong v-else>{{ tr('No file selected', '未選擇檔案') }}</strong>
          <span v-if="file" class="file-meta">{{ fileSize }}</span>
          <span v-else class="file-meta">{{ tr('Selected file', '已選擇檔案') }}</span>
          <span class="pick-file">{{ tr('Choose file', '選擇檔案') }}</span>
        </label>

        <div class="upload-actions">
          <button
            type="button"
            class="upload-button"
            :disabled="!file || uploading"
            @click="uploadFile"
          >
            {{ uploading ? tr('Importing...', '導入中...') : tr('Import', '導入') }}
          </button>
          <button
            v-if="file"
            type="button"
            class="clear-button"
            :disabled="uploading"
            @click="clearFile"
          >
            {{ tr('Clear', '清除') }}
          </button>
        </div>

        <pre
          v-if="message"
          class="message"
          :class="{ error: messageType === 'error', success: messageType === 'success' }"
        >{{ message }}</pre>
      </div>

      <div class="format-panel">
        <h2>{{ tr('Excel Format', 'Excel 格式') }}</h2>
        <div class="format-note">
          <span>{{ tr('Worksheet name', '工作表名稱') }}</span>
          <strong>Timetable</strong>
        </div>

        <div class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>teacher</th>
                <th>subject</th>
                <th>class</th>
                <th>room</th>
                <th>day</th>
                <th>period</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>T001</td>
                <td>ENG</td>
                <td>1A</td>
                <td>101</td>
                <td>Mon</td>
                <td>Period 1</td>
              </tr>
            </tbody>
          </table>
        </div>

        <ul>
          <li>day: Mon, Tue, Wed, Thu, Fri</li>
          <li>period: Period 1, P1, or 1</li>
          <li>day: Mon, Tue, Wed, Thu, Fri</li>
          <li>period: Period 1, P1, or 1</li>
          <li>{{ tr('First row must use the field names above.', '第一列必須使用以上欄位名稱。') }}</li>
          </ul>
      </div>
    </section>
  </main>
</template>

<script>
import axios from 'axios';

const TEXT = {
  upload: '\u4e0a\u8f09\u8ab2\u8868',
  uploading: '\u4e0a\u8f09\u4e2d...',
  clear: '\u6e05\u9664',
  chooseFile: '\u8acb\u9078\u64c7 Excel \u6a94\u6848\u3002',
  xlsxOnly: '\u8acb\u4e0a\u8f09 .xlsx \u6a94\u6848\u3002',
  loginFirst: '\u8acb\u5148\u767b\u5165\u518d\u4e0a\u8f09\u3002',
  failed: '\u4e0a\u8f09\u5931\u6557\u3002',
  networkFailed: '\u4e0a\u8f09\u5931\u6557\uff0c\u8acb\u6aa2\u67e5\u4f3a\u670d\u5668\u9023\u7dda\u3002',
  invalidRows: '\u8cc7\u6599\u5217\u6709\u683c\u5f0f\u554f\u984c'
};

export default {
  data() {
    return {
      file: null,
      dragging: false,
      uploading: false,
      message: '',
      messageType: '',
      text: TEXT
    };
  },
  computed: {
    fileSize() {
      if (!this.file) return '';
      const sizeInKb = Math.max(1, Math.round(this.file.size / 1024));
      return `${sizeInKb} KB`;
    }
  },
  methods: {
    tr(en, zh) {
      return this.$lang.locale === 'en' ? en : zh;
    },
    setFile(file) {
      this.dragging = false;
      this.message = '';
      this.messageType = '';

      if (!file) return;
      if (!/\.xlsx$/i.test(file.name)) {
        this.clearFile();
        this.showMessage(this.tr('Please upload a .xlsx file.', TEXT.xlsxOnly), 'error');
        return;
      }

      this.file = file;
    },
    handleFile(event) {
      this.setFile(event.target.files[0]);
    },
    handleDrop(event) {
      this.setFile(event.dataTransfer.files[0]);
    },
    clearFile() {
      this.file = null;
      this.dragging = false;

      if (this.$refs.fileInput) {
        this.$refs.fileInput.value = '';
      }
    },
    showMessage(message, type) {
      this.message = message;
      this.messageType = type;
    },
    formatList(title, values) {
      if (!values || values.length === 0) return '';
      return `${title}:\n${values.join(', ')}`;
    },
    formatInvalidRows(rows) {
      if (!rows || rows.length === 0) return '';
      return `${TEXT.invalidRows}:\n${rows.map(row => `Row ${row.row}`).join(', ')}`;
    },
    buildErrorMessage(data) {
      const parts = [
        data.message || this.tr('Upload failed.', TEXT.failed),
        this.formatList('Missing teacher_code', data.missingTeachers),
        this.formatList('Missing subject', data.missingSubjects),
        this.formatList('Missing class', data.missingClasses),
        this.formatList('Missing room', data.missingRooms),
        this.formatList('Missing period', data.missingPeriods),
        this.formatList('Missing columns', data.missingColumns),
        this.formatInvalidRows(data.invalidRows)
      ].filter(Boolean);

      return parts.join('\n\n');
    },
    async uploadFile() {
      if (!this.file) {
        this.showMessage(this.tr('Please choose an Excel file.', TEXT.chooseFile), 'error');
        return;
      }

      const token = localStorage.getItem('token');
      if (!token) {
        this.showMessage(this.tr('Please login before uploading.', TEXT.loginFirst), 'error');
        return;
      }

      const formData = new FormData();
      formData.append('file', this.file);
      this.uploading = true;

      try {
        const res = await axios.post(
          '/api/import/excel',
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        this.showMessage([
          res.data.message,
          `Imported rows: ${res.data.insertedTimetable}`,
          `Skipped rows: ${res.data.skippedRows}`
        ].join('\n'), 'success');
      } catch (err) {
        console.error('Import failed:', err);

        if (err.response && err.response.data) {
          this.showMessage(this.buildErrorMessage(err.response.data), 'error');
        } else {
          this.showMessage(this.tr('Upload failed. Please check the server connection.', TEXT.networkFailed), 'error');
        }
      } finally {
        this.uploading = false;
      }
    }
  }
};
</script>

<style scoped>
.import-page {
  max-width: 1120px;
  min-height: calc(100vh - 130px);
  margin: 0 auto;
  padding: 44px 28px 72px;
  color: var(--text);
}

.import-intro {
  max-width: 720px;
  margin: 0 0 24px;
}

.eyebrow {
  color: var(--primary);
  font-size: 13px;
  font-weight: 800;
  margin: 0 0 8px;
  text-transform: uppercase;
}

h1 {
  color: var(--text);
  font-size: 36px;
  line-height: 1.15;
  letter-spacing: 0;
  margin: 0 0 12px;
}

.intro-copy {
  color: var(--text-muted);
  font-size: 16px;
  line-height: 1.6;
  margin: 0;
}

.import-layout {
  display: grid;
  grid-template-columns: minmax(340px, 0.95fr) minmax(420px, 1.05fr);
  gap: 22px;
  align-items: start;
}

.upload-panel,
.format-panel {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--shadow);
}

.upload-panel {
  padding: 24px;
}

.file-input {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}

.drop-zone {
  min-height: 260px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 13px;
  border: 2px dashed #80a9b7;
  border-radius: 8px;
  background: var(--primary-soft);
  color: var(--text);
  cursor: pointer;
  text-align: center;
  transition: border-color 0.2s ease, background-color 0.2s ease, transform 0.2s ease;
}

.drop-zone.dragging,
.drop-zone:hover {
  border-color: var(--primary);
  background: #e0f1f2;
  transform: translateY(-1px);
}

.drop-zone.ready {
  border-style: solid;
  background: #f2f8ed;
}

.file-mark {
  min-width: 76px;
  border-radius: 8px;
  background: #17614d;
  color: #fff;
  font-size: 13px;
  font-weight: 800;
  padding: 16px 12px;
}

.drop-zone strong {
  max-width: 100%;
  padding: 0 18px;
  box-sizing: border-box;
  font-size: 20px;
  line-height: 1.35;
  overflow-wrap: break-word;
}

.file-meta {
  color: var(--text-muted);
  font-size: 14px;
}

.pick-file {
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  background: #fff;
  color: var(--text);
  font-weight: 700;
  padding: 10px 15px;
}

.upload-actions {
  min-height: 52px;
  display: flex;
  gap: 12px;
  margin-top: 18px;
}

button {
  width: auto;
  height: 48px;
  margin: 0;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  padding: 0 20px;
  font-size: 15px;
  font-weight: 800;
}

.upload-button {
  background: var(--primary);
  color: #fff;
}

.upload-button:hover:not(:disabled) {
  background: var(--primary-dark);
}

.clear-button {
  border: 1px solid var(--border-strong);
  background: #fff;
  color: var(--text);
}

button:disabled {
  background: #c7d2d8;
  border-color: #c7d2d8;
  color: #607683;
  cursor: not-allowed;
}

.message {
  min-height: 68px;
  box-sizing: border-box;
  white-space: pre-wrap;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #f5f8fa;
  color: var(--text);
  line-height: 1.5;
  margin: 18px 0 0;
  padding: 15px;
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

.format-panel {
  padding: 24px;
}

h2 {
  color: var(--text);
  font-size: 22px;
  letter-spacing: 0;
  margin: 0 0 16px;
}

.format-note {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: var(--surface-soft);
  padding: 13px 14px;
  margin-bottom: 18px;
}

.format-note span {
  color: var(--text-muted);
}

.format-note strong {
  color: var(--primary);
  font-size: 16px;
}

.table-wrap {
  overflow-x: auto;
  border: 1px solid var(--border);
  border-radius: 8px;
}

table {
  width: 100%;
  min-width: 480px;
  border-collapse: collapse;
  background: #fff;
}

th,
td {
  border-bottom: 1px solid var(--border);
  padding: 12px 10px;
  text-align: left;
  white-space: nowrap;
}

th {
  background: var(--surface-soft);
  color: var(--text);
  font-weight: 800;
}

td {
  color: var(--text-muted);
}

ul {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fbfdfd;
  color: var(--text-muted);
  font-size: 14px;
  line-height: 1.7;
  list-style-position: inside;
  margin: 18px 0 0;
  padding: 14px 16px;
}

@media (max-width: 820px) {
  .import-page {
    padding: 34px 16px 50px;
  }

  .import-layout {
    grid-template-columns: 1fr;
  }

  h1 {
    font-size: 30px;
  }

  .drop-zone {
    min-height: 238px;
  }
}
</style>
