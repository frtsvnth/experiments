# ФОРМА 60

Анализ личности по рисунку. Нарисуйте линию за минуту — получите разбор себя на сегодня:
как вы принимаете решения, как общаетесь, что вас выматывает и почему день читается именно так.

Статическое клиентское приложение: живой фон, окно-лаборатория, внутри окна весь поток
`splash → intake → briefing → draw → processing → result`, About поверх (hash `#/about`).
Страница не скроллится — скролл живёт только внутри листов результата.

## Стек

Vite + React 18 + TypeScript, без бэкенда и ключей. Графические метрики считаются по рисунку,
интерпретация собирается детерминированно: один и тот же след в один и тот же день даёт один и
тот же текст. PDF рисуется программно (`jspdf`) и встраивает TTF с кириллицей; `html2canvas` не
используется.

## Команды

```bash
npm install
npm run dev        # http://localhost:5173
npm run typecheck
npm test           # vitest: пустой след, детерминизм, пятница, дождь
npm run build      # dist/
npm run preview
```

## Структура

```
src/shell     AmbientBackground, AppWindow, TitleBar, StatusBar, ScreenHost, session
src/screens   Splash, Intake, Briefing, Draw, Processing, Result, About
src/canvas    GridCanvas, inkEngine, strokeMath
src/engine    types, metrics, interpret, insights, dayContext, copyBank, seed
src/pdf       buildFormPdf, pdfTheme, fonts
src/api       geo, weather, holidays, lunar
src/data      holidaysFallback, weatherCodes.ru, weekdayPsychology
src/components DateField
```

Внешние данные (только при наличии сети): `ipwho.is`/`ipapi.co` для города,
`api.open-meteo.com` для погоды, `date.nager.at` для праздников, `suncalc` для луны локально.
Все запросы с таймаутом ~3с и откатом на локальные данные; имя и рисунок в сеть не уходят.

## Деплой

GitHub Pages. Workflow `.github/workflows/deploy.yml` собирает `forma60/` и публикует
репозиторий целиком плюс `forma60/dist` в каталог `forma60/`. Приложение доступно по
`https://frtsvnth.github.io/experiments/forma60/`.

## Шрифты для PDF

`public/fonts/*.ttf` — Manrope, Cormorant Garamond, IBM Plex Mono (SIL OFL 1.1). Нужны только
для встраивания кириллицы в PDF; интерфейс берёт те же гарнитуры с Google Fonts.
