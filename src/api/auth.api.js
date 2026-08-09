// src/api/auth.api.js -- C.1 Super Admin Authentication.
import { apiRequest } from './client';

export const authApi = {
  login: (email, password) => apiRequest({ method: 'POST', url: '/superadmin-auth/login', data: { email, password } }),
  logout: (refreshToken) => apiRequest({ method: 'POST', url: '/superadmin-auth/logout', data: { refreshToken } }),
  me: () => apiRequest({ method: 'GET', url: '/superadmin-auth/me' }),
  changePassword: (currentPassword, newPassword) =>
    apiRequest({ method: 'POST', url: '/superadmin-auth/change-password', data: { currentPassword, newPassword } }),
};
