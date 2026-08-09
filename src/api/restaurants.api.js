// src/api/restaurants.api.js -- C.3 Restaurant Management, C.4 Configuration.
import { apiRequest } from './client';

export const restaurantsApi = {
  list: (params) => apiRequest({ method: 'GET', url: '/superadmin/restaurants', params }),
  getById: (id) => apiRequest({ method: 'GET', url: `/superadmin/restaurants/${id}` }),
  create: (data) => apiRequest({ method: 'POST', url: '/superadmin/restaurants', data }),
  update: (id, data) => apiRequest({ method: 'PUT', url: `/superadmin/restaurants/${id}`, data }),
  activate: (id) => apiRequest({ method: 'POST', url: `/superadmin/restaurants/${id}/activate` }),
  suspend: (id) => apiRequest({ method: 'POST', url: `/superadmin/restaurants/${id}/suspend` }),
  archive: (id) => apiRequest({ method: 'POST', url: `/superadmin/restaurants/${id}/archive` }),
  getConfig: (id) => apiRequest({ method: 'GET', url: `/superadmin/restaurants/${id}/config` }),
  updateConfig: (id, data) => apiRequest({ method: 'PUT', url: `/superadmin/restaurants/${id}/config`, data }),
};
