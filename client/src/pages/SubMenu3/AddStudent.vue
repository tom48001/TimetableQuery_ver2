<template>
  <main class="add-student-page">
    <section class="add-shell">
      <header class="add-header">
        <div>
          <p class="breadcrumb">Student Records / {{ tr('Add Student', '新增學生') }}</p>
          <h1>{{ tr('Add Student', '新增學生') }}</h1>
        </div>
        <div class="header-actions">
          <button type="button" class="secondary-btn" @click="goBack">{{ tr('Cancel', '取消') }} (Cancel)</button>
          <button type="button" class="primary-btn" @click="addStudent">{{ tr('Save', '儲存') }} (Save)</button>
        </div>
      </header>

      <div class="card-grid">
        <section class="form-card">
          <div class="card-title">
            <span class="card-icon">☻</span>
            <h2>{{ tr('Personal Info', '基本資料') }} (Personal Info)</h2>
          </div>
          <div class="form-grid two">
            <label><span>{{ tr('Chinese Name', '中文姓名') }} *</span><input v-model.trim="student.student_ch_name" :placeholder="tr('e.g. Chan Tai Man', '例：陳大文')" /></label>
            <label><span>{{ tr('English Name', '英文姓名') }} *</span><input v-model.trim="student.student_eng_name" placeholder="e.g. CHAN TAI MAN" /></label>
            <label><span>Email</span><input v-model.trim="student.email" type="email" placeholder="email@school.edu" /></label>
            <label><span>{{ tr('Sex', '性別') }}</span><select v-model="student.sex"><option>F</option><option>M</option></select></label>
            <label><span>NCS</span><select v-model="student.is_ncs"><option v-for="option in ncsOptions" :key="option" :value="option">{{ option }}</option></select></label>
          </div>
        </section>

        <section class="form-card">
          <div class="card-title">
            <span class="card-icon">▧</span>
            <h2>{{ tr('Academic Info', '學籍資料') }} (Academic Info)</h2>
          </div>
          <div class="form-grid two">
            <label><span>REGNO *</span><input v-model.trim="student.regno" placeholder="20240001" /></label>
            <label>
              <span>{{ tr('Class', '班別') }} (CLASS) *</span>
              <select v-model="student.class_id">
                <option value="">{{ tr('Select class', '選擇班別') }}</option>
                <option v-for="item in classes" :key="item.class_id" :value="item.class_id">{{ item.class_name }}</option>
              </select>
            </label>
            <label><span>{{ tr('Class No.', '班別學號') }} (CLASS NO) *</span><input v-model.trim="student.class_number" maxlength="3" placeholder="01" /></label>
            <label><span>CLSNO</span><input v-model.trim="student.class_code" placeholder="-" /></label>
            <label class="wide-field"><span>Status</span><select v-model="student.status"><option value="active">Active (在學)</option><option value="inactive">Inactive</option></select></label>
          </div>
        </section>
      </div>

      <section class="form-card full-card">
        <div class="card-title">
          <span class="card-icon">△</span>
          <h2>{{ tr('Other Info', '其他資訊') }} (Other Info)</h2>
        </div>
        <div class="form-grid three">
          <label><span>{{ tr('Citizenship', '公社') }} (HOUSE)</span><select v-model="student.citizenship"><option v-for="option in citizenshipOptions" :key="option" :value="option">{{ option }}</option></select></label>
          <label><span>{{ tr('House', '社別') }}</span><select v-model="student.house"><option v-for="option in houseOptions" :key="option" :value="option">{{ option }}</option></select></label>
          <label><span>{{ tr('Language Group', '語言組別') }}</span><select v-model="student.language_group"><option v-for="option in languageGroupOptions" :key="option" :value="option">{{ option }}</option></select></label>
          <label><span>SUPP CLASS</span><select v-model="student.supp_class"><option v-for="option in suppClassOptions" :key="option" :value="option">{{ option }}</option></select></label>
          <label><span>{{ tr('Maths', '數學/MATHS') }}</span><select v-model="student.maths_group"><option v-for="option in mathsOptions" :key="option" :value="option">{{ option }}</option></select></label>
          <label><span>{{ tr('Dropped Subjects', '退選科目') }}</span><input v-model.trim="student.dropped_subjects" :placeholder="tr('Enter dropped subjects', '請輸入退選科目')" /></label>
        </div>
      </section>

      <section v-if="usesDse(student)" class="form-card full-card">
        <div class="card-title">
          <span class="card-icon">◇</span>
          <h2>{{ tr('Elective Subjects', '選修科目') }}</h2>
        </div>
        <div class="form-grid three">
          <label v-for="slot in electiveSlots" :key="slot.key">
            <span>{{ slot.label }}</span>
            <select v-model="student[slot.key]">
              <option value="">-</option>
              <option v-for="subject in electiveSubjects" :key="subject.subject_id" :value="subject.subject_id">{{ subject.subject_name }}</option>
            </select>
          </label>
        </div>
      </section>

      <section class="form-card full-card">
        <div class="card-title">
          <span class="card-icon">☰</span>
          <h2>{{ tr('Remarks', '備註') }} (Remarks)</h2>
        </div>
        <textarea v-model.trim="student.remarks" :placeholder="tr('Enter additional notes...', '在此輸入學生的額外資訊、特殊需求或背景備註...')"></textarea>
      </section>

      <footer class="footer-actions">
        <small>* {{ tr('Required fields', '必填欄位') }}</small>
        <div>
          <button type="button" class="text-btn" @click="resetForm">{{ tr('Reset', '重設') }}</button>
          <button type="button" class="primary-btn confirm-btn" @click="addStudent">{{ tr('Confirm Add', '確認並新增') }}</button>
        </div>
      </footer>
    </section>
  </main>
</template>

<script>
import axios from 'axios';

function blankStudent() {
  return {
    regno: '',
    email: '',
    student_ch_name: '',
    student_eng_name: '',
    class_id: '',
    class_number: '',
    class_code: '',
    sex: 'F',
    status: 'active',
    is_ncs: 'N',
    x1_subject_id: '',
    x2_subject_id: '',
    x3_subject_id: '',
    house: '紅社',
    language_group: '英文組(EMI)',
    supp_class: '無',
    maths_group: '核心課程(英文)',
    citizenship: '公民、經濟與社會',
    dropped_subjects: '',
    remarks: ''
  };
}

export default {
  name: 'AddStudent',
  data() {
    return {
      student: blankStudent(),
      classes: [],
      electiveSubjects: [],
      electiveSlots: [
        { key: 'x1_subject_id', label: 'X1' },
        { key: 'x2_subject_id', label: 'X2' },
        { key: 'x3_subject_id', label: 'X3' }
      ],
      languageGroupOptions: ['英文組(EMI)', '純英文組(EMI)', '中文組(CMI)'],
      houseOptions: ['紅社', '藍社', '黃社', '綠社'],
      ncsOptions: ['N', 'Y'],
      mathsOptions: ['核心課程(英文)', '核心課程(中文)'],
      citizenshipOptions: ['公民、經濟與社會', '修讀 (DSE)'],
      suppClassOptions: ['無', '中文提升班', '數學試前補底', '英文拔尖班']
    };
  },
  methods: {
    tr(en, zh) { return this.$lang.locale === 'en' ? en : zh; },
    authHeaders() { return { Authorization: `Bearer ${localStorage.getItem('token')}` }; },
    usesDse(student) {
      return String((student && student.citizenship) || '').trim() === '修讀 (DSE)';
    },
    studentPayload(student) {
      const payload = { ...student };
      if (!this.usesDse(payload)) {
        payload.x1_subject_id = '';
        payload.x2_subject_id = '';
        payload.x3_subject_id = '';
      }
      return payload;
    },
    validate(student) {
      return student.regno && student.student_ch_name && student.student_eng_name &&
        student.class_id && student.class_number;
    },
    errorMessage(error, fallback) {
      return (error.response && error.response.data &&
        (error.response.data.error || error.response.data.message)) || fallback;
    },
    async loadClasses() {
      const res = await axios.get('/api/classes', { headers: this.authHeaders() });
      this.classes = res.data;
    },
    async loadElectives() {
      const res = await axios.get('/api/students/admin/elective-subjects', { headers: this.authHeaders() });
      this.electiveSubjects = res.data;
    },
    async addStudent() {
      if (!this.validate(this.student)) return alert(this.tr('Please fill in all required fields.', '請填寫所有必填欄位。'));
      try {
        await axios.post('/api/students/admin', this.studentPayload(this.student), { headers: this.authHeaders() });
        alert(this.tr('Student added.', '學生已新增。'));
        this.$router.push({ name: 'StudentManagement' });
      } catch (error) {
        alert(this.errorMessage(error, this.tr('Failed to add student.', '新增學生失敗。')));
      }
    },
    resetForm() {
      this.student = blankStudent();
    },
    goBack() {
      this.$router.push({ name: 'StudentManagement' });
    }
  },
  mounted() {
    Promise.all([this.loadClasses(), this.loadElectives()]).catch(error => {
      alert(this.errorMessage(error, this.tr('Failed to load student form data.', '載入新增學生資料失敗。')));
    });
  }
};
</script>

<style scoped>
.add-student-page {
  background: #f7f9ff;
  min-height: calc(100vh - 126px);
  padding: 28px 24px 64px;
}

.add-shell {
  margin: 0 auto;
  max-width: 1280px;
}

.add-header {
  align-items: flex-start;
  display: flex;
  justify-content: space-between;
  gap: 18px;
  margin-bottom: 28px;
}

.breadcrumb {
  color: #5b6b78;
  font-size: 13px;
  font-weight: 900;
  margin: 0 0 8px;
}

h1,
h2 {
  color: #0f2538;
  margin: 0;
}

h1 {
  font-size: 38px;
  font-weight: 900;
}

h2 {
  font-size: 18px;
  font-weight: 900;
}

.header-actions,
.footer-actions,
.footer-actions div {
  align-items: center;
  display: flex;
  gap: 14px;
}

.card-grid {
  display: grid;
  gap: 28px;
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-card {
  background: #fff;
  border: 1px solid #e6edf2;
  border-radius: 14px;
  box-shadow: 0 10px 28px rgba(25, 54, 69, 0.05);
  padding: 40px;
}

.full-card {
  margin-top: 28px;
}

.card-title {
  align-items: center;
  display: flex;
  gap: 14px;
  margin-bottom: 30px;
}

.card-icon {
  align-items: center;
  background: #e9f4f3;
  border-radius: 8px;
  color: #0b6f6a;
  display: inline-flex;
  font-weight: 900;
  height: 42px;
  justify-content: center;
  width: 42px;
}

.form-grid {
  display: grid;
  gap: 24px;
}

.form-grid.two {
  grid-template-columns: repeat(2, minmax(0, 1fr));
}

.form-grid.three {
  grid-template-columns: repeat(3, minmax(0, 1fr));
}

.wide-field {
  grid-column: 1 / -1;
}

label {
  color: #536474;
  display: grid;
  font-size: 12px;
  font-weight: 900;
  gap: 9px;
  text-transform: uppercase;
}

input,
select,
textarea {
  background: #edf3ff;
  border: 1px solid #dce6f2;
  border-radius: 8px;
  box-sizing: border-box;
  color: #10283b;
  font-size: 15px;
  min-height: 52px;
  padding: 0 16px;
  width: 100%;
}

textarea {
  min-height: 130px;
  padding: 18px;
  resize: vertical;
}

input:focus,
select:focus,
textarea:focus {
  border-color: #0b6f6a;
  box-shadow: 0 0 0 3px rgba(11, 111, 106, 0.12);
  outline: none;
}

button {
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-weight: 900;
  min-height: 48px;
  padding: 0 24px;
}

.primary-btn {
  background: #006b68;
  color: #fff;
}

.secondary-btn {
  background: #fff;
  border: 1px solid #cfdbe5;
  color: #536474;
}

.text-btn {
  background: transparent;
  color: #536474;
}

.confirm-btn {
  min-width: 190px;
}

.footer-actions {
  background: #edf3ff;
  border-radius: 12px;
  justify-content: space-between;
  margin-top: 34px;
  padding: 22px 24px;
}

.footer-actions small {
  color: #536474;
  font-weight: 900;
}

@media (max-width: 900px) {
  .add-header,
  .footer-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .card-grid,
  .form-grid.two,
  .form-grid.three {
    grid-template-columns: 1fr;
  }
}
</style>
