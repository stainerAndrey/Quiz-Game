// Default to the machine that served the frontend so phones hitting the LAN copy work.
const DEFAULT_API_BASE =
  typeof window === "undefined"
    ? "http://localhost:8000"
    : `${window.location.protocol}//${window.location.hostname}:8000`;

export const API_BASE = import.meta.env.VITE_API_BASE || DEFAULT_API_BASE;

export function makeWsUrl() {
  return API_BASE.replace(/^http/, "ws") + "/ws";
}
