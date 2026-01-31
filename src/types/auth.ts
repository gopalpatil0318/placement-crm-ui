export type UserRole = "sysadmin" | "college_admin" | "student"

export interface User {
  id: string
  email: string
  role: UserRole
  type?: string
  collegeId?: string
  isActive: boolean
}

export interface ApiLoginResponse {
  success: boolean
  message: string
  data: {
    id?: string;
    role: string
    email: string
    type: string
    // Any other backend fields
  }
}

// Context specific type
export interface AuthContextType {
  // id: string
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}