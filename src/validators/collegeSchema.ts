// src/validators/collegeSchema.ts
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
    .min(2, { message: "College address must be at least 2 characters" })
    .max(500, { message: "College address cannot exceed 500 characters" }),

  collegeCity: z
    .string()
    .min(2, { message: "City must be at least 2 characters" })
    .max(100, { message: "City cannot exceed 100 characters" }),

  collegeTaluka: z
    .string()
    .min(2, { message: "Taluka must be at least 2 characters" })
    .max(100, { message: "Taluka cannot exceed 100 characters" }),

  collegeDistrict: z
    .string()
    .min(2, { message: "District must be at least 2 characters" })
    .max(100, { message: "District cannot exceed 100 characters" }),

  collegeState: z
    .string()
    .min(2, { message: "State must be at least 2 characters" })
    .max(100, { message: "State cannot exceed 100 characters" }),

  collegePincode: z
    .string()
    .min(6, { message: "Pincode must be at least 6 digits" })
    .max(6, { message: "Pincode must be exactly 6 digits" })
    .regex(/^\d{6}$/, { message: "Pincode must be a valid 6-digit number" }),

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


