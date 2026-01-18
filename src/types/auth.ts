export type UserRole =  "sysadmin" | "college_admin" | "student"


export interface User {
  id: string
  email: string
  role: UserRole
  type?: string
  collegeId?: string // For college admin and students
  isActive: boolean
}

export interface LoginRequest {
  email: string
  password: string
}

export interface LoginResponse {
  user: User
  token: string
}

export interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  isLoading: boolean
  error: string | null
}
