import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { load } from '../utils/storage';

export default function GroupSetup() {
  const { dispatch } = useApp();
  const [mode,      setMode]      = useState(null); // 'create' | 'join'
  const [userName,  setUserName]  = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupCode, setGroupCode] = useState('');
  const [error,     setError]     = useState('');

  const reset = () => { setError(''); setUserName(''); setGroupName(''); setGroupCode(''); };

  const handleCreate = (e) => {
    e.preventDefault();
    if (!userName.trim())  { setError('Please enter your name.');         return; }
    if (!groupName.trim()) { setError('Please enter an apartment name.'); return; }
    dispatch({ type: 'CREATE_GROUP', payload: { userName: userName.trim(), groupName: groupName.trim() } });
  };

  const handleJoin = (e) => {
    e.preventDefault();
    if (!userName.trim())  { setError('Please enter your name.');          return; }
    if (!groupCode.trim()) { setError('Please enter the group code.');      return; }

    // Look up group from shared localStorage
    const existingGroup       = load('group',       null);
    const existingUsers       = load('users',        []);
    const existingChores      = load('chores',       []);
    const existingAssignments = load('assignments',  []);
    const existingWinners     = load('weekWinners',  []);

    if (!existingGroup || existingGroup.code !== groupCode.trim().toUpperCase()) {
      setError('Group not found. Double-check the code and try again.');
      return;
    }

    dispatch({
      type:    'JOIN_GROUP',
      payload: { userName: userName.trim(), existingGroup, existingUsers, existingChores, existingAssignments, existingWinners },
    });
  };

  if (!mode) {
    return (
      <div className="setup-page">
        <div className="setup-card setup-card--landing">
          <div className="setup-hero">
            <div className="setup-hero-icon">🏠</div>
            <h1>ChoreUp</h1>
            <p>Keep your apartment running smoothly.<br />Assign chores, earn points, compete with roommates.</p>
          </div>
          <div className="setup-actions">
            <button className="btn btn--primary btn--lg" onClick={() => setMode('create')}>
              Create an Apartment Group
            </button>
            <button className="btn btn--secondary btn--lg" onClick={() => setMode('join')}>
              Join an Existing Group
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="setup-page">
      <div className="setup-card">
        <button className="back-link" onClick={() => { setMode(null); reset(); }}>← Back</button>

        <h2>{mode === 'create' ? 'Create a Group' : 'Join a Group'}</h2>
        <p className="setup-subtitle">
          {mode === 'create'
            ? 'Start a new apartment group and invite your roommates.'
            : 'Enter the 6-character code your roommate shared with you.'}
        </p>

        {error && <div className="form-error">{error}</div>}

        <form onSubmit={mode === 'create' ? handleCreate : handleJoin}>
          <div className="form-group">
            <label htmlFor="name">Your Name</label>
            <input
              id="name"
              type="text"
              value={userName}
              onChange={(e) => { setUserName(e.target.value); setError(''); }}
              placeholder="e.g. Alex"
              maxLength={30}
              autoFocus
            />
          </div>

          {mode === 'create' ? (
            <div className="form-group">
              <label htmlFor="apt">Apartment Name</label>
              <input
                id="apt"
                type="text"
                value={groupName}
                onChange={(e) => setGroupName(e.target.value)}
                placeholder="e.g. Sunset Apt 4B"
                maxLength={50}
              />
            </div>
          ) : (
            <div className="form-group">
              <label htmlFor="code">Group Code</label>
              <input
                id="code"
                type="text"
                value={groupCode}
                onChange={(e) => setGroupCode(e.target.value.toUpperCase())}
                placeholder="e.g. AB3K9X"
                maxLength={6}
                style={{ letterSpacing: '0.2em', fontWeight: 700, textTransform: 'uppercase' }}
              />
            </div>
          )}

          <button type="submit" className="btn btn--primary btn--full">
            {mode === 'create' ? 'Create Group' : 'Join Group'}
          </button>
        </form>

        {mode === 'create' && (
          <p className="setup-hint">
            After creating, share your group code with roommates so they can join.
          </p>
        )}
      </div>
    </div>
  );
}
