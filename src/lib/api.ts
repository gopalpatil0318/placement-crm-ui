import axios from "axios"

const api = axios.create({
  baseURL: "/api",
  withCredentials: true, // Critical for cookies
  headers: {
    "Content-Type": "application/json",
  },
})

// Global error handler
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error.response?.data?.message || error.message || "An unexpected error occurred"
    return Promise.reject(new Error(message))
  }
)

export default api