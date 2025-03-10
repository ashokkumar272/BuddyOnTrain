import axios from 'axios';

// Create an instance of axios with a base URL
const axiosInstance = axios.create({
  baseURL: 'http://localhost:4000', // Match the existing URL in the app
  headers: {
    'Content-Type': 'application/json',
  },
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