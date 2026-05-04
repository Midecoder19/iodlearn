const rawApiBase = import.meta.env.VITE_API_BASE_URL || "https://iodlearn.onrender.com";
export const API_BASE_URL = rawApiBase.replace(/\/$/, "").endsWith("/api")
  ? rawApiBase.replace(/\/$/, "")
  : `${rawApiBase.replace(/\/$/, "")}/api`;
export const API_BASE = API_BASE_URL;