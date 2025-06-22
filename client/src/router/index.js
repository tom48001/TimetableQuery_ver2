import Vue from 'vue'
import Router from 'vue-router'

import Login from '@/pages/Login.vue'
import Home from '@/pages/Home.vue'
import GoogleRedirect from '@/pages/GoogleRedirect.vue'

import TeacherTimetable from '@/pages/SubMenu1/TeacherTimetable.vue'
import TeacherTimetableResult from '../pages/SubMenu1/TeacherTimetableResult.vue'
import ClassObservation from '@/pages/SubMenu1/ClassObservation.vue'
import ClassTimetable from '@/pages/SubMenu1/ClassTimetable.vue'
import Electives from '@/pages/SubMenu1/Electives.vue'
import FreeTeacher from '@/pages/SubMenu1/FreeTeacher.vue'
import RoomTimetable from '@/pages/SubMenu1/RoomTimetable.vue'
import StdTimetable from '@/pages/SubMenu1/StdTimetable.vue'
import SwapLesson from '@/pages/SubMenu1/SwapLesson.vue'
import StudentSelector from '@/pages/SubMenu1/StudentSelector.vue'

import BLA from '@/pages/SubMenu2/BLA.vue'
import BLAResult from '@/pages/SubMenu2/BLAResult.vue'
import ConductAward from '@/pages/SubMenu2/ConductAward.vue'
import ConductAwardResult from '@/pages/SubMenu2/ConductAwardResult.vue'

import editTeacher from '@/pages/SubMenu3/editTeacher.vue';
import ClassObservationResult from '../pages/SubMenu1/ClassObservationResult.vue'

Vue.use(Router);

const router = new Router({
  mode: 'history', // Use clean URLs
  routes: [
    { path: '/google-redirect', name: 'GoogleRedirect', component: GoogleRedirect },
    {
      path: '/',
      redirect: '/login' // Redirect to login page by default
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
      meta: { show: true }
    },
    {
      path: '/TeacherTimetable',
      name: 'TeacherTimetable',
      component: TeacherTimetable,
      meta: { show: true }
    },
    {
      path: '/TeacherTimetableResult',
      name: 'TeacherTimetableResult',
      component: TeacherTimetableResult,
      meta: { show: true }
    },
    {
      path: '/ClassObservation',
      name: 'ClassObservation',
      component: ClassObservation,
      meta: { show: true }
    },
    {
      path: '/ClassObservationResult',
      name: 'ClassObservationResult',
      component: ClassObservationResult,
      meta: { show: true }
    },
    {
      path: '/ClassTimetable',
      name: 'ClassTimetable',
      component: ClassTimetable,
      meta: { show: true }
    },
    {
      path: '/Electives',
      name: 'Electives',
      component: Electives,
      meta: { show: true }
    },
    {
      path: '/FreeTeacher',
      name: 'FreeTeacher',
      component: FreeTeacher,
      meta: { show: true }
    },
    {
      path: '/RoomTimetable',
      name: 'RoomTimetable',
      component: RoomTimetable,
      meta: { show: true }
    },
    {
      path: '/StdTimetable',
      name: 'StdTimetable',
      component: StdTimetable,
      meta: { show: true }
    },
    {
      path: '/SwapLesson',
      name: 'SwapLesson',
      component: SwapLesson,
      meta: { show: true }
    },
    {
      path: '/student-selector',
      name: 'StudentSelector',
      component: StudentSelector,
      meta: { show: true }
    },
    {
      path: '/ConductAwardResult',
      name: 'ConductAwardResult',
      component: ConductAwardResult,
      meta: { show: true }
    },
    {
      path: '/BLA',
      name: 'BLA',
      component: BLA,
      meta: { show: true }
    },
    {
      path: '/BLAResult',
      name: 'BLAResult',
      component: BLAResult,
      meta: { show: true }
    },
    {
      path: '/ConductAward',
      name: 'ConductAward',
      component: ConductAward,
      meta: { show: true }
    },
    {
      path: '/editTeacher',
      name: 'editTeacher',
      component: editTeacher,
      meta: { show: true, requiredRole: 'manager' }
    },
    {
      path: '/*',
      redirect: '/login' // Always redirect unknown routes to login
    }
  ]
});

router.beforeEach((to, from, next) => {
  const user = JSON.parse(localStorage.getItem('user'));

  // 只有 admin 可進入 editTeacher 頁
  if (to.meta.requiredRole && (!user || user.role !== to.meta.requiredRole)) {
    return next('/login');
  }

  next();
});

export default router;
