const messages = {
  app: {
    title: {
      zh: '\u6642\u9593\u8868\u67e5\u8a62\u7cfb\u7d71',
      en: 'Timetable Query System'
    }
  },
  common: {
    languageZh: { zh: '\u4e2d\u6587', en: 'Chinese' },
    languageEn: { zh: 'English', en: 'English' },
    username: { zh: '\u7528\u6236\u540d\u7a31', en: 'User' },
    role: { zh: '\u89d2\u8272', en: 'Role' },
    logout: { zh: '\u767b\u51fa', en: 'Logout' },
    submit: { zh: '\u63d0\u4ea4', en: 'Submit' },
    teacher: { zh: '\u8001\u5e2b', en: 'Teacher' },
    class: { zh: '\u73ed\u5225', en: 'Class' },
    subject: { zh: '\u79d1\u76ee', en: 'Subject' },
    room: { zh: '\u623f\u9593', en: 'Room' },
    dayPeriod: { zh: '\u8ab2\u7bc0 / \u661f\u671f', en: 'Period / Day' },
    lessonTeacher: { zh: '\u8001\u5e2b', en: 'Teacher' },
    loadTeacherScheduleFailed: { zh: '\u8f09\u5165\u8ab2\u8868\u5931\u6557\u3002', en: 'Failed to load timetable.' }
  },
  roles: {
    staff: { zh: 'Staff', en: 'Staff' },
    manager: { zh: 'Manager', en: 'Manager' },
    teacher: { zh: 'Teacher', en: 'Teacher' }
  },
  nav: {
    timetable: { zh: '\u6642\u9593\u8868\u61c9\u7528', en: 'Timetable' },
    nominations: { zh: '\u63d0\u540d\u5b78\u751f', en: 'Student Nominations' },
    userManagement: { zh: '\u4f7f\u7528\u8005\u7ba1\u7406', en: 'User Management' },
    teacherTimetable: { zh: '\u8001\u5e2b\u4e0a\u8ab2\u6642\u9593\u8868', en: 'Teacher Timetable' },
    classObservation: { zh: '\u89c0\u8ab2\u8ab2\u8868', en: 'Class Observation' },
    swapLesson: { zh: '\u8abf\u8ab2\u9078\u5802', en: 'Swap Lesson' },
    freeTeacher: { zh: '\u641c\u5c0b\u7a7a\u5802\u8001\u5e2b', en: 'Free Teachers' },
    classTimetable: { zh: '\u5404\u73ed\u4e0a\u8ab2\u6642\u9593\u8868', en: 'Class Timetable' },
    roomTimetable: { zh: '\u5404\u623f\u9593\u4e0a\u8ab2\u6642\u9593\u8868', en: 'Room Timetable' },
    electives: { zh: '\u53ef\u89c0\u8ab2\u8ab2\u8868', en: 'Elective Timetable' },
    studentTimetable: { zh: '\u67e5\u95b1\u5b78\u751f\u4e0a\u8ab2\u6642\u9593\u8868', en: 'Student Timetable' },
    bla: { zh: '\u6700\u4f73\u5b78\u7fd2\u614b\u5ea6\u63d0\u540d', en: 'Best Learning Attitude Nomination' },
    blaResult: { zh: '\u6700\u4f73\u5b78\u7fd2\u614b\u5ea6\u5b78\u751f\u63d0\u540d\u7d50\u679c', en: 'Best Learning Attitude Results' },
    conductAward: { zh: '\u64cd\u884c\u734e\u63d0\u540d', en: 'Conduct Award Nomination' },
    conductAwardResult: { zh: '\u64cd\u884c\u734e\u63d0\u540d\u7d71\u8a08\u7d50\u679c', en: 'Conduct Award Results' },
    learningGoalEntry: { zh: '\u8f38\u5165\u5b78\u751f\u5b8c\u6210\u76ee\u6a19\u7e3d\u6578', en: 'Enter Learning Goal Total' },
    learningGoalResult: { zh: '\u5b78\u7fd2\u76ee\u6a19\u734e\u52f5\u8a08\u5283\u7d50\u679c', en: 'Learning Goal Award Results' },
    prefectNomination: { zh: '\u7d00\u5f8b\u9818\u8896\u751f\u63d0\u540d', en: 'Prefect Nomination' },
    prefectNominationResult: { zh: '\u7d00\u5f8b\u9818\u8896\u751f\u63d0\u540d\u7d71\u8a08\u7d50\u679c', en: 'Prefect Nomination Results' },
    editTeacher: { zh: '\u4f7f\u7528\u8005\u7ba1\u7406', en: 'User Management' },
    studentManagement: { zh: '\u5b78\u751f\u7ba1\u7406', en: 'Student Management' },
    importTeacher: { zh: '\u5c0e\u5165\u6642\u9593\u8868', en: 'Import Timetable' },
    changePassword: { zh: '\u66f4\u6539\u5bc6\u78bc', en: 'Change Password' }
  },
  login: {
    title: { zh: '\u767b\u5165\u7cfb\u7d71', en: 'Sign In' },
    email: { zh: '\u96fb\u90f5', en: 'Email' },
    password: { zh: '\u5bc6\u78bc', en: 'Password' },
    submit: { zh: '\u767b\u5165', en: 'Login' },
    google: { zh: '\u4f7f\u7528 Google \u767b\u5165', en: 'Sign in with Google' },
    noUser: { zh: '\u767b\u5165\u5931\u6557\uff0c\u7121\u6cd5\u7372\u53d6\u4f7f\u7528\u8005\u8cc7\u8a0a\u3002', en: 'Login failed. Could not get user information.' },
    invalidCredentials: { zh: '\u767b\u5165\u5931\u6557\uff0c\u8acb\u6aa2\u67e5\u5e33\u865f\u5bc6\u78bc\u3002', en: 'Login failed. Please check your email and password.' },
    serverUnavailable: { zh: '\u767b\u5165\u5931\u6557\uff0c\u8acb\u6aa2\u67e5\u5f8c\u7aef\u4f3a\u670d\u5668\u662f\u5426\u5df2\u555f\u52d5\u3002', en: 'Login failed. Please check whether the backend server is running.' }
  },
  home: {
    title: { zh: '\u8001\u5e2b\u8ab2\u8868', en: 'Teacher Timetable' }
  },
  day: {
    Mon: { zh: '\u661f\u671f\u4e00', en: 'Mon' },
    Tue: { zh: '\u661f\u671f\u4e8c', en: 'Tue' },
    Wed: { zh: '\u661f\u671f\u4e09', en: 'Wed' },
    Thu: { zh: '\u661f\u671f\u56db', en: 'Thu' },
    Fri: { zh: '\u661f\u671f\u4e94', en: 'Fri' }
  }
};

export default messages;
