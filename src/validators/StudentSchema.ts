import { z } from "zod";

export const studentSchema = z.object({
    first_name: z.string().min(2, "First name must be at least 2 characters"),
    middle_name: z.string().optional(),
    last_name: z.string().min(1, "Last name is required"),
    student_email: z.string().email("Invalid email address"),
    student_password: z
        .string()
        .min(8, "Password must be at least 8 characters"),
    dept_name: z.string().min(1, "Department is required"),
    student_passout_year: z.number().min(2000, "Passout year must be 2000 or later"),
    current_year: z.number().min(1, "Current year is required").max(6, "Current year cannot exceed 6"),
});