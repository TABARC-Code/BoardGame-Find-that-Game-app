import { useState, useCallback, useEffect } from 'react';

const DEFAULT_FILTERS = {
  search: '',
  ratingMin: 1,
  ratingMax: 10,
  minVoters: 1000,
  playerCount: null,
  playtime: [],
  weight: ['light', 'medium', 'heavy'],
  categories: [],
  sort: 'rating-desc',
  showFavorites: false,
};

// Sentinel written to the URL when every weight option has been
// deliberately deselected, since an absent `weight` param is otherwise
// indistinguishable from "unset -> use the (non-empty) default".
const EMPTY_WEIGHT_SENTINEL = '__none__';

function getFiltersFromURL() {
  const params = new URLSearchParams(window.location.search);
  const weightParams = params.getAll('weight');
  return {
    search: params.get('q') || DEFAULT_FILTERS.search,
    ratingMin: parseFloat(params.get('rmin')) || DEFAULT_FILTERS.ratingMin,
    ratingMax: parseFloat(params.get('rmax')) || DEFAULT_FILTERS.ratingMax,
    minVoters: parseInt(params.get('voters')) || DEFAULT_FILTERS.minVoters,
    playerCount: params.get('players') || DEFAULT_FILTERS.playerCount,
    playtime: params.getAll('time').length ? params.getAll('time') : DEFAULT_FILTERS.playtime,
    weight: weightParams.length === 0
      ? DEFAULT_FILTERS.weight
      : weightParams[0] === EMPTY_WEIGHT_SENTINEL ? [] : weightParams,
    categories: params.getAll('cat').length ? params.getAll('cat') : DEFAULT_FILTERS.categories,
    sort: params.get('sort') || DEFAULT_FILTERS.sort,
    showFavorites: params.get('favorites') === 'true',
  };
}

function filtersToURL(filters) {
  const params = new URLSearchParams();

  if (filters.search) params.set('q', filters.search);
  if (filters.ratingMin !== DEFAULT_FILTERS.ratingMin) params.set('rmin', filters.ratingMin);
  if (filters.ratingMax !== DEFAULT_FILTERS.ratingMax) params.set('rmax', filters.ratingMax);
  if (filters.minVoters !== DEFAULT_FILTERS.minVoters) params.set('voters', filters.minVoters);
  if (filters.playerCount) params.set('players', filters.playerCount);
  filters.playtime.forEach(t => params.append('time', t));
  if (filters.weight.length === 0) {
    params.set('weight', EMPTY_WEIGHT_SENTINEL);
  } else if (filters.weight.length !== 3) {
    filters.weight.forEach(w => params.append('weight', w));
  }
  filters.categories.forEach(c => params.append('cat', c));
  if (filters.sort !== DEFAULT_FILTERS.sort) params.set('sort', filters.sort);
  if (filters.showFavorites) params.set('favorites', 'true');

  return params.toString();
}

export function useFilters() {
  const [filters, setFilters] = useState(getFiltersFromURL);

  useEffect(() => {
    const url = filtersToURL(filters);
    const newURL = url ? `?${url}` : window.location.pathname;
    window.history.replaceState({}, '', newURL);
  }, [filters]);

  const setFilter = useCallback((key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  }, []);

  const toggleArrayFilter = useCallback((key, value) => {
    setFilters(prev => {
      const arr = prev[key];
      const newArr = arr.includes(value)
        ? arr.filter(v => v !== value)
        : [...arr, value];
      return { ...prev, [key]: newArr };
    });
  }, []);

  const clearFilters = useCallback(() => {
    setFilters(DEFAULT_FILTERS);
  }, []);

  const hasActiveFilters =
    filters.search !== '' ||
    filters.ratingMin !== DEFAULT_FILTERS.ratingMin ||
    filters.ratingMax !== DEFAULT_FILTERS.ratingMax ||
    filters.minVoters !== DEFAULT_FILTERS.minVoters ||
    filters.playerCount !== null ||
    filters.playtime.length > 0 ||
    filters.weight.length !== 3 ||
    filters.categories.length > 0 ||
    filters.showFavorites;

  return { filters, setFilter, toggleArrayFilter, clearFilters, hasActiveFilters };
}
