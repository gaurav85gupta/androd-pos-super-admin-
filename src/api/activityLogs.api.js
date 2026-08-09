// src/api/activityLogs.api.js -- C.9 Activity Logs.
import { apiRequest } from './client';

export const activityLogsApi = {
  list: (params) => apiRequest({ method: 'GET', url: '/superadmin/activity-logs', params }),
};
