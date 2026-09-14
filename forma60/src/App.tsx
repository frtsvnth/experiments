import { AmbientBackground } from './shell/AmbientBackground';
import { AppWindow } from './shell/AppWindow';
import { SessionProvider } from './shell/session';

export function App() {
  return (
    <SessionProvider>
      <AmbientBackground />
      <div className="stage">
        <AppWindow />
      </div>
    </SessionProvider>
  );
}
