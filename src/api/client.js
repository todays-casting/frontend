import axios from "axios";

const client = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_URL,
  timeout: 10000,
  headers: {
    "Content-Type": "application/json",
  },
});

export const setAccessToken = (accessToken) => {
  if (accessToken) {
    client.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  } else {
    delete client.defaults.headers.common.Authorization;
  }
};

export default client;
