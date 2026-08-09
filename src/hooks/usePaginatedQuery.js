// src/hooks/usePaginatedQuery.js
//
// C.15 Performance -- Pagination, Server-side Filtering, Debounced Search,
// (Lazy Loading is handled at the route level via React.lazy, see
// router.jsx). One hook every list page (Restaurants, Users, Devices,
// Activity Logs) uses instead of each page re-implementing cursor state,
// filter state, and a debounce timer independently.

import { useState, useEffect, useCallback, useRef } from 'react';

const DEBOUNCE_MS = 350;

/**
 * @param {(params: object) => Promise<{items, total, nextCursor, hasMore}>} fetchFn
 * @param {object} filters - non-search filters (status, plan, etc), triggers immediate refetch
 * @param {string} searchValue - debounced before triggering a refetch
 */
export function usePaginatedQuery(fetchFn, filters = {}, searchValue = '') {
  const [state, setState] = useState({ items: [], total: 0, isLoading: true, isError: false, error: null });
  const [cursor, setCursor] = useState(null);
  const [debouncedSearch, setDebouncedSearch] = useState(searchValue);
  const requestId = useRef(0);

  // Debounce search input specifically -- filters (dropdowns) apply immediately,
  // since those are discrete choices, not per-keystroke typing.
  useEffect(() => {
    const timer = setTimeout(() => setDebouncedSearch(searchValue), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [searchValue]);

  const filterKey = JSON.stringify(filters);

  const load = useCallback(async (cursorToUse) => {
    const thisRequest = ++requestId.current;
    setState((s) => ({ ...s, isLoading: true, isError: false }));
    try {
      const result = await fetchFn({ ...filters, search: debouncedSearch || undefined, cursor: cursorToUse || undefined });
      if (thisRequest !== requestId.current) return; // a newer request superseded this one -- ignore stale response
      setState({ items: result.items, total: result.total, isLoading: false, isError: false, error: null });
      setCursor(result.nextCursor);
    } catch (error) {
      if (thisRequest !== requestId.current) return;
      setState((s) => ({ ...s, isLoading: false, isError: true, error }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, filterKey]);

  useEffect(() => {
    load(null);
  }, [load]);

  return {
    ...state,
    reload: () => load(null),
    loadMore: state.items.length && cursor ? () => load(cursor) : null,
  };
}
