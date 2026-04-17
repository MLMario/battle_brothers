# Battle Brothers Companion

Mobile-first reference for all 67 Battle Brothers backgrounds. Dark-themed accordion list with stat ranges, level-up bonuses, and color-coded attribute bars for quick hiring decisions.

## Run locally

The app is a static frontend with no build step. Serve the repo root over HTTP so `fetch()` can load `data/backgrounds.json`:

    python -m http.server 8000

Then open http://localhost:8000 in a browser.

## Live demo

_Live URL: https://mlmario.github.io/battle_brothers/_

## More

See [.planning/PROJECT.md](./.planning/PROJECT.md) for requirements, constraints, and key decisions.
