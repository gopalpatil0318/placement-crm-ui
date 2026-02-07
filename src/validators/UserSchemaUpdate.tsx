import { z } from "zod";

export const userSchemaUpdate = z.object({
  userName: z
    .string()
    .min(2, { message: "User name must be at least 2 characters" })
    .max(200, { message: "User name cannot exceed 200 characters" }),

  userEmail: z
    
    .string()
    .email({ message: 'Invalid email address' }),
    // .email({ message: "Invalid email format" }),

  
});

export type UserSchemaUpdateType = z.infer<typeof userSchemaUpdate>;