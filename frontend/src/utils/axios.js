import axios from 'axios';

// Create an instance of axios with a base URL
const axiosInstance = axios.create({
  baseURL: '', // Using relative path since we're using Vite proxy
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
});

// Add a request interceptor to add auth token
axiosInstance.interceptors.request.use(
  (config) => {
    const tokenData = localStorage.getItem('token');
    if (tokenData) {
      config.headers.Authorization = `Bearer ${tokenData}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Helper functions for auth
export const setToken = (token) => {
  if (token) {
    localStorage.setItem('token', token);
  }
};

export const removeToken = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('userId');
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  return !!getToken();
};

export default axiosInstance; 