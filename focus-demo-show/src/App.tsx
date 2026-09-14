import { useEffect, useState } from 'react';
import { AdminPanel } from './components/AdminPanel';
import { PresenterView } from './components/PresenterView';
import { AppStateProvider } from './state/AppStateContext';

const resolveRoute = () => {
  const hash = window.location.hash.replace('#', '');
  if (hash === 'admin' || hash === 'settings' || hash === 'session') return 'admin';
  return 'presenter';
};

const AppShell = () => {
  const [route, setRoute] = useState<'presenter' | 'admin'>(resolveRoute());

  useEffect(() => {
    const handler = () => setRoute(resolveRoute());
    window.addEventListener('hashchange', handler);
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  return (
    <main className="app-shell">
      <nav className="top-nav">
        <button onClick={() => (window.location.hash = '#presenter')}>Presenter</button>
        <button onClick={() => (window.location.hash = '#admin')}>Admin</button>
        <button onClick={() => document.documentElement.requestFullscreen?.()}>Fullscreen</button>
      </nav>
      {route === 'admin' ? <AdminPanel /> : <PresenterView />}
    </main>
  );
};

function App() {
  return (
    <AppStateProvider>
      <AppShell />
    </AppStateProvider>
  );
}

export default App;
