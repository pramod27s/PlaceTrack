# PlaceTrack — Frontend

The React + Vite single-page app for PlaceTrack. See the
[project README](../README.md) for the full overview and run instructions.

## Scripts

```bash
npm install     # install dependencies
npm run dev     # start the dev server on http://localhost:5173
npm run build   # type-check and build for production
npm run preview # preview the production build
```

The dev server proxies `/api` to the Spring Boot backend on `http://localhost:8080`
(configured in `vite.config.ts`).

## Structure

```
src/
├── components/   Reusable UI, layout, modals, Kanban board
├── pages/        Route screens (Dashboard, Pipeline, Analytics, …)
├── hooks/        TanStack Query data hooks
├── store/        Zustand auth store
└── lib/          API client, types, constants, formatting helpers
```

## Tech

React 19 · TypeScript · Vite · Tailwind CSS 4 · React Router · TanStack Query ·
Zustand · dnd-kit · lucide-react
