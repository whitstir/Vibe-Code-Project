import { useState } from 'react';
import { useApp } from '../context/AppContext';
import ChoreCard from './ChoreCard';
import ChoreForm from './ChoreForm';

const FILTERS = [
  { key: 'all',     label: 'All' },
  { key: 'daily',   label: '🌅 Daily' },
  { key: 'weekly',  label: '📅 Weekly' },
  { key: 'monthly', label: '🗓️ Monthly' },
];

export default function ChoresList() {
  const { state, dispatch } = useApp();
  const { chores, group } = state;
  const [showForm,     setShowForm]     = useState(false);
  const [editingChore, setEditingChore] = useState(null);
  const [filter,       setFilter]       = useState('all');

  const groupChores = chores.filter((c) => c.groupId === group.id);
  const visible     = filter === 'all' ? groupChores : groupChores.filter((c) => c.frequency === filter);

  const counts = {
    all:     groupChores.length,
    daily:   groupChores.filter((c) => c.frequency === 'daily').length,
    weekly:  groupChores.filter((c) => c.frequency === 'weekly').length,
    monthly: groupChores.filter((c) => c.frequency === 'monthly').length,
  };

  const openAdd = () => { setEditingChore(null); setShowForm(true); };

  const openEdit = (chore) => { setEditingChore(chore); setShowForm(true); };

  const handleDelete = (id) => {
    if (!window.confirm('Delete this chore? This will also remove its assignments.')) return;
    dispatch({ type: 'DELETE_CHORE', payload: id });
  };

  const handleSubmit = (data) => {
    if (editingChore) {
      dispatch({ type: 'UPDATE_CHORE', payload: { id: editingChore.id, ...data } });
    } else {
      dispatch({ type: 'ADD_CHORE', payload: data });
    }
  };

  const handleAssign = () => {
    dispatch({ type: 'ASSIGN_CHORES' });
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>All Chores</h2>
        <button className="btn btn--primary" onClick={openAdd}>+ Add Chore</button>
      </div>

      {/* Filter tabs */}
      <div className="filter-tabs">
        {FILTERS.map((f) => (
          <button
            key={f.key}
            className={`filter-tab ${filter === f.key ? 'filter-tab--active' : ''}`}
            onClick={() => setFilter(f.key)}
          >
            {f.label}
            <span className="tab-count">{counts[f.key]}</span>
          </button>
        ))}
      </div>

      {/* Chores grid */}
      {visible.length === 0 ? (
        <div className="empty-state">
          <p>{filter === 'all' ? 'No chores yet.' : `No ${filter} chores yet.`}</p>
          <button className="btn btn--ghost" onClick={openAdd}>Add one now</button>
        </div>
      ) : (
        <div className="chores-grid">
          {visible.map((chore) => (
            <ChoreCard
              key={chore.id}
              chore={chore}
              onEdit={openEdit}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Assign button */}
      {groupChores.length > 0 && (
        <div className="assign-bar">
          <p className="assign-hint">
            Chores are auto-assigned when periods reset. You can also reassign manually:
          </p>
          <button className="btn btn--secondary btn--full" onClick={handleAssign}>
            🎲 Randomly Reassign All Chores
          </button>
        </div>
      )}

      {showForm && (
        <ChoreForm
          chore={editingChore}
          onSubmit={handleSubmit}
          onClose={() => { setShowForm(false); setEditingChore(null); }}
        />
      )}
    </div>
  );
}
