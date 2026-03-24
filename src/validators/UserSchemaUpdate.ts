import { z } from "zod";

const ALLOWED_ROLES = ["tpo", "tpc", "hod", "teacher"] as const;

export const userSchemaUpdate = z.object({
  userName: z
    .string()
    .min(2, { message: "User name must be at least 2 characters" })
    .max(100, { message: "User name cannot exceed 100 characters" })
    .optional(),

  userEmail: z
    .string()
    .email({ message: "Invalid email address" })
    .optional(),

  userRole: z
    .enum(ALLOWED_ROLES, { message: "Role must be one of: TPO, TPC, HOD, Teacher" })
    .optional(),

  deptId: z
    .string()
    .uuid({ message: "Invalid department ID" })
    .nullable()
    .optional(),
}).refine(
  (data) => Object.values(data).some((v) => v !== undefined),
  { message: "At least one field must be provided for update" }
);

export type UserSchemaUpdateType = z.infer<typeof userSchemaUpdate>;