# ren-afstand — deploy contract

## What this app is

**Run Distance Planner** (Lovable display name), a.k.a. "Run Distance Calculator"
per its own README. A single-page Vite + React + TypeScript + shadcn/ui +
Tailwind app: you type/paste the segments of a structured running workout
(warm-up, intervals, cool-down, ...), each with a duration (or distance) and
a slow/fast pace range per km, and it computes the estimated total distance
and total time live as you type. No routing beyond `/` and a catch-all 404
page; no forms, no auth, no external API calls.

The actual calculation logic lives in `src/lib/workout.ts` — pure functions,
no side effects: `calcPhaseDistance`/`calcPhaseDuration` derive one from the
other using the average of the slow/fast pace, `togglePhaseMode` lets a
segment phase flip between "I know the time" and "I know the distance" while
preserving the computed value, and `calcTotalDistance`/`calcTotalDuration`
sum across all segments × repetitions. `src/pages/Index.tsx` is the only
real page — it holds the list of segments in a `useState` array and renders
one `SegmentCard`/`PhaseInput` per segment/phase.

**Persistence: none.** Checked deliberately rather than assumed —
`grep -rn "localStorage\|sessionStorage" src/` returns no matches anywhere
in the app code. The only `document.cookie` write in the whole tree lives in
the generic shadcn `src/components/ui/sidebar.tsx` (a collapsible-sidebar
cookie for remembering open/closed state), and that component is dead code
here — it is never imported by `App.tsx`, `Index.tsx`, or any other app file.
So the running app itself is purely in-memory: refreshing the page resets
every segment back to the initial empty state. If that ever needs to change,
it's a real feature to add, not something silently already there.

## Confirmed trap status (checked, not assumed)

- **`VITE_*` build-arg trap**: `grep -rn "import.meta.env" src/` and
  `grep -rl "VITE_" .` (excluding node_modules/dist/.git) both return no
  matches. This app uses zero `VITE_*` environment variables, so the
  Docker Compose `build.args` vs `environment:` distinction
  `lovable-porting/PORTING-PLAYBOOK.md` warns about is **not exercised** by
  this app.
- **`.wasm` Content-Type trap**: `find . -iname '*.wasm' -not -path
  './node_modules/*'` returns nothing. This app ships no `.wasm` file, so
  the `@wasm` block in this repo's `Caddyfile` is **defensive/dead code**,
  kept only so the Caddyfile matches the shared template used by every
  ported Lovable app — not because this app needs it.

## PWA support (added after the initial port)

Added `vite-plugin-pwa` (`registerType: "autoUpdate"`, `generateSW` mode),
mirroring the exact config already verified in `findjd`/
`hopsakee-decimal-finder`: manifest (`name`/`short_name`/`description` taken
from this app's own `index.html`; `theme_color`/`background_color` from
`src/index.css`'s `--accent`/`--background` tokens), `apple-touch-icon` +
`theme-color` meta added to `index.html`, two placeholder icons generated
in `public/` (`pwa-192x192.png`, `pwa-512x512.png` — a plain rounded square
in the app's accent color with an "R" monogram; **swap these for real
branding**, they're functional placeholders, not a design decision).

Verified for real, not assumed, via a full Docker build → run → curl round
trip:
- `npm run build` produces `dist/sw.js`, `dist/workbox-<hash>.js`,
  `dist/registerSW.js`, `dist/manifest.webmanifest`.
- `/`, `/index.html`, `/sw.js`, `/manifest.webmanifest`, `/registerSW.js` →
  `Cache-Control: no-cache` (so a returning visitor's browser always
  revalidates and the service worker picks up a new deploy).
- `/assets/*` → 1-year immutable, as before.
- **New finding this round**: vite-plugin-pwa's own runtime chunk
  (`workbox-<hash>.js`) lives at the repo root, not under `/assets/`, so it
  fell through both `Caddyfile` matchers and got **no** `Cache-Control`
  header at all until `/workbox-*.js` was added to the `@immutable`
  matcher explicitly — its filename is content-hashed exactly like
  `/assets/*`, so 1-year-immutable is correct and safe for it too. Confirmed
  with `curl -I` before and after the fix.
- `<link rel="manifest">` and `<meta name="theme-color">` both present in
  the served `index.html`; `manifest.webmanifest` serves with
  `Content-Type: application/manifest+json`.

## Build

Two-stage Docker build (see `Dockerfile`):

1. `node:22-slim` stage: `npm ci` against the committed `package-lock.json`,
   then `npm run build` (plain `vite build` — no env vars baked in, see
   above). Output is a static `dist/` (hashed asset filenames under
   `dist/assets/`).
2. Final stage is `FROM node-static-base:20` — the shared base image built
   once from `hopsakee-server/base/node-static.Dockerfile` (Caddy 2.8 on
   Alpine, fixed-UID `appuser`/`1001`, healthcheck already baked in). This
   repo's Dockerfile only copies its own `Caddyfile` and the built `dist/`
   into that base; it never builds Caddy or creates the user itself.

`package-lock.json` here was regenerated by `npm install` in the sandbox
(the Lovable-authored lockfile hit rollup/vitest optional-dependency drift
under `npm ci` — a known sandbox-only issue, not a real bug); `bun.lock` and
`bun.lockb` are left as fetched from Lovable and are not used by this build.

## Caddy serving/caching behaviour

See `Caddyfile`. `:8080`, gzip+zstd, SPA fallback (`try_files {path}
/index.html`), `no-cache` on `/`, `/index.html`, `/sw.js`,
`/manifest.webmanifest`, `/registerSW.js` (now live — see PWA section
above), `public, max-age=31536000, immutable` on everything under
`/assets/*` and on `/workbox-*.js` (Vite's and vite-plugin-pwa's
content-hashed filenames make that safe), and a plain-text `handle_errors`
block. The `path`-matcher-before-
`try_files` ordering matters: matchers see the literal request path, while
`try_files` resolves against the filesystem including the SPA rewrite, so
the header matchers have to run first or every request would get rewritten
to `/index.html` before the immutable/no-cache headers could apply.

## Naming

Repo name, container/image name (`ren-afstand`), and public subdomain
(`ren-afstand.hopsakee.top`) are all the same string — per Jelle's stated
default ("repo name = web-url start"), unlike the pilot
(`hopsakee-decimal-finder` repo → `hd.hopsakee.top` subdomain, a deliberate
exception for that app). Don't rename one without renaming all three.

## Where the real deploy artifacts live

This repo's `Dockerfile`, `Caddyfile`, `compose.yaml`, `caddy-snippet.txt`,
and `deploy.sh` are the app-side half of the deploy contract. The
server-side half already exists in the sibling `hopsakee-server` repo:
- `hopsakee-server/config/ren-afstand/compose.yaml` — the deployed compose
  file (joins the shared external `hup` Docker network instead of exposing
  a port).
- `hopsakee-server/server_setup/deploy-ren-afstand.sh` — the script that
  actually runs on the server (clone/pull, build the shared base image if
  needed, `docker compose up --build -d`, wait for healthy, reload Caddy).
- `hopsakee-server/config/caddy/conf/Caddyfile` — already has the
  `ren-afstand.hopsakee.top { reverse_proxy ren-afstand:8080 }` block from
  `caddy-snippet.txt` in this repo.

Keep this repo's copies and the sibling repo's real ones in sync when
either changes.
