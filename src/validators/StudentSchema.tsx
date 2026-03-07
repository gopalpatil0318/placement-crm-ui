import { z } from "zod";

export const studentSchema = z.object({
    first_name: z.string().min(2, "First name is required"),
    middle_name: z.string().optional(),
    last_name: z.string().min(2, "Last name is required"),
    student_email: z.string().email("Invalid email address"),
    student_password: z
        .string()
        .min(8, "Password must be at least 8 characters"),
    dept_name: z.string().min(1, "Department is required"),
    student_passout_year: z.number().min(2000),
    current_year: z.number().min(1).max(4),
});