import client from "./client";

const getNotificationSettings = async () => {
  const response = await client.get("/users/me/notification-settings");

  return response.data.result;
};

const updateNotificationSettings = async (settings) => {
  const response = await client.put("/users/me/notification-settings", settings);

  return response.data.result;
};

const saveFcmToken = async (token) => {
  await client.post("/users/me/fcm-token", { token });
};

const sendTestNotification = async ({ title, body, data }) => {
  const response = await client.post("/users/me/notifications/test", {
    title,
    body,
    data,
  });

  return response.data.result;
};

const notificationsApi = {
  getNotificationSettings,
  updateNotificationSettings,
  saveFcmToken,
  sendTestNotification,
};

export default notificationsApi;
