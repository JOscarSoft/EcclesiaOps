import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3000/api',
});

api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    const councilId = localStorage.getItem('last_council_id');
    
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    if (councilId) {
      config.headers['x-council-id'] = councilId;
    }
    
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
    }
    return Promise.reject(error);
  }
);
