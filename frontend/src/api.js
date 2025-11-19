// Change VITE_API_BASE in .env if you deploy elsewhere
export const API_BASE = import.meta.env.VITE_API_BASE || "http://localhost:8000";

export function makeWsUrl() {
  return API_BASE.replace(/^http/, "ws") + "/ws";
}
