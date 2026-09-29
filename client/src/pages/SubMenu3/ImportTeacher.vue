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
        {{ tr('Import Timetable CSV/Excel', '導入時間表 CSV/Excel') }}
      </button>
      <button
        v-if="canManageStudents"
        type="button"
        :class="{ active: activeTab === 'students' }"
        @click="selectTab('students')"
      >
        {{ tr('Import Student Data CSV/Excel', '導入學生資料 CSV/Excel') }}
      </button>
    </nav>

    <section class="import-layout">
      <div class="upload-panel">
        <div class="panel-heading">
          <h2>{{ tr('Upload File', '上傳檔案') }}</h2>
          <p>{{ tr('Drag and drop or choose a CSV or Excel file', '請拖放或點擊選擇 CSV 或 Excel 檔案') }}</p>
        </div>
        <input
          id="data-import-file"
          ref="fileInput"
          class="file-input"
          type="file"
          :accept="acceptedFileTypes"
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
          <strong v-if="file">{{ file.name }}</strong>
          <strong v-else>{{ tr('No file selected', '未選擇檔案') }}</strong>
          <span v-if="file" class="file-meta">{{ fileSize }}</span>
          <span v-else class="file-meta">{{ tr('No file selected', '未選擇檔案') }}</span>
          <span class="pick-file">{{ tr('Choose file', '選擇檔案') }}</span>
        </label>

        <div class="upload-actions">
          <button
          type="button"
          class="upload-button"
          :disabled="!file || uploading"
          @click="uploadFile"
        >
            {{ uploadButtonLabel }}
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
          <div>
            <h2>{{ activeTab === 'timetable' ? tr('Timetable CSV/Excel Format', '時間表 CSV/Excel 格式') : tr('Student CSV/Excel Format', '學生 CSV/Excel 格式') }}</h2>
            <p>{{ tr('Make sure your file follows this format', '請確保你的檔案符合以下格式') }}</p>
          </div>
          <button type="button" class="template-button" @click="downloadCsvTemplate">
            {{ tr('Download Template', '下載範本') }}
          </button>
        </div>

        <div v-if="activeTab === 'timetable'" class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Abbreviation</th>
                <th>Teacher</th>
                <th>Class</th>
                <th>Subject</th>
                <th>Weekday</th>
                <th>Period</th>
                <th>Start Time</th>
                <th>End Time</th>
                <th>Room</th>
                <th>Details</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>CWK</td>
                <td>CHAN WAI KIT</td>
                <td>1Y</td>
                <td>ENG</td>
                <td>星期一</td>
                <td>11</td>
                <td>14:50</td>
                <td>15:25</td>
                <td>705</td>
                <td>Group1</td>
              </tr>
              <tr>
                <td>LCW</td>
                <td>LEE CHI WAI</td>
                <td>1Y</td>
                <td>ENG</td>
                <td>星期一</td>
                <td>12</td>
                <td>15:25</td>
                <td>16:00</td>
                <td>705</td>
                <td>Group2</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div v-else class="table-wrap">
          <table>
            <thead>
              <tr>
                <th>REGNO</th>
                <th>級別</th>
                <th>班別</th>
                <th>學號</th>
                <th>姓名</th>
                <th>ENNAME</th>
                <th>SEX</th>
                <th>Email</th>
                <th>NCS</th>
                <th>Status</th>
                <th>X1</th>
                <th>X2</th>
                <th>X3/M1/APL/OL</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>20260001</td>
                <td>S4</td>
                <td>A</td>
                <td>1</td>
                <td>陳小明</td>
                <td>CHAN SIU MING</td>
                <td>M</td>
                <td>s20260001@school.edu.hk</td>
                <td>No</td>
                <td>正常</td>
                <td>PHY</td>
                <td>CHEM</td>
                <td>Math(M1)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <ul v-if="activeTab === 'timetable'">
          <li>{{ tr('Timetable import accepts CSV or Excel. Excel can contain multiple sheets.', '時間表可接受 CSV 或 Excel；Excel 可以有多個工作表。') }}</li>
          <li>{{ tr('Abbreviation must be the unique teacher code stored in the system; the Teacher column is the teacher name.', 'Abbreviation 必須填寫系統內唯一的老師代碼；Teacher 欄填寫老師姓名。') }}</li>
          <li>day: Mon, Tue, Wed, Thu, Fri</li>
          <li>period: Period 1, P1, or 1</li>
          <li>{{ tr('Each sheet must contain the field names above in its header row.', '每個工作表的標題列必須包含以上欄位名稱。') }}</li>
          <li>{{ tr('Group worksheets in the existing horizontal two-column format are detected automatically.', '同一活頁簿內的橫向雙欄分組工作表會自動識別。') }}</li>
        </ul>

        <div v-if="activeTab === 'timetable'" class="group-sample">
          <h3>{{ tr('Group worksheet sample', '分組工作表範例') }}</h3>
          <p>{{ tr('Name the worksheet Grade_Subject, for example S6_STEM, S1_Eng, or S5_中文.', '工作表名稱使用「年級_科目」，例如 S6_STEM、S1_Eng 或 S5_中文。') }}</p>
          <div class="table-wrap">
            <table>
              <thead><tr><th>Group 1</th><th></th><th>Group 2</th><th></th><th class="empty-column"></th><th>Group 3</th><th></th></tr></thead>
              <tbody>
                <tr><td>劉明欣</td><td>6Y02</td><td>陳美軒</td><td>6Y03</td><td></td><td>何嘉欣</td><td>6Y01</td></tr>
                <tr><td>HO GRACE</td><td>6Y04</td><td>LEE MARY</td><td>6Y05</td><td></td><td></td><td></td></tr>
              </tbody>
            </table>
          </div>
          <ul>
            <li>{{ tr('The worksheet name identifies the timetable grade and subject; Eng alone is not enough.', '系統按工作表名稱識別時間表的年級及科目；只寫 Eng 並不足夠。') }}</li>
            <li>{{ tr('Each group occupies two columns. Name + student ID and student ID + name are both accepted.', '每組佔兩欄；「姓名＋學生編號」或「學生編號＋姓名」兩種次序都接受。') }}</li>
            <li>{{ tr('Groups may begin in any column, with one or more empty columns between them.', '分組可由任何欄開始，組與組之間可有一欄或多欄空白。') }}</li>
            <li>{{ tr('Accepted headers include Group1, Group 1, 第一組, 第二組 and so on.', '組別標題可使用 Group1、Group 1、第一組、第二組等。') }}</li>
            <li>{{ tr('Student IDs use class plus student number, such as 1Y04; leading zeros are preserved.', '學生編號使用班別＋學號，例如 1Y04；學號開首的 0 會保留。') }}</li>
            <li>{{ tr('Group 1, 2, 3 are matched in order to the same number of timetable lesson groups.', 'Group 1、2、3會按次序配對時間表內相同數量的小組課堂。') }}</li>
            <li>{{ tr('Use a different valid Abbreviation for each teacher group, and optionally write Group1, Group2, etc. in Details for clarity.', '每個老師小組必須使用不同且有效的 Abbreviation；亦可在 Details 填寫 Group1、Group2 等，方便辨認。') }}</li>
            <li>{{ tr('The same student may belong to different groups in different subject worksheets.', '同一學生可在不同科目的工作表屬於不同組別。') }}</li>
          </ul>
        </div>
        <ul v-else>
          <li>{{ tr('REGNO identifies students for add or update.', '系統按 REGNO 新增或更新學生。') }}</li>
          <li>{{ tr('Student import accepts CSV or Excel (.xlsx/.xls).', '學生資料可接受 CSV 或 Excel（.xlsx/.xls）。') }}</li>
          <li>{{ tr('sex must be M or F.', 'sex 必須為 M 或 F。') }}</li>
          <li>{{ tr('Students not listed in the uploaded file will not be deleted.', '上傳檔案沒有列出的學生不會被刪除。') }}</li>
        </ul>
      </div>
    </section>

    <section v-if="activeTab === 'timetable' && groupPreview" class="history-panel group-preview-panel">
      <div class="history-header">
        <div>
          <h2>{{ tr('Import Preview', '導入預覽') }}</h2>
          <p>{{ tr('Review every record before saving.', '儲存前請檢查每項記錄。') }}</p>
        </div>
        <div class="preview-actions">
          <button v-if="groupPreview.issues && groupPreview.issues.length" type="button" class="clear-button" @click="downloadGroupErrorReport">
            {{ tr('Download Error Report', '下載錯誤報告') }}
          </button>
          <button type="button" class="template-button" :disabled="groupPreview.hasFatalErrors || !groupPreviewCount('importable') || savingGroup" @click="saveGroupImport">
            {{ savingGroup ? tr('Importing...', '導入中...') : (groupPreviewCount('skipped') ? tr('Import Valid Records Only', '只導入有效資料') : tr('Import Timetable and Groups', '導入時間表及分組')) }}
          </button>
        </div>
      </div>
      <div class="group-preview-summary">
        <div class="summary-item valid"><strong>{{ groupPreviewCount('valid') }}</strong><span>{{ tr('Ready', '可導入') }}</span></div>
        <div class="summary-item warning"><strong>{{ groupPreviewCount('warning') }}</strong><span>{{ tr('Warnings (will import)', '警告（仍會導入）') }}</span></div>
        <div class="summary-item error"><strong>{{ groupPreviewCount('skipped') }}</strong><span>{{ tr('Errors (will skip)', '錯誤（將跳過）') }}</span></div>
      </div>
      <p v-if="groupPreview.hasFatalErrors" class="fatal-import-message">
        {{ tr('A structural or group conflict was found. Fix the affected worksheet before importing.', '發現結構或分組衝突，請先修正受影響的工作表，暫不能導入。') }}
      </p>
      <p v-else-if="groupPreviewCount('skipped')" class="partial-import-message">
        {{ tr('Valid records can be imported. Error rows shown below will be skipped.', '可以只導入有效資料；下列錯誤資料將會跳過。') }}
      </p>
      <div class="preview-toolbar">
        <div>
          <span class="preview-toolbar-label">{{ tr('Show records', '顯示記錄') }}</span>
          <div class="preview-filter" role="group" :aria-label="tr('Preview filter', '預覽篩選')">
            <button type="button" class="preview-filter-button" :class="{ active: previewFilter === 'all' }" @click="setPreviewFilter('all')">
              {{ tr('All', '全部') }} ({{ groupPreview.records.length }})
            </button>
            <button type="button" class="preview-filter-button" :class="{ active: previewFilter === 'warning' }" @click="setPreviewFilter('warning')">
              {{ tr('Warnings', '警告') }} ({{ groupPreviewCount('warning') }})
            </button>
            <button type="button" class="preview-filter-button" :class="{ active: previewFilter === 'error' }" @click="setPreviewFilter('error')">
              {{ tr('Errors', '錯誤') }} ({{ groupPreviewCount('skipped') }})
            </button>
          </div>
        </div>
        <strong class="preview-toolbar-range">{{ previewRangeLabel }}</strong>
      </div>
      <div class="history-table-wrap">
        <table class="history-table">
          <thead><tr><th>{{ tr('Grade', '年級') }}</th><th>{{ tr('Subject', '科目') }}</th><th>{{ tr('Group', '組別') }}</th><th>{{ tr('Class / No.', '班別／學號') }}</th><th>{{ tr('Chinese name', '中文姓名') }}</th><th>{{ tr('English name', '英文姓名') }}</th><th>{{ tr('Status', '狀態') }}</th><th>{{ tr('Message', '訊息') }}</th></tr></thead>
          <tbody>
            <tr v-for="record in paginatedGroupRecords" :key="`${record.gradeLevel}-${record.subjectCode}-${record.studentKey}`">
              <td>{{ record.gradeLevel || '-' }}</td><td>{{ record.subjectCode || '-' }}</td><td>{{ record.groupCode }}</td><td>{{ record.studentKey }}</td><td>{{ record.nameZh || '-' }}</td><td>{{ record.nameEn || '-' }}</td>
              <td><span class="status-pill" :class="record.validationStatus">{{ validationStatusLabel(record.validationStatus) }}</span></td>
              <td>{{ record.messages.length ? record.messages.join(' ') : tr('Ready', '可導入') }}</td>
            </tr>
            <tr v-for="(issue, index) in visibleUnlinkedGroupIssues" :key="`issue-${index}`">
              <td>-</td><td>-</td><td>{{ issue.groupCode || '-' }}</td><td>{{ issue.studentKey || '-' }}</td><td>-</td><td>-</td><td><span class="status-pill error">{{ tr('Error', '錯誤') }}</span></td><td>{{ issue.message }}</td>
            </tr>
            <tr v-if="!paginatedGroupRecords.length && !visibleUnlinkedGroupIssues.length">
              <td colspan="8" class="empty-preview">{{ tr('No records match this filter.', '沒有符合此篩選的記錄。') }}</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div v-if="filteredGroupRecords.length" class="history-footer preview-footer">
        <span>{{ tr('Page', '頁數') }} {{ previewPage }} / {{ previewTotalPages }}</span>
        <div class="history-pager">
          <button type="button" class="clear-button small" :disabled="previewPage === 1" @click="previewPage -= 1">
            {{ tr('Previous', '上一頁') }}
          </button>
          <button type="button" class="clear-button small" :disabled="previewPage === previewTotalPages" @click="previewPage += 1">
            {{ tr('Next', '下一頁') }}
          </button>
        </div>
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
  chooseFile: '\u8acb\u9078\u64c7\u6a94\u6848\u3002',
  studentFileOnly: '\u8acb\u4e0a\u8f09 .csv\u3001.xlsx \u6216 .xls \u6a94\u6848\u3002',
  timetableFileOnly: '\u8acb\u4e0a\u8f09 .csv\u3001.xlsx \u6216 .xls \u6a94\u6848\u3002',
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
      importStage: '',
      uploadProgress: 0,
      historyLoading: false,
      rollbackLoading: false,
      studentHistoryLoading: false,
      studentRollbackLoading: false,
      savingGroup: false,
      groupPreview: null,
      previewFilter: 'all',
      previewPage: 1,
      previewPageSize: 10,
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
    acceptedFileTypes() {
      return '.csv,.xlsx,.xls,text/csv,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel';
    },
    fileTypeLabel() {
      return 'CSV/XLSX';
    },
    uploadButtonLabel() {
      if (this.importStage === 'uploading') {
        return this.tr(`Uploading ${this.uploadProgress}%...`, `上傳中 ${this.uploadProgress}%...`);
      }
      if (this.importStage === 'previewing') return this.tr('Checking worksheets...', '正在檢查工作表...');
      if (this.importStage === 'processing') return this.tr('Validating and saving...', '正在驗證及儲存...');
      return this.tr('Start Import', '開始導入');
    },
    unlinkedGroupIssues() {
      if (!this.groupPreview) return [];
      const recordKeys = new Set(this.groupPreview.records.map(record => record.studentKey));
      return this.groupPreview.issues.filter(issue => issue.affectsRecord === false || !recordKeys.has(issue.studentKey));
    },
    visibleUnlinkedGroupIssues() {
      return this.previewFilter === 'warning' ? [] : this.unlinkedGroupIssues;
    },
    filteredGroupRecords() {
      if (!this.groupPreview) return [];
      if (this.previewFilter === 'all') return this.groupPreview.records;
      return this.groupPreview.records.filter(record => record.validationStatus === this.previewFilter);
    },
    previewTotalPages() {
      return Math.max(1, Math.ceil(this.filteredGroupRecords.length / this.previewPageSize));
    },
    paginatedGroupRecords() {
      const page = Math.min(this.previewPage, this.previewTotalPages);
      const start = (page - 1) * this.previewPageSize;
      return this.filteredGroupRecords.slice(start, start + this.previewPageSize);
    },
    previewRangeLabel() {
      if (!this.filteredGroupRecords.length) return this.tr('No records', '沒有記錄');
      const page = Math.min(this.previewPage, this.previewTotalPages);
      const start = (page - 1) * this.previewPageSize + 1;
      const end = Math.min(start + this.previewPageSize - 1, this.filteredGroupRecords.length);
      return `${start}-${end} / ${this.filteredGroupRecords.length}`;
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
      if (!this.importBatches.length) return this.tr('No records', '沒有記錄');
      const page = Math.min(this.historyPage, this.historyTotalPages);
      const start = (page - 1) * this.historyPageSize + 1;
      const end = Math.min(start + this.historyPageSize - 1, this.importBatches.length);
      return `${start}-${end} / ${this.importBatches.length}`;
    }
  },
  methods: {
    tr(en, zh) {
      return this.$lang.locale === 'en' ? en : zh;
    },
    setPreviewFilter(filter) {
      this.previewFilter = filter;
      this.previewPage = 1;
    },
    selectTab(tab) {
      if (tab === 'timetable' && !this.canImportTimetable) return;
      if (tab === 'students' && !this.canManageStudents) return;
      this.activeTab = tab;
      this.clearFile();
      this.message = '';
      this.messageType = '';
      this.lastImportResult = null;
      this.groupPreview = null;
      this.previewFilter = 'all';
      this.previewPage = 1;
      if (tab === 'timetable') this.fetchImportBatches();
      if (tab === 'students') this.fetchStudentImportBatches();
    },
    setFile(file) {
      this.dragging = false;
      this.message = '';
      this.messageType = '';
      this.groupPreview = null;
      this.previewFilter = 'all';
      this.previewPage = 1;

      if (!file) return;
      const validFile = /\.(csv|xlsx|xls)$/i.test(file.name);
      if (!validFile) {
        this.clearFile();
        this.showMessage(
          this.activeTab !== 'students'
            ? this.tr('Please upload a .csv, .xlsx, or .xls file.', TEXT.timetableFileOnly)
            : this.tr('Please upload a .csv, .xlsx, or .xls file.', TEXT.studentFileOnly),
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
    validationStatusLabel(status) {
      const labels = {
        valid: this.tr('Valid', '有效'),
        warning: this.tr('Warning', '警告'),
        error: this.tr('Error', '錯誤')
      };
      return labels[status] || status;
    },
    groupPreviewCount(key) {
      return Number((this.groupPreview && this.groupPreview.counts && this.groupPreview.counts[key]) || 0);
    },
    downloadGroupErrorReport() {
      if (!this.groupPreview || !Array.isArray(this.groupPreview.issues)) return;
      const csvCell = value => `"${String(value === undefined || value === null ? '' : value).replace(/"/g, '""')}"`;
      const rows = [
        ['Severity', 'Scope', 'Worksheet', 'Row', 'Grade', 'Subject', 'Group', 'Student ID', 'Message'],
        ...this.groupPreview.issues.map(issue => [
          issue.severity,
          issue.scope || 'row',
          issue.sheetName || '',
          issue.row || '',
          issue.gradeLevel || '',
          issue.subjectCode || '',
          issue.groupCode || '',
          issue.studentKey || '',
          issue.message || ''
        ])
      ];
      const blob = new Blob([`\uFEFF${rows.map(row => row.map(csvCell).join(',')).join('\n')}`], { type: 'text/csv;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `group-import-errors-${new Date().toISOString().slice(0, 10)}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    },
    showMessage(message, type) {
      this.message = message;
      this.messageType = type;
    },
    authHeaders() {
      const token = localStorage.getItem('token');
      return { Authorization: `Bearer ${token}` };
    },
    importRequestConfig(token, nextStage = 'processing') {
      return {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' },
        onUploadProgress: event => {
          if (!event.total) return;
          this.uploadProgress = Math.min(100, Math.round((event.loaded * 100) / event.total));
          this.importStage = this.uploadProgress >= 100 ? nextStage : 'uploading';
        }
      };
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
        'Abbreviation,Teacher,Class,Subject,Weekday,Period,Start Time,End Time,Room,Details',
        'CWK,CHAN WAI KIT,1Y,ENG,星期一,11,14:50,15:25,705,Group1',
        'LCW,LEE CHI WAI,1Y,ENG,星期一,12,15:25,16:00,705,Group2'
      ];
      const studentRows = [
        'REGNO,級別,班別,學號,ClsNo,姓名,ENNAME,SEX,社別,Email,NCS,Status,語言組別,X1,X2,X3/M1/APL/OL,SUPP CLASS,數學/Maths,公社,退選科目,備註',
        '20260001,S4,A,1,1,陳小明,CHAN SIU MING,M,Red,s20260001@school.edu.hk,N,正常,,PHY,CHEM,Math(M1),,,,,',
        '20260002,S4,A,2,2,李美玲,LEE MEI LING,F,Blue,s20260002@school.edu.hk,Y,正常,,BIO,ECON,JAP,,,,,'
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
        this.formatList('Group validation', (data.issues || []).map(issue => issue.message)),
        this.formatList('Worksheet / timetable matching', data.contextErrors),
        this.formatList('Students not found', (data.missingStudents || []).map(issue => issue.message)),
        this.formatInvalidRows(data.invalidRows)
      ].filter(Boolean);

      return parts.join('\n\n');
    },
    async uploadFile() {
      if (!this.file) {
        this.showMessage(this.tr('Please choose a file.', TEXT.chooseFile), 'error');
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
      this.importStage = 'uploading';
      this.uploadProgress = 0;

      try {
        const isExcelTimetable = this.activeTab === 'timetable' && /\.(xlsx|xls)$/i.test(this.file.name);
        if (isExcelTimetable && this.canManageStudents && !this.groupPreview) {
          const previewRes = await axios.post(
            '/api/import/groups/preview',
            formData,
            this.importRequestConfig(token, 'previewing')
          );
          if (previewRes.data.hasGroups) {
            this.groupPreview = previewRes.data;
            this.previewFilter = 'all';
            this.previewPage = 1;
            this.showMessage(this.tr('Group worksheets found. Review the preview below before importing the timetable.', '找到分組工作表，請先檢查下方預覽再導入時間表。'), 'success');
            return;
          }
        }
        const endpoint = this.activeTab === 'timetable'
          ? '/api/import/csv'
          : '/api/import/students/file';
        this.importStage = 'uploading';
        this.uploadProgress = 0;
        const res = await axios.post(
          endpoint,
          formData,
          this.importRequestConfig(token)
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
          if (this.activeTab === 'timetable' && Array.isArray(err.response.data.records)) {
            this.groupPreview = err.response.data;
          }
          this.showMessage(this.buildErrorMessage(err.response.data), 'error');
        } else {
          this.showMessage(this.tr('Upload failed. Please check the server connection.', TEXT.networkFailed), 'error');
        }
      } finally {
        this.uploading = false;
        this.importStage = '';
        this.uploadProgress = 0;
      }
    },
    async saveGroupImport() {
      if (!this.groupPreview || this.groupPreview.hasFatalErrors || !this.groupPreviewCount('importable')) return;
      const skipped = this.groupPreviewCount('skipped');
      if (skipped) {
        const confirmed = window.confirm(this.tr(
          `${skipped} invalid record(s) will not be imported. Continue with the valid records?`,
          `有 ${skipped} 筆錯誤資料不會導入，是否繼續導入其餘有效資料？`
        ));
        if (!confirmed) return;
      }
      this.savingGroup = true;
      try {
        const formData = new FormData();
        formData.append('file', this.file);
        const timetableRes = await axios.post('/api/import/csv', formData, {
          headers: { ...this.authHeaders(), 'Content-Type': 'multipart/form-data' }
        });
        const groupRes = await axios.post('/api/import/groups/save', { records: this.groupPreview.records }, { headers: this.authHeaders() });
        this.lastImportResult = timetableRes.data;
        const resultLines = [
          timetableRes.data.message,
          groupRes.data.message,
          `${this.tr('Imported group rows', '已導入分組資料')}: ${groupRes.data.updatedRows}`,
          `${this.tr('Skipped group rows', '已跳過分組資料')}: ${Number(groupRes.data.skippedRows || 0)}`,
          this.formatList(this.tr('Unmatched worksheets', '未能配對的工作表'), groupRes.data.contextErrors),
          this.formatList(this.tr('Students not found', '找不到的學生'), (groupRes.data.missingStudents || []).map(issue => issue.message))
        ].filter(Boolean);
        this.showMessage(resultLines.join('\n'), 'success');
        this.groupPreview = null;
        this.clearFile();
        await this.fetchImportBatches();
      } catch (err) {
        const data = err.response && err.response.data;
        this.showMessage(data ? this.buildErrorMessage(data) : this.tr('Save failed. Please check the server connection.', '儲存失敗，請檢查伺服器連線。'), 'error');
      } finally {
        this.savingGroup = false;
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

/* Modern import page layout */
.import-page {
  background: #f8f9ff;
  box-sizing: border-box;
  color: #0b1c30;
  font-family: "Hanken Grotesk", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  margin: 0 auto;
  max-width: 1160px;
  min-height: calc(100vh - 130px);
  padding: 36px 22px 64px;
}

.import-intro {
  margin: 0 0 24px;
  max-width: none;
  text-align: left;
}

h1 {
  color: #0b1c30;
  font-size: 32px;
  font-weight: 900;
  letter-spacing: -0.02em;
  line-height: 1.1;
  margin: 0;
  text-align: left;
}

.import-tabs {
  background: #eaf0f8;
  border: 0;
  border-radius: 12px;
  display: inline-flex;
  gap: 4px;
  margin-bottom: 38px;
  padding: 4px;
}

.import-tabs button {
  background: transparent;
  border: 0;
  border-radius: 9px;
  color: #4e616f;
  font-size: 15px;
  font-weight: 900;
  height: 44px;
  padding: 0 28px;
}

.import-tabs button:hover {
  background: rgba(255, 255, 255, 0.55);
  color: #005454;
}

.import-tabs button.active {
  background: #ffffff;
  border: 1px solid #dce6ef;
  box-shadow: 0 2px 8px rgba(15, 35, 52, 0.06);
  color: #005454;
}

.import-layout {
  align-items: stretch;
  display: grid;
  gap: 38px;
  grid-template-columns: minmax(360px, 1fr) minmax(420px, 1fr);
}

.upload-panel,
.format-panel,
.history-panel {
  background: #ffffff;
  border: 1px solid #dbe5ef;
  border-radius: 12px;
  box-shadow: 0 3px 12px rgba(15, 35, 52, 0.04);
}

.upload-panel,
.format-panel {
  min-height: 470px;
  padding: 38px;
}

.panel-heading {
  margin-bottom: 26px;
}

.panel-heading h2,
.format-header h2,
.history-header h2,
.batch-result h2 {
  color: #0b1c30;
  font-size: 22px;
  font-weight: 900;
  letter-spacing: 0;
  line-height: 1.2;
  margin: 0;
}

.panel-heading p,
.format-header p,
.history-header p {
  color: #4e616f;
  font-size: 15px;
  font-weight: 700;
  margin: 6px 0 0;
}

.drop-zone {
  background: #ffffff;
  border: 2px dashed #c9d8e8;
  border-radius: 10px;
  color: #0b1c30;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 300px;
  padding: 22px;
  text-align: center;
}

.drop-zone.dragging,
.drop-zone:hover {
  background: #f7fbff;
  border-color: #0b7787;
  transform: none;
}

.drop-zone.ready {
  background: #f2fbf6;
  border-color: #0b7787;
  border-style: solid;
}

.file-mark {
  align-items: center;
  background: #e7eff0;
  border-radius: 999px;
  color: #0b7787;
  display: inline-flex;
  font-size: 0;
  font-weight: 900;
  height: 68px;
  justify-content: center;
  min-width: 0;
  padding: 0;
  width: 68px;
}

.file-mark::before {
  background: currentColor;
  content: "";
  height: 34px;
  width: 34px;
  -webkit-mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 16l-4-4-4 4'/%3E%3Cpath d='M12 12v9'/%3E%3Cpath d='M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3'/%3E%3Cpath d='M16 21h1a4 4 0 0 0 0-8h-.6'/%3E%3Cpath d='M8 21H7a4 4 0 0 1 0-8h.6'/%3E%3C/svg%3E") center / contain no-repeat;
  mask: url("data:image/svg+xml,%3Csvg viewBox='0 0 24 24' fill='none' stroke='black' stroke-width='2.4' stroke-linecap='round' stroke-linejoin='round' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M16 16l-4-4-4 4'/%3E%3Cpath d='M12 12v9'/%3E%3Cpath d='M20.39 18.39A5 5 0 0 0 18 9h-1.26A8 8 0 1 0 3 16.3'/%3E%3Cpath d='M16 21h1a4 4 0 0 0 0-8h-.6'/%3E%3Cpath d='M8 21H7a4 4 0 0 1 0-8h.6'/%3E%3C/svg%3E") center / contain no-repeat;
}

.drop-zone strong {
  color: #0b1c30;
  font-size: 20px;
  font-weight: 900;
  line-height: 1.3;
  max-width: 100%;
  overflow-wrap: break-word;
  padding: 0;
}

.file-meta {
  color: #4e616f;
  font-size: 15px;
  font-weight: 700;
}

.pick-file {
  background: #ffffff;
  border: 1px solid #dbe5ef;
  border-radius: 8px;
  color: #0b1c30;
  display: inline-flex;
  font-weight: 900;
  margin-top: 6px;
  padding: 13px 34px;
}

.upload-actions {
  display: flex;
  gap: 12px;
  margin-top: 36px;
  min-height: 54px;
}

button {
  border: 0;
  border-radius: 8px;
  cursor: pointer;
  font-size: 15px;
  font-weight: 900;
  height: 48px;
  margin: 0;
  padding: 0 20px;
}

.upload-button {
  background: #0b7787;
  color: #ffffff;
  flex: 1;
}

.upload-button::before {
  content: none;
}

.upload-button:hover:not(:disabled),
.template-button:hover {
  background: #00616d;
}

.clear-button,
.template-button {
  background: #e7eff0;
  border: 0;
  color: #005454;
}

.template-button {
  background: #0b7787;
  color: #ffffff;
  flex: 0 0 auto;
  height: 50px;
  padding: 0 24px;
}

.template-button::before {
  content: none;
}

button:disabled {
  background: #dce4ee;
  color: #8a9aaa;
  cursor: not-allowed;
}

.format-header {
  align-items: flex-start;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  margin-bottom: 30px;
}

.table-wrap {
  border: 1px solid #edf2f7;
  border-radius: 8px;
  overflow-x: auto;
}

table {
  background: #ffffff;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 480px;
  width: 100%;
}

th,
td {
  border-bottom: 1px solid #edf2f7;
  color: #0b1c30;
  padding: 18px 20px;
  text-align: left;
  vertical-align: middle;
  white-space: nowrap;
}

th {
  background: #f7f9fd;
  color: #0b1c30;
  font-weight: 900;
}

td {
  color: #173044;
  font-weight: 700;
}

ul {
  background: #eff5ff;
  border: 0;
  border-left: 4px solid #3b82f6;
  border-radius: 8px;
  color: #1d4ed8;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.8;
  list-style-position: inside;
  margin: 28px 0 0;
  padding: 18px 20px;
}

.message,
.batch-result {
  border: 1px solid #dbe5ef;
  border-radius: 10px;
  margin: 18px 0 0;
}

.message {
  background: #f7f9fd;
  color: #173044;
  line-height: 1.5;
  min-height: auto;
  padding: 16px;
  white-space: pre-wrap;
}

.message.success {
  background: #eefaf3;
  border-color: #b8e2c8;
  color: #16613f;
}

.message.error {
  background: #fff1f0;
  border-color: #f0b8b8;
  color: #8c2929;
}

.batch-result {
  background: #fbfdff;
  padding: 18px;
}

.batch-result h2 {
  font-size: 18px;
  margin-bottom: 14px;
}

.batch-result dl {
  display: grid;
  gap: 10px;
  margin: 0;
}

.batch-result dl div {
  border-bottom: 1px solid #edf2f7;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding-bottom: 10px;
}

.batch-result dl div:last-child {
  border-bottom: 0;
  padding-bottom: 0;
}

.batch-result dt {
  color: #4e616f;
  font-weight: 800;
}

.batch-result dd {
  color: #0b1c30;
  font-weight: 900;
  margin: 0;
}

.history-panel {
  margin-top: 38px;
  overflow: hidden;
  padding: 0;
}

.history-header {
  align-items: center;
  display: flex;
  gap: 16px;
  justify-content: space-between;
  padding: 38px 38px 32px;
}

.history-header .clear-button {
  height: 52px;
  padding: 0 24px;
}

.history-table-wrap {
  overflow-x: auto;
}

.history-table {
  background: #ffffff;
  border-collapse: separate;
  border-spacing: 0;
  min-width: 860px;
  width: 100%;
}

.history-table th,
.history-table td {
  border: 0;
  border-bottom: 1px solid #edf2f7;
  padding: 20px 38px;
  text-align: left;
  vertical-align: middle;
}

.history-table th {
  background: #f7f9fd;
  color: #4e616f;
  font-size: 14px;
  font-weight: 900;
}

.history-table td {
  color: #0b1c30;
  font-size: 15px;
  font-weight: 800;
}

.status-pill {
  align-items: center;
  border-radius: 999px;
  display: inline-flex;
  font-size: 13px;
  font-weight: 900;
  justify-content: center;
  min-height: 32px;
  min-width: 32px;
  padding: 0 10px;
}

.status-pill.success {
  background: #d8f7e4;
  color: #047857;
}

.status-pill.failed {
  background: #ffe1e1;
  color: #c02626;
}

.status-pill.rolled_back {
  background: #e7eff0;
  color: #4e616f;
}

.status-pill.valid {
  background: #d8f7e4;
  color: #047857;
}

.status-pill.warning {
  background: #fff3cd;
  color: #8a5a00;
}

.status-pill.error {
  background: #ffe1e1;
  color: #c02626;
}

.group-preview-panel {
  margin-top: 38px;
}

.group-preview-panel .group-preview-summary {
  display: grid;
  grid-template-columns: repeat(3, minmax(150px, 1fr));
  gap: 12px;
  margin: 18px 38px;
}

.group-preview-panel .fatal-import-message,
.group-preview-panel .partial-import-message {
  margin-left: 38px;
  margin-right: 38px;
}

.preview-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-end;
}

.preview-toolbar {
  align-items: flex-end;
  background: #f7fafb;
  border: 2px solid #c8d7de;
  border-radius: 10px 10px 0 0;
  display: flex;
  justify-content: space-between;
  gap: 16px;
  margin: 18px 38px 0;
  padding: 12px 14px;
}

.preview-toolbar-label {
  color: var(--text-muted);
  display: block;
  font-size: 12px;
  font-weight: 800;
  margin-bottom: 8px;
}

.preview-toolbar-range {
  color: var(--text-muted);
  font-size: 14px;
  padding-bottom: 9px;
  white-space: nowrap;
}

.preview-filter {
  display: inline-flex;
  flex-wrap: wrap;
  gap: 6px;
}

.preview-filter-button {
  align-items: center;
  background: #fff;
  border: 2px solid #8da8b4;
  border-radius: 7px;
  color: var(--text);
  cursor: pointer;
  display: inline-flex;
  font-size: 14px;
  font-weight: 800;
  min-height: 36px;
  padding: 6px 11px;
}

.preview-filter-button:hover,
.preview-filter-button.active {
  background: var(--primary);
  border-color: var(--primary);
  color: #fff;
}

.preview-toolbar + .history-table-wrap .history-table {
  border-top: 0;
}

.preview-toolbar + .history-table-wrap {
  border-bottom: 2px solid #c8d7de;
  border-left: 2px solid #c8d7de;
  border-right: 2px solid #c8d7de;
  margin-left: 38px;
  margin-right: 38px;
}

.preview-footer {
  margin: 14px 38px 0;
}

.empty-preview {
  color: var(--text-muted);
  font-weight: 700;
  text-align: center !important;
}

.summary-item {
  border: 1px solid #dbe4e9;
  border-radius: 10px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 14px 16px;
}

.summary-item strong {
  font-size: 24px;
}

.summary-item.valid { background: #edf9f1; color: #047857; }
.summary-item.warning { background: #fff9e8; color: #8a5a00; }
.summary-item.error { background: #fff0f0; color: #b42318; }

.fatal-import-message,
.partial-import-message {
  border-radius: 8px;
  font-weight: 800;
  padding: 12px 14px;
}

.fatal-import-message {
  background: #ffe1e1;
  color: #9f1c1c;
}

.partial-import-message {
  background: #fff3cd;
  color: #765000;
}

@media (max-width: 760px) {
  .group-preview-panel .group-preview-summary {
    grid-template-columns: 1fr;
    margin-left: 18px;
    margin-right: 18px;
  }

  .preview-toolbar {
    align-items: stretch;
    flex-direction: column;
    margin-left: 18px;
    margin-right: 18px;
  }

  .preview-toolbar-range {
    padding-bottom: 0;
  }

  .preview-toolbar + .history-table-wrap,
  .group-preview-panel .fatal-import-message,
  .group-preview-panel .partial-import-message,
  .preview-footer {
    margin-left: 18px;
    margin-right: 18px;
  }
}

.group-preview-panel td:last-child {
  min-width: 240px;
  white-space: normal;
}

.group-sample {
  border-top: 1px solid #dbe5ef;
  margin-top: 28px;
  padding-top: 24px;
}

.group-sample h3 {
  color: #0b1c30;
  font-size: 18px;
  margin: 0 0 6px;
}

.group-sample p {
  color: #4e616f;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.5;
  margin: 8px 0 12px;
}

.group-sample .table-wrap {
  margin-top: 0;
}

.group-sample .empty-column {
  min-width: 28px;
  background: #f8fafc;
}

.group-sample ul {
  margin-top: 14px;
}

.history-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.clear-button.small,
.danger-button.small,
.delete-button.small {
  border-radius: 8px;
  height: 34px;
  padding: 0 12px;
}

.danger-button {
  background: #fee2e2;
  color: #991b1b;
}

.delete-button {
  background: #f1f5f9;
  color: #0b1c30;
}

.empty-history {
  border: 0;
  color: #4e616f;
  font-weight: 900;
  margin: 0;
  padding: 28px;
  text-align: center;
}

.history-footer,
.history-pager {
  align-items: center;
  display: flex;
  gap: 12px;
}

.history-footer {
  background: #fbfdff;
  color: #4e616f;
  font-size: 14px;
  font-weight: 800;
  justify-content: space-between;
  margin-top: 0;
  padding: 22px 38px;
}

.history-pager span {
  color: #0b1c30;
  font-weight: 900;
  min-width: 52px;
  text-align: center;
}

@media (max-width: 900px) {
  .import-layout {
    grid-template-columns: 1fr;
  }

  .format-header,
  .history-header,
  .history-footer {
    align-items: stretch;
    flex-direction: column;
  }
}

@media (max-width: 640px) {
  .import-page {
    padding: 24px 12px 44px;
  }

  .upload-panel,
  .format-panel {
    padding: 24px;
  }

  .import-tabs {
    display: flex;
    width: 100%;
  }

  .import-tabs button {
    flex: 1;
    padding: 0 10px;
  }
}
</style>
