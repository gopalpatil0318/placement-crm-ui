/**
 * Centralized query key factory for React Query cache management.
 *
 * Hierarchical keys enable precise cache invalidation:
 *   queryClient.invalidateQueries({ queryKey: queryKeys.companies.all() })
 *     → invalidates ALL company list queries (any filter combination)
 *   queryClient.invalidateQueries({ queryKey: queryKeys.companies.detail("abc") })
 *     → invalidates only company "abc" detail
 *
 * Usage in hooks:
 *   useQuery({ queryKey: queryKeys.companies.all({ search, status, page }), queryFn: ... })
 *   useMutation({ onSuccess: () => queryClient.invalidateQueries({ queryKey: ["companies"] }) })
 */
export const queryKeys = {
  // ─── Companies ──────────────────────────────────────────────────────────────
  companies: {
    all: (filters?: Record<string, unknown>) =>
      filters ? (["companies", "list", filters] as const) : (["companies", "list"] as const),
    detail: (id: string) => ["companies", "detail", id] as const,
    contacts: (companyId: string, filters?: Record<string, unknown>) =>
      filters
        ? (["companies", companyId, "contacts", filters] as const)
        : (["companies", companyId, "contacts"] as const),
  },

  // ─── Jobs ───────────────────────────────────────────────────────────────────
  jobs: {
    all: (filters?: Record<string, unknown>) =>
      filters ? (["jobs", "list", filters] as const) : (["jobs", "list"] as const),
    detail: (id: string) => ["jobs", "detail", id] as const,
    positions: (jobId: string) => ["jobs", jobId, "positions"] as const,
    rounds: (jobId: string) => ["jobs", jobId, "rounds"] as const,
    criteria: (jobId: string) => ["jobs", jobId, "criteria"] as const,
    questions: (jobId: string) => ["jobs", jobId, "questions"] as const,
    applications: (jobId: string, filters?: Record<string, unknown>) =>
      filters
        ? (["jobs", jobId, "applications", filters] as const)
        : (["jobs", jobId, "applications"] as const),
    application: (applicationId: string) =>
      ["jobs", "application", applicationId] as const,
    eligibleNotApplied: (jobId: string, filters?: Record<string, unknown>) =>
      filters
        ? (["jobs", jobId, "eligibleNotApplied", filters] as const)
        : (["jobs", jobId, "eligibleNotApplied"] as const),
    denials: (jobId: string, filters?: Record<string, unknown>) =>
      filters
        ? (["jobs", jobId, "denials", filters] as const)
        : (["jobs", jobId, "denials"] as const),
    overrides: (jobId: string, filters?: Record<string, unknown>) =>
      filters
        ? (["jobs", jobId, "overrides", filters] as const)
        : (["jobs", jobId, "overrides"] as const),
    roundResults: (roundId: string, filters?: Record<string, unknown>) =>
      filters
        ? (["jobs", "round", roundId, "results", filters] as const)
        : (["jobs", "round", roundId, "results"] as const),
    roundProcessing: (roundId: string) =>
      ["jobs", "round", roundId, "processing"] as const,
  },

  // ─── Overrides (Dashboard) ─────────────────────────────────────────────────
  overrides: {
    all: (filters?: Record<string, unknown>) =>
      filters
        ? (["overrides", "list", filters] as const)
        : (["overrides", "list"] as const),
  },

  // ─── Placements ─────────────────────────────────────────────────────────────
  placements: {
    all: (filters?: Record<string, unknown>) =>
      filters
        ? (["placements", "list", filters] as const)
        : (["placements", "list"] as const),
    detail: (id: string) => ["placements", "detail", id] as const,
    policies: (filters?: Record<string, unknown>) =>
      filters
        ? (["placements", "policies", filters] as const)
        : (["placements", "policies"] as const),
  },

  // ─── Departments ────────────────────────────────────────────────────────────
  departments: {
    all: (filters?: Record<string, unknown>) =>
      filters
        ? (["departments", "list", filters] as const)
        : (["departments", "list"] as const),
    detail: (id: string, year?: number) =>
      year
        ? (["departments", "detail", id, year] as const)
        : (["departments", "detail", id] as const),
  },

  // ─── Users ──────────────────────────────────────────────────────────────────
  users: {
    all: (filters?: Record<string, unknown>) =>
      filters ? (["users", "list", filters] as const) : (["users", "list"] as const),
    detail: (id: string) => ["users", "detail", id] as const,
  },

  // ─── Students ───────────────────────────────────────────────────────────────
  students: {
    all: (filters?: Record<string, unknown>) =>
      filters
        ? (["students", "list", filters] as const)
        : (["students", "list"] as const),
    detail: (id: string) => ["students", "detail", id] as const,
    departments: (year?: number) =>
      year
        ? (["students", "departments", year] as const)
        : (["students", "departments"] as const),
    eligible: (jobId: string, filters?: Record<string, unknown>) =>
      filters
        ? (["students", "eligible", jobId, filters] as const)
        : (["students", "eligible", jobId] as const),
  },

  // ─── Dashboard ──────────────────────────────────────────────────────────────
  dashboard: {
    root: () => ["dashboard"] as const,
    overview: (passoutYear: number) =>
      ["dashboard", "overview", passoutYear] as const,
    placement: (passoutYear: number) =>
      ["dashboard", "placement", passoutYear] as const,
    funnel: (passoutYear: number) =>
      ["dashboard", "funnel", passoutYear] as const,
    students: (passoutYear: number) =>
      ["dashboard", "students", passoutYear] as const,
    diversity: (passoutYear: number) =>
      ["dashboard", "diversity", passoutYear] as const,
    training: (passoutYear: number) =>
      ["dashboard", "training", passoutYear] as const,
    departments: (passoutYear: number) =>
      ["dashboard", "departments", passoutYear] as const,
    companies: (passoutYear: number) =>
      ["dashboard", "companies", passoutYear] as const,
    yearComparison: (years: number[]) =>
      ["dashboard", "yearComparison", ...years] as const,
  },

  // ─── Skills ──────────────────────────────────────────────────────────────────
  skills: {
    all: (filters?: Record<string, unknown>) =>
      filters
        ? (["skills", "list", filters] as const)
        : (["skills", "list"] as const),
  },

  // ─── Verifications ──────────────────────────────────────────────────────────
  verifications: {
    settings: () => ["verifications", "settings"] as const,
    counts: (year?: number) =>
      year
        ? (["verifications", "counts", year] as const)
        : (["verifications", "counts"] as const),
    profiles: (filters?: Record<string, unknown>) =>
      filters
        ? (["verifications", "profiles", filters] as const)
        : (["verifications", "profiles"] as const),
    experiences: (filters?: Record<string, unknown>) =>
      filters
        ? (["verifications", "experiences", filters] as const)
        : (["verifications", "experiences"] as const),
    achievements: (filters?: Record<string, unknown>) =>
      filters
        ? (["verifications", "achievements", filters] as const)
        : (["verifications", "achievements"] as const),
    certificates: (filters?: Record<string, unknown>) =>
      filters
        ? (["verifications", "certificates", filters] as const)
        : (["verifications", "certificates"] as const),
    studentReview: (studentId: string) =>
      ["verifications", "student", studentId] as const,
  },

  // ─── Colleges (SysAdmin) ────────────────────────────────────────────────────
  colleges: {
    all: (filters?: Record<string, unknown>) =>
      filters
        ? (["colleges", "list", filters] as const)
        : (["colleges", "list"] as const),
    detail: (id: string) => ["colleges", "detail", id] as const,
  },

  // ─── Student Portal ────────────────────────────────────────────────────────
  studentPortal: {
    fullProfile: () => ["studentPortal", "fullProfile"] as const,
    profileCompletion: () => ["studentPortal", "profileCompletion"] as const,
    personalInfo: () => ["studentPortal", "personalInfo"] as const,
    academicInfo: () => ["studentPortal", "academicInfo"] as const,
    semesterGrades: () => ["studentPortal", "semesterGrades"] as const,
    skillsCatalog: () => ["studentPortal", "skillsCatalog"] as const,
    mySkills: () => ["studentPortal", "mySkills"] as const,
    experience: () => ["studentPortal", "experience"] as const,
    projects: () => ["studentPortal", "projects"] as const,
    certificates: () => ["studentPortal", "certificates"] as const,
    achievements: () => ["studentPortal", "achievements"] as const,
    activities: () => ["studentPortal", "activities"] as const,
    profileLinks: () => ["studentPortal", "profileLinks"] as const,
    availableJobs: (filters?: Record<string, unknown>) =>
      filters
        ? (["studentPortal", "jobs", filters] as const)
        : (["studentPortal", "jobs"] as const),
    myApplications: (filters?: Record<string, unknown>) =>
      filters
        ? (["studentPortal", "applications", filters] as const)
        : (["studentPortal", "applications"] as const),
    applicationDetail: (id: string) =>
      ["studentPortal", "application", id] as const,
    jobDetail: (id: string) => ["studentPortal", "job", id] as const,
    eligibility: (jobId: string) =>
      ["studentPortal", "eligibility", jobId] as const,
    myPlacements: (filters?: Record<string, unknown>) =>
      filters
        ? (["studentPortal", "placements", filters] as const)
        : (["studentPortal", "placements"] as const),
    availableTrainings: (filters?: Record<string, unknown>) =>
      filters
        ? (["studentPortal", "availableTrainings", filters] as const)
        : (["studentPortal", "availableTrainings"] as const),
    myEnrollments: (filters?: Record<string, unknown>) =>
      filters
        ? (["studentPortal", "myEnrollments", filters] as const)
        : (["studentPortal", "myEnrollments"] as const),
    myRestrictions: (filters?: Record<string, unknown>) =>
      filters
        ? (["studentPortal", "myRestrictions", filters] as const)
        : (["studentPortal", "myRestrictions"] as const),
    overrideEligibility: (jobId: string) =>
      ["studentPortal", "overrideEligibility", jobId] as const,
    myOverrides: (filters?: Record<string, unknown>) =>
      filters
        ? (["studentPortal", "myOverrides", filters] as const)
        : (["studentPortal", "myOverrides"] as const),
    myFeedback: (filters?: Record<string, unknown>) =>
      filters
        ? (["studentPortal", "myFeedback", filters] as const)
        : (["studentPortal", "myFeedback"] as const),
    browseQuestions: (filters?: Record<string, unknown>) =>
      filters
        ? (["studentPortal", "browseQuestions", filters] as const)
        : (["studentPortal", "browseQuestions"] as const),
    appliedJobOptions: () => ["studentPortal", "appliedJobOptions"] as const,
    questionCompanies: () => ["studentPortal", "questionCompanies"] as const,
    mySessionSchedule: (programId: string) =>
      ["studentPortal", "sessionSchedule", programId] as const,
  },

  // ─── Training Programs ──────────────────────────────────────────────────────
  trainingPrograms: {
    all: (filters?: Record<string, unknown>) =>
      filters
        ? (["trainingPrograms", "list", filters] as const)
        : (["trainingPrograms", "list"] as const),
    detail: (id: string) => ["trainingPrograms", "detail", id] as const,
    enrollments: (programId: string, filters?: Record<string, unknown>) =>
      filters
        ? (["trainingPrograms", programId, "enrollments", filters] as const)
        : (["trainingPrograms", programId, "enrollments"] as const),
    sessions: (programId: string) =>
      ["trainingPrograms", programId, "sessions"] as const,
    sessionAttendance: (sessionId: string) =>
      ["trainingPrograms", "sessionAttendance", sessionId] as const,
    studentReport: (studentId: string) =>
      ["trainingPrograms", "studentReport", studentId] as const,
  },

  // ─── Feedback ───────────────────────────────────────────────────────────────
  feedback: {
    all: (filters?: Record<string, unknown>) =>
      filters
        ? (["feedback", "list", filters] as const)
        : (["feedback", "list"] as const),
  },

  // ─── Interview Questions ────────────────────────────────────────────────────
  interviewQuestions: {
    all: (filters?: Record<string, unknown>) =>
      filters
        ? (["interviewQuestions", "list", filters] as const)
        : (["interviewQuestions", "list"] as const),
  },

  // ─── Notifications ──────────────────────────────────────────────────────────
  notifications: {
    sent: (filters?: Record<string, unknown>) =>
      filters
        ? (["notifications", "sent", filters] as const)
        : (["notifications", "sent"] as const),
    studentList: (filters?: Record<string, unknown>) =>
      filters
        ? (["notifications", "student", "list", filters] as const)
        : (["notifications", "student", "list"] as const),
    studentUnreadCount: () =>
      ["notifications", "student", "unreadCount"] as const,
  },

  // ─── Student Restrictions (College Admin) ───────────────────────────────────
  restrictions: {
    all: (filters?: Record<string, unknown>) =>
      filters
        ? (["restrictions", "list", filters] as const)
        : (["restrictions", "list"] as const),
    student: (studentId: string, filters?: Record<string, unknown>) =>
      filters
        ? (["restrictions", "student", studentId, filters] as const)
        : (["restrictions", "student", studentId] as const),
  },

  // ─── Audit Logs (College Admin) ─────────────────────────────────────────────
  auditLogs: {
    all: (filters?: Record<string, unknown>) =>
      filters
        ? (["auditLogs", "list", filters] as const)
        : (["auditLogs", "list"] as const),
    detail: (id: string) => ["auditLogs", "detail", id] as const,
  },

  // ─── Company Tiers (College Admin) ──────────────────────────────────────────
  companyTiers: {
    all: (filters?: Record<string, unknown>) =>
      filters
        ? (["companyTiers", "list", filters] as const)
        : (["companyTiers", "list"] as const),
    detail: (id: string) => ["companyTiers", "detail", id] as const,
  },

  // ─── Placement Settings (College Admin) ─────────────────────────────────────
  placementSettings: {
    byYear: (passoutYear: number) =>
      ["placementSettings", "year", passoutYear] as const,
  },
} as const
