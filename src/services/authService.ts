const API_BASE_URL = "https://testpcrmapi.vercel.app/api"

interface ApiLoginResponse {
  success: boolean
  message: string
  data: {
    token: string
    role: string
    email: string
    type: string
  }
}

export const authService = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    })

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}))
      throw new Error(errorData.message || "Login failed")
    }

    const data: ApiLoginResponse = await response.json()

    if (!data.success) {
      throw new Error(data.message || "Login failed")
    }

    return data.data
  },
}
