// Returns today's date as YYYY-MM-DD using local time (avoids UTC offset issues)
export const getToday = () => {
  const now = new Date();
  return [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('-');
};

// Returns the Sunday of the current week as YYYY-MM-DD
export const getWeekStart = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0); // Avoid DST edge cases
  d.setDate(d.getDate() - d.getDay()); // Sunday = 0
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
};

// Returns the Saturday of the current week as YYYY-MM-DD
export const getWeekEnd = (date = new Date()) => {
  const d = new Date(date);
  d.setHours(12, 0, 0, 0);
  d.setDate(d.getDate() + (6 - d.getDay())); // Saturday = 6
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
};

// Returns the last day of the current month as YYYY-MM-DD
export const getMonthEnd = (date = new Date()) => {
  const d = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return [
    d.getFullYear(),
    String(d.getMonth() + 1).padStart(2, '0'),
    String(d.getDate()).padStart(2, '0'),
  ].join('-');
};

// Returns YYYY-MM key for the month
export const getMonthKey = (date = new Date()) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;

// Compare two YYYY-MM-DD strings
export const isSameDay = (d1, d2) => d1.slice(0, 10) === d2.slice(0, 10);

export const isSameWeek = (d1, d2) =>
  getWeekStart(new Date(d1 + 'T12:00:00')) === getWeekStart(new Date(d2 + 'T12:00:00'));

export const isSameMonth = (d1, d2) =>
  getMonthKey(new Date(d1 + 'T12:00:00')) === getMonthKey(new Date(d2 + 'T12:00:00'));

export const isSaturday = (date = new Date()) => date.getDay() === 6;

export const formatDate = (dateStr) =>
  new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  });

export const formatDateLong = (dateStr) =>
  new Date(dateStr + 'T12:00:00').toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
