import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const ACCESS_TOKEN_KEY = "todays-casting:access-token";

const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

let cachedAccessToken = null;

export const setAccessToken = (accessToken) => {
  cachedAccessToken = accessToken || null;

  if (accessToken) {
    client.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
    AsyncStorage.setItem(ACCESS_TOKEN_KEY, accessToken).catch(() => {});
  } else {
    delete client.defaults.headers.common.Authorization;
    AsyncStorage.removeItem(ACCESS_TOKEN_KEY).catch(() => {});
  }
};

export const hydrateAccessToken = async () => {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }

  const storedAccessToken = await AsyncStorage.getItem(ACCESS_TOKEN_KEY);

  if (storedAccessToken) {
    cachedAccessToken = storedAccessToken;
    client.defaults.headers.common.Authorization = `Bearer ${storedAccessToken}`;
  }

  return storedAccessToken;
};

client.interceptors.request.use(async (config) => {
  if (config.skipAuth) {
    return config;
  }

  const existingAuthorization =
    config.headers?.Authorization ?? client.defaults.headers.common.Authorization;

  if (existingAuthorization) {
    return config;
  }

  const accessToken = await hydrateAccessToken();

  if (accessToken) {
    config.headers.Authorization = `Bearer ${accessToken}`;
  }

  return config;
});

export default client;
