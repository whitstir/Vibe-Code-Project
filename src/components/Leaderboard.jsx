import { useApp } from '../context/AppContext';
import { getWeekStart, getWeekEnd, formatDate, formatDateLong } from '../utils/dateUtils';
import { getRank } from '../utils/pointsUtils';
import { FREQ_META } from './ChoreCard';

const MEDALS = ['🥇', '🥈', '🥉'];

export default function Leaderboard() {
  const { state } = useApp();
  const { users, currentUser, chores, assignments, weekWinners } = state;

  const weekStart = getWeekStart();
  const weekEnd   = getWeekEnd();

  const choreLookup = Object.fromEntries(chores.map((c) => [c.id, c]));

  const getUserStats = (userId) => {
    const userAssignments = assignments.filter((a) => a.userId === userId);
    const done = userAssignments.filter((a) => a.completed);
    const pct  = userAssignments.length > 0 ? Math.round((done.length / userAssignments.length) * 100) : 0;

    const byFreq = { daily: { total: 0, done: 0 }, weekly: { total: 0, done: 0 }, monthly: { total: 0, done: 0 } };
    userAssignments.forEach((a) => {
      const freq = choreLookup[a.choreId]?.frequency;
      if (freq && byFreq[freq]) {
        byFreq[freq].total++;
        if (a.completed) byFreq[freq].done++;
      }
    });

    return { pct, byFreq };
  };

  const ranked = [...users].sort((a, b) => b.weeklyPoints - a.weeklyPoints);

  return (
    <div className="page">
      <div className="page-header">
        <h2>Leaderboard</h2>
        <p className="muted small">{formatDate(weekStart)} – {formatDate(weekEnd)}</p>
      </div>

      {/* Current standings */}
      <div className="rankings">
        {ranked.map((user, idx) => {
          const isMe = user.id === currentUser.id;
          const stats = getUserStats(user.id);
          const rank  = getRank(user.totalPoints);

          return (
            <div key={user.id} className={`rank-card ${isMe ? 'rank-card--me' : ''}`}>
              <div className="rank-pos">{idx < 3 ? MEDALS[idx] : `#${idx + 1}`}</div>

              <div className="rank-avatar" style={{ background: user.color }}>
                {user.name[0].toUpperCase()}
              </div>

              <div className="rank-details">
                <div className="rank-name-row">
                  <span className="rank-name">{user.name}</span>
                  {isMe && <span className="you-badge">you</span>}
                  <span className="rank-tier" style={{ color: rank.color }}>{rank.label}</span>
                </div>

                {/* Per-frequency breakdown */}
                <div className="freq-breakdown">
                  {(['daily', 'weekly', 'monthly']).map((freq) => {
                    const meta = FREQ_META[freq];
                    const s = stats.byFreq[freq];
                    if (s.total === 0) return null;
                    return (
                      <span key={freq} className="freq-chip" style={{ color: meta.color, background: meta.bg }}>
                        {meta.icon} {s.done}/{s.total}
                      </span>
                    );
                  })}
                </div>

                <div className="rank-progress-row">
                  <div className="mini-bar">
                    <div className="mini-bar-fill" style={{ width: `${stats.pct}%`, background: user.color }} />
                  </div>
                  <span className="mini-pct">{stats.pct}% done</span>
                </div>
              </div>

              <div className="rank-pts-col">
                <div className="rank-weekly-pts">{user.weeklyPoints}</div>
                <div className="rank-pts-label">wk pts</div>
                <div className="rank-total-pts">{user.totalPoints} total</div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Past winners */}
      {weekWinners.length > 0 && (
        <div className="past-winners">
          <h3>Past Weekly Winners</h3>
          <div className="winners-list">
            {[...weekWinners].reverse().slice(0, 10).map((w, i) => (
              <div key={i} className="winner-row">
                <span className="winner-trophy">🏆</span>
                <span
                  className="winner-dot"
                  style={{ background: w.winnerColor ?? '#6366f1' }}
                >
                  {w.winnerName[0].toUpperCase()}
                </span>
                <span className="winner-name">{w.winnerName}</span>
                <span className="winner-dates muted small">
                  {formatDate(w.weekStart)} – {formatDate(w.weekEnd)}
                </span>
                <span className="winner-pts">{w.points} pts</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
