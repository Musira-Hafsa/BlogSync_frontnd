import axios from "axios";

const api = axios.create({
baseURL: 'https://blogsync-backend.vercel.app'
 
});

// Attach Bearer token from storage if present
api.interceptors.request.use((config) => {
  const token =
    localStorage.getItem("bs_token") ||
    sessionStorage.getItem("bs_token");
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

// Global response error handler — auto-logout on 401
api.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      // Token expired — clear storage, redirect to login
      localStorage.removeItem("bs_token");
      localStorage.removeItem("bs_user");
      sessionStorage.removeItem("bs_token");
      sessionStorage.removeItem("bs_user");
      if (window.location.pathname !== "/auth") {
        window.location.href = "/auth";
      }
    }
    return Promise.reject(err);
  }
);

export default api;