# Copilot Instructions — PivotX Docs & Demo Site

## Project Overview

This is the **documentation and interactive demo site** for [PivotX](https://www.npmjs.com/package/@colon-dev/pivotx) (`@colon-dev/pivotx`), a lightweight 2D game library supporting Vanilla JS, TypeScript, and React. It's a Create React App (TypeScript) deployed to Netlify. The site serves three purposes: marketing homepage, versioned API docs, and playable game tutorials that double as PivotX showcases.

## Architecture

```
src/
├── pages/           # Route-level page components (HomePage, DocsPage, TutorialsPage, etc.)
├── components/
│   ├── organisms/   # SiteHeader, DocsSidebar — shared layout pieces
│   └── templates/   # SiteLayout — wraps pages with header + sidebar
├── data/            # Static content: docs.ts (versioned API docs), gameTutorials.ts (tutorial metadata)
├── games/           # Each subfolder = one playable PivotX demo game
├── hooks/           # Shared hooks (useExitToMenu)
└── types/           # Shared TypeScript interfaces (DocVersion, DocSection)
```

**Key architectural decisions:**
- **No CSS framework or component library.** All styling is inline `style={{}}` objects. Follow this pattern; do not introduce CSS modules, Tailwind, or styled-components.
- **No external Markdown renderer.** `DocsPage.tsx` has a custom inline Markdown parser (`MarkdownContent`). Docs content lives as template literal strings in `src/data/docs.ts`.
- **Two layout modes:** Pages under `/docs`, `/tutorials`, `/` use `SiteLayout` (header + sidebar). Game routes (`/game/*`) render full-screen with **no header** — see `App.tsx`.

## PivotX Library Usage

Games import from the `pivotx/react` subpath (aliased as `@colon-dev/pivotx` in package.json):

```tsx
import { PivotCanvas, PivotCircle, PivotRectangle, PivotLabel, useGameLoop } from 'pivotx/react';
```

Core rendering pattern in every game:
1. `PivotCanvas` as root — accepts `width`, `height`, `background`
2. Shape primitives: `PivotRectangle`, `PivotCircle`, `PivotLabel` (no `<img>` or DOM elements inside canvas)
3. `useGameLoop((dt) => { ... })` drives animation — `dt` is delta time in seconds
4. Game state in `useRef` (avoids re-render cost); a `setTick` counter forces renders each frame

## Game Architecture Patterns

**Simple games** (BouncingBall, StaticScene, PlayerMovement): single `index.tsx` file with inline types, state, and rendering.

**Complex games** (Aetherdrift) use a modular ECS-like structure — follow this pattern for new complex games:
```
games/GameName/
├── index.tsx          # Rendering only — reads state from the hook, returns PivotCanvas JSX
├── hooks/useGame.ts   # Main orchestrator hook — wires input, systems, game loop
├── types/index.ts     # All interfaces (PlayerState, EnemyState, etc.)
├── constants/index.ts # Tuning values, colors, realm/level definitions
├── entities/          # Factory functions + update logic per entity (Player.ts, enemies.ts)
├── systems/           # Pure-ish functions: physics.ts, combat.ts, camera.ts, particles.ts
├── objects/           # Level objects: platforms.ts, collectibles.ts
└── levels/            # Procedural generation (generator.ts)
```

**Conventions in game code:**
- Entity factory functions: `createPlayer(x, y)` returns a full state object
- Systems are pure functions that mutate refs: `updatePlayer(player, input, platforms, dt)`
- AABB collision everywhere — `checkAABBCollision(a, b)` from `systems/physics.ts`
- All games handle ESC to exit via `useExitToMenu()` hook which navigates to `/`
- Responsive: games track `window.innerWidth/innerHeight` via resize listener + `useState`

## Adding Content

**New game tutorial:**
1. Create `src/games/NewGame/index.tsx` (default export)
2. Add route in `App.tsx`: `<Route path="/game/newgame" element={<NewGameComponent />} />`
3. Add entry to `games` array in `src/pages/GameMenu.tsx`
4. Add tutorial metadata to `GAME_TUTORIALS` array in `src/data/gameTutorials.ts`

**New documentation section:**
- Edit `src/data/docs.ts` — add a `DocSection` object to the relevant version's `sections` array. Content is Markdown in template literals. Support: headings, code blocks, tables, inline code.

## Build & Dev

```bash
npm start          # Dev server at localhost:3000
npm run build      # Production build → build/ (deployed by Netlify)
npm test           # Jest + React Testing Library
```

Netlify config in `netlify.toml` handles SPA routing with `/* → /index.html` redirect.

## Conventions

- **TypeScript strict mode** enabled — no `any` types
- **React 19** with `react-router-dom` v7 for routing
- Component exports: `export default function ComponentName()`
- Color palette: dark theme (`#0a0a1a` bg, `#00ccff` accent, `#aa66ff`/`#ff6699` gradients)
- Section comment dividers in game files use box-drawing: `// ─── Section Name ────────`
