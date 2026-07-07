# ALBIONSTAT

Albion Online market prices (Asia server), collected in-game with a private tracker
and published as a static site. Deployed on Vercel.

- `index.html` / `style.css` / `app.js` - the site (vanilla JS, no build step)
- `item-names.json` - item id to English name map (from ao-bin-dumps localization)
- `data/latest.json` - current best sell/buy price per item, city and quality
- `data/daily.json` - daily price aggregates for the last 60 days
- `data/meta.json` - export timestamp and counts

Data is updated by running `publish.cmd` on the collector machine
(exports SQLite -> JSON, commits and pushes; Vercel redeploys automatically).
