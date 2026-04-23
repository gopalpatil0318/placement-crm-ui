import type { ComponentType } from "react"
import {
  LayoutDashboard,
  Building2,
  BriefcaseBusiness,
  Briefcase,
  FileText,
  UserCheck,
  ClipboardCheck,
  BookOpen,
  Lightbulb,
  MessageSquare,
  Bell,
  GraduationCap,
  Settings,
  ShieldAlert,
  ShieldCheck,
  Shield,
  Trophy,
  User as UserIcon,
  Pencil,
  HelpCircle,
} from "lucide-react"

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface NavEntry {
  label: string
  path: string
  section: string
  icon: ComponentType<{ size?: number; className?: string }>
  keywords: string[]
  /** Permission key(s) required. Omit for always-visible pages. */
  requiredPermission?: string | string[]
}

// ─── College Admin Navigation ───────────────────────────────────────────────────

export const collegeAdminNav: NavEntry[] = [
  // Main
  { label: "Dashboard", path: "/college/dashboard", section: "Main", icon: LayoutDashboard, keywords: ["home", "overview"], requiredPermission: "dashboard.view" },
  // Recruitment & Jobs
  { label: "All Companies", path: "/college/companies", section: "Companies", icon: Building2, keywords: ["company", "employer", "recruiter"], requiredPermission: "companies.view" },
  { label: "Add Company", path: "/college/create-company", section: "Companies", icon: Building2, keywords: ["new company", "register company"], requiredPermission: "companies.create" },
  { label: "All Jobs", path: "/college/jobs", section: "Job Postings", icon: BriefcaseBusiness, keywords: ["job", "posting", "vacancy", "opening"], requiredPermission: "jobs.view" },
  { label: "Create Job", path: "/college/create-job", section: "Job Postings", icon: BriefcaseBusiness, keywords: ["new job", "post job"], requiredPermission: "jobs.create" },
  { label: "Override Requests", path: "/college/overrides", section: "Job Postings", icon: BriefcaseBusiness, keywords: ["override", "exception"], requiredPermission: "overrides.view" },
  { label: "All Placements", path: "/college/placements", section: "Placements", icon: BriefcaseBusiness, keywords: ["placement", "offer", "placed"], requiredPermission: "placements.view" },
  { label: "Placement Stats", path: "/college/placements/stats", section: "Placements", icon: BriefcaseBusiness, keywords: ["statistics", "analytics", "report"], requiredPermission: "placements.view" },
  // Student Management
  { label: "All Students", path: "/college/students", section: "Students", icon: UserCheck, keywords: ["student", "list"], requiredPermission: "students.view" },
  { label: "Student Registration", path: "/college/create-student", section: "Students", icon: UserCheck, keywords: ["register", "new student", "add student"], requiredPermission: "students.create" },
  { label: "Bulk Registration", path: "/college/bulk-register", section: "Students", icon: UserCheck, keywords: ["bulk", "import", "csv", "excel"], requiredPermission: "students.create" },
  { label: "Verification Center", path: "/college/verifications", section: "Students", icon: ClipboardCheck, keywords: ["verify", "approve", "review"], requiredPermission: "verification.view" },
  { label: "Student Restrictions", path: "/college/restrictions", section: "Students", icon: ShieldAlert, keywords: ["restrict", "block", "ban"], requiredPermission: "restrictions.view" },
  // Academics & Training
  { label: "All Departments", path: "/college/departments", section: "Departments", icon: BookOpen, keywords: ["department", "branch"], requiredPermission: "departments.view" },
  { label: "Create Department", path: "/college/create-department", section: "Departments", icon: BookOpen, keywords: ["new department", "add branch"], requiredPermission: "departments.manage" },
  { label: "Skills Master", path: "/college/skills", section: "Academics", icon: Lightbulb, keywords: ["skill", "competency"], requiredPermission: "skills.view" },
  { label: "All Programs", path: "/college/training-programs", section: "Training", icon: BookOpen, keywords: ["training", "program", "course"], requiredPermission: "training.view" },
  { label: "Create Program", path: "/college/create-training-program", section: "Training", icon: BookOpen, keywords: ["new training", "add program"], requiredPermission: "training.manage" },
  { label: "All Policies", path: "/college/placement-policies", section: "Policies", icon: FileText, keywords: ["policy", "rule", "guideline"], requiredPermission: "policies.view" },
  // Feedback & Communications
  { label: "Placement Feedback", path: "/college/feedback", section: "Feedback", icon: MessageSquare, keywords: ["feedback", "review"], requiredPermission: "feedback.view" },
  { label: "Interview Questions", path: "/college/interview-questions", section: "Feedback", icon: MessageSquare, keywords: ["interview", "question"], requiredPermission: "feedback.view" },
  { label: "Send Notification", path: "/college/send-notification", section: "Notifications", icon: Bell, keywords: ["notify", "send", "announcement"], requiredPermission: "notifications.send" },
  { label: "Sent History", path: "/college/notification-history", section: "Notifications", icon: Bell, keywords: ["notification", "history", "sent"], requiredPermission: "notifications.view" },
  // Administration
  { label: "All Users", path: "/college/view-users", section: "Users", icon: GraduationCap, keywords: ["user", "admin", "tpo", "tpc"], requiredPermission: "users.view" },
  { label: "Create Users", path: "/college/create-user", section: "Users", icon: GraduationCap, keywords: ["new user", "add user"], requiredPermission: "users.manage" },
  { label: "Permission Manager", path: "/college/permissions", section: "Administration", icon: Shield, keywords: ["permissions", "roles", "access", "matrix", "toggle"] },
  { label: "My Profile", path: "/college/my-profile", section: "Profile", icon: UserIcon, keywords: ["profile", "account", "me", "settings"] },
  { label: "Change Password", path: "/college/change-password", section: "Settings", icon: Settings, keywords: ["password", "security"] },
  { label: "Company Tiers", path: "/college/company-tiers", section: "Settings", icon: Settings, keywords: ["tier", "salary", "drive", "classification", "dream"], requiredPermission: "settings.manage" },
  { label: "Placement Settings", path: "/college/placement-settings", section: "Settings", icon: Settings, keywords: ["settings", "placement", "rules", "policy", "offers"], requiredPermission: "settings.manage" },
  { label: "Verification Settings", path: "/college/verification-settings", section: "Settings", icon: Settings, keywords: ["verification", "settings", "approve", "document"], requiredPermission: "settings.manage" },
  { label: "Self-Report Review", path: "/college/self-reports", section: "Placements", icon: BriefcaseBusiness, keywords: ["self-report", "review", "off-campus", "self"], requiredPermission: "self_reports.view" },
  { label: "Audit Trail", path: "/college/audit-logs", section: "Administration", icon: Shield, keywords: ["audit", "log", "trail", "history", "activity"] },
]

// ─── Student Navigation ─────────────────────────────────────────────────────────

export const studentNav: NavEntry[] = [
  { label: "Dashboard", path: "/student/dashboard", section: "Main", icon: LayoutDashboard, keywords: ["home", "overview"] },
  { label: "Notifications", path: "/student/notifications", section: "Main", icon: Bell, keywords: ["notification", "alert", "message"] },
  { label: "Browse Jobs", path: "/student/jobs", section: "Placements", icon: Briefcase, keywords: ["job", "vacancy", "opening", "apply"] },
  { label: "My Applications", path: "/student/applications", section: "Placements", icon: FileText, keywords: ["application", "applied", "status"] },
  { label: "My Placements", path: "/student/placements", section: "Placements", icon: Trophy, keywords: ["placed", "offer", "accepted"] },
  { label: "My Restrictions", path: "/student/restrictions", section: "Placements", icon: ShieldAlert, keywords: ["restriction", "blocked"] },
  { label: "Override Requests", path: "/student/overrides", section: "Placements", icon: ShieldCheck, keywords: ["override", "exception", "request"] },
  { label: "Training Programs", path: "/student/trainings", section: "Training", icon: GraduationCap, keywords: ["training", "course", "program"] },
  { label: "Feedback", path: "/student/feedback", section: "Community", icon: MessageSquare, keywords: ["feedback", "review"] },
  { label: "Interview Questions", path: "/student/interview-questions", section: "Community", icon: HelpCircle, keywords: ["interview", "question", "preparation"] },
  { label: "View Profile", path: "/student/profile", section: "Profile", icon: UserIcon, keywords: ["profile", "my info", "details"] },
  { label: "Update Profile", path: "/student/update-profile", section: "Profile", icon: Pencil, keywords: ["edit profile", "update info"] },
  { label: "Change Password", path: "/student/change-password", section: "Settings", icon: Settings, keywords: ["password", "security"] },
]

// ─── SysAdmin Navigation ────────────────────────────────────────────────────────

export const sysadminNav: NavEntry[] = [
  { label: "Dashboard", path: "/sysadmin/dashboard", section: "Main", icon: LayoutDashboard, keywords: ["home", "overview"] },
  { label: "All Colleges", path: "/sysadmin/colleges", section: "Colleges", icon: Building2, keywords: ["college", "institution", "list"] },
  { label: "Register College", path: "/sysadmin/colleges/create", section: "Colleges", icon: Building2, keywords: ["new college", "add college", "register"] },
  { label: "Change Password", path: "/sysadmin/change-password", section: "Settings", icon: Settings, keywords: ["password", "security"] },
]
