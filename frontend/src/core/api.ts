import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

export const api = axios.create({
  baseURL: 'http://localhost:3000/api',
});

api.interceptors.request.use(
  (config) => {
    const { token, tenantId } = useAuthStore.getState();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    if (tenantId && !config.url?.includes('platform/auth/login')) {
      config.headers['x-tenant-id'] = tenantId;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      const { user, logout } = useAuthStore.getState();
      // Only auto-logout for tenant users with empty permissions (stale token)
      if (user && user.role !== 'SUPER_ADMIN' && (!user.permissions || user.permissions.length === 0)) {
        logout();
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);
