import { getToday, getWeekEnd, getMonthEnd, isSameDay, isSameWeek, isSameMonth } from './dateUtils';
import { getPoints } from './pointsUtils';

export const generateId = () =>
  Date.now().toString(36) + Math.random().toString(36).slice(2);

export const generateGroupCode = () => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // Omit I, O, 0, 1 to avoid confusion
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
};

const shuffle = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

// Determines whether an existing assignment is still valid for its period
const isAssignmentCurrent = (assignment, chore) => {
  const today = getToday();
  if (chore.frequency === 'daily')   return isSameDay(assignment.assignedDate, today);
  if (chore.frequency === 'weekly')  return isSameWeek(assignment.assignedDate, today);
  if (chore.frequency === 'monthly') return isSameMonth(assignment.assignedDate, today);
  return false;
};

// Assign chores across users, preserving already-valid assignments.
// Guarantees each user gets ≥1 chore of each frequency IF enough chores exist.
// Remaining chores are distributed round-robin.
export const assignChores = (chores, users, existingAssignments) => {
  if (!users.length || !chores.length) return existingAssignments;

  const today = getToday();

  // Keep assignments that are still valid for their period
  const choreLookup = Object.fromEntries(chores.map((c) => [c.id, c]));
  const valid = existingAssignments.filter((a) => {
    const chore = choreLookup[a.choreId];
    return chore && isAssignmentCurrent(a, chore);
  });

  const assignedChoreIds = new Set(valid.map((a) => a.choreId));

  // Partition unassigned chores by frequency
  const unassigned = {
    daily:   shuffle(chores.filter((c) => c.frequency === 'daily'   && !assignedChoreIds.has(c.id))),
    weekly:  shuffle(chores.filter((c) => c.frequency === 'weekly'  && !assignedChoreIds.has(c.id))),
    monthly: shuffle(chores.filter((c) => c.frequency === 'monthly' && !assignedChoreIds.has(c.id))),
  };

  const newAssignments = [];

  const makeAssignment = (chore, userId) => {
    let dueDate = today;
    if (chore.frequency === 'weekly')  dueDate = getWeekEnd();
    if (chore.frequency === 'monthly') dueDate = getMonthEnd();
    return {
      id:           generateId(),
      choreId:      chore.id,
      userId,
      groupId:      chore.groupId,
      assignedDate: today,
      dueDate,
      completed:    false,
      completedAt:  null,
      pointsEarned: getPoints(chore.frequency),
    };
  };

  const shuffledUsers = shuffle(users);

  // Guarantee phase: ensure each user has ≥1 assignment per frequency bucket
  (['daily', 'weekly', 'monthly']).forEach((freq) => {
    shuffledUsers.forEach((user) => {
      const alreadyHas = valid.some(
        (a) => a.userId === user.id && choreLookup[a.choreId]?.frequency === freq
      );
      if (!alreadyHas && unassigned[freq].length > 0) {
        newAssignments.push(makeAssignment(unassigned[freq].shift(), user.id));
      }
    });
  });

  // Distribution phase: round-robin for remaining unassigned chores
  (['daily', 'weekly', 'monthly']).forEach((freq) => {
    let idx = 0;
    while (unassigned[freq].length > 0) {
      const chore = unassigned[freq].shift();
      newAssignments.push(makeAssignment(chore, shuffledUsers[idx % shuffledUsers.length].id));
      idx++;
    }
  });

  return [...valid, ...newAssignments];
};
