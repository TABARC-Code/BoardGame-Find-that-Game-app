// Shared uid format for public/data/games.json entries. The app keys
// React lists, localStorage favorites, and modal lookups off `game.uid`
// (see src/hooks/useFavorites.js, src/components/GameGrid.jsx), so every
// pipeline script that can produce games.json must generate the same
// shape here rather than reimplementing it - a script that skips this
// ships games with `uid: undefined`, which breaks React's list identity
// and silently breaks favoriting for every game it touches.

export function slugify(name) {
  return (name || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function generateUid(gameId, year, name) {
  return `${gameId}-${year}-${slugify(name)}`;
}
