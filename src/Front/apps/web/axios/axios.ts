import axios from "axios";
import { toast } from "react-toastify";

const api = axios.create({
  // Use 127.0.0.1 to avoid potential localhost IPv6 mismatch
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000",
  headers: { "Content-Type": "application/json" },
  // Desactivar cookies en peticiones CORS por ahora (el token va en Authorization)
  withCredentials: false,
  timeout: 10000,
});

// adjunta token desde localStorage en cada petición
api.interceptors.request.use((config) => {
  try {
    if (typeof window !== "undefined" && config.headers) {
      const token = localStorage.getItem("access_token");
      if (token) config.headers.Authorization = `Bearer ${token}`;
    }
  } catch (e) {
    /* ignore */
  }
  return config;
}, (error) => Promise.reject(error));

// Logging interceptor (verbose - remove when debugging finished)
api.interceptors.request.use((config) => {
  try {
    const token = (typeof window !== 'undefined') ? localStorage.getItem('access_token') : null;
    const fullUrl = (config.baseURL || '') + (config.url || '');
    console.log('[axios] request ->', {
      method: config.method,
      url: fullUrl,
      headers: config.headers,
      hasToken: !!token,
      tokenPreview: token ? `${token.slice(0,10)}...` : null,
      data: (config as any).data || undefined,
    });
  } catch (err) {
    console.error('[axios] request logging error', err);
  }
  return config;
}, (error) => Promise.reject(error));

api.interceptors.response.use((response) => {
  try {
    console.log('[axios] response <-', {
      url: response.config && `${response.config.baseURL || ''}${response.config.url || ''}`,
      status: response.status,
      data: response.data,
    });
  } catch (err) {
    console.error('[axios] response logging error', err);
  }
  return response;
}, (error) => {
  try {
    console.error('[axios] response error <-', {
      message: error?.message,
      code: error?.code,
      url: error?.config && `${error.config.baseURL || ''}${error.config.url || ''}`,
      request: error?.request ? '[request exists]' : null,
      response: error?.response ? { status: error.response.status, data: error.response.data } : null,
    });

    // Show toast for critical errors (only if not handled by components)
    // Note: 401 errors are handled by individual components, not globally
    if (error?.response?.status === 500) {
      toast.error("Server error. Please try again later.");
    } else if (error?.response?.status === 503) {
      toast.error("Service unavailable. Please try again later.");
    } else if (error?.code === "ECONNABORTED" || error?.code === "ERR_NETWORK") {
      toast.error("Network error. Please check your connection.");
    }
  } catch (err) {
    console.error('[axios] response error logging failed', err);
  }
  return Promise.reject(error);
});

export default api;