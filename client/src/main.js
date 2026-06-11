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

/* eslint-disable no-new */
new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
