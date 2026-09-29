export function timetablePeriodLabel(locale, period, time, alternateTime) {
  const periodText = number => locale === 'en' ? `Period ${number}` : `第${number}節`;
  const alternateTimeText = alternateTime
    ? `<br><small class="red-time">(${alternateTime})</small>`
    : '';

  return `${periodText(period)}<br><small>(${time})</small>${alternateTimeText}`;
}
