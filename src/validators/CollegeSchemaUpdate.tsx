import { z } from "zod";

export const collegeSchemaUpdate = z.object({
  college_name: z
    .string()
    .min(2, { message: "College name must be at least 2 characters" })
    .max(200, { message: "College name cannot exceed 200 characters" }),

  college_subdomain: z
    .string()
    .min(2, { message: "Subdomain must be at least 2 characters" })
    .max(50, { message: "Subdomain cannot exceed 50 characters" })
    .regex(/^[a-z0-9-]+$/, {
      message:
        "Subdomain must contain only lowercase letters, numbers, and hyphens",
    }),

  college_type: z
    .string()
    .min(1, { message: "Please select a college type" }),

  college_address: z
    .string()
    .min(2, { message: "College address must be at least 2 characters" })
    .max(500, { message: "College address cannot exceed 500 characters" }),

  college_city: z
    .string()
    .min(2, { message: "City must be at least 2 characters" })
    .max(100, { message: "City cannot exceed 100 characters" }),

  college_taluka: z
    .string()
    .min(2, { message: "Taluka must be at least 2 characters" })
    .max(100, { message: "Taluka cannot exceed 100 characters" }),

  college_district: z
    .string()
    .min(2, { message: "District must be at least 2 characters" })
    .max(100, { message: "District cannot exceed 100 characters" }),

  college_state: z
    .string()
    .min(2, { message: "State must be at least 2 characters" })
    .max(100, { message: "State cannot exceed 100 characters" }),

  college_pincode: z
    .string()
    .min(6, { message: "Pincode must be at least 6 digits" })
    .max(6, { message: "Pincode must be exactly 6 digits" })
    .regex(/^\d{6}$/, { message: "Pincode must be a valid 6-digit number" }),
});

export type CollegeSchemaUpdateType = z.infer<typeof collegeSchemaUpdate>;
