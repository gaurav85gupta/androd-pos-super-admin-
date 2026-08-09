// src/api/devices.api.js -- C.8 Device Management.
import { apiRequest } from './client';

export const devicesApi = {
  list: (params) => apiRequest({ method: 'GET', url: '/superadmin/devices', params }),
  approve: (deviceId) => apiRequest({ method: 'POST', url: `/superadmin/devices/${deviceId}/approve` }),
  disable: (deviceId) => apiRequest({ method: 'POST', url: `/superadmin/devices/${deviceId}/disable` }),
  remove: (deviceId) => apiRequest({ method: 'POST', url: `/superadmin/devices/${deviceId}/remove` }),
};
