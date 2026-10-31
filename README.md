# Azadera · A wedding celebration

A responsive static wedding invitation blending Kerala and North Indian Hindu-inspired visual traditions. **Carry an original 3D doli through a royal wedding fort**: brass-trimmed gates open into a courtyard with a themed pavilion for every configured event, a story garden, family haveli and couple space. Approach a destination and discover it, or select it directly. Written plaques exist inside the 3D spaces, alongside readable semantic detail panels. No trackers, external fonts, visitor-data collection, or CDN requests are used.

Personal and event details are read from `wedding.config.js`. The illustrated fort and pavilions are **artistic thematic representations, not verified models of the actual venues**. Confirm venue locations before travel. Existing story/biography content may still need personalization; the website never invents family members or unprovided directions/dress requirements.

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

### Event rooms and additional details

Every event automatically gets a pavilion, accessible selection button, and detail panel. Its `name` determines the default theme. Optionally add a `theme` field to override it:

| Theme | Artistic room design |
| --- | --- |
| `roka` | Rose floral arch, family seating, warm rose light |
| `kerala-marriage` | Ivory/gold, tiered roof, stylized banana leaves and brass lamps |
| `rituals` | Wooden roof, ivory garlands, brass trays and tall lamps |
| `reception` | Sage garden lounge, floral backdrop and table arrangements |
| `sagai` | Interlocking gold rings, blush lighting and a display pedestal |
| `haldi` | Marigold flower wall, yellow ceremonial bowl and concentric floral pattern |
| `sangeet` | Lavender stage, geometric dance floor and decorative stage lights |
| `hapur-marriage` | Coral/gold mandap, canopy, garlands and ceremonial flame |

Decorations are respectful artistic motifs, not instructions about how your family observes a ceremony. The existing `tone` controls the pavilion's base colour; `theme` controls its architecture, decorations, room lighting, and coordinated detail-panel palette.

Optional editable fields (add them inside the relevant event object):

```js
directions: "", // Your verified travel instructions. A venue can also have directions.
details: "",    // Additional event information, displayed as plain text.
dressCode: ""   // Leave blank until requirements are confirmed.
```

Event directions take precedence over venue directions. Empty directions and dress code explicitly display “not yet provided”; Maps links still use the configured venue query. An overnight event's `time` remains a display string, so include the next-day date explicitly.

### Celebratory effects

`experience.effects` sets whether celebratory effects start enabled. Visitors can switch **Celebration effects** off in the fort. Reduced motion disables them regardless of the configuration.

Rooms have function-specific entrance moments: rose/ivory/garden petal showers, golden petals for Sagai and Haldi, a turmeric-inspired expanding golden floor ripple for Haldi, warm still lighting for the remaining rituals, and gently drifting luminous Sangeet lights. Showers last at most six seconds and are limited to 48 particles on phones or 90 elsewhere; they render only in the 3D room, never over its HTML details. There is no flashing.

Optionally add `effect: "petals"`, `"golden-petals"`, `"lights"`, `"warm-glow"`, or `"none"` to an event to override its theme's default.

### Meet the family and relationship timeline

`family.groom` and `family.bride` are arrays, initially empty. No real family members have been supplied. Empty arrays show an invitation to add details; add only information you want publicly visible:

```js
{ name: "Your family member's name", relationship: "Relationship", bio: "", image: "", imageAlt: "" }
```

Photos are optional and use the same local/HTTPS rules as couple portraits. `story.chapters` drives the numbered relationship timeline in array order: edit its existing `label`, `date`, `title`, and `text`, or add/remove chapters. No extra milestones are generated.

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

Repository: **https://github.com/yashb319/ATHIRAwedsYASH**

Public URL: **https://yashb319.github.io/ATHIRAwedsYASH/**

In the repository, open **Settings → Pages → Build and deployment**, select **Deploy from a branch**, then **main** and **/ (root)**, and save. GitHub publishes `index.html` directly; `.nojekyll` disables Jekyll processing. Updates to `main` trigger a new Pages deployment and may take a few minutes to appear. See the repository's **Actions** tab for deployment status.

All local asset references are relative, so the website works under the GitHub project subpath as well as a custom domain. No backend, RSVP collection, or account is required. Maps links open Google Maps only when clicked; the optional contact link opens the visitor's email application.

## Accessibility and entrance

Open the gates to take control of the doli. Use **Arrow keys / WASD**, or hold the mobile direction buttons: up/down carry it forward/backward and left/right turn it. The camera follows the doli. Approaching a destination shows its name and enables **Discover nearby space**; press Enter while navigating, or tap Discover. Driving pauses while exploring a room. **Return doli to entrance** recovers its position and heading. Courtyard boundaries, the lotus pool, and lamps have collision handling. This is a bounded palanquin journey, not a physics/racing simulator.

“Begin the celebration tour” and the destination buttons remain as shortcuts for guests who prefer not to steer. Every event has a written 3D plaque and a readable detail panel. The story garden, family haveli, and couple space are destinations at the far end of the courtyard. **Previous/Next plaque** turns their spatial story/family/couple pages without leaving the 3D world. Full configured text is mirrored in the semantic panel, since long text on a world plaque is necessarily constrained by its surface area.

Escape returns from an event or memory space to the doli, then closes the experience. Focus is trapped while the invitation behind it is inert. The secondary **Accessible text version** preserves conventional access to all details; it is not the main visual experience. Without WebGL the driving controls are disabled with an explicit notice, while every event and memory destination remains readable.

Visitors who prefer reduced motion, or arrive at a direct section link, bypass the initial entrance. Reduced-motion replay initially uses the static illustrated welcome. Explicitly entering the fort renders still views with instant camera transitions; manually carrying the doli updates the scene only while movement buttons are held. Motion preference changes are respected immediately. Missing WebGL or context loss displays a notice and leaves all event controls/details accessible. Mobile detail sheets scroll independently with the 3D room above them.

## Background music

The user supplied `assets/kalyani-remix.mp3` and explicitly confirmed permission for public redistribution. It is configured in **`music`** in `wedding.config.js`: `src`, `title`, `enabled` (default preference), and `volume` (0–1, configuration only). Do not replace it with a recording you are not authorized to publish.

Background music starts on the explicit **Open the gates** or **Explore** gesture, not before interaction. Browser policies may still deny playback; a visible error and retry button are provided. Music loading never blocks navigation. The unobtrusive **Sound on/off** button lets guests silence it. There is no visible volume slider, video, YouTube embed, or third-party audio connection. Audio pauses when the browser tab becomes hidden; it resumes only with another guest gesture.

Repeated architecture, flowers, and lamps use instanced geometry. One WebGL context, bounded pixel density (1 on phones, at most 1.5 elsewhere), adaptive density reduction, a ~30 fps animation cap, no shadow maps or heavy models, and pause-on-hidden behavior limit GPU load. `window.WEDDING_EXPERIENCE.getState()` exposes basic scene diagnostics for validation. Each configuration event adds one room; very large event lists may need further layout tuning.

The artwork is a stylized celebration of both traditions, not a claim that every family observes the same rituals. Adjust ceremony descriptions and schedules to reflect your own family's customs.
