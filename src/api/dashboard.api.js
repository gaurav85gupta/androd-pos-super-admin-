// src/api/dashboard.api.js -- C.2 Super Admin Dashboard.
import { apiRequest } from './client';

export const dashboardApi = {
  getSummary: () => apiRequest({ method: 'GET', url: '/superadmin/dashboard' }),
};
