<template>
  <main class="bla-page">
    <h1>最佳學習態度提名<br />選擇班別與科目</h1>

    <div class="table-wrap">
      <table class="choice-table">
        <thead>
          <tr>
            <th class="subject-col"></th>
            <th v-for="cls in classList" :key="cls.class_id">
              {{ cls.class_name }}
            </th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="subject in subjects" :key="subject.subject_id">
            <th class="subject-col">{{ subject.subject_name }}</th>
            <td
              v-for="cls in classList"
              :key="`${subject.subject_id}-${cls.class_id}`"
              :class="{ unavailable: !isAvailable(subject.subject_id, cls.class_id) }"
            >
              <label
                v-if="isAvailable(subject.subject_id, cls.class_id)"
                class="choice-cell"
                :class="{ selected: selectedChoice === choiceValue(subject, cls) }"
              >
                <input
                  type="radio"
                  name="subjectClass"
                  :value="choiceValue(subject, cls)"
                  v-model="selectedChoice"
                />
                <span>{{ countFor(subject.subject_id, cls.class_id) }}</span>
              </label>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <button type="button" :disabled="!selectedChoice" @click="goNext">
      下一步
    </button>
  </main>
</template>

<script>
import axios from 'axios';

const TEXT = {
  choose: '\u8acb\u9078\u64c7\u73ed\u5225\u8207\u79d1\u76ee\u3002'
};

export default {
  data() {
    return {
      subjects: [],
      classList: [],
      counts: {},
      selectedChoice: ''
    };
  },
  computed: {
    selectedSubject() {
      if (!this.selectedChoice) return null;
      const subjectId = Number(this.selectedChoice.split('-')[0]);
      return this.subjects.find(subject => Number(subject.subject_id) === subjectId);
    },
    selectedClassId() {
      if (!this.selectedChoice) return null;
      return Number(this.selectedChoice.split('-')[1]);
    }
  },
  methods: {
    choiceValue(subject, cls) {
      return `${subject.subject_id}-${cls.class_id}`;
    },
    countKey(subjectId, classId) {
      return `${subjectId}-${classId}`;
    },
    isAvailable(subjectId, classId) {
      return this.counts[this.countKey(subjectId, classId)] !== undefined;
    },
    countFor(subjectId, classId) {
      const value = this.counts[this.countKey(subjectId, classId)];
      return value === undefined ? '' : value;
    },
    async fetchSubjects() {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/subjects', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.subjects = res.data;
    },
    async fetchClasses() {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/classes', {
        headers: { Authorization: `Bearer ${token}` }
      });
      this.classList = res.data;
    },
    async fetchCounts() {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:3000/api/subjects/class-counts', {
        headers: { Authorization: `Bearer ${token}` }
      });

      const nextCounts = {};
      res.data.forEach(row => {
        nextCounts[this.countKey(row.subject_id, row.class_id)] = Number(row.student_count) || 0;
      });
      this.counts = nextCounts;
    },
    goNext() {
      if (!this.selectedSubject || !this.selectedClassId) {
        alert(TEXT.choose);
        return;
      }

      this.$router.push({
        name: 'BLAvote',
        query: {
          selectedSubject: JSON.stringify(this.selectedSubject),
          selectedClass: JSON.stringify([this.selectedClassId])
        }
      });
    }
  },
  mounted() {
    this.fetchSubjects();
    this.fetchClasses();
    this.fetchCounts();
  }
};
</script>

<style scoped>
.bla-page {
  box-sizing: border-box;
  min-height: calc(100vh - 126px);
  padding: 26px 4px 48px;
  background: #fff;
  color: #000;
}

h1 {
  margin: 0 0 28px;
  text-align: center;
  font-size: 32px;
  font-weight: 800;
  line-height: 1.35;
  letter-spacing: 0;
}

.table-wrap {
  max-width: 1260px;
  margin: 0 auto;
  overflow-x: auto;
}

.choice-table {
  width: 100%;
  min-width: 1180px;
  border: 1px solid #444;
  border-collapse: separate;
  border-spacing: 2px;
  background: #fff;
}

.choice-table th,
.choice-table td {
  border: 1px solid #666;
  height: 24px;
  padding: 2px 4px;
  font-size: 15px;
  line-height: 1.2;
  vertical-align: middle;
}

.choice-table thead th {
  text-align: center;
  font-weight: 800;
}

.subject-col {
  width: 126px;
  min-width: 126px;
  text-align: left;
  font-weight: 700;
}

.choice-table tbody tr:nth-child(odd) td,
.choice-table tbody tr:nth-child(odd) .subject-col {
  background: #fffed0;
}

.choice-table tbody tr:nth-child(even) td,
.choice-table tbody tr:nth-child(even) .subject-col {
  background: #fff;
}

.choice-table td.unavailable {
  background: #fff;
}

.choice-cell {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 2px;
  min-width: 34px;
  cursor: pointer;
}

.choice-cell input {
  width: 13px;
  height: 13px;
  margin: 0;
}

.choice-cell span {
  color: #f00;
  font-size: 14px;
}

.choice-cell.selected span {
  font-weight: 800;
}

button {
  display: block;
  min-width: 92px;
  border: 1px solid #555;
  border-radius: 4px;
  background: #f4f4f4;
  color: #000;
  cursor: pointer;
  font-size: 16px;
  font-weight: 700;
  margin: 20px auto 0;
  padding: 7px 16px;
}

button:hover:not(:disabled) {
  background: #e7e7e7;
}

button:disabled {
  color: #888;
  cursor: not-allowed;
}

@media (max-width: 720px) {
  h1 {
    font-size: 28px;
  }
}
</style>
