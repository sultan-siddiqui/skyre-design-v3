# Sky Re — Website v3

A static, English-only site for Sky Re, the onshore P&C reinsurance MGA in Riyadh. The whole experience is built around the mark: two opposing crescents meet, and a star is born. The type is **Cairo**.

## Run or publish

- **GitHub Pages:** upload the folder as is (no build step) and enable Pages on the branch.
- **From disk:** double-clicking `index.html` works too. All scripts are classic (non-module), the Cairo font is embedded in `assets/css/fonts.css`, and every library is vendored in `assets/vendor`.
- **Local preview without caching:**

```bash
python tools/serve.py 5174
```

## Navigation and pages (31)

Home · About (+ Brand Story) · Portfolios (+ 6 detail pages) · Partners · Team · Resources ▾ (Broker Information, Claims Information, News & Insights + 6 articles, Careers + 2 vacancies, Legal & Regulatory + 5 policies) · Contact.

The landing page uses no photographs. Photographs appear only on News & Insights, the articles and the Team page. Each one opens through the Sky Re star (`.ph` in `assets/css/pages.css`).

## Editing

| What | Where | Then run |
| --- | --- | --- |
| Header, menu and footer | `tools/partials/` | `python tools/sync-partials.py` |
| Portfolio content | `tools/gen_portfolios.py` | `python tools/gen_portfolios.py`, `python tools/build_pages.py`, then sync |
| News, Broker, Claims, Careers, Legal and portfolio detail pages | `tools/build_pages.py` | `python tools/build_pages.py`, then sync |
| Team profiles | `assets/js/pages/team.js` | — |
| Design tokens (official palette) | top of `assets/css/main.css` | — |

The motion engine is in `assets/js/core.js`. The home WebGL hero is in `assets/js/hero.js` and uses Three.js r149 (UMD). Shared canvases are in `assets/js/fx.js`, and page logic is in `assets/js/pages/`.

- **Header:** hides after a deliberate 120px scroll down and returns after 80px up (or when the mouse reaches the top edge). Thresholds are at the top of the Header block in `core.js`.
- **Contact "Find us" map:** the mark scatters, its star falls on Al Mugheb Tower (24.7892° N, 46.6366° E, from the office's Google Maps link). Country outlines are in `assets/js/geo-arabia.js` (simplified Natural Earth, public domain); the Riyadh roads and landmarks are hand-simplified in `assets/js/pages/contact.js`. No map tiles or external requests are used.

## Assets carried over from the v2 reference

- **Team portraits** (`assets/img/team/`) were AI-generated for the v2 design preview. They show fictional people with illustrative names and biographies, labelled as samples on the page. Replace them with approved photography.
- **Editorial photographs** (`assets/img/news/`) come from Unsplash and Pexels under their free licences. The photographers are listed in v2's `ASSET-SOURCES.md`.
- **Cairo** (Latin, Latin Extended and Arabic subsets) is licensed under the SIL Open Font License; see `assets/fonts/OFL-Cairo.txt`.

## Content still to be supplied by Sky Re

Approved team photography and profiles, the claims mailbox and procedures, real news articles, vacancies, licence details and final legal wording. All of these are marked as illustrative or "to follow" on the site.
