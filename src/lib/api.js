import axios from "axios";

const API_URL = process.env.REACT_APP_BACKEND_URL;

export const api = axios.create({
  baseURL: API_URL,
});

// Helper to wait for Clerk to be ready
const waitForClerk = () => {
  return new Promise((resolve) => {
    if (window.Clerk && window.Clerk.isReady) {
      resolve(window.Clerk);
      return;
    }

    const interval = setInterval(() => {
      if (window.Clerk && window.Clerk.isReady) {
        clearInterval(interval);
        resolve(window.Clerk);
      }
    }, 100);

    // Timeout after 5 seconds
    setTimeout(() => {
      clearInterval(interval);
      resolve(window.Clerk);
    }, 5000);
  });
};

api.interceptors.request.use(async (config) => {
  try {
    const clerk = await waitForClerk();
    if (clerk && clerk.session) {
      const token = await clerk.session.getToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } else {
      console.warn("Clerk not ready or session missing");
    }
  } catch (err) {
    console.error("Clerk interceptor error:", err);
  }
  return config;
});
