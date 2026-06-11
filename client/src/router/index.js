import Vue from 'vue'
import Router from 'vue-router'

import Login from '@/pages/Login.vue'
import Home from '@/pages/Home.vue'
import GoogleRedirect from '@/pages/GoogleRedirect.vue'
import ChangePassword from '@/pages/ChangePassword.vue'

import TeacherTimetable from '@/pages/SubMenu1/TeacherTimetable.vue'
import TeacherTimetableResult from '../pages/SubMenu1/TeacherTimetableResult.vue'
import ClassObservation from '@/pages/SubMenu1/ClassObservation.vue'
import ClassObservationResult from '../pages/SubMenu1/ClassObservationResult.vue'
import ClassTimetable from '@/pages/SubMenu1/ClassTimetable.vue'
import ClassTimetableResult from '@/pages/SubMenu1/ClassTimetableResult.vue'
import Electives from '@/pages/SubMenu1/Electives.vue'
import ElectivesResult from '@/pages/SubMenu1/ElectivesResult.vue'
import FreeTeacher from '@/pages/SubMenu1/FreeTeacher.vue'
import FreeTeacherResult from '@/pages/SubMenu1/FreeTeacherResult.vue'
import RoomTimetable from '@/pages/SubMenu1/RoomTimetable.vue'
import RoomTimetableResult from '@/pages/SubMenu1/RoomTimetableResult.vue'
import StdTimetable from '@/pages/SubMenu1/StdTimetable.vue'
import StdTimetableResult from '@/pages/SubMenu1/StdTimetableResult.vue'
import SwapLesson from '@/pages/SubMenu1/SwapLesson.vue'
import SwapLessonPick from '@/pages/SubMenu1/SwapLessonPick.vue'
import SwapLessonResult from '@/pages/SubMenu1/SwapLessonResult.vue'
import StudentSelector from '@/pages/SubMenu1/StudentSelector.vue'

import BLA from '@/pages/SubMenu2/BLA.vue'
import BLAvote from '@/pages/SubMenu2/BLAvote.vue'
import BLAResult from '@/pages/SubMenu2/BLAResult.vue'
import ConductAward from '@/pages/SubMenu2/ConductAward.vue'
import ConductAwardVote from '@/pages/SubMenu2/ConductAwardVote.vue'
import ConductAwardResult from '@/pages/SubMenu2/ConductAwardResult.vue'
import PrefectNomination from '@/pages/SubMenu2/PrefectNomination.vue'
import PrefectNominationVote from '@/pages/SubMenu2/PrefectNominationVote.vue'
import PrefectNominationResult from '@/pages/SubMenu2/PrefectNominationResult.vue'
import LearningGoalEntry from '@/pages/SubMenu2/LearningGoalEntry.vue'
import LearningGoalResult from '@/pages/SubMenu2/LearningGoalResult.vue'

import editTeacher from '@/pages/SubMenu3/editTeacher.vue'
import ImportTeacher from '@/pages/SubMenu3/ImportTeacher.vue'
import StudentManagement from '@/pages/SubMenu3/StudentManagement.vue'

Vue.use(Router)

const router = new Router({
  mode: 'history',
  routes: [
    { path: '/google-redirect', name: 'GoogleRedirect', component: GoogleRedirect },
    {
      path: '/',
      redirect: '/login'
    },
    {
      path: '/login',
      name: 'login',
      component: Login,
      meta: { show: false }
    },
    {
      path: '/home',
      name: 'home',
      component: Home,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/change-password',
      name: 'ChangePassword',
      component: ChangePassword,
      meta: { show: true, requiredPermission: 'changePassword' }
    },
    {
      path: '/TeacherTimetable',
      name: 'TeacherTimetable',
      component: TeacherTimetable,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/TeacherTimetableResult',
      name: 'TeacherTimetableResult',
      component: TeacherTimetableResult,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/ClassObservation',
      name: 'ClassObservation',
      component: ClassObservation,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/ClassObservationResult',
      name: 'ClassObservationResult',
      component: ClassObservationResult,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/ClassTimetable',
      name: 'ClassTimetable',
      component: ClassTimetable,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/ClassTimetableResult',
      name: 'ClassTimetableResult',
      component: ClassTimetableResult,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/Electives',
      name: 'Electives',
      component: Electives,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/ElectivesResult',
      name: 'ElectivesResult',
      component: ElectivesResult,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/FreeTeacher',
      name: 'FreeTeacher',
      component: FreeTeacher,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/FreeTeacherResult',
      name: 'FreeTeacherResult',
      component: FreeTeacherResult,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/RoomTimetable',
      name: 'RoomTimetable',
      component: RoomTimetable,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/RoomTimetableResult',
      name: 'RoomTimetableResult',
      component: RoomTimetableResult,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/StdTimetable',
      name: 'StdTimetable',
      component: StdTimetable,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/StdTimetableResult',
      name: 'StdTimetableResult',
      component: StdTimetableResult,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/SwapLesson',
      name: 'SwapLesson',
      component: SwapLesson,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/SwapLessonPick',
      name: 'SwapLessonPick',
      component: SwapLessonPick,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/SwapLessonResult',
      name: 'SwapLessonResult',
      component: SwapLessonResult,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/student-selector',
      name: 'StudentSelector',
      component: StudentSelector,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/ConductAward',
      name: 'ConductAward',
      component: ConductAward,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/ConductAwardVote',
      name: 'ConductAwardVote',
      component: ConductAwardVote,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/ConductAwardResult',
      name: 'ConductAwardResult',
      component: ConductAwardResult,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/PrefectNomination',
      name: 'PrefectNomination',
      component: PrefectNomination,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/PrefectNominationVote',
      name: 'PrefectNominationVote',
      component: PrefectNominationVote,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/PrefectNominationResult',
      name: 'PrefectNominationResult',
      component: PrefectNominationResult,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/LearningGoalEntry',
      name: 'LearningGoalEntry',
      component: LearningGoalEntry,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/LearningGoalResult',
      name: 'LearningGoalResult',
      component: LearningGoalResult,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/BLA',
      name: 'BLA',
      component: BLA,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/BLAvote',
      name: 'BLAvote',
      component: BLAvote,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/BLAResult',
      name: 'BLAResult',
      component: BLAResult,
      meta: { show: true, requiresAuth: true }
    },
    {
      path: '/editTeacher',
      name: 'editTeacher',
      component: editTeacher,
      meta: { show: true, requiredPermission: 'manageUsers' }
    },
    {
      path: '/ImportTeacher',
      name: 'ImportTeacher',
      component: ImportTeacher,
      meta: { show: true, requiredPermission: 'importTimetable' }
    },
    {
      path: '/StudentManagement',
      name: 'StudentManagement',
      component: StudentManagement,
      meta: { show: true, requiredPermission: 'manageStudents' }
    },
    {
      path: '/*',
      redirect: '/login'
    }
  ]
})

const timetableRouteNames = new Set([
  'TeacherTimetable', 'TeacherTimetableResult', 'ClassObservation', 'ClassObservationResult',
  'ClassTimetable', 'ClassTimetableResult', 'Electives', 'ElectivesResult', 'FreeTeacher',
  'FreeTeacherResult', 'RoomTimetable', 'RoomTimetableResult', 'StdTimetable', 'StdTimetableResult',
  'SwapLesson', 'SwapLessonPick', 'SwapLessonResult', 'StudentSelector'
])

const nominationRouteNames = new Set([
  'BLA', 'BLAvote', 'BLAResult', 'ConductAward', 'ConductAwardVote', 'ConductAwardResult',
  'PrefectNomination', 'PrefectNominationVote', 'PrefectNominationResult',
  'LearningGoalEntry', 'LearningGoalResult'
])

router.beforeEach((to, from, next) => {
  const rawUser = localStorage.getItem('user')
  const user = rawUser ? JSON.parse(rawUser) : null

  const routePermission = to.meta.requiredPermission ||
    (timetableRouteNames.has(to.name) ? 'timetable' : null) ||
    (nominationRouteNames.has(to.name) ? 'nominations' : null)

  if (to.meta.requiredRole && (!user || user.role !== to.meta.requiredRole)) {
    return next('/login')
  }

  if (routePermission) {
    const permissions = user && user.permissions ? user.permissions : {}
    const isManager = user && user.role === 'manager'
    if (!user || (!isManager && !permissions[routePermission])) {
      return next('/login')
    }
  }

  if (to.meta.allowedRoles && (!user || !to.meta.allowedRoles.includes(user.role))) {
    return next('/login')
  }

  if (to.meta.requiresAuth && !user) {
    return next('/login')
  }

  next()
})

export default router
