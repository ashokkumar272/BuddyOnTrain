import axios from 'axios';

// Function to get the appropriate base URL
const getBaseURL = () => {
  // Use environment variable or fallback to deployed backend URL
  return import.meta.env.VITE_API_BASE_URL || 'https://trainbuddy.onrender.com';
};

// Create an instance of axios with a base URL
const axiosInstance = axios.create({
  baseURL: getBaseURL(),
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 15000, // Increased timeout for mobile networks
});

// Add response interceptor for better error handling
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    console.error('API Error:', error);
    
    if (error.code === 'ECONNABORTED') {
      throw new Error('Request timeout. Please check your internet connection.');
    }
    
    if (error.code === 'ERR_NETWORK') {
      throw new Error('Network error. Please check your internet connection and try again.');
    }
    
    if (!error.response) {
      throw new Error('Unable to connect to server. Please check if the server is running.');
    }
    
    return Promise.reject(error);
  }
);

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