import { Platform } from "react-native";
import * as Notifications from "expo-notifications";
import notificationsApi from "../api/notifications-api";

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

export function stopPushTokenSync() {
  pushTokenSubscription?.remove();
  pushTokenSubscription = null;
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

  return token;
}
