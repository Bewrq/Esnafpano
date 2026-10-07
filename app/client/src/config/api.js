// Relative requests work both through Vite's development proxy and in production.
export const API_BASE = (import.meta.env.VITE_API_BASE_URL || '/api').replace(/\/+$/, '');
