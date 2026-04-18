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
  timeout: 15000, // 15 seconds — balances slow networks vs connection exhaustion at scale
  headers: {
    "Content-Type": "application/json",
  },
})

function redirectToLogin() {
  // Clear all auth sessions to prevent PublicRoute from redirecting back
  localStorage.removeItem("student_user")
  localStorage.removeItem("college_user")
  localStorage.removeItem("sysadmin_user")
  localStorage.removeItem("placenex_selected_year")
  const path = globalThis.location.pathname
  if (path.startsWith("/sysadmin")) {
    globalThis.location.href = "/sysadmin/login"
  } else {
    globalThis.location.href = "/login"
  }
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const status = error.response?.status
    const originalRequest = error.config

    // Check if this is a login request — login 401s are credential errors, not session expiry
    const requestUrl = originalRequest?.url ?? ""
    const requestPath = new URL(requestUrl, "http://localhost").pathname
    const isLoginRequest = /\/(college|student|sysadmin)\/login$/.test(requestPath)

    // 401 Unauthorized — for non-login requests, session expired → redirect to login
    // NOTE: Token refresh (B21) not yet implemented — redirect immediately
    if (status === 401 && !isLoginRequest) {
      redirectToLogin()
      throw new ApiError("Session expired. Please log in again.", 401)
    }

    // 429 Rate Limited — provide a clear user-friendly message
    if (status === 429) {
      throw new ApiError("Too many requests. Please wait a moment and try again.", 429)
    }

    const message =
      error.response?.data?.error ||
      error.response?.data?.message ||
      error.message ||
      "An unexpected error occurred"
    throw new ApiError(message, status)
  },
)

export default api