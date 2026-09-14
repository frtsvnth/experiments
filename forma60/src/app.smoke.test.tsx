import { renderToString } from 'react-dom/server';
import { describe, expect, it } from 'vitest';
import { App } from './App';

describe('shell', () => {
  it('renders the window chrome and the splash screen', () => {
    const html = renderToString(<App />);
    expect(html).toContain('ФОРМА 60');
    expect(html).toContain('Минута на клетке. Форма на день.');
    expect(html).toContain('СЕАНС 60с · ЛОКАЛЬНЫЙ СРЕЗ');
    expect(html).toContain('Открыть бланк');
    expect(html).toContain('ЭКСПРЕСС-СРЕЗ ЛИЧНОСТИ НА ДЕНЬ');
  });

  it('does not leak raw metric names into the interface', () => {
    const html = renderToString(<App />);
    const forbidden = ['энтропи', 'центроид', 'loopiness', 'Big Five', 'DISC', 'Hogan', 'OCEAN', 'архетип'];
    for (const word of forbidden) {
      expect(html.toLowerCase()).not.toContain(word.toLowerCase());
    }
  });
});
