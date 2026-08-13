import { Platform } from "react-native";
import * as Notifications from "expo-notifications";

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
