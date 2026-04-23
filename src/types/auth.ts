export type UserRole = "sysadmin" | "collegeadmin" | "teacher" | "hod" | "tpo" | "tpc" | "student"

export const COLLEGE_ROLES: UserRole[] = ["collegeadmin", "teacher", "hod", "tpo", "tpc"]

export interface Department {
  dept_id: string
  dept_name: string
  dept_code: string | null
}

export type SubscriptionStatus = "none" | "trial" | "active" | "expired" | "suspended"

export type ConfigurableRole = "tpo" | "tpc" | "hod" | "teacher"

export const CONFIGURABLE_ROLES: ConfigurableRole[] = ["tpo", "tpc", "hod", "teacher"]

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
  defaultAcademicYear?: number
  collegeType?: string
  subscriptionStatus?: SubscriptionStatus
  departments?: Department[]
  // Dynamic permissions (populated for configurable roles: tpo/tpc/hod/teacher)
  permissions?: string[] | null
  deptScoped?: boolean
  deptIds?: string[]
  // Student-specific fields (populated only when role === "student")
  firstName?: string
  middleName?: string
  lastName?: string
  deptName?: string
  profileComplete?: boolean
  profileIsApproved?: boolean
  passoutYear?: number
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
      default_academic_year: number | null
      college_type: string | null
      subscription_status: string | null
      departments: Department[]
      permissions: string[] | null
      dept_scoped: boolean
      dept_ids: string[]
    }
  }
}

export interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<User | void>
  logout: () => Promise<void>
}

export type SysAdminAuthContextType = AuthContextType

export interface CollegeAuthContextType extends Omit<AuthContextType, 'login'> {
  login: (email: string, password: string) => Promise<User>
  refreshPermissions: () => Promise<void>
}

export interface YearFilterContextType {
  selectedYear: number
  setSelectedYear: (year: number) => void
  yearOptions: number[]
  isDefaultYear: boolean
  defaultYear: number
}

export interface StudentAuthContextType {
  user: User | null
  isAuthenticated: boolean
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  logout: () => Promise<void>
  refreshUser: () => Promise<void>
}