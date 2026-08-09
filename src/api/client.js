// src/api/client.js
//
// C.12 API Integration -- "Business logic frontend mein nahi hogi."
// This file's job is strictly plumbing: attach the access token, transparently
// refresh it on a 401 once, and unwrap the backend's standard envelope
// { success, data, error, meta } into a plain value or a thrown error. No
// page/component ever sees the envelope shape directly.

import axios from 'axios';
import { getAccessToken, getRefreshToken, setTokens, clearTokens } from '../auth/tokenStorage';

const BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:4000/api/v1';

export const apiClient = axios.create({ baseURL: BASE_URL, timeout: 20000 });

apiClient.interceptors.request.use((config) => {
  const token = getAccessToken();
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

let refreshInFlight = null;

async function performRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) throw new Error('No refresh token available');
  const response = await axios.post(`${BASE_URL}/superadmin-auth/refresh`, { refreshToken });
  const { accessToken } = response.data.data;
  setTokens({ accessToken, refreshToken });
  return accessToken;
}

apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const original = error.config;

    // C.1 -- transparent single-retry refresh on an expired access token.
    // Never retries more than once (original._retry guard) to avoid a loop
    // if the refresh token itself is also invalid.
    if (error.response?.status === 401 && !original._retry && !original.url?.includes('/superadmin-auth/')) {
      original._retry = true;
      try {
        refreshInFlight = refreshInFlight || performRefresh();
        const newAccessToken = await refreshInFlight;
        refreshInFlight = null;
        original.headers.Authorization = `Bearer ${newAccessToken}`;
        return apiClient(original);
      } catch {
        refreshInFlight = null;
        clearTokens();
        window.location.href = '#/login';
        return Promise.reject(error);
      }
    }

    return Promise.reject(error);
  },
);

/**
 * Unwraps the standard envelope. Throws a normalized ApiError with
 * `.code`, `.message`, `.details`, `.status` so components can branch on
 * `err.code` without touching axios/response shape at all.
 */
export class ApiError extends Error {
  constructor({ message, code, details, status }) {
    super(message);
    this.code = code;
    this.details = details;
    this.status = status;
  }
}

export async function apiRequest(config) {
  try {
    const response = await apiClient(config);
    return response.data.data;
  } catch (error) {
    if (error.response?.data?.error) {
      const { code, message, details } = error.response.data.error;
      throw new ApiError({ message, code, details, status: error.response.status });
    }
    if (error.request && !error.response) {
      throw new ApiError({ message: 'Could not reach the server. Check your connection.', code: 'NETWORK_ERROR', status: 0 });
    }
    throw new ApiError({ message: error.message || 'Something went wrong.', code: 'UNKNOWN', status: error.response?.status });
  }
}
