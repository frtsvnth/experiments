import type { AnimationHint, MechanicId } from '../types';

export interface AnimationFrameState {
  progress: number;
  pulse: number;
}

export interface MechanicAdapter {
  id: MechanicId;
  title: string;
  renderClassName: string;
  computeFrame: (timeMs: number, hint: AnimationHint) => AnimationFrameState;
}

const makeAdapter = (id: MechanicId, title: string, speedFactor: number, renderClassName: string) => ({
  id,
  title,
  renderClassName,
  computeFrame: (timeMs: number, hint: AnimationHint) => {
    const total = Math.max(1000, hint.durationMs);
    const t = Math.min(1, timeMs / total);
    const eased = 1 - (1 - t) ** (2.2 + speedFactor);
    return {
      progress: eased,
      pulse: Math.sin((timeMs / 1000) * (3 + speedFactor)),
    };
  },
});

export const mechanicAdapters: MechanicAdapter[] = [
  makeAdapter('wheel', 'Wheel of Fortune', 0.8, 'mechanic-wheel'),
  makeAdapter('plinko', 'Plinko / Drop Ball', 0.55, 'mechanic-plinko'),
  makeAdapter('pinball', 'Pinball Finish', 1.1, 'mechanic-pinball'),
  makeAdapter('slot', 'Slot Machine', 0.45, 'mechanic-slot'),
  makeAdapter('race', 'Horse / Rocket Race', 0.95, 'mechanic-race'),
  makeAdapter('claw', 'Prize Claw', 0.4, 'mechanic-claw'),
  makeAdapter('cards', 'Card Flip / Mystery Doors', 0.5, 'mechanic-cards'),
];

export const getMechanicAdapter = (id: MechanicId) =>
  mechanicAdapters.find((item) => item.id === id) ?? mechanicAdapters[0];
