import axios from 'axios';
import { apiUrl } from './api';

let csrf = null;
let pending = null;
let onSessionExpired = () => {};

export function setSessionExpiredHandler(handler) {
  onSessionExpired = handler;
}
axios.defaults.withCredentials = true;
localStorage.removeItem('token');

axios.interceptors.request.use(async config => {
  const target = new URL(config.url, config.baseURL || window.location.origin);
  const api = new URL(apiUrl('/'), window.location.origin);
  if (target.origin !== api.origin) return config;
  if (!['get', 'head', 'options'].includes((config.method || 'get').toLowerCase())) {
    if (!csrf) {
      if (!pending) pending = axios.get(apiUrl('/auth/csrf')).then(response => {
        csrf = response.data.csrfToken;
      }).finally(() => { pending = null; });
      await pending;
    }
    config.headers = config.headers || {};
    config.headers['X-CSRF-Token'] = csrf;
  }
  return config;
});
axios.interceptors.response.use(response => {
  if (/\/auth\/(login|logout|change-password)$/.test(response.config.url)) csrf = null;
  return response;
}, error => {
  if (error.response && error.response.data.code === 'CSRF_INVALID') csrf = null;
  if (error.response && error.response.status === 401 && !/\/auth\/login$/.test(error.config.url)) {
    localStorage.removeItem('user');
    onSessionExpired();
  }
  return Promise.reject(error);
});

export async function refreshSession() {
  try {
    const response = await axios.get(apiUrl('/auth/me'));
    localStorage.setItem('user', JSON.stringify(response.data));
    return response.data;
  } catch (error) {
    localStorage.removeItem('user');
    return null;
  }
}
