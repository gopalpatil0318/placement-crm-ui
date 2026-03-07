import { z } from "zod";

export const departmentSchema = z.object({
    deptName: z
        .string()
        .min(2, { message: "Department name must be at least 2 characters" })
        .max(200, { message: "Department name cannot exceed 200 characters" }),

    deptCode: z
        .string()
        .min(1, { message: "Department code is required" })
        .max(10, { message: "Department code cannot exceed 10 characters" }),

    deptType: z
        .string()
        .min(1, { message: "Department type is required" }),

    programDurationYears: z
        .number({ invalid_type_error: "Program duration must be a number" })
        .min(1, { message: "Program duration must be at least 1 year" })
        .max(6, { message: "Program duration cannot exceed 6 years" }),

    totalSemesters: z
        .number({ invalid_type_error: "Total semesters must be a number" })
        .min(1, { message: "Total semesters must be at least 1" })
        .max(12, { message: "Total semesters cannot exceed 12" }),
});

export type DepartmentSchemaType = z.infer<typeof departmentSchema>;
