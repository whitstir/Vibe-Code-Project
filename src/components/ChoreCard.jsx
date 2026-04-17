import { useApp } from '../context/AppContext';

export const FREQ_META = {
  daily:   { color: '#3b82f6', bg: '#eff6ff', label: 'Daily',   icon: '🌅', points: 10 },
  weekly:  { color: '#8b5cf6', bg: '#f5f3ff', label: 'Weekly',  icon: '📅', points: 50 },
  monthly: { color: '#f59e0b', bg: '#fffbeb', label: 'Monthly', icon: '🗓️', points: 30 },
};

export default function ChoreCard({ chore, onEdit, onDelete }) {
  const { state } = useApp();
  const { users, assignments } = state;
  const meta = FREQ_META[chore.frequency];

  // Find current (incomplete) assignment for this chore
  const assignment = assignments.find((a) => a.choreId === chore.id && !a.completed);
  const assignee   = assignment ? users.find((u) => u.id === assignment.userId) : null;

  return (
    <div className="chore-card" style={{ borderLeftColor: meta.color }}>
      <div className="chore-card-top">
        <span className="freq-pill" style={{ background: meta.bg, color: meta.color }}>
          {meta.icon} {meta.label}
        </span>
        <span className="chore-pts" style={{ color: meta.color }}>+{meta.points} pts</span>
      </div>

      <h4 className="chore-title">{chore.title}</h4>
      {chore.description && <p className="chore-desc">{chore.description}</p>}

      <div className="chore-card-bottom">
        {assignee ? (
          <div className="assignee">
            <span className="assignee-dot" style={{ background: assignee.color }}>
              {assignee.name[0].toUpperCase()}
            </span>
            <span className="assignee-name">{assignee.name}</span>
          </div>
        ) : (
          <span className="unassigned">Unassigned</span>
        )}

        <div className="chore-card-actions">
          <button className="action-btn" onClick={() => onEdit(chore)}>Edit</button>
          <button className="action-btn action-btn--danger" onClick={() => onDelete(chore.id)}>Delete</button>
        </div>
      </div>
    </div>
  );
}
