const listeners = new Set();

export function notifyFavoriteChanged(payload) {
  listeners.forEach((listener) => listener(payload));
}

export function subscribeFavoriteChanges(listener) {
  listeners.add(listener);

  return () => {
    listeners.delete(listener);
  };
}
