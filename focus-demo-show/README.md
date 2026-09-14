# Sprint Review Show

Статическое SPA-приложение для выбора очередности команд на Sprint Review с игровыми механиками, режимами `Presenter` и `Admin`, и поддержкой управляемой случайности.

## Стек

- React + TypeScript + Vite
- Полностью статический билд, совместим с GitHub Pages
- Хранение состояния: `localStorage` + импорт/экспорт JSON

## Запуск локально

```bash
npm install
npm run dev
```

## Сборка

```bash
npm run build
```

Результат в папке `dist/`.

## Деплой на GitHub Pages

1. Запустить `npm run build`.
2. Опубликовать содержимое `dist/` в ветку `gh-pages` или через GitHub Actions.
3. В `vite.config.ts` уже указан `base: './'`, поэтому роутинг по hash работает на Pages.

## Режимы и маршруты

- `#presenter` — экран показа.
- `#admin` — админ-панель.
- `#settings`, `#session` — алиасы админки.

## Настройка команд

В `Admin mode` можно:
- добавлять/редактировать/удалять команды;
- включать/выключать команды для сессии;
- задавать цвет;
- сбрасывать/откатывать сессию.

## Scripted random

В админке доступны:
- `Pin next team` — зафиксировать следующую команду;
- `Фиксировать позицию` — закрепить команду за конкретным шагом;
- `Очистить правила`.

Выбор всегда проходит через единый `selection engine`, а механики получают уже целевую команду и анимационные параметры.

## Локальный доступ админа

Админ-доступ реализован на уровне UI:
- вход через PIN-код из локального состояния;
- либо переход на hash-route `#admin`.

Это **не** backend-аутентификация и не защита уровня сервера.
# React + TypeScript + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend updating the configuration to enable type-aware lint rules:

```js
export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...

      // Remove tseslint.configs.recommended and replace with this
      tseslint.configs.recommendedTypeChecked,
      // Alternatively, use this for stricter rules
      tseslint.configs.strictTypeChecked,
      // Optionally, add this for stylistic rules
      tseslint.configs.stylisticTypeChecked,

      // Other configs...
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```

You can also install [eslint-plugin-react-x](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-x) and [eslint-plugin-react-dom](https://github.com/Rel1cx/eslint-react/tree/main/packages/plugins/eslint-plugin-react-dom) for React-specific lint rules:

```js
// eslint.config.js
import reactX from 'eslint-plugin-react-x'
import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
