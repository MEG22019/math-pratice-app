# Math Practice

Math Practice is a child-friendly arithmetic practice app for ages 7–12. It
supports addition, subtraction, multiplication, division, configurable practice
sessions, mistake review, mastery, statistics, accessibility preferences, and
session recovery. The app runs entirely in the browser and does not need an
account or backend service.

## Requirements

- Node.js 22 or newer
- npm 10 or newer
- A current version of Chrome, Edge, Firefox, or Safari

## Install

From the `MathApp` directory, install the locked dependency versions:

```bash
npm ci
```

Use `npm install` instead when intentionally updating dependencies and the lock
file.

## Run locally

Start the Vite development server:

```bash
npm run dev
```

Open the local URL printed by Vite, normally `http://localhost:5173`. Stop the
server with `Ctrl+C`.

## Test and verify

Run the complete release gate:

```bash
npm run verify
```

This checks formatting and linting, runs the complete Vitest suite, creates a
production build, and enforces the JavaScript bundle-size budget. Individual
commands are also available:

- `npm test` — run all tests once
- `npm run test:watch` — run tests while files change
- `npm run lint` — run ESLint
- `npm run format:check` — check Prettier formatting
- `npm run format` — format project files
- `npm run build` — type-check and build the production app
- `npm run build:size` — build and check the bundle-size budget

## Build and preview production

Create the deployable site in `dist/`:

```bash
npm run build
```

Preview that exact production build locally:

```bash
npm run preview
```

Open the URL printed by Vite, normally `http://localhost:4173`. The `dist/`
folder is generated and should not be committed.

## Deploy to Netlify

The repository includes `netlify.toml` and `public/_redirects`. Together they
set the build command, publish `dist/`, select Node.js 22, and send direct or
refreshed application routes to `index.html` so React Router can handle them.

For this repository:

1. Push the finished repository to a Git provider.
2. In Netlify, choose **Add new project** → **Import an existing project**.
3. Connect the Git provider and select the repository.
4. Leave **Base directory** blank because `package.json` is at the repository
   root.
5. Confirm **Build command** is `npm run build`.
6. Confirm **Publish directory** is `dist` (relative to the base directory).
7. Confirm the environment contains `NODE_VERSION=22`.
8. Choose **Deploy**.
9. Open the generated Netlify URL and check `/`, `/practice/setup`,
   `/statistics`, `/settings`, and `/privacy`.
10. Refresh each nested route directly. It should reload the same page rather
    than show a 404.

## Browser and device verification

The responsive breakpoints are designed for modern Chromium, Firefox, and
Safari engines, with a minimum supported viewport width of 320 px. Before a
release, test the production preview in current Chrome, Edge, Firefox, and
Safari where available. At minimum, check:

- phone portrait at 375 × 812
- tablet portrait at 768 × 1024
- tablet landscape at 1024 × 768
- desktop at 1440 × 900
- keyboard navigation, visible focus, and browser zoom to 200%
- direct navigation and refresh on every main route
- starting, refreshing, and completing a practice session
- saved settings, statistics, mistakes, and recovery after refresh
- the browser console during normal use

## Privacy and saved data

Math Practice requests no personal information and requires no account. It has
no advertising, third-party analytics, or behavioral tracking. Settings and
practice progress stay in the current browser’s local storage; they are not sent
to a server by this app. Clearing browser/site data removes saved progress. The
**Clear All Application Data** control in Settings removes all Math Practice
data and restores defaults.

Because data is local to a browser profile, progress does not automatically
sync between devices or browsers. Private-browsing modes may discard it when
the private session closes.

## Project structure

- `src/components/` — shared layout, controls, and practice card
- `src/features/` — question, session, mistake, and statistics logic
- `src/pages/` — routed application pages
- `src/services/` — persistence and feedback services
- `src/styles/` — responsive application theme
- `public/_redirects` — Netlify SPA fallback copied into the build
- `netlify.toml` — Netlify build and routing configuration
