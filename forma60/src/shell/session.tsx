import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import type { DayContext, Profile, Stroke } from '../engine/types';
import { loadDayContext } from '../engine/dayContext';

export type Stage = 'splash' | 'intake' | 'briefing' | 'draw' | 'processing' | 'result';

export type BirthDate = { day: number; month: number; year: number };

type SessionValue = {
  stage: Stage;
  setStage: (stage: Stage) => void;
  name: string;
  setName: (name: string) => void;
  participantName: string;
  birth: BirthDate | null;
  setBirth: (birth: BirthDate | null) => void;
  age: number | null;
  strokes: Stroke[];
  setStrokes: (strokes: Stroke[]) => void;
  canvasSize: number;
  setCanvasSize: (size: number) => void;
  drawElapsedMs: number;
  setDrawElapsedMs: (value: number) => void;
  dayContext: DayContext | null;
  dayLoading: boolean;
  refreshDay: () => void;
  profile: Profile | null;
  setProfile: (profile: Profile | null) => void;
  aboutOpen: boolean;
  setAboutOpen: (open: boolean) => void;
  statusText: string;
  resetSession: () => void;
};

const SessionContext = createContext<SessionValue | null>(null);

function computeAge(birth: BirthDate | null): number | null {
  if (!birth) return null;
  const now = new Date();
  let age = now.getFullYear() - birth.year;
  const monthDiff = now.getMonth() + 1 - birth.month;
  if (monthDiff < 0 || (monthDiff === 0 && now.getDate() < birth.day)) age -= 1;
  return age;
}

function formatDraw(elapsedMs: number): string {
  const total = Math.max(0, Math.floor(elapsedMs / 1000));
  const mm = String(Math.floor(total / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export function SessionProvider({ children }: { children: ReactNode }) {
  const [stage, setStage] = useState<Stage>('splash');
  const [name, setName] = useState('');
  const [birth, setBirth] = useState<BirthDate | null>(null);
  const [strokes, setStrokes] = useState<Stroke[]>([]);
  const [canvasSize, setCanvasSize] = useState(360);
  const [drawElapsedMs, setDrawElapsedMs] = useState(0);
  const [dayContext, setDayContext] = useState<DayContext | null>(null);
  const [dayLoading, setDayLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [aboutOpen, setAboutOpen] = useState(false);

  const loadDay = useCallback(
    (birthValue: BirthDate | null) => {
      setDayLoading(true);
      loadDayContext(new Date(), birthValue)
        .then((context) => {
          setDayContext(context);
        })
        .catch(() => {
          setDayContext(null);
        })
        .finally(() => setDayLoading(false));
    },
    [],
  );

  useEffect(() => {
    loadDay(null);
  }, [loadDay]);

  useEffect(() => {
    const applyHash = () => {
      setAboutOpen(window.location.hash.replace(/^#\/?/, '') === 'about');
    };
    applyHash();
    window.addEventListener('hashchange', applyHash);
    return () => window.removeEventListener('hashchange', applyHash);
  }, []);

  const setAbout = useCallback((open: boolean) => {
    setAboutOpen(open);
    const target = open ? '#/about' : '#/';
    if (window.location.hash !== target) {
      window.history.replaceState(null, '', target);
    }
  }, []);

  const refreshDay = useCallback(() => {
    loadDay(birth);
  }, [birth, loadDay]);

  const resetSession = useCallback(() => {
    setStage('splash');
    setName('');
    setBirth(null);
    setStrokes([]);
    setCanvasSize(360);
    setDrawElapsedMs(0);
    setProfile(null);
    setAbout(false);
  }, [setAbout]);

  const participantName = name.trim().length > 0 ? name.trim() : 'Участник';
  const age = computeAge(birth);

  const statusText = useMemo(() => {
    switch (stage) {
      case 'splash':
        return 'ГОТОВО';
      case 'intake':
        return 'ЗНАКОМСТВО';
      case 'briefing':
        return 'ИНСТРУКЦИЯ';
      case 'draw':
        return `РИСУНОК ${formatDraw(drawElapsedMs)}`;
      case 'processing':
        return 'АНАЛИЗ';
      case 'result':
        return 'РАЗБОР ГОТОВ';
      default:
        return 'ГОТОВО';
    }
  }, [stage, drawElapsedMs]);

  const value: SessionValue = {
    stage,
    setStage,
    name,
    setName,
    participantName,
    birth,
    setBirth,
    age,
    strokes,
    setStrokes,
    canvasSize,
    setCanvasSize,
    drawElapsedMs,
    setDrawElapsedMs,
    dayContext,
    dayLoading,
    refreshDay,
    profile,
    setProfile,
    aboutOpen,
    setAboutOpen: setAbout,
    statusText,
    resetSession,
  };

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}

export function useSession(): SessionValue {
  const value = useContext(SessionContext);
  if (!value) throw new Error('useSession must be used inside SessionProvider');
  return value;
}
