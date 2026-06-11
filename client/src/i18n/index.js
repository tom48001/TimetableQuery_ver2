import Vue from 'vue';
import messages from './messages';

const DEFAULT_LOCALE = 'zh';
const savedLocale = localStorage.getItem('locale');

export const i18nState = new Vue({
  data: {
    locale: savedLocale === 'en' ? 'en' : DEFAULT_LOCALE
  }
});

function findMessage(path) {
  return path.split('.').reduce((current, part) => {
    return current && current[part] ? current[part] : null;
  }, messages);
}

export function t(path) {
  const message = findMessage(path);
  if (!message) return path;
  return message[i18nState.locale] || message[DEFAULT_LOCALE] || path;
}

export function setLocale(locale) {
  i18nState.locale = locale === 'en' ? 'en' : DEFAULT_LOCALE;
  localStorage.setItem('locale', i18nState.locale);
}

export default {
  state: i18nState,
  t,
  setLocale
};
