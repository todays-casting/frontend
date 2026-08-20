import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import notificationsApi from "../api/notifications-api";
import { addNotification } from "./notificationState";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

const hasNotificationPermission = (permission) =>
  permission.status === "granted" ||
  permission.ios?.status === Notifications.IosAuthorizationStatus.PROVISIONAL;

let pushTokenSubscription = null;
let notificationReceivedSubscription = null;
let notificationResponseSubscription = null;

const formatNotificationTime = (date = new Date()) =>
  `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;

const normalizeNotificationType = (data) =>
  data.notificationType ?? data.type ?? data.event ?? data.kind ?? null;

const getNotificationIcon = (type, fallback) => {
  if (fallback) {
    return fallback;
  }

  if (type === "RECORD_REMINDER" || type === "DAILY_REMINDER") {
    return "pencil-outline";
  }

  if (type === "DRAFT_REMINDER") {
    return "content-save-outline";
  }

  return "movie-open-star-outline";
};

const toSheetNotification = (notification) => {
  const content = notification?.request?.content;
  const data = content?.data ?? {};
  const type = normalizeNotificationType(data);
  const dedupeKey =
    data.dedupeKey ??
    (type && data.recordId ? `${type}-${data.recordId}` : undefined) ??
    (type ? `${type}-${formatNotificationTime()}` : undefined);

  return {
    id: dedupeKey ?? notification?.request?.identifier ?? `${Date.now()}`,
    dedupeKey,
    title: content?.title ?? "새 알림",
    body: content?.body ?? "",
    time: formatNotificationTime(),
    icon: getNotificationIcon(type, data.icon),
    unread: true,
    data: { ...data, notificationType: type, dedupeKey },
  };
};

export function startNotificationListeners() {
  if (Platform.OS === "web") {
    return;
  }

  if (!notificationReceivedSubscription) {
    notificationReceivedSubscription = Notifications.addNotificationReceivedListener(
      (notification) => {
        addNotification(toSheetNotification(notification));
      }
    );
  }

  if (!notificationResponseSubscription) {
    notificationResponseSubscription = Notifications.addNotificationResponseReceivedListener(
      (response) => {
        addNotification(toSheetNotification(response?.notification));
      }
    );
  }
}

export function stopPushTokenSync() {
  pushTokenSubscription?.remove();
  pushTokenSubscription = null;
  notificationReceivedSubscription?.remove();
  notificationReceivedSubscription = null;
  notificationResponseSubscription?.remove();
  notificationResponseSubscription = null;
}

export function startPushTokenSync() {
  if (Platform.OS === "web" || pushTokenSubscription) {
    return;
  }

  pushTokenSubscription = Notifications.addPushTokenListener((token) => {
    if (!token?.data) {
      return;
    }

    notificationsApi.saveFcmToken(token.data).catch((error) => {
      console.warn("Failed to sync rotated push token:", error);
    });
  });
}

export async function registerForPushNotificationsAsync() {
  if (Platform.OS === "web") {
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "Default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#F56643",
    });
  }

  let permission = await Notifications.getPermissionsAsync();

  if (!hasNotificationPermission(permission)) {
    permission = await Notifications.requestPermissionsAsync();
  }

  if (!hasNotificationPermission(permission)) {
    console.warn("Push notification permission was not granted.");
    return null;
  }

  const token = await Notifications.getDevicePushTokenAsync();

  return token.data;
}

export async function syncPushTokenWithServer() {
  const token = await registerForPushNotificationsAsync();

  if (token) {
    await notificationsApi.saveFcmToken(token);
  }

  startPushTokenSync();
  startNotificationListeners();

  return token;
}
