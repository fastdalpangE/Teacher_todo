export const DAYS = ['일', '월', '화', '수', '목', '금', '토'];

export function getDateKey(input) {
  const d = new Date(input);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
}

export function getWeekStart(baseDate = new Date()) {
  const d = new Date(baseDate);
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  d.setHours(0, 0, 0, 0);
  return d;
}

export function getDayLabel(dateKey) {
  const d = new Date(dateKey);
  return DAYS[d.getDay()];
}

export function getWeekDates(baseDate = new Date()) {
  const start = getWeekStart(baseDate);
  return Array.from({ length: 7 }, (_, index) => {
    const next = new Date(start);
    next.setDate(start.getDate() + index);
    return getDateKey(next);
  });
}

export function formatDisplayDate(dateKey) {
  const d = new Date(dateKey);
  return `${d.getMonth() + 1}월 ${d.getDate()}일`;
}
