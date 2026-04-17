import { useApp } from './context/AppContext';
import Header      from './components/Header';
import Navigation  from './components/Navigation';
import GroupSetup  from './components/GroupSetup';
import Dashboard   from './components/Dashboard';
import ChoresList  from './components/ChoresList';
import MyChores    from './components/MyChores';
import Leaderboard from './components/Leaderboard';
import './App.css';

const VIEWS = {
  dashboard:   <Dashboard />,
  'my-chores': <MyChores />,
  chores:      <ChoresList />,
  leaderboard: <Leaderboard />,
};

export default function App() {
  const { state } = useApp();
  const { currentUser, group, activeView } = state;

  // Show setup screen until both user and group exist
  if (!currentUser || !group) {
    return (
      <div className="app">
        <Header />
        <GroupSetup />
      </div>
    );
  }

  return (
    <div className="app">
      <Header />
      <Navigation />
      <main className="main-content">
        {VIEWS[activeView] ?? <Dashboard />}
      </main>
    </div>
  );
}
