import axios from "axios";
import { Clerk } from "@clerk/clerk-js";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(async (config) => {
  const clerk = Clerk?.instance;
  if (clerk) {
    const token = await clerk.session?.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});
