import { useEffect, useState } from 'react';
import { moonSymbol } from '../api/lunar';
import { useSession } from './session';

function formatClock(date: Date): string {
  return `${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
}

export function StatusBar() {
  const { dayContext, dayLoading } = useSession();
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(new Date()), 15000);
    return () => window.clearInterval(timer);
  }, []);

  const lunar = dayContext?.lunar;
  const city = dayContext?.location?.city ?? (dayLoading ? 'сверяю локацию' : 'локация не определена');
  const moon = lunar
    ? `${moonSymbol(lunar.illumination, lunar.phase)} ${Math.round(lunar.illumination * 100)}%`
    : '— %';

  return (
    <footer className="statusbar">
      <span className="statusbar-item statusbar-clock">{formatClock(now)}</span>
      <span className="statusbar-item" title="Освещённость луны">
        {moon}
      </span>
      <span className="statusbar-item statusbar-city" title={city}>
        {city}
      </span>
      <span className="statusbar-item statusbar-mark">Ф60</span>
    </footer>
  );
}
