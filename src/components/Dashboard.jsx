import { useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { getToday, getWeekStart, getWeekEnd, formatDate, isSameDay, isSameWeek, isSameMonth } from '../utils/dateUtils';
import { getRank } from '../utils/pointsUtils';

export default function Dashboard() {
  const { state, dispatch } = useApp();
  const { currentUser, group, users, chores, assignments, weekWinners } = state;

  // Auto-assign whenever the dashboard mounts (refreshes expired periods)
  useEffect(() => {
    if (chores.length > 0 && users.length > 0) {
      dispatch({ type: 'ASSIGN_CHORES' });
    }
  }, []);

  const today     = getToday();
  const weekStart = getWeekStart();
  const weekEnd   = getWeekEnd();

  // My current-period assignments
  const choreLookup = Object.fromEntries(chores.map((c) => [c.id, c]));
  const myAssignments = assignments.filter((a) => {
    if (a.userId !== currentUser.id) return false;
    const chore = choreLookup[a.choreId];
    if (!chore) return false;
    if (chore.frequency === 'daily')   return isSameDay(a.assignedDate, today);
    if (chore.frequency === 'weekly')  return isSameWeek(a.assignedDate, today);
    if (chore.frequency === 'monthly') return isSameMonth(a.assignedDate, today);
    return false;
  });

  const completed = myAssignments.filter((a) => a.completed).length;
  const total     = myAssignments.length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  const rank = getRank(currentUser.totalPoints);

  // Sorted users for mini-leaderboard
  const ranked = [...users].sort((a, b) => b.weeklyPoints - a.weeklyPoints);

  const latestWinner = weekWinners.length > 0 ? weekWinners[weekWinners.length - 1] : null;

  return (
    <div className="page">
      {/* Welcome */}
      <div className="dashboard-welcome">
        <div>
          <h2>Hey, {currentUser.name}! 👋</h2>
          <p className="muted">{formatDate(today)}</p>
        </div>
        <div className="rank-badge" style={{ color: rank.color, borderColor: rank.color }}>
          {rank.label}
        </div>
      </div>

      {/* Last winner banner */}
      {latestWinner && (
        <div className="winner-banner">
          🏆 Last week's winner: <strong>{latestWinner.winnerName}</strong> — {latestWinner.points} pts
          <span className="winner-week"> ({formatDate(latestWinner.weekStart)}–{formatDate(latestWinner.weekEnd)})</span>
        </div>
      )}

      {/* Stats row */}
      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-value" style={{ color: '#6366f1' }}>{currentUser.weeklyPoints}</div>
          <div className="stat-label">Weekly Points</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{currentUser.totalPoints}</div>
          <div className="stat-label">Total Points</div>
        </div>
        <div className="stat-card">
          <div className="stat-value" style={{ color: pct === 100 ? '#10b981' : '#1e293b' }}>{pct}%</div>
          <div className="stat-label">Done This Period</div>
        </div>
        <div className="stat-card">
          <div className="stat-value">{completed}/{total}</div>
          <div className="stat-label">Chores Complete</div>
        </div>
      </div>

      {/* Progress bar */}
      {total > 0 && (
        <div className="progress-section">
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${pct}%` }} />
          </div>
          <p className="progress-label">
            {completed === total ? '🎉 All done for this period!' : `${total - completed} chore${total - completed !== 1 ? 's' : ''} remaining`}
          </p>
        </div>
      )}

      {/* Group info */}
      <div className="dashboard-card">
        <h3>{group.name}</h3>
        <div className="group-code-row">
          <span className="muted">Invite code:</span>
          <span className="code-display">{group.code}</span>
        </div>
        <div className="members-row">
          {users.map((u) => (
            <div key={u.id} className="member-chip">
              <span className="member-dot" style={{ background: u.color }}>{u.name[0].toUpperCase()}</span>
              <span>{u.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Mini leaderboard */}
      <div className="dashboard-card">
        <h3>This Week's Standings</h3>
        <p className="muted small">{formatDate(weekStart)} – {formatDate(weekEnd)}</p>
        <div className="mini-leaderboard">
          {ranked.map((u, i) => (
            <div key={u.id} className={`mini-rank-row ${u.id === currentUser.id ? 'mini-rank-row--you' : ''}`}>
              <span className="mini-rank-pos">{i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}</span>
              <span className="mini-rank-dot" style={{ background: u.color }}>{u.name[0].toUpperCase()}</span>
              <span className="mini-rank-name">{u.name}{u.id === currentUser.id && <span className="you-tag"> (you)</span>}</span>
              <span className="mini-rank-pts">{u.weeklyPoints} pts</span>
            </div>
          ))}
        </div>
      </div>

      {/* CTA if no chores */}
      {chores.length === 0 && (
        <div className="empty-cta">
          <p>No chores added yet.</p>
          <button className="btn btn--primary" onClick={() => dispatch({ type: 'SET_VIEW', payload: 'chores' })}>
            Add Your First Chore
          </button>
        </div>
      )}
    </div>
  );
}
