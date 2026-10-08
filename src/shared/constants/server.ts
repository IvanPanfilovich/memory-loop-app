/**
 * Base URL of the Memory Loop API.
 *
 * Override it with VITE_API_BASE_URL at build time (see .env.example);
 * falls back to the hosted production API.
 */
export const SERVER_URL = import.meta.env.VITE_API_BASE_URL || 'https://api.memoryloop.co';
