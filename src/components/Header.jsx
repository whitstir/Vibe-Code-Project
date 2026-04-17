import { useApp } from '../context/AppContext';

export default function Header() {
  const { state } = useApp();
  const { currentUser, group, notification } = state;

  return (
    <header className="header">
      <div className="header-logo">
        <span className="logo-house">🏠</span>
        <span className="logo-text">ChoreUp</span>
      </div>

      {currentUser && group && (
        <div className="header-right">
          <div className="group-badge">
            <span className="group-name">{group.name}</span>
            <span className="group-code">#{group.code}</span>
          </div>
          <div
            className="user-avatar"
            style={{ backgroundColor: currentUser.color }}
            title={currentUser.name}
          >
            {currentUser.name[0].toUpperCase()}
          </div>
        </div>
      )}

      {notification && (
        <div className={`toast toast--${notification.type}`}>
          {notification.type === 'points'  && '✨ '}
          {notification.type === 'winner'  && '🏆 '}
          {notification.type === 'success' && '✓ '}
          {notification.message}
        </div>
      )}
    </header>
  );
}
