import { z } from "zod";

const ALLOWED_ROLES = ["tpo", "tpc", "hod", "teacher"] as const;

export const userSchemaCreate = z.object({
  userName: z
    .string()
    .min(2, { message: "User name must be at least 2 characters" })
    .max(100, { message: "User name cannot exceed 100 characters" }),

  userEmail: z
    .string()
    .email({ message: "Invalid email address" }),

  userPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .max(128, { message: "Password cannot exceed 128 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message: "Password must contain uppercase, lowercase, and numeric characters",
    }),

  userRole: z
    .enum(ALLOWED_ROLES, { message: "Role must be one of: TPO, TPC, HOD, Teacher" }),

  deptId: z
    .string()
    .uuid({ message: "Invalid department ID" })
    .nullable()
    .optional(),
});

export type UserSchemaCreateType = z.infer<typeof userSchemaCreate>;