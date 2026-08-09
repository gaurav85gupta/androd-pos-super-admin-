// src/api/users.api.js -- C.7 User Management.
import { apiRequest } from './client';

export const usersApi = {
  list: (restaurantId, params) => apiRequest({ method: 'GET', url: `/superadmin/restaurants/${restaurantId}/users`, params }),
  create: (restaurantId, data) => apiRequest({ method: 'POST', url: `/superadmin/restaurants/${restaurantId}/users`, data }),
  update: (restaurantId, userId, data) => apiRequest({ method: 'PUT', url: `/superadmin/restaurants/${restaurantId}/users/${userId}`, data }),
  disable: (restaurantId, userId) => apiRequest({ method: 'POST', url: `/superadmin/restaurants/${restaurantId}/users/${userId}/disable` }),
  enable: (restaurantId, userId) => apiRequest({ method: 'POST', url: `/superadmin/restaurants/${restaurantId}/users/${userId}/enable` }),
};
