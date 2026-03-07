export type UserRole = "sysadmin" | "collegeadmin" | "teacher" | "hod" | "tpo" | "tpc" | "student"

export const COLLEGE_ROLES: UserRole[] = ["collegeadmin", "teacher", "hod", "tpo", "tpc"]

export interface User {
  id: string
  email: string
  role: UserRole
  name?: string
  type?: string
  isActive?: boolean
  collegeId?: string
  collegeName?: string
  deptId?: string | null
  // Student-specific fields (populated only when role === "student")
  firstName?: string
  middleName?: string
  lastName?: string
  deptName?: string
  profileComplete?: boolean
  profileIsApproved?: boolean
  passoutYear?: number
  currentYear?: number
  studentStatus?: string
}

export interface ApiLoginResponse {
  success: boolean
  message: string
  data: {
    user: {
      user_id: string
      user_name: string
      user_email: string
      user_role: string
      college_id: string
      college_name: string
      dept_id: string | null
    }
  }
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}

export type SysAdminAuthContextType = AuthContextType

export type CollegeAuthContextType = AuthContextType

export interface StudentAuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
}