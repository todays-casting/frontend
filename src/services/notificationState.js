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

const getNotificationKey = (notification) => {
  if (!notification) {
    return null;
  }

  if (notification.dedupeKey) {
    return notification.dedupeKey;
  }

  if (notification.data?.dedupeKey) {
    return notification.data.dedupeKey;
  }

  if (notification.data?.recordId) {
    return `${notification.title ?? ""}|${notification.body ?? ""}|record-${notification.data.recordId}`;
  }

  return notification.id ?? `${notification.title ?? ""}|${notification.body ?? ""}|${notification.time ?? ""}`;
};

export function getNotificationState() {
  return getPublicState();
}

export function setNotifications(notifications) {
  state.notifications = Array.isArray(notifications) ? notifications : [];
  notify();
}

export function addNotification(notification) {
  if (!notification) {
    return;
  }

  const nextKey = getNotificationKey(notification);
  const existing = state.notifications.find(
    (item) => getNotificationKey(item) === nextKey
  );
  const nextNotification = existing
    ? {
        ...existing,
        ...notification,
        unread: existing.unread || notification.unread,
      }
    : notification;

  state.notifications = [
    nextNotification,
    ...state.notifications.filter((item) => getNotificationKey(item) !== nextKey),
  ].slice(0, 20);
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
