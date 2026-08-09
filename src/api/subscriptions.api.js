// src/api/subscriptions.api.js -- C.5 Subscription Management, C.6 Feature Flags.
import { apiRequest } from './client';

export const subscriptionsApi = {
  get: (restaurantId) => apiRequest({ method: 'GET', url: `/superadmin/restaurants/${restaurantId}/subscription` }),
  changePlan: (restaurantId, data) => apiRequest({ method: 'PUT', url: `/superadmin/restaurants/${restaurantId}/subscription`, data }),
  renew: (restaurantId, extendByDays) =>
    apiRequest({ method: 'POST', url: `/superadmin/restaurants/${restaurantId}/subscription/renew`, data: { extendByDays } }),
  suspend: (restaurantId) => apiRequest({ method: 'POST', url: `/superadmin/restaurants/${restaurantId}/subscription/suspend` }),
};

export const featureFlagsApi = {
  get: (restaurantId) => apiRequest({ method: 'GET', url: `/superadmin/restaurants/${restaurantId}/feature-flags` }),
  set: (restaurantId, key, value) =>
    apiRequest({ method: 'PUT', url: `/superadmin/restaurants/${restaurantId}/feature-flags`, data: { key, value } }),
};
