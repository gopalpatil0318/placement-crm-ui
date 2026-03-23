import axios from "axios"

/**
 * Custom error class that preserves the HTTP status code from API responses.
 * Use `instanceof ApiError` and `.status` in hooks to handle specific status codes
 * (e.g. 409 duplicate, 400 bad request) without relying on the raw AxiosError shape.
 */
export class ApiError extends Error {
  readonly status?: number

  constructor(message: string, status?: number) {
    super(message)
    this.name = "ApiError"
    this.status = status
  }
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || "/api",
  withCredentials: true,
  timeout: 30000, // 30 seconds — prevents hanging requests on slow networks
  headers: {
    "Content-Type": "application/json",
  },
})

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status

    // 401 Unauthorized — session expired, redirect to login
    if (status === 401) {
      const path = window.location.pathname
      if (path.startsWith("/student")) {
        window.location.href = "/student/login"
      } else if (path.startsWith("/sysadmin")) {
        window.location.href = "/sysadmin/login"
      } else {
        window.location.href = "/college/login"
      }
      return Promise.reject(new ApiError("Session expired. Please log in again.", 401))
    }

    // 429 Rate Limited — provide a clear user-friendly message
    if (status === 429) {
      return Promise.reject(
        new ApiError("Too many requests. Please wait a moment and try again.", 429),
      )
    }

    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred"
    return Promise.reject(new ApiError(message, status))
  },
)

export default api