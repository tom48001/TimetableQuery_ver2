<template>
  <main class="import-page">
    <section class="import-intro">
      <h1>{{ tr('Data Import', '資料導入') }}</h1>
    </section>

    <nav class="import-tabs" :aria-label="tr('Import type', '導入類型')">
      <button
        v-if="canImportTimetable"
        type="button"
        :class="{ active: activeTab === 'timetable' }"
        @click="selectTab('timetable')"
      >
        {{ tr('Import Timetable CSV', '導入時間表 CSV') }}
      </button>
      <button
        v-if="canManageStudents"
        type="button"
        :class="{ active: activeTab === 'students' }"
        @click="selectTab('students')"
      >
        {{ tr('Import Student Data CSV / XLSX', '導入學生資料 CSV / XLSX') }}
      </button>
    </nav>

    <section class="import-layout">
      <div class="upload-panel">
        <input
          id="data-import-file"
          ref="fileInput"
          class="file-input"
          type="file"
          :accept="activeTab === 'timetable' ? '.csv,text/csv' : '.csv,.xlsx,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'"
          @change="handleFile"
        />

        <label
          for="data-import-file"
          class="drop-zone"
          :class="{ dragging: dragging, ready: file }"
          @dragenter.prevent="dragging = true"
          @dragover.prevent="dragging = true"
          @dragleave.prevent="dragging = false"
          @drop.prevent="handleDrop"
        >
          <span class="file-mark" aria-hidden="true">CSV</span>
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
          <dl v-if="activeTab === 'timetable'">
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
          <dl v-else>
            <div>
              <dt>{{ tr('Added students', '新增學生') }}</dt>
              <dd>{{ lastImportResult.insertedStudents }}</dd>
            </div>
            <div>
              <dt>{{ tr('Updated students', '更新學生') }}</dt>
              <dd>{{ lastImportResult.updatedStudents }}</dd>
            </div>
            <div>
              <dt>{{ tr('Total rows', '總筆數') }}</dt>
              <dd>{{ lastImportResult.totalRows }}</dd>
            </div>
          </dl>
        </div>
      </div>

      <div class="format-panel">
        <div class="format-header">
          <h2>{{ activeTab === 'timetable' ? tr('Timetable CSV Format', '時間表 CSV 格式') : tr('Student CSV Format', '學生 CSV 格式') }}</h2>
          <button type="button" class="template-button" @click="downloadCsvTemplate">
            {{ tr('Download CSV Template', '下載 CSV 範本') }}
          </button>
        </div>

        <div v-if="activeTab === 'timetable'" class="table-wrap">
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

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>regno</th>
                <th>student_ch_name</th>
                <th>student_eng_name</th>
                <th>email</th>
                <th>class</th>
                <th>class_number</th>
                <th>sex</th>
                <th>status</th>
                <th>ncs</th>
                <th>x1</th>
                <th>x2</th>
                <th>x3</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>20260001</td>
                <td>陳小明</td>
                <td>CHAN SIU MING</td>
                <td>20260001@example.edu.hk</td>
                <td>1A</td>
                <td>01</td>
                <td>M</td>
                <td>active</td>
                <td>No</td>
                <td></td>
                <td></td>
                <td></td>
              </tr>
            </tbody>
          </table>
        </div>

        <ul v-if="activeTab === 'timetable'">
          <li>day: Mon, Tue, Wed, Thu, Fri</li>
          <li>period: Period 1, P1, or 1</li>
          <li>{{ tr('First row must use the field names above.', '第一列必須使用以上欄位名稱。') }}</li>
        </ul>
        <ul v-else>
          <li>{{ tr('REGNO identifies students for add or update.', '系統按 REGNO 新增或更新學生。') }}</li>
          <li>{{ tr('Student import accepts CSV or XLSX.', '學生資料可使用 CSV 或 XLSX。') }}</li>
          <li>{{ tr('sex must be M or F.', 'sex 必須為 M 或 F。') }}</li>
          <li>{{ tr('Students not listed in the CSV will not be deleted.', 'CSV 沒有列出的學生不會被刪除。') }}</li>
        </ul>
      </div>
    </section>

    <section v-if="activeTab === 'timetable' && canImportTimetable" class="history-panel">
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
                <div class="history-actions">
                  <button
                    type="button"
                    class="clear-button small"
                    @click="downloadBatchJson(batch)"
                  >
                    JSON
                  </button>
                  <button
                    type="button"
                    class="danger-button small"
                    :disabled="!canRollback(batch) || rollbackLoading"
                    @click="rollbackBatch(batch)"
                  >
                    {{ tr('Restore', '\u56de\u5fa9') }}
                  </button>
                  <button
                    type="button"
                    class="delete-button small"
                    :disabled="historyLoading || rollbackLoading"
                    @click="deleteBatch(batch)"
                  >
                    {{ tr('Delete', '\u522a\u9664') }}
                  </button>
                </div>
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

    <section v-if="activeTab === 'students' && canManageStudents" class="history-panel">
      <div class="history-header">
        <div>
          <h2>{{ tr('Student Import History', '學生匯入記錄') }}</h2>
          <p>{{ tr('Restore student data to before a successful import.', '可將學生資料回復到某次成功匯入前的版本。') }}</p>
        </div>
        <button type="button" class="clear-button" :disabled="studentHistoryLoading" @click="fetchStudentImportBatches">
          {{ tr('Reload', '重新載入') }}
        </button>
      </div>

      <div class="history-table-wrap">
        <table v-if="studentImportBatches.length" class="history-table">
          <thead>
            <tr>
              <th>{{ tr('Time', '時間') }}</th>
              <th>{{ tr('File', '檔案') }}</th>
              <th>{{ tr('User', '使用者') }}</th>
              <th>{{ tr('Status', '狀態') }}</th>
              <th>{{ tr('Added', '新增') }}</th>
              <th>{{ tr('Updated', '更新') }}</th>
              <th>{{ tr('Snapshot', '備份') }}</th>
              <th>{{ tr('Action', '操作') }}</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="batch in studentImportBatches" :key="batch.batch_id">
              <td>{{ formatDate(batch.created_at) }}</td>
              <td>{{ batch.file_name }}</td>
              <td>{{ batch.imported_by_name || '-' }}</td>
              <td><span class="status-pill" :class="batch.status">{{ statusLabel(batch.status) }}</span></td>
              <td>{{ batch.inserted_rows }}</td>
              <td>{{ batch.updated_rows }}</td>
              <td>{{ batch.snapshot_rows }}</td>
              <td>
                <div class="history-actions">
                  <button type="button" class="clear-button small" @click="downloadStudentBatchJson(batch)">JSON</button>
                  <button
                    type="button"
                    class="danger-button small"
                    :disabled="batch.status !== 'success' || studentRollbackLoading"
                    @click="rollbackStudentBatch(batch)"
                  >
                    {{ tr('Restore', '回復') }}
                  </button>
                  <button
                    type="button"
                    class="delete-button small"
                    :disabled="studentHistoryLoading || studentRollbackLoading"
                    @click="deleteStudentBatch(batch)"
                  >
                    {{ tr('Delete', '刪除') }}
                  </button>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
        <p v-else class="empty-history">
          {{ studentHistoryLoading ? tr('Loading...', '載入中...') : tr('No student import history yet.', '暫時沒有學生匯入記錄。') }}
        </p>
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
  chooseFile: '\u8acb\u9078\u64c7 CSV \u6a94\u6848\u3002',
  csvOnly: '\u8acb\u4e0a\u8f09 .csv \u6a94\u6848\u3002',
  loginFirst: '\u8acb\u5148\u767b\u5165\u518d\u4e0a\u8f09\u3002',
  failed: '\u4e0a\u8f09\u5931\u6557\u3002',
  networkFailed: '\u4e0a\u8f09\u5931\u6557\uff0c\u8acb\u6aa2\u67e5\u4f3a\u670d\u5668\u9023\u7dda\u3002',
  invalidRows: '\u8cc7\u6599\u5217\u6709\u683c\u5f0f\u554f\u984c'
};

export default {
  data() {
    return {
      activeTab: 'timetable',
      permissions: {},
      userRole: '',
      file: null,
      dragging: false,
      uploading: false,
      historyLoading: false,
      rollbackLoading: false,
      studentHistoryLoading: false,
      studentRollbackLoading: false,
      message: '',
      messageType: '',
      lastImportResult: null,
      importBatches: [],
      studentImportBatches: [],
      historyPage: 1,
      historyPageSize: 5,
      text: TEXT
    };
  },
  computed: {
    canImportTimetable() {
      return this.userRole === 'manager' || Boolean(this.permissions.importTimetable);
    },
    canManageStudents() {
      return this.userRole === 'manager' || Boolean(this.permissions.manageStudents);
    },
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
    selectTab(tab) {
      if (tab === 'timetable' && !this.canImportTimetable) return;
      if (tab === 'students' && !this.canManageStudents) return;
      this.activeTab = tab;
      this.clearFile();
      this.message = '';
      this.messageType = '';
      this.lastImportResult = null;
      if (tab === 'timetable') this.fetchImportBatches();
      if (tab === 'students') this.fetchStudentImportBatches();
    },
    setFile(file) {
      this.dragging = false;
      this.message = '';
      this.messageType = '';

      if (!file) return;
      const validFile = this.activeTab === 'timetable'
        ? /\.csv$/i.test(file.name)
        : /\.(csv|xlsx)$/i.test(file.name);
      if (!validFile) {
        this.clearFile();
        this.showMessage(
          this.activeTab === 'timetable'
            ? this.tr('Please upload a .csv file.', TEXT.csvOnly)
            : this.tr('Please upload a .csv or .xlsx file.', '請上載 .csv 或 .xlsx 檔案。'),
          'error'
        );
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
    async fetchStudentImportBatches() {
      const token = localStorage.getItem('token');
      if (!token || !this.canManageStudents) return;
      this.studentHistoryLoading = true;
      try {
        const res = await axios.get('/api/import/students/batches', { headers: this.authHeaders() });
        this.studentImportBatches = res.data;
      } catch (err) {
        console.error('Failed to load student import history:', err);
      } finally {
        this.studentHistoryLoading = false;
      }
    },
    async rollbackBatch(batch) {
      const firstConfirm = confirm(this.tr(
        `Restore timetable to before import? Current timetable will be replaced.`,
        `\u78ba\u5b9a\u8981\u56de\u5fa9\u5230\u532f\u5165\u524d\u7684\u7248\u672c\uff1f\u73fe\u5728\u7684\u6642\u9593\u8868\u6703\u88ab\u53d6\u4ee3\u3002`
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
    async downloadBatchJson(batch) {
      try {
        const res = await axios.get(`/api/import/batches/${batch.batch_id}/json`, { headers: this.authHeaders() });
        const json = JSON.stringify(res.data, null, 2);
        const blob = new Blob([json], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `import_batch_${batch.batch_id}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
      } catch (err) {
        const data = err.response && err.response.data;
        this.showMessage(data && data.message ? data.message : this.tr('Failed to download JSON.', '\u4e0b\u8f09 JSON \u5931\u6557\u3002'), 'error');
      }
    },
    async downloadStudentBatchJson(batch) {
      try {
        const res = await axios.get(`/api/import/students/batches/${batch.batch_id}/json`, { headers: this.authHeaders() });
        this.downloadJson(res.data, `student_import_batch_${batch.batch_id}.json`);
      } catch (err) {
        const data = err.response && err.response.data;
        this.showMessage(data && data.message ? data.message : this.tr('Failed to download JSON.', '下載 JSON 失敗。'), 'error');
      }
    },
    downloadJson(data, filename) {
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    async rollbackStudentBatch(batch) {
      const confirmed = confirm(this.tr(
        'Restore student data to before this import? Newly added students in this batch will be removed.',
        '確定回復到這次匯入前的學生資料？此批次新增的學生會被移除。'
      ));
      if (!confirmed) return;

      this.studentRollbackLoading = true;
      try {
        const res = await axios.post(`/api/import/students/rollback/${batch.batch_id}`, {}, { headers: this.authHeaders() });
        this.showMessage([
          res.data.message,
          `Restored rows: ${res.data.restoredRows}`,
          `Removed rows: ${res.data.removedRows}`
        ].join('\n'), 'success');
        await this.fetchStudentImportBatches();
      } catch (err) {
        const data = err.response && err.response.data;
        this.showMessage(data && data.message ? data.message : this.tr('Restore failed.', '回復失敗。'), 'error');
      } finally {
        this.studentRollbackLoading = false;
      }
    },
    async deleteStudentBatch(batch) {
      if (!confirm(this.tr(
        'Delete student import history? Current student data will not change.',
        '確定刪除學生匯入記錄？現有學生資料不會改變。'
      ))) return;

      try {
        await axios.delete(`/api/import/students/batches/${batch.batch_id}`, { headers: this.authHeaders() });
        await this.fetchStudentImportBatches();
      } catch (err) {
        const data = err.response && err.response.data;
        this.showMessage(data && data.message ? data.message : this.tr('Delete failed.', '刪除失敗。'), 'error');
      }
    },
    downloadCsvTemplate() {
      const timetableRows = [
        'teacher,subject,class,room,day,period',
        'T001,ENG,1A,101,Mon,Period 1'
      ];
      const studentRows = [
        'regno,student_ch_name,student_eng_name,email,class,class_number,sex,status,ncs,x1,x2,x3',
        '20260001,陳小明,CHAN SIU MING,20260001@example.edu.hk,1A,01,M,active,No,,,'
      ];
      const csv = (this.activeTab === 'timetable' ? timetableRows : studentRows).join('\r\n');
      const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = this.activeTab === 'timetable'
        ? 'timetable_template.csv'
        : 'student_template.csv';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    async deleteBatch(batch) {
      const confirmed = confirm(this.tr(
        `Delete import history? This only deletes the record and snapshot not the current timetable.`,
        `\u78ba\u5b9a\u522a\u9664\u532f\u5165\u8a18\u9304\uff1f\u9019\u53ea\u6703\u522a\u9664\u8a18\u9304\u548c\u5099\u4efd\uff0c\u4e0d\u6703\u6539\u8b8a\u73fe\u5728\u7684\u6642\u9593\u8868\u3002`
      ));
      if (!confirmed) return;

      try {
        await axios.delete(`/api/import/batches/${batch.batch_id}`, { headers: this.authHeaders() });
        this.showMessage(this.tr('Import history deleted.', '\u532f\u5165\u8a18\u9304\u5df2\u522a\u9664\u3002'), 'success');
        await this.fetchImportBatches();
      } catch (err) {
        const data = err.response && err.response.data;
        this.showMessage(data && data.message ? data.message : this.tr('Failed to delete import history.', '\u522a\u9664\u532f\u5165\u8a18\u9304\u5931\u6557\u3002'), 'error');
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
        this.formatList('Duplicate student_id', data.duplicateStudentIds),
        this.formatList('Duplicate REGNO', data.duplicateRegnos),
        this.formatList('Duplicate email', data.duplicateEmails),
        this.formatList('Duplicate class number', data.duplicateClassNumbers),
        this.formatList('Missing elective', data.missingElectives),
        this.formatInvalidRows(data.invalidRows)
      ].filter(Boolean);

      return parts.join('\n\n');
    },
    async uploadFile() {
      if (!this.file) {
        this.showMessage(this.tr('Please choose a CSV file.', TEXT.chooseFile), 'error');
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
        const endpoint = this.activeTab === 'timetable'
          ? '/api/import/csv'
          : '/api/import/students/file';
        const res = await axios.post(
          endpoint,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              'Content-Type': 'multipart/form-data'
            }
          }
        );

        const resultLines = this.activeTab === 'timetable'
          ? [
            res.data.message,
            `Batch ID: ${res.data.batchId}`,
            `Imported rows: ${res.data.insertedTimetable}`,
            `Skipped rows: ${res.data.skippedRows}`,
            `Snapshot rows: ${res.data.snapshotRows}`
          ]
          : [
            res.data.message,
            `Added students: ${res.data.insertedStudents}`,
            `Updated students: ${res.data.updatedStudents}`,
            `Total rows: ${res.data.totalRows}`
          ];
        this.showMessage(resultLines.join('\n'), 'success');
        this.lastImportResult = res.data;
        this.clearFile();
        if (this.activeTab === 'timetable') {
          await this.fetchImportBatches();
        } else {
          await this.fetchStudentImportBatches();
        }
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
    const rawUser = localStorage.getItem('user');
    if (rawUser) {
      try {
        const user = JSON.parse(rawUser);
        this.userRole = String(user.role || '').trim().toLowerCase();
        this.permissions = user.permissions || {};
      } catch (error) {
        console.error('Failed to read import permissions:', error);
      }
    }

    if (!this.canImportTimetable && this.canManageStudents) {
      this.activeTab = 'students';
    }
    if (this.canImportTimetable) this.fetchImportBatches();
    if (this.canManageStudents) this.fetchStudentImportBatches();
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

.import-tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 20px;
  border-bottom: 1px solid var(--border);
}

.import-tabs button {
  height: 46px;
  border: 1px solid transparent;
  border-bottom: 3px solid transparent;
  border-radius: 6px 6px 0 0;
  background: transparent;
  color: var(--text-muted);
}

.import-tabs button:hover {
  background: var(--surface-soft);
  color: var(--text);
}

.import-tabs button.active {
  border-bottom-color: var(--primary);
  background: var(--primary-soft);
  color: var(--primary-dark);
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

.format-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 14px;
  margin-bottom: 16px;
}

.format-header h2 {
  margin: 0;
}

.template-button {
  height: 40px;
  border: 1px solid var(--primary);
  background: var(--primary-soft);
  color: var(--primary-dark);
  padding: 0 14px;
}

.template-button:hover {
  background: #e0f1f2;
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

.history-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.delete-button {
  background: #7f1d1d;
  color: #fff;
}

.delete-button:hover:not(:disabled) {
  background: #631616;
}

.danger-button.small,
.delete-button.small {
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
