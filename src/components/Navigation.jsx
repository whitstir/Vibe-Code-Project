import { useApp } from '../context/AppContext';

const NAV_ITEMS = [
  { id: 'dashboard',   label: 'Dashboard',  icon: '📊' },
  { id: 'my-chores',   label: 'My Chores',  icon: '✅' },
  { id: 'chores',      label: 'All Chores', icon: '📋' },
  { id: 'leaderboard', label: 'Leaderboard',icon: '🏆' },
];

export default function Navigation() {
  const { state, dispatch } = useApp();

  return (
    <nav className="navigation">
      {NAV_ITEMS.map((item) => (
        <button
          key={item.id}
          className={`nav-item ${state.activeView === item.id ? 'nav-item--active' : ''}`}
          onClick={() => dispatch({ type: 'SET_VIEW', payload: item.id })}
        >
          <span className="nav-icon">{item.icon}</span>
          <span className="nav-label">{item.label}</span>
        </button>
      ))}
    </nav>
  );
}
