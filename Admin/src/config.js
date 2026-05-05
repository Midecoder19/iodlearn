const rawApiBase = import.meta.env.VITE_API_BASE_URL || "https://iodlearn.onrender.com";
export const BACKEND_BASE_URL = rawApiBase.replace(/\/$/, "").replace(/\/api$/, "");
export const API_BASE_URL = BACKEND_BASE_URL.endsWith("/api")
  ? BACKEND_BASE_URL.replace(/\/$/, "")
  : `${BACKEND_BASE_URL}/api`;
export const API_BASE = API_BASE_URL;