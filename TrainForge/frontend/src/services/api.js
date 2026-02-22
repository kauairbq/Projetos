import axios from 'axios';

const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL ||
  'http://localhost:8085/api/v1';

export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json'
  }
});

let isRefreshing = false;
let waitingQueue = [];

function saveAuth(authPayload) {
  localStorage.setItem('trainforge_user', JSON.stringify(authPayload.user));
  localStorage.setItem('trainforge_access_token', authPayload.accessToken);
  localStorage.setItem('trainforge_refresh_token', authPayload.refreshToken);
}

function clearAuth() {
  localStorage.removeItem('trainforge_user');
  localStorage.removeItem('trainforge_access_token');
  localStorage.removeItem('trainforge_refresh_token');
}

function notifyQueue(error, token = null) {
  waitingQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token);
    }
  });
  waitingQueue = [];
}

export async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('trainforge_refresh_token');
  if (!refreshToken) {
    throw new Error('Missing refresh token');
  }

  const { data } = await axios.post(`${API_BASE_URL}/auth/refresh`, { refreshToken });
  if (!data?.ok) {
    throw new Error(data?.error || 'Refresh failed');
  }

  saveAuth(data);
  return data.accessToken;
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('trainforge_access_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const status = error.response?.status;

    if (status !== 401 || originalRequest?._retry) {
      return Promise.reject(error);
    }

    if (originalRequest.url?.includes('/auth/login') || originalRequest.url?.includes('/auth/refresh')) {
      return Promise.reject(error);
    }

    originalRequest._retry = true;

    if (isRefreshing) {
      return new Promise((resolve, reject) => {
        waitingQueue.push({ resolve, reject });
      })
        .then((token) => {
          originalRequest.headers.Authorization = `Bearer ${token}`;
          return api(originalRequest);
        });
    }

    isRefreshing = true;

    try {
      const token = await refreshAccessToken();
      notifyQueue(null, token);
      originalRequest.headers.Authorization = `Bearer ${token}`;
      return api(originalRequest);
    } catch (refreshErr) {
      notifyQueue(refreshErr, null);
      clearAuth();
      return Promise.reject(refreshErr);
    } finally {
      isRefreshing = false;
    }
  }
);

export { API_BASE_URL, saveAuth, clearAuth };
