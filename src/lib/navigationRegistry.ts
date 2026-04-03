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
}

// ─── College Admin Navigation ───────────────────────────────────────────────────

export const collegeAdminNav: NavEntry[] = [
  // Main
  { label: "Dashboard", path: "/college/dashboard", section: "Main", icon: LayoutDashboard, keywords: ["home", "overview"] },
  // Recruitment & Jobs
  { label: "All Companies", path: "/college/companies", section: "Companies", icon: Building2, keywords: ["company", "employer", "recruiter"] },
  { label: "Add Company", path: "/college/create-company", section: "Companies", icon: Building2, keywords: ["new company", "register company"] },
  { label: "All Jobs", path: "/college/jobs", section: "Job Postings", icon: BriefcaseBusiness, keywords: ["job", "posting", "vacancy", "opening"] },
  { label: "Create Job", path: "/college/create-job", section: "Job Postings", icon: BriefcaseBusiness, keywords: ["new job", "post job"] },
  { label: "Override Requests", path: "/college/overrides", section: "Job Postings", icon: BriefcaseBusiness, keywords: ["override", "exception"] },
  { label: "All Placements", path: "/college/placements", section: "Placements", icon: BriefcaseBusiness, keywords: ["placement", "offer", "placed"] },
  { label: "Placement Stats", path: "/college/placements/stats", section: "Placements", icon: BriefcaseBusiness, keywords: ["statistics", "analytics", "report"] },
  // Student Management
  { label: "All Students", path: "/college/students", section: "Students", icon: UserCheck, keywords: ["student", "list"] },
  { label: "Student Registration", path: "/college/create-student", section: "Students", icon: UserCheck, keywords: ["register", "new student", "add student"] },
  { label: "Bulk Registration", path: "/college/bulk-register", section: "Students", icon: UserCheck, keywords: ["bulk", "import", "csv", "excel"] },
  { label: "Verification Center", path: "/college/verifications", section: "Students", icon: ClipboardCheck, keywords: ["verify", "approve", "review"] },
  { label: "Student Restrictions", path: "/college/restrictions", section: "Students", icon: ShieldAlert, keywords: ["restrict", "block", "ban"] },
  // Academics & Training
  { label: "All Departments", path: "/college/departments", section: "Departments", icon: BookOpen, keywords: ["department", "branch"] },
  { label: "Create Department", path: "/college/create-department", section: "Departments", icon: BookOpen, keywords: ["new department", "add branch"] },
  { label: "Skills Master", path: "/college/skills", section: "Academics", icon: Lightbulb, keywords: ["skill", "competency"] },
  { label: "All Programs", path: "/college/training-programs", section: "Training", icon: BookOpen, keywords: ["training", "program", "course"] },
  { label: "Create Program", path: "/college/create-training-program", section: "Training", icon: BookOpen, keywords: ["new training", "add program"] },
  { label: "All Policies", path: "/college/placement-policies", section: "Policies", icon: FileText, keywords: ["policy", "rule", "guideline"] },
  // Feedback & Communications
  { label: "Placement Feedback", path: "/college/feedback", section: "Feedback", icon: MessageSquare, keywords: ["feedback", "review"] },
  { label: "Interview Questions", path: "/college/interview-questions", section: "Feedback", icon: MessageSquare, keywords: ["interview", "question"] },
  { label: "Send Notification", path: "/college/send-notification", section: "Notifications", icon: Bell, keywords: ["notify", "send", "announcement"] },
  { label: "Sent History", path: "/college/notification-history", section: "Notifications", icon: Bell, keywords: ["notification", "history", "sent"] },
  // Administration
  { label: "All Users", path: "/college/view-users", section: "Users", icon: GraduationCap, keywords: ["user", "admin", "tpo", "tpc"] },
  { label: "Create Users", path: "/college/create-user", section: "Users", icon: GraduationCap, keywords: ["new user", "add user"] },
  { label: "Change Password", path: "/college/change-password", section: "Settings", icon: Settings, keywords: ["password", "security"] },
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
