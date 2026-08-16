import client, { setAccessToken } from "./client";
import {
  stopPushTokenSync,
  syncPushTokenWithServer,
} from "../services/notifications";

const publicRequestConfig = {
  headers: {
    Authorization: undefined,
  },
};

const syncNotificationsAfterAuth = () => {
  syncPushTokenWithServer().catch((error) => {
    console.warn("Failed to sync push token:", error);
  });
};

const signUpStepOne = async ({ email, password, passwordConfirm }) => {
  const response = await client.post(
    "/auth/signup/step1",
    { email, password, passwordConfirm },
    publicRequestConfig
  );

  return response.data;
};

const signUpStepTwo = async ({ userId, nickname, age, gender }) => {
  const response = await client.post(
    "/auth/signup/step2",
    { userId, nickname, age, gender },
    publicRequestConfig
  );

  setAccessToken(response.data.accessToken);
  syncNotificationsAfterAuth();
  return response.data;
};

const login = async ({ email, password }) => {
  const response = await client.post(
    "/auth/login",
    { email, password },
    publicRequestConfig
  );

  setAccessToken(response.data.accessToken);
  syncNotificationsAfterAuth();
  return response.data;
};

const kakaoLogin = async ({ accessToken }) => {
  const response = await client.post(
    "/auth/kakao",
    { accessToken },
    publicRequestConfig
  );

  setAccessToken(response.data.accessToken);
  syncNotificationsAfterAuth();
  return response.data;
};

const resetPassword = async ({ email }) => {
  await client.post(
    "/auth/password/reset",
    { email },
    publicRequestConfig
  );
};

const changePassword = async ({ currentPassword, newPassword, newPasswordConfirm }) => {
  await client.patch("/auth/password", {
    currentPassword,
    newPassword,
    newPasswordConfirm,
  });
  setAccessToken(null);
  stopPushTokenSync();
};

const logout = () => {
  setAccessToken(null);
  stopPushTokenSync();
};

const authApi = {
  signUpStepOne,
  signUpStepTwo,
  login,
  kakaoLogin,
  resetPassword,
  changePassword,
  logout,
};

export default authApi;
