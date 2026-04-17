import { useState, useEffect } from 'react';

const FREQ_OPTIONS = [
  { value: 'daily',   label: 'Daily',   icon: '🌅', points: 10, desc: 'Resets every day'   },
  { value: 'weekly',  label: 'Weekly',  icon: '📅', points: 50, desc: 'Resets each Sunday'  },
  { value: 'monthly', label: 'Monthly', icon: '🗓️', points: 30, desc: 'Resets each month'   },
];

export default function ChoreForm({ chore, onSubmit, onClose }) {
  const [title,       setTitle]       = useState('');
  const [description, setDescription] = useState('');
  const [frequency,   setFrequency]   = useState('weekly');
  const [error,       setError]       = useState('');

  useEffect(() => {
    if (chore) {
      setTitle(chore.title);
      setDescription(chore.description ?? '');
      setFrequency(chore.frequency);
    }
  }, [chore]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim()) { setError('Chore name is required.'); return; }
    onSubmit({ title: title.trim(), description: description.trim(), frequency });
    onClose();
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{chore ? 'Edit Chore' : 'Add a Chore'}</h3>
          <button className="close-btn" onClick={onClose}>✕</button>
        </div>

        {error && <p className="form-error">{error}</p>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="chore-title">Chore name *</label>
            <input
              id="chore-title"
              type="text"
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(''); }}
              placeholder="e.g. Wash the dishes"
              maxLength={60}
              autoFocus
            />
          </div>

          <div className="form-group">
            <label htmlFor="chore-desc">Description <span className="optional">(optional)</span></label>
            <textarea
              id="chore-desc"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Any extra details…"
              maxLength={200}
              rows={2}
            />
          </div>

          <div className="form-group">
            <label>Frequency</label>
            <div className="freq-grid">
              {FREQ_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  className={`freq-btn freq-btn--${opt.value} ${frequency === opt.value ? 'freq-btn--selected' : ''}`}
                  onClick={() => setFrequency(opt.value)}
                >
                  <span className="freq-icon">{opt.icon}</span>
                  <span className="freq-label">{opt.label}</span>
                  <span className="freq-pts">+{opt.points} pts</span>
                  <span className="freq-desc">{opt.desc}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="modal-actions">
            <button type="button" className="btn btn--ghost" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn--primary">
              {chore ? 'Save Changes' : 'Add Chore'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
