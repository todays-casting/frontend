const listeners = new Set();

const state = {
  notifications: [],
};

const getPublicState = () => ({
  notifications: state.notifications,
  hasUnread: state.notifications.some((notification) => notification.unread),
});

const notify = () => {
  const nextState = getPublicState();

  listeners.forEach((listener) => listener(nextState));
};

export function getNotificationState() {
  return getPublicState();
}

export function setNotifications(notifications) {
  state.notifications = Array.isArray(notifications) ? notifications : [];
  notify();
}

export function markAllNotificationsRead() {
  state.notifications = state.notifications.map((notification) => ({
    ...notification,
    unread: false,
  }));
  notify();
}

export function subscribeNotificationState(listener) {
  listeners.add(listener);
  listener(getPublicState());

  return () => {
    listeners.delete(listener);
  };
}
