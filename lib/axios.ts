
import axios from "axios"

export const API_BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL ||  "http://localhost/api";
  console.log( process.env.NEXT_PUBLIC_BASE_URL,"process.env.NEXT_PUBLIC_API_BASE_URL")

  console.log(process.env.NODE_ENV,"process.env.NODE_ENV") 

export const axiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

axiosInstance.interceptors.request.use(
  async (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
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
