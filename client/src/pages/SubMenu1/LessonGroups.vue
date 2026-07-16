<template>
  <main class="group-page">
    <section class="group-panel">
      <header class="page-header">
        <div>
          <h1>{{ tr('Split Lesson Groups', '分組課設定') }}</h1>
          <p>{{ tr('Assign students when the same class, subject, day, and period has multiple teachers or rooms.', '同一班同一科同日同節有多位老師或房間時，可在此分配學生組別。') }}</p>
        </div>
        <button type="button" class="secondary-btn" :disabled="loadingGroups" @click="fetchGroups">
          {{ tr('Reload', '重新載入') }}
        </button>
      </header>

      <div class="group-filters">
        <label class="search-box">
          <span>{{ tr('Search', '搜尋') }}</span>
          <input
            v-model.trim="searchText"
            type="text"
            :placeholder="tr('Class, subject, day, or period...', '班別、科目、星期或節數...')"
          />
        </label>

        <div class="grade-filter" :aria-label="tr('Grade filter', '級別篩選')">
          <button
            type="button"
            :class="{ active: selectedGrade === '' }"
            @click="selectedGrade = ''"
          >
            {{ tr('All', '全部') }}
          </button>
          <button
            v-for="grade in gradeOptions"
            :key="grade"
            type="button"
            :class="{ active: selectedGrade === grade }"
            @click="selectedGrade = grade"
          >
            {{ grade }}
          </button>
        </div>

        <label class="checkbox-filter">
          <input type="checkbox" v-model="showUnassignedOnly" />
          <span>{{ tr('Show unfinished only', '只顯示未完成分配') }}</span>
        </label>
      </div>

      <div class="result-summary">
        {{ tr('Showing', '顯示') }} {{ filteredGroups.length }} / {{ groups.length }}
      </div>

      <div class="layout">
        <aside class="group-list">
          <button
            v-for="group in filteredGroups"
            :key="groupKey(group)"
            type="button"
            class="group-row"
            :class="{ active: selectedGroup && groupKey(selectedGroup) === groupKey(group) }"
            @click="selectGroup(group)"
          >
            <strong>{{ group.class_name }} · {{ subjectLabel(group) }}</strong>
            <span>{{ dayLabel(group.day_of_week) }} · {{ group.period_name }}</span>
            <small>{{ group.group_count }} {{ tr('groups', '組') }} · {{ group.assigned_students || 0 }}/{{ group.student_count || '?' }} {{ tr('assigned', '已分配') }}</small>
          </button>
          <p v-if="!loadingGroups && !groups.length" class="empty-message">
            {{ tr('No split lessons found.', '暫時沒有分組課。') }}
          </p>
          <p v-else-if="!loadingGroups && !filteredGroups.length" class="empty-message">
            {{ tr('No matching split lessons.', '找不到符合條件的分組課。') }}
          </p>
        </aside>

        <section class="assignment-card">
          <p v-if="loadingDetail" class="empty-message">{{ tr('Loading...', '載入中...') }}</p>
          <template v-else-if="selectedGroup">
            <div class="selected-title">
              <div>
                <h2>{{ selectedGroup.class_name }} · {{ subjectLabel(selectedGroup) }}</h2>
                <p>{{ dayLabel(selectedGroup.day_of_week) }} · {{ selectedGroup.period_name }}</p>
              </div>
              <button type="button" class="primary-btn" :disabled="saving" @click="saveAssignments">
                {{ saving ? tr('Saving...', '儲存中...') : tr('Save Assignments', '儲存分組') }}
              </button>
            </div>

            <div class="lesson-options">
              <div v-for="lesson in lessons" :key="lesson.timetable_id" class="lesson-option">
                <strong>{{ lesson.teacher_name }}</strong>
                <span>{{ lesson.room_name }}</span>
                <small>{{ assignmentCount(lesson.timetable_id) }} {{ tr('students', '學生') }}</small>
              </div>
            </div>

            <div v-if="studentClassOptions.length > 1" class="student-class-filter">
              <span>{{ tr('Student class', '學生班別') }}</span>
              <button
                type="button"
                :class="{ active: selectedStudentClass === '' }"
                @click="selectedStudentClass = ''"
              >
                {{ tr('All', '全部') }}
              </button>
              <button
                v-for="className in studentClassOptions"
                :key="className"
                type="button"
                :class="{ active: selectedStudentClass === className }"
                @click="selectedStudentClass = className"
              >
                {{ className }}
              </button>
            </div>

            <div class="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>{{ tr('No.', '班號') }}</th>
                    <th>{{ tr('Student', '學生') }}</th>
                    <th v-for="lesson in lessons" :key="lesson.timetable_id">
                      {{ lesson.teacher_name }}<br />
                      <small>{{ lesson.room_name }}</small>
                    </th>
                    <th>{{ tr('Unassigned', '未分配') }}</th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="group in groupedFilteredStudents">
                    <tr :key="`class-${group.className}`" class="class-divider">
                      <td :colspan="lessons.length + 3">
                        {{ group.className }} · {{ group.students.length }} {{ tr('students', '學生') }}
                      </td>
                    </tr>
                    <tr v-for="student in group.students" :key="student.student_id">
                      <td>{{ student.class_number }}</td>
                      <td>
                        <strong>{{ student.student_name }}</strong>
                        <span>{{ student.english_name }}</span>
                      </td>
                      <td v-for="lesson in lessons" :key="lesson.timetable_id">
                        <input
                          type="radio"
                          :name="`student-${student.student_id}`"
                          :value="lesson.timetable_id"
                          v-model="assignments[student.student_id]"
                        />
                      </td>
                      <td>
                        <input
                          type="radio"
                          :name="`student-${student.student_id}`"
                          :value="null"
                          v-model="assignments[student.student_id]"
                        />
                      </td>
                    </tr>
                  </template>
                </tbody>
              </table>
            </div>
          </template>
          <p v-else class="empty-message">
            {{ tr('Select a split lesson to start assigning students.', '請選擇一個分組課開始分配學生。') }}
          </p>
        </section>
      </div>

      <pre v-if="message" class="message" :class="{ success: messageType === 'success', error: messageType === 'error' }">{{ message }}</pre>
    </section>
  </main>
</template>

<script>
import axios from 'axios';
import { subjectLabel as formatSubjectLabel } from '../../utils/timetableLabels';

export default {
  data() {
    return {
      groups: [],
      selectedGroup: null,
      lessons: [],
      students: [],
      assignments: {},
      loadingGroups: false,
      loadingDetail: false,
      saving: false,
      message: '',
      messageType: '',
      searchText: '',
      selectedGrade: '',
      showUnassignedOnly: false,
      selectedStudentClass: ''
    };
  },
  computed: {
    gradeOptions() {
      return Array.from(new Set(
        this.groups
          .map(group => String(group.class_name || '').trim().match(/^\d+/))
          .filter(Boolean)
          .map(match => match[0])
      )).sort((a, b) => Number(a) - Number(b));
    },
    filteredGroups() {
      const keyword = this.searchText.toLowerCase();
      return this.groups.filter(group => {
        const className = String(group.class_name || '');
        const haystack = [
          className,
          this.classSearchText(className),
          this.subjectLabel(group),
          this.dayLabel(group.day_of_week),
          group.period_name
        ].join(' ').toLowerCase();
        const matchesKeyword = !keyword || haystack.includes(keyword);
        const matchesGrade = !this.selectedGrade || className.startsWith(this.selectedGrade);
        const assigned = Number(group.assigned_students || 0);
        const total = Number(group.student_count || 0);
        const matchesUnassigned = !this.showUnassignedOnly || !total || assigned < total;
        return matchesKeyword && matchesGrade && matchesUnassigned;
      });
    },
    studentClassOptions() {
      return Array.from(new Set(
        this.students
          .map(student => String(student.class_name || '').trim())
          .filter(Boolean)
      )).sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base', numeric: true }));
    },
    filteredStudents() {
      if (!this.selectedStudentClass) return this.students;
      return this.students.filter(student => student.class_name === this.selectedStudentClass);
    },
    groupedFilteredStudents() {
      const groups = new Map();
      this.filteredStudents.forEach(student => {
        const className = String(student.class_name || '').trim() || this.tr('No class', '未有班別');
        if (!groups.has(className)) groups.set(className, []);
        groups.get(className).push(student);
      });
      return Array.from(groups.entries()).map(([className, students]) => ({
        className,
        students
      }));
    }
  },
  methods: {
    tr(en, zh) {
      return this.$lang.locale === 'en' ? en : zh;
    },
    authHeaders() {
      const token = localStorage.getItem('token');
      return { Authorization: `Bearer ${token}` };
    },
    subjectLabel(group) {
      return formatSubjectLabel({
        subject_name: group.subject_name,
        subject_name_zh: group.subject_name_zh,
        subject_name_en: group.subject_name_en
      }, this.$lang.locale);
    },
    classSearchText(className) {
      const parts = String(className || '')
        .replace(/／/g, '/')
        .split(/[/,，#]/)
        .map(part => part.trim())
        .filter(Boolean);
      return [...parts, [...parts].reverse().join('/')].join(' ');
    },
    dayLabel(day) {
      const labels = {
        Mon: this.tr('Mon', '星期一'),
        Tue: this.tr('Tue', '星期二'),
        Wed: this.tr('Wed', '星期三'),
        Thu: this.tr('Thu', '星期四'),
        Fri: this.tr('Fri', '星期五'),
        Sat: this.tr('Sat', '星期六')
      };
      return labels[day] || day;
    },
    groupKey(group) {
      return [group.class_id, group.subject_id, group.day_of_week, group.period_id].join('-');
    },
    assignmentCount(timetableId) {
      return Object.values(this.assignments).filter(value => Number(value) === Number(timetableId)).length;
    },
    showMessage(message, type) {
      this.message = message;
      this.messageType = type;
    },
    async fetchGroups() {
      this.loadingGroups = true;
      try {
        const res = await axios.get('/api/lesson-groups', { headers: this.authHeaders() });
        this.groups = res.data;
      } catch (err) {
        const data = err.response && err.response.data;
        this.showMessage(data && data.error ? data.error : this.tr('Failed to load split lessons.', '載入分組課失敗。'), 'error');
      } finally {
        this.loadingGroups = false;
      }
    },
    async selectGroup(group) {
      this.selectedGroup = group;
      this.loadingDetail = true;
      this.message = '';
      try {
        const res = await axios.get('/api/lesson-groups/detail', {
          headers: this.authHeaders(),
          params: {
            classId: group.class_id,
            subjectId: group.subject_id,
            day: group.day_of_week,
            periodId: group.period_id
          }
        });
        this.lessons = res.data.lessons;
        this.students = res.data.students;
        this.assignments = Object.fromEntries(
          this.students.map(student => [student.student_id, student.assigned_timetable_id || null])
        );
        this.selectedStudentClass = '';
      } catch (err) {
        const data = err.response && err.response.data;
        this.showMessage(data && data.error ? data.error : this.tr('Failed to load group detail.', '載入分組資料失敗。'), 'error');
      } finally {
        this.loadingDetail = false;
      }
    },
    async saveAssignments() {
      if (!this.selectedGroup) return;
      this.saving = true;
      try {
        const assignments = this.students.map(student => ({
          student_id: student.student_id,
          timetable_id: this.assignments[student.student_id] || null
        }));
        const res = await axios.post('/api/lesson-groups/assignments', {
          classId: this.selectedGroup.class_id,
          subjectId: this.selectedGroup.subject_id,
          day: this.selectedGroup.day_of_week,
          periodId: this.selectedGroup.period_id,
          assignments
        }, { headers: this.authHeaders() });

        this.showMessage(res.data.message || this.tr('Assignments saved.', '分組已儲存。'), 'success');
        await this.fetchGroups();
        const current = this.groups.find(group => this.groupKey(group) === this.groupKey(this.selectedGroup));
        if (current) {
          this.selectedGroup = current;
          await this.selectGroup(current);
        }
      } catch (err) {
        const data = err.response && err.response.data;
        this.showMessage(data && data.error ? data.error : this.tr('Failed to save assignments.', '儲存分組失敗。'), 'error');
      } finally {
        this.saving = false;
      }
    }
  },
  mounted() {
    this.fetchGroups();
  }
};
</script>

<style scoped>
.group-page {
  min-height: calc(100vh - 126px);
  box-sizing: border-box;
  padding: 34px 20px 64px;
}

.group-panel {
  max-width: 1280px;
  margin: 0 auto;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.96);
  box-shadow: var(--shadow);
  padding: 24px;
}

.page-header,
.selected-title {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 18px;
}

h1,
h2,
p {
  margin: 0;
}

.page-header p,
.selected-title p {
  color: var(--text-muted);
  margin-top: 8px;
}

.group-filters {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) auto auto;
  gap: 12px;
  align-items: end;
  margin-top: 22px;
}

.search-box {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.search-box span,
.checkbox-filter {
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 800;
}

.search-box input {
  height: 42px;
  border: 1px solid var(--border);
  border-radius: 6px;
  box-sizing: border-box;
  color: var(--text);
  font-size: 15px;
  padding: 0 12px;
}

.grade-filter {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
}

.student-class-filter {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 6px;
  margin: 4px 0 14px;
}

.student-class-filter span {
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 800;
  margin-right: 4px;
}

.grade-filter button,
.student-class-filter button {
  height: 42px;
  border: 1px solid var(--border);
  background: #fff;
  color: var(--text);
}

.grade-filter button.active,
.student-class-filter button.active {
  border-color: var(--primary);
  background: var(--primary);
  color: #fff;
}

.checkbox-filter {
  min-height: 42px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.checkbox-filter input {
  width: 18px;
  height: 18px;
}

.result-summary {
  color: var(--text-muted);
  font-size: 13px;
  font-weight: 800;
  margin-top: 10px;
}

.layout {
  display: grid;
  grid-template-columns: 340px minmax(0, 1fr);
  gap: 18px;
  margin-top: 12px;
}

.group-list,
.assignment-card {
  min-height: 420px;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #fff;
  padding: 14px;
}

.group-list {
  display: flex;
  flex-direction: column;
  gap: 6px;
  max-height: 680px;
  overflow: auto;
}

.group-row {
  height: auto;
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  gap: 4px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #f7fafb;
  color: var(--text);
  padding: 10px 12px;
  text-align: left;
}

.group-row.active,
.group-row:hover {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.group-row small,
.lesson-option small {
  color: var(--text-muted);
}

.lesson-options {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 10px;
  margin: 16px 0;
}

.lesson-option {
  display: flex;
  flex-direction: column;
  gap: 4px;
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #eef6ff;
  padding: 12px;
}

.table-wrap {
  overflow: auto;
}

table {
  width: 100%;
  border-collapse: collapse;
}

th,
td {
  border-bottom: 1px solid var(--border);
  padding: 10px;
  text-align: center;
  vertical-align: middle;
}

th {
  background: #f3f8fa;
  font-weight: 800;
}

.class-divider td {
  background: #dff0f3;
  color: var(--primary-dark);
  font-size: 15px;
  font-weight: 900;
  letter-spacing: 0;
  text-align: left;
}

td:nth-child(2) {
  text-align: left;
}

td span {
  display: block;
  color: var(--text-muted);
  font-size: 13px;
}

input[type="radio"] {
  width: 18px;
  height: 18px;
}

button {
  height: 42px;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 800;
  padding: 0 16px;
}

.primary-btn {
  background: var(--primary);
  color: #fff;
}

.secondary-btn {
  border: 1px solid var(--border-strong);
  background: #fff;
  color: var(--text);
}

button:disabled {
  background: #c7d2d8;
  color: #607683;
  cursor: not-allowed;
}

.empty-message {
  color: var(--text-muted);
  padding: 26px;
  text-align: center;
}

.message {
  white-space: pre-wrap;
  border: 1px solid var(--border);
  border-radius: 8px;
  background: #f5f8fa;
  color: var(--text);
  margin: 18px 0 0;
  padding: 14px;
}

.message.success {
  border-color: #a8d0b5;
  background: #edf8f0;
  color: #1c5634;
}

.message.error {
  border-color: #e0b4b4;
  background: #fff0f0;
  color: #8a1f1f;
}

@media (max-width: 880px) {
  .group-filters,
  .layout {
    grid-template-columns: 1fr;
  }
}
</style>
