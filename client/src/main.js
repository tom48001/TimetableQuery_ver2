import { refreshSession, setSessionExpiredHandler } from './config/session'
import Vue from 'vue'
import App from './App'
import router from './router'
import i18n, { i18nState, setLocale, t } from './i18n'
import './assets/theme.css'

Vue.config.productionTip = false
Vue.prototype.$lang = i18nState
Vue.prototype.$setLocale = setLocale
Vue.prototype.$t = t
Vue.prototype.$i18n = i18n

setSessionExpiredHandler(() => {
  if (router.currentRoute.path !== '/login') {
    router.replace('/login', () => {}, () => {})
  }
})

/* eslint-disable no-new */
refreshSession().then(() => new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
}))
