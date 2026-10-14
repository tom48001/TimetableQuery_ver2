const runtimeBaseUrl = typeof window !== 'undefined' ? window.__API_BASE_URL__ : '';
const envBaseUrl = typeof process !== 'undefined' && process.env ? (process.env.VUE_APP_API_BASE_URL || process.env.API_BASE_URL) : '';

export const API_BASE_URL = (runtimeBaseUrl || envBaseUrl || '/api').replace(/\/$/, '');

export function apiUrl(path = '') {
  if (/^https?:\/\//i.test(path)) return path;
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalizedPath}`;
}
