import { z } from "zod";

export const userSchemaCreate = z.object({
  userName: z
    .string()
    .min(2, { message: "User name must be at least 2 characters" })
    .max(200, { message: "User name cannot exceed 200 characters" }),

  userEmail: z
    .string()
    .email({ message: "Invalid email address" }),

  userPassword: z
    .string()
    .min(8, { message: "Password must be at least 8 characters" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, {
      message:
        "Password must contain uppercase, lowercase, and numeric characters",
    }),

});

export type UserSchemaCreateType = z.infer<typeof userSchemaCreate>;