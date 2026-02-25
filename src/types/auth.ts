export type UserRole = "sysadmin" | "collegeadmin" | "teacher" | "hod" | "tpo" | "tpc" | "student"

// All college portal roles — used for route protection and role checks
export const COLLEGE_ROLES: UserRole[] = ["collegeadmin", "teacher", "hod", "tpo", "tpc"]

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
    user?: {
      user_id?: string
      user_name?: string
      user_email?: string
      user_role?: string
      college_id?: string
      college_name?: string
      dept_id?: string | null
    }
    // Fallback fields for sysadmin or other response formats
    id?: string
    role?: string
    email?: string
    type?: string
  }
}

// SysAdmin context type
export interface SysAdminAuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

// College context type
export interface CollegeAuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}
