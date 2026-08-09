// src/components/StateViews.jsx
//
// C.16 Error Handling -- reusable Loading / Empty / Error / Retry views,
// used the same way on every list/detail page instead of each page
// building its own ad-hoc spinner/message.

export function LoadingView({ label = 'Loading…' }) {
  return (
    <div className="state-view">
      <div className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}

export function EmptyView({ title = 'Nothing here yet', message, action }) {
  return (
    <div className="state-view">
      <h3>{title}</h3>
      {message && <p>{message}</p>}
      {action}
    </div>
  );
}

export function ErrorView({ error, onRetry }) {
  return (
    <div className="state-view state-view--error">
      <h3>Something went wrong</h3>
      <p>{error?.message || 'An unexpected error occurred.'}</p>
      {onRetry && (
        <button type="button" className="btn btn--secondary" onClick={onRetry}>
          Retry
        </button>
      )}
    </div>
  );
}

/**
 * Convenience wrapper: pass a react-query-shaped { isLoading, isError,
 * error, data } and render exactly one of the four states, matching the
 * pattern used by the Android app's StatefulContent composable (Phase A)
 * for consistency across products.
 */
export function StatefulContent({ isLoading, isError, error, data, isEmpty, onRetry, emptyProps, children }) {
  if (isLoading) return <LoadingView />;
  if (isError) return <ErrorView error={error} onRetry={onRetry} />;
  if (isEmpty ? isEmpty(data) : !data) return <EmptyView {...emptyProps} />;
  return children(data);
}
