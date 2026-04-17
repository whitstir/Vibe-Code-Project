import { useApp } from '../context/AppContext';
import { getToday, isSameDay, isSameWeek, isSameMonth, formatDate } from '../utils/dateUtils';
import { FREQ_META } from './ChoreCard';

export default function MyChores() {
  const { state, dispatch } = useApp();
  const { currentUser, chores, assignments } = state;

  const today = getToday();
  const choreLookup = Object.fromEntries(chores.map((c) => [c.id, c]));

  // Valid assignments for the current user this period
  const mine = assignments.filter((a) => {
    if (a.userId !== currentUser.id) return false;
    const chore = choreLookup[a.choreId];
    if (!chore) return false;
    if (chore.frequency === 'daily')   return isSameDay(a.assignedDate, today);
    if (chore.frequency === 'weekly')  return isSameWeek(a.assignedDate, today);
    if (chore.frequency === 'monthly') return isSameMonth(a.assignedDate, today);
    return false;
  });

  const completed = mine.filter((a) => a.completed).length;
  const total     = mine.length;
  const pct       = total > 0 ? Math.round((completed / total) * 100) : 0;

  const handleComplete = (id) => dispatch({ type: 'COMPLETE_ASSIGNMENT', payload: { assignmentId: id } });

  const byFreq = {
    daily:   mine.filter((a) => choreLookup[a.choreId]?.frequency === 'daily'),
    weekly:  mine.filter((a) => choreLookup[a.choreId]?.frequency === 'weekly'),
    monthly: mine.filter((a) => choreLookup[a.choreId]?.frequency === 'monthly'),
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>My Chores</h2>
      </div>

      {/* Progress */}
      {total > 0 && (
        <div className="my-progress">
          <div className="my-progress-header">
            <span>{completed} of {total} complete</span>
            <span className="my-pct">{pct}%</span>
          </div>
          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${pct}%`, background: pct === 100 ? '#10b981' : '#6366f1' }}
            />
          </div>
          {pct === 100 && <p className="all-done">🎉 All done! Great work!</p>}
        </div>
      )}

      {mine.length === 0 ? (
        <div className="empty-state">
          <p>No chores assigned yet.</p>
          <p className="muted">Go to <strong>All Chores</strong> and hit "Randomly Reassign" to get started.</p>
        </div>
      ) : (
        (['daily', 'weekly', 'monthly']).map((freq) => {
          const list = byFreq[freq];
          if (!list.length) return null;
          const meta = FREQ_META[freq];

          return (
            <section key={freq} className="chore-section">
              <h3 className="section-heading" style={{ color: meta.color }}>
                {meta.icon} {meta.label} Chores
              </h3>
              <div className="assignment-list">
                {list.map((a) => {
                  const chore = choreLookup[a.choreId];
                  if (!chore) return null;
                  return (
                    <div
                      key={a.id}
                      className={`assignment-card ${a.completed ? 'assignment-card--done' : ''}`}
                      style={{ borderLeftColor: meta.color }}
                    >
                      <div className="assignment-body">
                        <div className="assignment-title">{chore.title}</div>
                        {chore.description && (
                          <div className="assignment-desc">{chore.description}</div>
                        )}
                        <div className="assignment-due muted">
                          Due: {formatDate(a.dueDate)} · <span style={{ color: meta.color }}>+{a.pointsEarned} pts</span>
                        </div>
                      </div>
                      {a.completed ? (
                        <div className="done-badge">✓ Done</div>
                      ) : (
                        <button
                          className="complete-btn"
                          style={{ background: meta.color }}
                          onClick={() => handleComplete(a.id)}
                        >
                          Mark Done
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>
          );
        })
      )}
    </div>
  );
}
