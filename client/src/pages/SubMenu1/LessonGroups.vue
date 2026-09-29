<template>
  <main class="group-page">
    <section class="group-panel">
      <header class="page-header">
        <div>
          <h1>{{ tr('Split Lesson Groups', '分組課設定') }}</h1>
          <p>{{ tr('Assign once for lessons with the same grade, class, subject, and number of groups.', '相同級別、班別、科目及小組數量只需分配一次，所有相同課節會自動套用。') }}</p>
        </div>
        <button type="button" class="secondary-btn" :disabled="loadingGroups" @click="fetchGroups">
          {{ tr('Reload', '重新載入') }}
        </button>
      </header>

      <div v-if="message" class="notification-row" role="status" aria-live="polite">
        <div class="message-toast" :class="{ success: messageType === 'success', error: messageType === 'error' }">
          <span class="message-icon">{{ messageType === 'success' ? '✓' : '!' }}</span>
          <p>{{ message }}</p>
          <button type="button" class="message-close" :aria-label="tr('Close notification', '關閉提示')" @click="message = ''">×</button>
        </div>
      </div>

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
            <strong>{{ gradeLabel(group.grade_level) }} · {{ group.class_name }}</strong>
            <span>{{ subjectLabel(group) }}</span>
            <small>{{ group.group_count }} {{ tr('groups', '組') }}</small>
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
                <h2>{{ gradeLabel(selectedGroup.grade_level) }} · {{ selectedGroup.class_name }} · {{ subjectLabel(selectedGroup) }} · {{ selectedGroup.group_count }} {{ tr('groups', '組') }}</h2>
              </div>
              <div class="title-actions">
                <button v-if="canAddTeacher" type="button" class="secondary-btn" @click="showAddTeacher = !showAddTeacher">
                  {{ tr('Add Teacher', '新增老師') }}
                </button>
                <button type="button" class="primary-btn" :disabled="saving" @click="saveAssignments">
                  {{ saving ? tr('Saving...', '儲存中...') : tr('Save Assignments', '儲存分組') }}
                </button>
              </div>
            </div>

            <form v-if="canAddTeacher && showAddTeacher" class="add-teacher-form" @submit.prevent="addTeacher">
              <label>
                <span>{{ tr('Teacher', '老師') }}</span>
                <select v-model.number="newTeacherId" required>
                  <option :value="null" disabled>{{ tr('Select a teacher', '選擇老師') }}</option>
                  <option v-for="teacher in availableTeachers" :key="teacher.teacher_id" :value="teacher.teacher_id">
                    {{ teacher.teacher_name }}
                  </option>
                </select>
              </label>
              <label>
                <span>{{ tr('Room', '課室') }}</span>
                <select v-model.number="newRoomId" required>
                  <option :value="null" disabled>{{ tr('Select a room', '選擇課室') }}</option>
                  <option v-for="room in rooms" :key="room.room_id" :value="room.room_id">{{ room.room_name }}</option>
                </select>
              </label>
              <button type="submit" class="primary-btn" :disabled="addingTeacher || !newTeacherId || !newRoomId">
                {{ addingTeacher ? tr('Adding...', '新增中...') : tr('Confirm Add', '確認新增') }}
              </button>
            </form>

            <div class="lesson-options">
              <div v-for="lesson in lessons" :key="lesson.timetable_id" class="lesson-option">
                <strong>{{ lesson.teacher_name }}</strong>
                <span>{{ lesson.room_name }}</span>
                <small>{{ assignmentCount(lesson.timetable_id) }} {{ tr('students', '學生') }}</small>
                <button type="button" class="assign-all-btn" @click="assignAllTo(lesson.timetable_id)">
                  {{ tr('Select all students', '選擇全部學生') }}
                </button>
                <button
                  v-if="canAddTeacher"
                  type="button"
                  class="delete-teacher-btn"
                  :disabled="lessons.length <= 2 || deletingTeacherId === lesson.timetable_id"
                  :title="lessons.length <= 2 ? tr('At least two teachers are required.', '分組課最少需要保留兩位老師。') : tr('Delete teacher', '刪除老師')"
                  @click="deleteTeacher(lesson)"
                >
                  {{ deletingTeacherId === lesson.timetable_id ? tr('Deleting...', '刪除中...') : tr('Delete Teacher', '刪除老師') }}
                </button>
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
              <table class="assignment-table">
                <colgroup>
                  <col class="number-column" />
                  <col class="student-column" />
                  <col v-for="lesson in visibleLessons" :key="`col-${lesson.timetable_id}`" class="teacher-column" />
                  <col class="teacher-column" />
                </colgroup>
                <thead>
                  <tr>
                    <th>{{ tr('No.', '班號') }}</th>
                    <th>{{ tr('Student', '學生') }}</th>
                    <th v-for="lesson in visibleLessons" :key="lesson.timetable_id" class="teacher-heading">
                      <span class="teacher-header-name">{{ lesson.teacher_name }}</span>
                      <small class="teacher-header-room">{{ lesson.room_name }}</small>
                    </th>
                    <th class="teacher-heading">
                      <span class="teacher-header-name">{{ tr('Unassigned', '未分配') }}</span>
                      <button type="button" class="assign-all-btn compact" @click="assignAllTo(null)">
                        {{ tr('Select all', '全部選擇') }}
                      </button>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  <template v-for="group in groupedFilteredStudents">
                    <tr :key="`class-${group.className}`" class="class-divider">
                      <td :colspan="visibleLessons.length + 3">
                        {{ group.className }} · {{ group.students.length }} {{ tr('students', '學生') }}
                      </td>
                    </tr>
                    <tr v-for="student in group.students" :key="student.student_id">
                      <td>{{ student.class_number }}</td>
                      <td>
                        <strong>{{ student.student_name }}</strong>
                        <span>{{ student.english_name }}</span>
                      </td>
                      <td v-for="lesson in visibleLessons" :key="lesson.timetable_id">
                        <input type="radio" :name="`student-${student.student_id}`" :value="lesson.timetable_id" v-model="assignments[student.student_id]" />
                      </td>
                      <td>
                        <input type="radio" :name="`student-${student.student_id}`" :value="null" v-model="assignments[student.student_id]" />
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
      selectedStudentClass: '',
      userRole: 'teacher',
      teachers: [],
      rooms: [],
      showAddTeacher: false,
      newTeacherId: null,
      newRoomId: null,
      addingTeacher: false,
      deletingTeacherId: null
    };
  },
  computed: {
    canAddTeacher() {
      return this.userRole === 'manager' || this.userRole === 'subject_head';
    },
    availableTeachers() {
      const currentTeacherIds = new Set(this.lessons.map(lesson => Number(lesson.teacher_id)));
      return this.teachers.filter(teacher => !currentTeacherIds.has(Number(teacher.teacher_id)));
    },
    visibleLessons() {
      return this.lessons.slice(0, 6);
    },
    gradeOptions() {
      return Array.from(new Set(
        this.groups
          .map(group => this.gradeNumber(group))
          .filter(Boolean)
      )).sort((a, b) => Number(a) - Number(b));
    },
    filteredGroups() {
      const keyword = this.searchText.toLowerCase();
      return this.groups.filter(group => {
        const className = String(group.class_name || '');
        const haystack = [
          className,
          group.grade_level,
          this.classSearchText(className),
          this.subjectLabel(group),
          this.groupScheduleLabel(group)
        ].join(' ').toLowerCase();
        const matchesKeyword = !keyword || haystack.includes(keyword);
        const matchesGrade = !this.selectedGrade || this.gradeNumber(group) === this.selectedGrade;
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
    gradeLabel(grade) {
      const value = String(grade || '').trim();
      const match = value.match(/(\d+)/);
      return match ? `S${match[1]}` : (value || '-');
    },
    gradeNumber(group) {
      const gradeLevel = String((group && group.grade_level) || '').trim();
      const className = String((group && group.class_name) || '').trim();
      const match = gradeLevel.match(/([1-6])/) || className.match(/^[SF]?([1-6])/i);
      return match ? match[1] : '';
    },
    groupKey(group) {
      return [group.class_id, group.subject_id, group.family_signature || `${group.day_of_week}-${group.period_id}`].join('-');
    },
    groupScheduleLabel(group) {
      const occurrences = Array.isArray(group.occurrences) ? group.occurrences : [];
      if (!occurrences.length) return `${this.dayLabel(group.day_of_week)} · ${group.period_name}`;
      return occurrences
        .map(item => `${this.dayLabel(item.day_of_week)} · ${item.period_name}`)
        .join(this.$lang.locale === 'en' ? ', ' : '、');
    },
    assignmentCount(timetableId) {
      return Object.values(this.assignments).filter(value => Number(value) === Number(timetableId)).length;
    },
    assignAllTo(timetableId) {
      this.filteredStudents.forEach(student => {
        this.$set(this.assignments, student.student_id, timetableId);
      });
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
      this.showAddTeacher = false;
      this.newTeacherId = null;
      this.newRoomId = null;
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
    async loadAddTeacherOptions() {
      if (!this.canAddTeacher) return;
      try {
        const [teacherRes, roomRes] = await Promise.all([
          axios.get('/api/teachers/list', { headers: this.authHeaders() }),
          axios.get('/api/rooms', { headers: this.authHeaders() })
        ]);
        this.teachers = teacherRes.data;
        this.rooms = roomRes.data;
      } catch (err) {
        const data = err.response && err.response.data;
        this.showMessage(data && data.error ? data.error : this.tr('Failed to load teachers or rooms.', '載入老師或課室失敗。'), 'error');
      }
    },
    async addTeacher() {
      if (!this.selectedGroup || !this.newTeacherId || !this.newRoomId) return;
      this.addingTeacher = true;
      const group = this.selectedGroup;
      try {
        const res = await axios.post('/api/lesson-groups/teachers', {
          classId: group.class_id,
          subjectId: group.subject_id,
          day: group.day_of_week,
          periodId: group.period_id,
          teacherId: this.newTeacherId,
          roomId: this.newRoomId
        }, { headers: this.authHeaders() });
        const selectedTeacher = this.teachers.find(teacher => Number(teacher.teacher_id) === Number(this.newTeacherId));
        const successMessage = this.tr(
          `${selectedTeacher ? selectedTeacher.teacher_name : 'Teacher'} added to ${Number(res.data.occurrenceCount || 0)} matching lesson(s).`,
          `已將 ${selectedTeacher ? selectedTeacher.teacher_name : '老師'} 新增至 ${Number(res.data.occurrenceCount || 0)} 個相同課節。`
        );
        this.showAddTeacher = false;
        this.newTeacherId = null;
        this.newRoomId = null;
        await this.fetchGroups();
        const updated = this.groups.find(item => {
          const sameCourse = Number(item.class_id) === Number(group.class_id) && Number(item.subject_id) === Number(group.subject_id);
          const occurrences = Array.isArray(item.occurrences) ? item.occurrences : [];
          return sameCourse && occurrences.some(occurrence => occurrence.day_of_week === group.day_of_week && Number(occurrence.period_id) === Number(group.period_id));
        });
        if (updated) await this.selectGroup(updated);
        this.showMessage(successMessage, 'success');
      } catch (err) {
        const data = err.response && err.response.data;
        this.showMessage(data && data.error ? data.error : this.tr('Failed to add teacher.', '新增老師失敗。'), 'error');
      } finally {
        this.addingTeacher = false;
      }
    },
    async deleteTeacher(lesson) {
      if (!this.selectedGroup || !lesson || this.lessons.length <= 2) return;
      const assigned = this.assignmentCount(lesson.timetable_id);
      const confirmed = window.confirm(this.tr(
        `Delete ${lesson.teacher_name} from this lesson group and all matching periods? ${assigned} assigned student(s) will become unassigned.`,
        `確定從此分組課及所有相同課節刪除 ${lesson.teacher_name}？目前有 ${assigned} 位學生屬於此組，刪除後會變成未分配。`
      ));
      if (!confirmed) return;

      const group = this.selectedGroup;
      this.deletingTeacherId = lesson.timetable_id;
      try {
        const res = await axios.delete(`/api/lesson-groups/teachers/${lesson.timetable_id}`, {
          headers: this.authHeaders(),
          params: {
            classId: group.class_id,
            subjectId: group.subject_id,
            day: group.day_of_week,
            periodId: group.period_id
          }
        });
        await this.fetchGroups();
        const updated = this.groups.find(item => {
          const sameCourse = Number(item.class_id) === Number(group.class_id) && Number(item.subject_id) === Number(group.subject_id);
          const occurrences = Array.isArray(item.occurrences) ? item.occurrences : [];
          return sameCourse && occurrences.some(occurrence => occurrence.day_of_week === group.day_of_week && Number(occurrence.period_id) === Number(group.period_id));
        });
        if (updated) await this.selectGroup(updated);
        else {
          this.selectedGroup = null;
          this.lessons = [];
          this.students = [];
          this.assignments = {};
        }
        const unassigned = Number(res.data.unassignedStudents || 0);
        this.showMessage(this.tr(
          `${lesson.teacher_name} was deleted. ${unassigned} student(s) are now unassigned.`,
          `已刪除 ${lesson.teacher_name}；${unassigned} 位學生現為未分配。`
        ), 'success');
      } catch (err) {
        const data = err.response && err.response.data;
        this.showMessage(data && data.error ? data.error : this.tr('Failed to delete teacher.', '刪除老師失敗。'), 'error');
      } finally {
        this.deletingTeacherId = null;
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

        const successMessage = res.data.message || this.tr('Assignments saved.', '分組已儲存。');
        await this.fetchGroups();
        const current = this.groups.find(group => this.groupKey(group) === this.groupKey(this.selectedGroup));
        if (current) {
          this.selectedGroup = current;
          await this.selectGroup(current);
        }
        this.showMessage(successMessage, 'success');
      } catch (err) {
        const data = err.response && err.response.data;
        this.showMessage(data && data.error ? data.error : this.tr('Failed to save assignments.', '儲存分組失敗。'), 'error');
      } finally {
        this.saving = false;
      }
    }
  },
  mounted() {
    const user = localStorage.getItem('user');
    if (user) {
      try {
        const parsed = JSON.parse(user);
        this.userRole = String(parsed.role || 'teacher').trim().toLowerCase();
      } catch (error) {
        console.error('Failed to parse user role:', error);
      }
    }
    this.fetchGroups();
    this.loadAddTeacherOptions();
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

.title-actions,
.add-teacher-form {
  display: flex;
  align-items: flex-end;
  gap: 10px;
}

.add-teacher-form {
  border: 1px solid var(--border);
  border-radius: 6px;
  background: #f7fafb;
  margin: 14px 0;
  padding: 14px;
}

.add-teacher-form label {
  display: flex;
  flex: 1;
  flex-direction: column;
  gap: 6px;
}

.add-teacher-form select {
  min-width: 180px;
  height: 42px;
  border: 1px solid var(--border-strong);
  border-radius: 6px;
  background: #fff;
  padding: 0 10px;
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

.assign-all-btn {
  min-height: 34px;
  height: auto;
  border: 1px solid #b8cad3;
  border-radius: 6px;
  background: #fff;
  color: var(--primary-dark);
  font-size: 12px;
  margin-top: 7px;
  padding: 7px 10px;
}

.assign-all-btn:hover {
  border-color: var(--primary);
  background: var(--primary-soft);
}

.assign-all-btn.compact {
  min-height: 28px;
  margin-top: 5px;
  padding: 4px 7px;
}

.delete-teacher-btn {
  min-height: 34px;
  height: auto;
  border: 1px solid #e0b4b4;
  background: #fff;
  color: #a02626;
  font-size: 12px;
  margin-top: 4px;
  padding: 7px 10px;
}

.delete-teacher-btn:hover:not(:disabled) {
  border-color: #c43d3d;
  background: #fff0f0;
}

.table-wrap {
  overflow: visible;
}

table {
  width: 100%;
  border-collapse: collapse;
}

.assignment-table {
  table-layout: fixed;
}

.assignment-table .number-column {
  width: 64px;
}

.assignment-table .student-column {
  width: 36%;
}

.assignment-table .teacher-column {
  width: auto;
}

.teacher-heading {
  height: 104px;
  overflow-wrap: anywhere;
  padding: 10px 7px;
}

.teacher-header-name,
.teacher-header-room {
  display: block;
  line-height: 1.2;
  text-align: center;
}

.teacher-header-name {
  font-size: 15px;
  font-weight: 900;
}

.teacher-header-room {
  color: var(--text-muted);
  font-size: 13px;
  margin-top: 7px;
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
  height: 18px;
  width: 18px;
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

.notification-row {
  display: flex;
  justify-content: flex-end;
  margin: -6px 0 18px;
}

.message-toast {
  align-items: flex-start;
  border: 1px solid var(--border);
  border-radius: 10px;
  box-shadow: 0 8px 22px rgba(15, 45, 60, 0.12);
  display: grid;
  grid-template-columns: 28px minmax(0, 1fr) 30px;
  max-width: 620px;
  padding: 13px 12px 13px 14px;
  width: min(100%, 620px);
}

.message-toast p {
  line-height: 1.45;
  margin: 1px 8px 0;
  white-space: pre-wrap;
}

.message-icon {
  align-items: center;
  border-radius: 50%;
  display: inline-flex;
  font-size: 14px;
  font-weight: 900;
  height: 24px;
  justify-content: center;
  width: 24px;
}

.message-close {
  align-items: center;
  align-self: start;
  background: transparent !important;
  color: currentColor !important;
  display: inline-flex;
  font-size: 24px;
  height: 28px;
  justify-content: center;
  opacity: 0.65;
  padding: 0;
}

.message-toast.success {
  border-color: #a8d0b5;
  background: #edf8f0;
  color: #1c5634;
}

.message-toast.success .message-icon {
  background: #c8ead3;
}

.message-toast.error {
  border-color: #e0b4b4;
  background: #fff0f0;
  color: #8a1f1f;
}

.message-toast.error .message-icon {
  background: #f3cccc;
}

@media (max-width: 880px) {
  .group-filters,
  .layout,
  .add-teacher-form {
    grid-template-columns: 1fr;
  }

  .selected-title,
  .add-teacher-form,
  .title-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .notification-row {
    justify-content: stretch;
    margin-top: 0;
  }

  .message-toast {
    max-width: none;
  }

  .assignment-table .number-column {
    width: 54px;
  }

  .assignment-table .student-column {
    width: 34%;
  }

  .assignment-table th,
  .assignment-table td {
    padding: 8px 6px;
  }

}
</style>
