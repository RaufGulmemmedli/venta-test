
import axios from "axios"

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "http://10.40.10.42:8001/api";

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

axiosInstance.interceptors.request.use(
  async (config) => {
    // Only access localStorage in browser environment
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token')
      if (token) {
        config.headers.Authorization = `Bearer ${token}`
      }
    }

    config.headers["Accept-Language"] = getCurrentLocaleFromCookie();

    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)


axiosInstance.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
    }
    return Promise.reject(error)
  },
)

function getCurrentLocaleFromCookie() {
  if (typeof document !== "undefined") {
    const match = document.cookie.match(/(^| )NEXT_LOCALE=([^;]+)/);
    return match ? match[2] : "en";
  }
  return "en";
}
