import { createContext, useContext, useReducer, useEffect } from 'react';
import { loadAllState, saveAllState, load } from '../utils/storage';
import { generateId, generateGroupCode, assignChores } from '../utils/choreUtils';
import { getWeekStart, getWeekEnd, isSaturday } from '../utils/dateUtils';
import { getPoints } from '../utils/pointsUtils';

export const AppContext = createContext(null);

// Avatar colors cycled for new users
const COLORS = [
  '#6366f1', '#ec4899', '#14b8a6', '#f59e0b',
  '#10b981', '#ef4444', '#8b5cf6', '#06b6d4',
];

const initialState = {
  currentUser:  null,
  group:        null,
  users:        [],
  chores:       [],
  assignments:  [],
  weekWinners:  [],
  activeView:   'dashboard',
  notification: null, // { message, type }
};

function reducer(state, action) {
  switch (action.type) {

    case 'LOAD_STATE':
      return { ...state, ...action.payload, activeView: 'dashboard' };

    case 'SET_VIEW':
      return { ...state, activeView: action.payload };

    case 'CLEAR_NOTIFICATION':
      return { ...state, notification: null };

    // ── Group management ────────────────────────────────────────────────────

    case 'CREATE_GROUP': {
      const { userName, groupName } = action.payload;
      const userId  = generateId();
      const groupId = generateId();
      const group = {
        id:        groupId,
        name:      groupName,
        code:      generateGroupCode(),
        members:   [userId],
        createdAt: new Date().toISOString(),
      };
      const user = {
        id:           userId,
        name:         userName,
        groupId,
        color:        COLORS[0],
        weeklyPoints: 0,
        totalPoints:  0,
        createdAt:    new Date().toISOString(),
      };
      return {
        ...state,
        currentUser:  user,
        group,
        users:        [user],
        chores:       [],
        assignments:  [],
        weekWinners:  [],
        activeView:   'dashboard',
        notification: { message: `Welcome to ${groupName}!`, type: 'success' },
      };
    }

    case 'JOIN_GROUP': {
      const { userName, existingGroup, existingUsers, existingChores, existingAssignments, existingWinners } = action.payload;
      const usedColors = existingUsers.map((u) => u.color);
      const color = COLORS.find((c) => !usedColors.includes(c)) ?? COLORS[existingUsers.length % COLORS.length];
      const userId = generateId();
      const user = {
        id:           userId,
        name:         userName,
        groupId:      existingGroup.id,
        color,
        weeklyPoints: 0,
        totalPoints:  0,
        createdAt:    new Date().toISOString(),
      };
      const updatedGroup = { ...existingGroup, members: [...existingGroup.members, userId] };
      return {
        ...state,
        currentUser:  user,
        group:        updatedGroup,
        users:        [...existingUsers, user],
        chores:       existingChores,
        assignments:  existingAssignments,
        weekWinners:  existingWinners,
        activeView:   'dashboard',
        notification: { message: `Joined ${existingGroup.name}!`, type: 'success' },
      };
    }

    // ── Chore management ────────────────────────────────────────────────────

    case 'ADD_CHORE': {
      const chore = {
        id:          generateId(),
        groupId:     state.group.id,
        title:       action.payload.title,
        description: action.payload.description ?? '',
        frequency:   action.payload.frequency,
        createdBy:   state.currentUser.id,
        createdAt:   new Date().toISOString(),
      };
      return {
        ...state,
        chores:       [...state.chores, chore],
        notification: { message: `"${chore.title}" added!`, type: 'success' },
      };
    }

    case 'UPDATE_CHORE': {
      const { id, title, description, frequency } = action.payload;
      return {
        ...state,
        chores: state.chores.map((c) =>
          c.id === id ? { ...c, title, description, frequency } : c
        ),
        notification: { message: 'Chore updated.', type: 'success' },
      };
    }

    case 'DELETE_CHORE':
      return {
        ...state,
        chores:      state.chores.filter((c) => c.id !== action.payload),
        assignments: state.assignments.filter((a) => a.choreId !== action.payload),
      };

    // ── Assignment management ───────────────────────────────────────────────

    case 'ASSIGN_CHORES': {
      const newAssignments = assignChores(state.chores, state.users, state.assignments);
      return { ...state, assignments: newAssignments };
    }

    case 'COMPLETE_ASSIGNMENT': {
      const { assignmentId } = action.payload;
      const assignment = state.assignments.find((a) => a.id === assignmentId);
      if (!assignment || assignment.completed) return state;

      const earned = assignment.pointsEarned;
      const now    = new Date().toISOString();

      const updatedAssignments = state.assignments.map((a) =>
        a.id === assignmentId ? { ...a, completed: true, completedAt: now } : a
      );
      const updatedUsers = state.users.map((u) =>
        u.id === assignment.userId
          ? { ...u, totalPoints: u.totalPoints + earned, weeklyPoints: u.weeklyPoints + earned }
          : u
      );
      const updatedCurrentUser =
        state.currentUser.id === assignment.userId
          ? { ...state.currentUser, totalPoints: state.currentUser.totalPoints + earned, weeklyPoints: state.currentUser.weeklyPoints + earned }
          : state.currentUser;

      return {
        ...state,
        assignments:  updatedAssignments,
        users:        updatedUsers,
        currentUser:  updatedCurrentUser,
        notification: { message: `+${earned} points earned!`, type: 'points' },
      };
    }

    // ── Weekly winner ───────────────────────────────────────────────────────

    case 'CHECK_WEEK_WINNER': {
      const weekStart = getWeekStart();
      const alreadyRecorded = state.weekWinners.some((w) => w.weekStart === weekStart);
      if (alreadyRecorded || !state.users.length) return state;

      const winner = [...state.users].sort((a, b) => b.weeklyPoints - a.weeklyPoints)[0];
      const weekWinner = {
        weekStart,
        weekEnd:     getWeekEnd(),
        winnerId:    winner.id,
        winnerName:  winner.name,
        winnerColor: winner.color,
        points:      winner.weeklyPoints,
      };
      // Reset weekly points for all users
      const resetUsers = state.users.map((u) => ({ ...u, weeklyPoints: 0 }));
      const resetCurrentUser = { ...state.currentUser, weeklyPoints: 0 };
      return {
        ...state,
        weekWinners:  [...state.weekWinners, weekWinner],
        users:        resetUsers,
        currentUser:  resetCurrentUser,
        notification: {
          message: `Week winner: ${winner.name} with ${winner.weeklyPoints} pts!`,
          type:    'winner',
        },
      };
    }

    default:
      return state;
  }
}

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);

  // Hydrate from localStorage on first mount
  useEffect(() => {
    const saved = loadAllState();
    if (saved.currentUser || saved.group) {
      dispatch({ type: 'LOAD_STATE', payload: saved });
    }
  }, []);

  // Persist state whenever it changes
  useEffect(() => {
    if (state.currentUser || state.group) {
      saveAllState(state);
    }
  }, [state]);

  // Check for week winner on Saturday
  useEffect(() => {
    if (isSaturday()) {
      dispatch({ type: 'CHECK_WEEK_WINNER' });
    }
  }, []);

  // Auto-clear notifications
  useEffect(() => {
    if (!state.notification) return;
    const timer = setTimeout(() => dispatch({ type: 'CLEAR_NOTIFICATION' }), 3000);
    return () => clearTimeout(timer);
  }, [state.notification]);

  return (
    <AppContext.Provider value={{ state, dispatch }}>
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
