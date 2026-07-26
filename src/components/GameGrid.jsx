import { useState } from 'react';
import { GameCard } from './GameCard';

// The dataset can run past 900 games with no filters applied. Rendering
// (and lazy-image-requesting) all of them at once is real, measured cost
// - not just theoretical - so only an initial batch is mounted, grown on
// request via the button below rather than all at once or via
// scroll-triggered auto-loading, which is unpredictable for keyboard and
// screen-reader users.
const INITIAL_BATCH = 60;
const BATCH_SIZE = 60;

export function GameGrid({ games, onGameClick, isFavorite, onToggleFavorite, onClearFilters, resetKey }) {
  const [visibleCount, setVisibleCount] = useState(INITIAL_BATCH);
  const [syncedResetKey, setSyncedResetKey] = useState(resetKey);

  // Jump back to the first batch whenever the active filters change, so a
  // new filter always starts at the top of its (re-sorted) results
  // instead of carrying over an unrelated "how many are loaded" count.
  // Toggling a favorite does NOT go through this (resetKey is derived
  // from filters only), so favoriting a card deep in the loaded batch
  // doesn't collapse the list back down under the user. Adjusted during
  // render (React's recommended pattern for resetting state from a
  // changed prop) rather than in an effect, to avoid an extra render pass.
  if (resetKey !== syncedResetKey) {
    setSyncedResetKey(resetKey);
    setVisibleCount(INITIAL_BATCH);
  }

  if (games.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 px-4">
        <svg className="w-24 h-24 text-[var(--border)] mb-4" viewBox="0 0 24 24" fill="currentColor">
          <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
        </svg>
        <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2" style={{ fontFamily: 'Fraunces, Georgia, serif' }}>
          No games found
        </h3>
        <p className="text-sm text-[var(--text-secondary)] text-center max-w-md mb-4">
          Try adjusting your filters to discover more games. There are thousands of great board games waiting to be explored!
        </p>
        {onClearFilters && (
          <button
            onClick={onClearFilters}
            className="px-4 py-2 text-sm font-medium text-white bg-[var(--navy)] hover:bg-[var(--navy-light)] rounded-lg transition-colors"
          >
            Clear filters
          </button>
        )}
      </div>
    );
  }

  const visibleGames = games.slice(0, visibleCount);
  const hasMore = visibleGames.length < games.length;

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4 2xl:grid-cols-5 gap-2 sm:gap-4 p-2 sm:p-4 lg:p-6">
        {visibleGames.map(game => (
          <GameCard
            key={game.uid}
            game={game}
            onClick={() => onGameClick(game)}
            isFavorite={isFavorite(game.uid)}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </div>
      {hasMore && (
        <div className="flex flex-col items-center gap-2 pb-8 px-4">
          <p className="text-xs text-[var(--text-secondary)]">
            Showing {visibleGames.length} of {games.length}
          </p>
          <button
            onClick={() => setVisibleCount(c => Math.min(c + BATCH_SIZE, games.length))}
            className="px-5 py-2 text-sm font-medium text-[var(--navy)] bg-[var(--bg-card)] border border-[var(--border)] rounded-lg hover:bg-[var(--border)] transition-colors"
          >
            Load more games
          </button>
        </div>
      )}
    </>
  );
}
