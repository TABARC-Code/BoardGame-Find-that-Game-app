# Board Game Cafe

A fast board game discovery tool with a cozy tabletop aesthetic. Filter and
sort a grid of ~1,000 board games by rating, player count, playtime, and
complexity, favorite the ones you like, and click through to
[BoardGameGeek](https://boardgamegeek.com) for full details.

See [`SPEC.md`](./SPEC.md) for the original design/technical spec.

## Stack

- React 19 + Vite 7
- Tailwind CSS 4
- No backend: game data is a static JSON file (`public/data/games.json`)
  fetched client-side. Filter/sort state lives in the URL query string
  (no router dependency needed).
- Favorites are stored in `localStorage`.

## Getting started

```bash
npm install
npm run dev       # start the dev server
npm run build     # production build to dist/
npm run preview   # preview a production build locally
npm run lint      # eslint
```

## Project structure

```
src/
  components/   TopBar, FilterSidebar, GameCard, GameGrid, GameModal, LoadingState
  hooks/        useGames (data loading), useFilters (filter state + URL sync), useFavorites
  utils/        filterGames (filtering/sorting), sortOptions
public/data/
  games.json    the game dataset served to the app
scripts/
  convert-kaggle-data.js   convert a Kaggle BGG CSV export into games.json
  convert-bg-info.js       convert a bg_info-style CSV, resolving BGG IDs and
                            scraping details (image, description, mechanics)
                            from boardgamegeek.com
  fetch-bgg-data.js        refresh an existing games.json by re-scraping
                            BGG pages for the games already in it
```

## Regenerating the game data

The data pipeline scripts require a local CSV export and network access to
`boardgamegeek.com` (which is rate-limited and occasionally blocks
scraping), so they're run manually and are not part of `npm run build`:

```bash
node scripts/convert-kaggle-data.js /path/to/board_games.csv [--fetch-images]
node scripts/convert-bg-info.js /path/to/bg_info.csv [/path/to/old_board_games.csv]
node scripts/fetch-bgg-data.js
```

**Known data limitations** (see `convert-bg-info.js` for details): BGG's
`og:image` URLs are cryptographically signed per-size, so `thumbnail` is
currently the same full-size image as `image` rather than a lighter
asset — fixing this needs the real thumb-sized URL scraped from BGG, not a
derived one. `convert-bg-info.js`'s BGG-search fallback can also resolve two
different games (e.g. a base game and a stand-alone expansion) to the same
`game_id`; the script now warns about this at the end of a run so it can be
reviewed before shipping.
