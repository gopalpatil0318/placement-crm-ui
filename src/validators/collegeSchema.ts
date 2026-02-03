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


