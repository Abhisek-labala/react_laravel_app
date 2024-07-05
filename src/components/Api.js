import axios from 'axios';

const Api = axios.create({
  baseURL: 'http://localhost:8000/api',
});

let isLoginProcess = false;
let tokenRefreshInterval = null;
let isTokenRefreshing = false;

const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('tokenExpiry');
  clearInterval(tokenRefreshInterval);
  tokenRefreshInterval = null;
  window.location.href = '/';
};


Api.interceptors.request.use(
  async (config) => {
    if (isLoginProcess) return config;

    const token = localStorage.getItem('token');
    const tokenExpiry = localStorage.getItem('tokenExpiry');

    const refreshAccessToken = async () => {
      if (isTokenRefreshing) return;
      isTokenRefreshing = true;
      try {
        const response = await Api.post('/refresh-token', { token });
        const newToken = response.data.token;
        const newTokenExpiry = response.data.tokenExpiry;

        localStorage.setItem('token', newToken);
        localStorage.setItem('tokenExpiry', Date.now() + newTokenExpiry * 1000);

        console.log('Token refreshed successfully.');
        clearInterval(tokenRefreshInterval);
        tokenRefreshInterval = setInterval(checkTokenExpiry, 30 * 1000);
      } catch (error) {
        console.error('Failed to refresh token:', error);
        logout();
        
      } finally {
        isTokenRefreshing = false;
      }
    };

    const checkTokenExpiry = async () => {
      if (!tokenExpiry || Date.now() >= tokenExpiry) {
        console.log('Token expired or about to expire, attempting to refresh...');
        await refreshAccessToken();
      } else {
        console.log('Token is still valid.');
      }
    };

    await checkTokenExpiry();

    if (!tokenRefreshInterval) {
      tokenRefreshInterval = setInterval(checkTokenExpiry, 30 * 1000);
    }

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const setLoginProcess = (status) => {
  isLoginProcess = status;
  if (!status) {
  
    clearInterval(tokenRefreshInterval);
    tokenRefreshInterval = null;
  }
};

export default Api;
