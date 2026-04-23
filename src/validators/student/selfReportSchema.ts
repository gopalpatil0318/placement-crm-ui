import { z } from "zod/v4"

// ─── Constants ──────────────────────────────────────────────────────────────────

export const PLACEMENT_TYPES = ["full-time", "internship", "both"] as const
export type PlacementType = (typeof PLACEMENT_TYPES)[number]

export const DRIVE_TYPES = ["off_campus", "pool_campus"] as const
export type DriveType = (typeof DRIVE_TYPES)[number]

export const PLACEMENT_TYPE_LABELS: Record<PlacementType, string> = {
  "full-time": "Full-Time",
  internship: "Internship",
  both: "Full-Time + Internship",
}

export const DRIVE_TYPE_LABELS: Record<DriveType, string> = {
  off_campus: "Off Campus",
  pool_campus: "Pool Campus",
}

// ─── Schema ─────────────────────────────────────────────────────────────────────

/** Matches the backend submitSelfReportSchema (Joi) */
export const submitSelfReportSchema = z
  .object({
    company_id: z.uuid().nullable().optional(),
    job_id: z.uuid().nullable().optional(),
    company_name: z
      .string()
      .min(2, "Company name must be at least 2 characters")
      .max(200, "Company name must be at most 200 characters"),
    job_title: z
      .string()
      .min(3, "Job title must be at least 3 characters")
      .max(300, "Job title must be at most 300 characters"),
    placement_type: z.enum(PLACEMENT_TYPES),
    drive_type: z.enum(DRIVE_TYPES).optional().default("off_campus"),
    fulltime_package: z.number().positive("Package must be positive").nullable().optional(),
    fulltime_designation: z.string().max(200).nullable().optional(),
    fulltime_joining_date: z.iso.date().nullable().optional(),
    internship_stipend: z.number().nonnegative("Stipend cannot be negative").nullable().optional(),
    internship_duration: z.string().max(100).nullable().optional(),
    internship_start_date: z.iso.date().nullable().optional(),
    job_location: z.string().max(300).optional().default(""),
    offer_date: z.iso.date().nullable().optional(),
    offer_letter_url: z.string().max(500).nullable().optional(),
    remarks: z.string().max(1000).nullable().optional(),
  })
  .check(
    z.refine((data) => {
      const isFulltime = data.placement_type === "full-time" || data.placement_type === "both"
      if (isFulltime && (data.fulltime_package === null || data.fulltime_package === undefined)) {
        return false
      }
      return true
    }, {
      message: "Package is required for full-time placements",
      path: ["fulltime_package"],
    }),
    z.refine((data) => {
      const isInternship = data.placement_type === "internship" || data.placement_type === "both"
      if (isInternship && (data.internship_stipend === null || data.internship_stipend === undefined)) {
        return false
      }
      return true
    }, {
      message: "Stipend is required for internship placements",
      path: ["internship_stipend"],
    }),
    z.refine((data) => {
      if (!data.offer_date) return true
      const today = new Date()
      today.setHours(23, 59, 59, 999)
      return new Date(data.offer_date) <= today
    }, {
      message: "Offer date cannot be in the future",
      path: ["offer_date"],
    }),
  )

export type SubmitSelfReportInput = z.infer<typeof submitSelfReportSchema>

// ─── Helpers ────────────────────────────────────────────────────────────────────

/** Extract field-level errors from a Zod result for display */
export function getFieldErrors(result: { success: boolean; error?: { issues: readonly { path: readonly PropertyKey[]; message: string }[] } }): Record<string, string> {
  if (result.success || !result.error) return {}
  const errors: Record<string, string> = {}
  for (const issue of result.error.issues) {
    const path = issue.path.map(String).join(".")
    if (path && !errors[path]) {
      errors[path] = issue.message
    }
  }
  return errors
}
