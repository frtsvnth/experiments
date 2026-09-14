let audioCtx: AudioContext | null = null;

const ensureCtx = () => {
  if (!audioCtx) audioCtx = new AudioContext();
  return audioCtx;
};

const beep = (freq: number, durationMs: number, gainValue = 0.03) => {
  const ctx = ensureCtx();
  const oscillator = ctx.createOscillator();
  const gain = ctx.createGain();
  oscillator.frequency.value = freq;
  gain.gain.value = gainValue;
  oscillator.connect(gain);
  gain.connect(ctx.destination);
  oscillator.start();
  oscillator.stop(ctx.currentTime + durationMs / 1000);
};

export const playStartSound = () => {
  beep(260, 150);
  window.setTimeout(() => beep(340, 150), 120);
};

export const playRevealSound = () => {
  beep(520, 220, 0.04);
  window.setTimeout(() => beep(720, 260, 0.04), 220);
};
