# Azadera · A wedding celebration

A responsive static wedding website blending Kerala and North Indian Hindu-inspired visual traditions. A **Three.js 3D entrance** features dimensional brass-trimmed gates that swing open, and an original 3D bride and groom circling a ceremonial flame. Local SVG illustrations provide a graceful non-WebGL fallback. No trackers, external fonts, or CDN requests are used.

**All supplied names, dates, stories, and venues are fictional demo content. This is not a real wedding invitation.** The demo banner stays visible until you explicitly turn it off.

## Personalize the website

Edit **[`wedding.config.js`](./wedding.config.js)**. All personal details live in this one file:

1. Replace both names, biographies, and hometowns in `couple`.
2. Set `wedding.date` (`YYYY-MM-DD`), location, welcome, tagline, closing message, and optional contact email.
3. Replace the story introduction and chapters.
4. Update `venues`. Give each venue a unique `id`, real address, and `mapQuery` for its Google Maps search link.
5. Update all six events (or add/remove events). Each `venueId` must match a venue. Dates use `YYYY-MM-DD`; times and attire are displayed exactly as written. Include your time zone in `eventFootnote`.
6. Replace travel information, site/page titles, and description.
7. Optionally add photos to `assets/` and set `couple.groom.image`, `couple.bride.image`, and/or `heroImage.src`, for example `"./assets/groom.jpg"`. Set meaningful alternative text. Empty portrait image strings use the original illustrated portraits.
8. After replacing **all** demo details, set `demoMode: false`.

Use the pencil button in GitHub's file editor, then commit your changes to `main`. Preserve JavaScript quotes, commas, and brackets. Configuration errors appear visibly rather than silently hiding wedding details. Text is rendered as text, not executable HTML. Use only photos you own or have permission to publish, and remember that this repository and its contents are public.

`icon` options: `flower`, `rings`, `leaf`, `sun`, `music`, `lamp`. `tone` options: `rose`, `sand`, `sage`, `yellow`, `lavender`, `peach`.

## Preview locally

Serve this directory with any static web server; for example, if Python is installed:

```sh
python3 -m http.server 8000
```

Open `http://localhost:8000`. No package install or build step is needed to serve or deploy the site: the pinned Three.js modules are already included in `assets/vendor/`, alongside their MIT license.

For development, `npm ci` installs the pinned Three.js version, `npm run vendor` refreshes the committed runtime modules and license, and `npm run check` checks JavaScript syntax. Commit updated vendor files whenever upgrading Three.js; Pages serves these files directly.

## GitHub Pages

Public URL: **https://yashb319.github.io/AzaderaWedCH/**

In the repository, open **Settings → Pages → Build and deployment**, select **Deploy from a branch**, then **main** and **/ (root)**, and save. GitHub publishes `index.html` directly; `.nojekyll` disables Jekyll processing. Updates to `main` trigger a new Pages deployment and may take a few minutes to appear. See the repository's **Actions** tab for deployment status.

All local asset references are relative, so the website works under the GitHub project subpath as well as a custom domain. No backend, RSVP collection, or account is required. Maps links open Google Maps only when clicked; the optional contact link opens the visitor's email application.

## Accessibility and entrance

The welcome gate has keyboard-operable open/skip buttons, an Escape shortcut, a focus trap, and a replay button in the footer. The page behind it is inert while the welcome is open. Visitors who prefer reduced motion, or arrive at a direct section link, bypass the entrance; reduced motion also disables animations and smooth scrolling. Reduced-motion replay uses the static illustrated scene without initializing WebGL. WebGL initialization or context failures display an explicit fallback notice. The renderer caps pixel density and pauses while the entrance or browser tab is hidden. Navigation, visible focus rings, responsive layouts, and original illustrations with accessible descriptions are included.

The artwork is a stylized celebration of both traditions, not a claim that every family observes the same rituals. Adjust ceremony descriptions and schedules to reflect your own family's customs.
