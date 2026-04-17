const PREFIX = 'choreup_';

const keys = ['currentUser', 'group', 'users', 'chores', 'assignments', 'weekWinners'];

export const save = (key, value) => {
  try {
    localStorage.setItem(PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Storage write failed:', e);
  }
};

export const load = (key, fallback = null) => {
  try {
    const raw = localStorage.getItem(PREFIX + key);
    return raw !== null ? JSON.parse(raw) : fallback;
  } catch (e) {
    console.error('Storage read failed:', e);
    return fallback;
  }
};

export const loadAllState = () => ({
  currentUser: load('currentUser', null),
  group:       load('group', null),
  users:       load('users', []),
  chores:      load('chores', []),
  assignments: load('assignments', []),
  weekWinners: load('weekWinners', []),
});

export const saveAllState = (state) => {
  keys.forEach((k) => save(k, state[k]));
};
