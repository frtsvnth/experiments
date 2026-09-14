import { useEffect, useRef, useState, type ReactNode } from 'react';

type Props = {
  stage: string;
  children: ReactNode;
};

export function ScreenHost({ stage, children }: Props) {
  const [keys, setKeys] = useState<string[]>(() => [stage]);
  const nodesRef = useRef<Record<string, ReactNode>>({ [stage]: children });
  const currentKeyRef = useRef(stage);

  nodesRef.current[stage] = children;

  useEffect(() => {
    if (stage === currentKeyRef.current) return;
    const previous = currentKeyRef.current;
    currentKeyRef.current = stage;
    setKeys((prev) => {
      const kept = prev.includes(previous) ? previous : prev[prev.length - 1];
      return kept === stage ? [stage] : [kept, stage];
    });
    const timer = window.setTimeout(() => {
      setKeys((prev) => prev.filter((key) => key === stage));
      delete nodesRef.current[previous];
    }, 400);
    return () => window.clearTimeout(timer);
  }, [stage]);

  return (
    <div className="screen-host">
      {keys.map((key) => (
        <div
          key={key}
          className={`screen-layer ${key === stage ? 'is-active' : 'is-leaving'}`}
        >
          {nodesRef.current[key]}
        </div>
      ))}
    </div>
  );
}
