# CAMPUSSHIELD Frontend

React + TypeScript + Vite frontend for the CAMPUSSHIELD PWA and admin dashboards.

## Local setup

```bash
cp .env.example .env.local
npm install
npm run dev
```

## Styling

The Phase 1 frontend uses a stable CSS design-system fallback instead of relying on Tailwind compilation. The previous Tailwind setup used `tailwindcss: latest` with an older PostCSS plugin configuration, which can fail with Tailwind v4 and leave utility classes uncompiled.

Active styling files:
- `src/styles.css`
- `src/styles/variables.css`
- `src/styles/globals.css`
- `src/styles/components.css`
- `src/styles/responsive.css`

Tailwind dependencies remain in `package.json` for a future pinned migration, but the current polished CampusShield shell does not require Tailwind to compile successfully.

Phase 1 includes a branded shell only. Functional routing, auth, reports, maps, charts, and dashboards are planned for later phases.
