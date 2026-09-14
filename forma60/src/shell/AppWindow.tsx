import { About } from '../screens/About';
import { Briefing } from '../screens/Briefing';
import { Draw } from '../screens/Draw';
import { Intake } from '../screens/Intake';
import { Processing } from '../screens/Processing';
import { Result } from '../screens/Result';
import { Splash } from '../screens/Splash';
import { ScreenHost } from './ScreenHost';
import { StatusBar } from './StatusBar';
import { TitleBar } from './TitleBar';
import { useSession } from './session';

export function AppWindow() {
  const { stage } = useSession();

  return (
    <div className="app-window">
      <TitleBar />
      <ScreenHost stage={stage}>
        {stage === 'splash' && <Splash />}
        {stage === 'intake' && <Intake />}
        {stage === 'briefing' && <Briefing />}
        {stage === 'draw' && <Draw />}
        {stage === 'processing' && <Processing />}
        {stage === 'result' && <Result />}
      </ScreenHost>
      <StatusBar />
      <About />
    </div>
  );
}
