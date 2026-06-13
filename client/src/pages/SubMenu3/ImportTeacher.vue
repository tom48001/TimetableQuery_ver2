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

        <div v-if="lastImportResult" class="batch-result">
          <h2>{{ tr('Import Result', '\u532f\u5165\u7d50\u679c') }}</h2>
          <dl>
            <div>
              <dt>{{ tr('Batch ID', '\u6279\u6b21') }}</dt>
              <dd>#{{ lastImportResult.batchId }}</dd>
            </div>
            <div>
              <dt>{{ tr('Imported rows', '\u532f\u5165\u7b46\u6578') }}</dt>
              <dd>{{ lastImportResult.insertedTimetable }}</dd>
            </div>
            <div>
              <dt>{{ tr('Previous snapshot', '\u532f\u5165\u524d\u5099\u4efd') }}</dt>
              <dd>{{ lastImportResult.snapshotRows }}</dd>
            </div>
          </dl>
        </div>
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

    <section class="history-panel">
      <div class="history-header">
        <div>
          <h2>{{ tr('Import History', '\u532f\u5165\u8a18\u9304') }}</h2>
          <p>{{ tr('Managers can restore the timetable to the version before a successful import.', '\u53ef\u5c07\u6642\u9593\u8868\u56de\u5fa9\u5230\u67d0\u6b21\u6210\u529f\u532f\u5165\u524d\u7684\u7248\u672c\u3002') }}</p>
        </div>
        <button type="button" class="clear-button" :disabled="historyLoading" @click="fetchImportBatches">
          {{ tr('Reload', '\u91cd\u65b0\u8f09\u5165') }}
        </button>
      </div>

      <div class="history-table-wrap">
        <table v-if="importBatches.length" class="history-table">
          <thead>
            <tr>
              <th>{{ tr('Time', '\u6642\u9593') }}</th>
              <th>{{ tr('File', '\u6a94\u6848') }}</th>
              <th>{{ tr('User', '\u4f7f\u7528\u8005') }}</th>
              <th>{{ tr('Status', '\u72c0\u614b') }}</th>
              <th>{{ tr('Rows', '\u7b46\u6578') }}</th>
              <th>{{ tr('Snapshot', '\u5099\u4efd') }}</th>
              <th>{{ tr('Action', '\u64cd\u4f5c') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="batch in paginatedImportBatches" :key="batch.batch_id">
              <td>{{ formatDate(batch.created_at) }}</td>
              <td>{{ batch.file_name }}</td>
              <td>{{ batch.imported_by_name || '-' }}</td>
              <td><span class="status-pill" :class="batch.status">{{ statusLabel(batch.status) }}</span></td>
              <td>{{ batch.inserted_rows }}</td>
              <td>{{ batch.snapshot_rows }}</td>
              <td>
                <button
                  type="button"
                  class="danger-button small"
                  :disabled="!canRollback(batch) || rollbackLoading"
                  @click="rollbackBatch(batch)"
                >
                  {{ tr('Restore', '\u56de\u5fa9') }}
                </button>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty-history">{{ historyLoading ? tr('Loading...', '\u8f09\u5165\u4e2d...') : tr('No import history yet.', '\u66ab\u6642\u6c92\u6709\u532f\u5165\u8a18\u9304\u3002') }}</p>
      </div>

      <div v-if="importBatches.length" class="history-footer">
        <span>{{ historyRangeLabel }}</span>
        <div class="history-pager">
          <button type="button" class="clear-button small" :disabled="historyPage === 1" @click="historyPage -= 1">
            {{ tr('Previous', '\u4e0a\u4e00\u9801') }}
          </button>
          <span>{{ historyPage }} / {{ historyTotalPages }}</span>
          <button type="button" class="clear-button small" :disabled="historyPage === historyTotalPages" @click="historyPage += 1">
            {{ tr('Next', '\u4e0b\u4e00\u9801') }}
          </button>
        </div>
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
      historyLoading: false,
      rollbackLoading: false,
      message: '',
      messageType: '',
      lastImportResult: null,
      importBatches: [],
      historyPage: 1,
      historyPageSize: 5,
      text: TEXT
    };
  },
  computed: {
    fileSize() {
      if (!this.file) return '';
      const sizeInKb = Math.max(1, Math.round(this.file.size / 1024));
      return `${sizeInKb} KB`;
    },
    historyTotalPages() {
      return Math.max(1, Math.ceil(this.importBatches.length / this.historyPageSize));
    },
    paginatedImportBatches() {
      const page = Math.min(this.historyPage, this.historyTotalPages);
      const start = (page - 1) * this.historyPageSize;
      return this.importBatches.slice(start, start + this.historyPageSize);
    },
    historyRangeLabel() {
      if (!this.importBatches.length) return '';
      const page = Math.min(this.historyPage, this.historyTotalPages);
      const start = (page - 1) * this.historyPageSize + 1;
      const end = Math.min(start + this.historyPageSize - 1, this.importBatches.length);
      return this.tr(`Showing ${start}-${end} of ${this.importBatches.length}`, `\u986f\u793a\u7b2c ${start}-${end} \u7b46\uff0c\u5171 ${this.importBatches.length} \u7b46`);
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
    authHeaders() {
      const token = localStorage.getItem('token');
      return { Authorization: `Bearer ${token}` };
    },
    formatDate(value) {
      if (!value) return '-';
      const date = new Date(value);
      if (Number.isNaN(date.getTime())) return value;
      return date.toLocaleString();
    },
    statusLabel(status) {
      const labels = {
        success: this.tr('Success', '\u6210\u529f'),
        failed: this.tr('Failed', '\u5931\u6557'),
        rolled_back: this.tr('Restored', '\u5df2\u56de\u5fa9')
      };
      return labels[status] || status;
    },
    canRollback(batch) {
      return batch.status === 'success';
    },
    async fetchImportBatches() {
      const token = localStorage.getItem('token');
      if (!token) return;

      this.historyLoading = true;
      try {
        const res = await axios.get('/api/import/batches', { headers: this.authHeaders() });
        this.importBatches = res.data;
        if (this.historyPage > this.historyTotalPages) this.historyPage = this.historyTotalPages;
      } catch (err) {
        console.error('Failed to load import history:', err);
      } finally {
        this.historyLoading = false;
      }
    },
    async rollbackBatch(batch) {
      const firstConfirm = confirm(this.tr(
        `Restore timetable to before import #${batch.batch_id}? Current timetable will be replaced.`,
        `\u78ba\u5b9a\u8981\u56de\u5fa9\u5230\u532f\u5165 #${batch.batch_id} \u524d\u7684\u7248\u672c\uff1f\u73fe\u5728\u7684\u6642\u9593\u8868\u6703\u88ab\u53d6\u4ee3\u3002`
      ));
      if (!firstConfirm) return;

      const typed = prompt(this.tr(
        'Type ROLLBACK to confirm restore.',
        '\u8acb\u8f38\u5165 ROLLBACK \u78ba\u8a8d\u56de\u5fa9\u3002'
      ));
      if (typed !== 'ROLLBACK') {
        this.showMessage(this.tr('Restore cancelled.', '\u5df2\u53d6\u6d88\u56de\u5fa9\u3002'), 'error');
        return;
      }

      this.rollbackLoading = true;
      try {
        const res = await axios.post(`/api/import/rollback/${batch.batch_id}`, {}, { headers: this.authHeaders() });
        this.showMessage([
          res.data.message,
          `Restored rows: ${res.data.restoredRows}`
        ].join('\n'), 'success');
        await this.fetchImportBatches();
      } catch (err) {
        const data = err.response && err.response.data;
        this.showMessage(data && data.message ? data.message : this.tr('Restore failed.', '\u56de\u5fa9\u5931\u6557\u3002'), 'error');
      } finally {
        this.rollbackLoading = false;
      }
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
          `Batch ID: ${res.data.batchId}`,
          `Imported rows: ${res.data.insertedTimetable}`,
          `Skipped rows: ${res.data.skippedRows}`,
          `Snapshot rows: ${res.data.snapshotRows}`
        ].join('\n'), 'success');
        this.lastImportResult = res.data;
        this.clearFile();
        await this.fetchImportBatches();
      } catch (err) {
        console.error('Import failed:', err);
        this.lastImportResult = null;

        if (err.response && err.response.data) {
          this.showMessage(this.buildErrorMessage(err.response.data), 'error');
        } else {
          this.showMessage(this.tr('Upload failed. Please check the server connection.', TEXT.networkFailed), 'error');
        }
      } finally {
        this.uploading = false;
      }
    }
  },
  mounted() {
    this.fetchImportBatches();
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

.batch-result {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fbfdfd;
  margin-top: 18px;
  padding: 16px;
}

.batch-result h2 {
  font-size: 18px;
  margin-bottom: 12px;
}

.batch-result dl {
  display: grid;
  gap: 10px;
  margin: 0;
}

.batch-result dl div {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  border-bottom: 1px solid var(--border);
  padding-bottom: 8px;
}

.batch-result dl div:last-child {
  border-bottom: none;
  padding-bottom: 0;
}

.batch-result dt {
  color: var(--text-muted);
  font-weight: 800;
}

.batch-result dd {
  color: var(--text);
  font-weight: 900;
  margin: 0;
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

.history-panel {
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--shadow);
  margin-top: 22px;
  padding: 24px;
}

.history-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.history-header p {
  color: var(--text-muted);
  font-size: 14px;
  font-weight: 700;
  margin: 6px 0 0;
}

.history-table-wrap {
  overflow-x: auto;
}

.history-table {
  width: 100%;
  min-width: 860px;
  border-collapse: collapse;
  background: #fff;
}

.history-table th,
.history-table td {
  border: 1px solid var(--border);
  padding: 10px;
  text-align: left;
  vertical-align: middle;
}

.history-table th {
  background: var(--surface-soft);
  color: var(--text);
  font-weight: 800;
}

.status-pill {
  display: inline-flex;
  align-items: center;
  border-radius: 999px;
  background: #e8eef2;
  color: var(--text-muted);
  font-size: 12px;
  font-weight: 900;
  min-height: 26px;
  padding: 0 10px;
}

.status-pill.success {
  background: #e6f4ed;
  color: #16613f;
}

.status-pill.failed {
  background: #fff1f0;
  color: #8c2929;
}

.status-pill.rolled_back {
  background: #eef2f5;
  color: #607683;
}

.danger-button {
  background: var(--danger);
  color: #fff;
}

.danger-button:hover:not(:disabled) {
  background: #9f302b;
}

.danger-button.small {
  height: 34px;
  padding: 0 12px;
}

.empty-history {
  border: 1px dashed var(--border-strong);
  border-radius: 8px;
  color: var(--text-muted);
  font-weight: 800;
  margin: 0;
  padding: 28px;
  text-align: center;
}

.history-footer,
.history-pager {
  display: flex;
  align-items: center;
  gap: 12px;
}

.history-footer {
  justify-content: space-between;
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 800;
  margin-top: 14px;
}

.history-pager span {
  color: var(--text);
  font-weight: 900;
  min-width: 52px;
  text-align: center;
}

.clear-button.small {
  height: 34px;
  padding: 0 12px;
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

  .history-header {
    flex-direction: column;
  }

  .history-footer {
    align-items: stretch;
    flex-direction: column;
  }

  .history-pager {
    justify-content: center;
  }
}
</style>
