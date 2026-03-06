import { z } from "zod";

export const collegeSchemaUpdate = z.object({
  college_name: z
    .string()
    .min(2, { message: "College name must be at least 2 characters" })
    .max(200, { message: "College name cannot exceed 200 characters" })
    .optional(),

  college_subdomain: z
    .string()
    .min(2, { message: "Subdomain must be at least 2 characters" })
    .max(50, { message: "Subdomain cannot exceed 50 characters" })
    .regex(/^[a-z0-9-]+$/, {
      message: "Subdomain must contain only lowercase letters, numbers, and hyphens",
    })
    .optional(),

  college_type: z
    .string()
    .min(1, { message: "Please select a college type" })
    .optional(),

  college_address: z
    .string()
    .max(500, { message: "College address cannot exceed 500 characters" })
    .optional()
    .or(z.literal("")),

  college_city: z
    .string()
    .max(100, { message: "City cannot exceed 100 characters" })
    .optional()
    .or(z.literal("")),

  college_taluka: z
    .string()
    .max(100, { message: "Taluka cannot exceed 100 characters" })
    .optional()
    .or(z.literal("")),

  college_district: z
    .string()
    .max(100, { message: "District cannot exceed 100 characters" })
    .optional()
    .or(z.literal("")),

  college_state: z
    .string()
    .max(100, { message: "State cannot exceed 100 characters" })
    .optional()
    .or(z.literal("")),

  college_pincode: z
    .string()
    .regex(/^(\d{6})?$/, { message: "Pincode must be exactly 6 digits" })
    .optional()
    .or(z.literal("")),
});

export type CollegeSchemaUpdateType = z.infer<typeof collegeSchemaUpdate>;
