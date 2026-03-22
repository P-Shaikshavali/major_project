import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:5273/api',
  timeout: 15000,
});

// ── Attach JWT token to every request ─────────────────────────────────────────
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Handle 401 Unauthorized — auto redirect to login ─────────────────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token is missing or expired
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login?reason=session_expired';
      }
    }
    return Promise.reject(error);
  }
);

export default api;
