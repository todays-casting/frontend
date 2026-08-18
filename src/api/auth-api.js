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

const unwrapAuthResponse = (data) => data?.result ?? data;

const requireAccessToken = (result, message) => {
  if (!result?.accessToken) {
    throw new Error(message);
  }

  return result.accessToken;
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

  return unwrapAuthResponse(response.data);
};

const signUpStepTwo = async ({ userId, nickname, age, gender }) => {
  const response = await client.post(
    "/auth/signup/step2",
    { userId, nickname, age, gender },
    publicRequestConfig
  );

  const result = unwrapAuthResponse(response.data);
  const accessToken = requireAccessToken(
    result,
    "회원가입 응답에 accessToken이 없습니다."
  );

  setAccessToken(accessToken);
  setTodayRecordStateScope(getAuthScope(userId, result));
  syncNotificationsAfterAuth();
  return result;
};

const login = async ({ email, password }) => {
  const response = await client.post(
    "/auth/login",
    { email, password },
    publicRequestConfig
  );

  const result = unwrapAuthResponse(response.data);
  const accessToken = requireAccessToken(
    result,
    "로그인 응답에 accessToken이 없습니다."
  );

  setAccessToken(accessToken);
  setTodayRecordStateScope(getAuthScope(email.trim(), result));
  syncNotificationsAfterAuth();
  return result;
};

const kakaoLogin = async ({ accessToken }) => {
  const response = await client.post(
    "/auth/kakao",
    { accessToken },
    publicRequestConfig
  );

  const result = unwrapAuthResponse(response.data);

  if (!result.isNewUser && result.accessToken) {
    setAccessToken(result.accessToken);
    setTodayRecordStateScope(getAuthScope(accessToken, result));
    syncNotificationsAfterAuth();
  }

  return result;
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

const deleteAccount = async () => {
  await client.delete("/auth/me");
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
  deleteAccount,
  logout,
};

export default authApi;
