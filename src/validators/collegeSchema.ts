import { z } from "zod";

export const collegeSchema = z.object({
  collegeName: z
    .string()
    .min(2, { message: "College name must be at least 2 characters" })
    .max(200, { message: "College name cannot exceed 200 characters" }),

  collegeSubdomain: z
    .string()
    .min(2, { message: "Subdomain must be at least 2 characters" })
    .max(50, { message: "Subdomain cannot exceed 50 characters" })
    .regex(/^[a-z0-9-]+$/, {
      message:
        "Subdomain must contain only lowercase letters, numbers, and hyphens",
    }),

  collegeType: z
    .string()
    .min(1, { message: "Please select a college type" }),

  collegeAddress: z
    .string()
    .max(500, { message: "College address cannot exceed 500 characters" })
    .optional()
    .or(z.literal("")),

  collegeCity: z
    .string()
    .max(100, { message: "City cannot exceed 100 characters" })
    .optional()
    .or(z.literal("")),

  collegeTaluka: z
    .string()
    .max(100, { message: "Taluka cannot exceed 100 characters" })
    .optional()
    .or(z.literal("")),

  collegeDistrict: z
    .string()
    .max(100, { message: "District cannot exceed 100 characters" })
    .optional()
    .or(z.literal("")),

  collegeState: z
    .string()
    .max(100, { message: "State cannot exceed 100 characters" })
    .optional()
    .or(z.literal("")),

  collegePincode: z
    .string()
    .regex(/^(\d{6})?$/, { message: "Pincode must be a valid 6-digit number" })
    .optional()
    .or(z.literal("")),

  defaultAcademicYear: z
    .string()
    .min(1, { message: "Please select a default academic year" }),

  adminName: z
    .string()
    .min(2, { message: "Admin name must be at least 2 characters" })
    .max(100, { message: "Admin name cannot exceed 100 characters" }),

  adminEmail: z
    .string()
    .email({ message: "Invalid email format" }),

  adminPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message:
        "Password must contain uppercase, lowercase, and numeric characters",
    }),
});

export type CollegeSchemaType = z.infer<typeof collegeSchema>;
