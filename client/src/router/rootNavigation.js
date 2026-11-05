// Vue Router owns internal routes; browser history entries all keep the URL '/'.
const STORAGE_KEY = 'timetable.navigation.v1'
const STATE_KEY = 'timetableNavigation'

export function initializeRootNavigation(router, browser) {
  const owner = () => {
    try { const user = JSON.parse(browser.localStorage.getItem('user') || 'null'); return user ? user.id : null } catch (error) { return null }
  }
  const valid = saved => saved && saved.owner === owner() && typeof saved.path === 'string' && saved.path.startsWith('/') && !saved.path.startsWith('//')
  const incoming = browser.location.pathname + browser.location.search + browser.location.hash
  let target = owner() ? '/home' : '/login'
  if (incoming !== '/') target = incoming
  else {
    let saved = browser.history.state && browser.history.state[STATE_KEY]
    if (!valid(saved)) {
      try { saved = JSON.parse(browser.sessionStorage.getItem(STORAGE_KEY) || 'null') } catch (error) { /* Optional refresh fallback. */ }
    }
    if (valid(saved)) target = saved.path
  }

  let action = 'replace'
  const push = router.push.bind(router)
  const replace = router.replace.bind(router)
  router.push = (...args) => { action = 'push'; return push(...args) }
  router.replace = (...args) => { action = 'replace'; return replace(...args) }
  router.go = delta => browser.history.go(delta)
  browser.addEventListener('popstate', event => {
    const saved = event.state && event.state[STATE_KEY]
    let path = valid(saved) ? saved.path : (owner() ? '/home' : '/login')
    if (owner() && ['/login', '/google-redirect'].includes(path.split('?')[0])) path = '/home'
    action = 'replace'
    replace(path, () => {}, () => {})
  })
  // OAuth parameters remain only in the internal route, never in history/storage.
  browser.history.replaceState(browser.history.state, '', '/')
  router.afterEach((to, from) => {
    const transient = to.name === 'GoogleRedirect'
    const saved = { owner: owner(), path: transient ? '/login' : to.fullPath }
    const state = { ...browser.history.state, [STATE_KEY]: saved }
    const authTransition = ['login', 'GoogleRedirect'].includes(to.name) || ['login', 'GoogleRedirect'].includes(from.name)
    if (action === 'push' && !authTransition) browser.history.pushState(state, '', '/')
    else browser.history.replaceState(state, '', '/')
    action = 'replace'
    try {
      if (transient) browser.sessionStorage.removeItem(STORAGE_KEY)
      else browser.sessionStorage.setItem(STORAGE_KEY, JSON.stringify(saved))
    } catch (error) { /* History still restores the page if session storage is blocked. */ }
  })
  replace(target, () => {}, () => {})
}
