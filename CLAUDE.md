# pivotx-docs

Public documentation site for `@colon-dev/pivotx` (React app, deployed via Netlify).

- This is the **docs/consumer** repo, not the source of truth for the library.
- Main library: `../pIvotX` (local path: `/home/sachitha/Documents/Development/colondev-community/pIvotX`, repo: https://github.com/ColonDev-Community/pIvotX), currently on **v2.0.0**.
- Homepage: https://pivotx.colondev.com/

## Structure

- `src/pages` — documentation pages
- `src/components` — shared/reusable page components
- `src/games`, `src/data` — interactive demo games and their data used in docs
- `src/hooks`, `src/types` — supporting hooks/types
- `build/` — production build output, do not hand-edit

## Keeping in sync

When `../pIvotX` changes its public API surface (core, `react`, or `react-native` exports/props/hooks) or ships a new version, check whether these docs still describe current behavior — update the relevant `src/pages` and demo `src/games` accordingly. Don't let docs silently drift from the version shipped in the main repo.

Also update this repo's own `README.md` whenever setup/deploy steps or the docs' scope changes — don't let it silently go stale.
