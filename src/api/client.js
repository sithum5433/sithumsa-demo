import { demoRequest } from './demoBackend.js';

export function setCsrfToken(_token) {
  // Handled internally by browser demo backend
}

export async function apiRequest(url, options = {}) {
  return demoRequest(url, options);
}
