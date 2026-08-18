import client, { setAccessToken } from "./client";
import {
  stopPushTokenSync,
  syncPushTokenWithServer,
} from "../services/notifications";
import {
  clearTodayRecordSession,
  setTodayRecordStateScope,
} from "../services/todayRecordState";

const publicRequestConfig = {
  skipAuth: true,
  headers: {
    Authorization: undefined,
  },
};

const syncNotificationsAfterAuth = () => {
  syncPushTokenWithServer().catch((error) => {
    console.warn("Failed to sync push token:", error);
  });
};

const getAuthScope = (fallback, data) =>
  data?.userId ??
  data?.id ??
  data?.memberId ??
  data?.email ??
  data?.user?.id ??
  data?.member?.id ??
  fallback;

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
  setTodayRecordStateScope(getAuthScope(userId, response.data));
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
  setTodayRecordStateScope(getAuthScope(email.trim(), response.data));
  syncNotificationsAfterAuth();
  return response.data;
};

const kakaoLogin = async ({ accessToken }) => {
  const response = await client.post(
    "/auth/kakao",
    { accessToken },
    publicRequestConfig
  );

  if (!response.data.isNewUser && response.data.accessToken) {
    setAccessToken(response.data.accessToken);
    setTodayRecordStateScope(getAuthScope(accessToken, response.data));
    syncNotificationsAfterAuth();
  }

  return response.data;
};

const requestPasswordReset = async ({ email }) => {
  await client.post(
    "/auth/password/reset/request",
    { email },
    publicRequestConfig
  );
};

const confirmPasswordReset = async ({ email, otp, newPassword }) => {
  await client.post(
    "/auth/password/reset/confirm",
    { email, otp, newPassword },
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
  clearTodayRecordSession();
  stopPushTokenSync();
};

const logout = () => {
  setAccessToken(null);
  clearTodayRecordSession();
  stopPushTokenSync();
};

const authApi = {
  signUpStepOne,
  signUpStepTwo,
  login,
  kakaoLogin,
  requestPasswordReset,
  confirmPasswordReset,
  changePassword,
  logout,
};

export default authApi;
