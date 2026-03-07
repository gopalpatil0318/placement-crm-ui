import { z } from "zod";

// ========================
// SHARED CONSTANTS
// ========================

export const DEPT_TYPES = [
    "engineering",
    "science",
    "commerce",
    "arts",
    "management",
    "pharmacy",
    "medical",
    "polytechnic",
    "other",
] as const;

export type DeptType = (typeof DEPT_TYPES)[number];

// ========================
// CREATE SCHEMA
// ========================

export const departmentCreateSchema = z.object({
    deptName: z
        .string()
        .min(2, { message: "Department name must be at least 2 characters" })
        .max(150, { message: "Department name cannot exceed 150 characters" }),

    deptCode: z
        .string()
        .max(20, { message: "Department code cannot exceed 20 characters" })
        .optional()
        .or(z.literal("")),

    deptType: z
        .enum(DEPT_TYPES, { message: "Invalid department type" })
        .optional()
        .or(z.literal("")),

    programDurationYears: z
        .number({ message: "Program duration must be a number" })
        .int({ message: "Program duration must be a whole number" })
        .min(1, { message: "Program duration must be at least 1 year" })
        .max(6, { message: "Program duration cannot exceed 6 years" })
        .default(4),

    totalSemesters: z
        .number({ message: "Total semesters must be a number" })
        .int({ message: "Total semesters must be a whole number" })
        .min(1, { message: "Total semesters must be at least 1" })
        .max(12, { message: "Total semesters cannot exceed 12" })
        .default(8),
});

export type DepartmentCreateInput = z.infer<typeof departmentCreateSchema>;

// ========================
// UPDATE SCHEMA (partial — at least 1 field required)
// ========================

export const departmentUpdateSchema = z
    .object({
        deptName: z
            .string()
            .min(2, { message: "Department name must be at least 2 characters" })
            .max(150, { message: "Department name cannot exceed 150 characters" })
            .optional()
            .or(z.literal("")),

        deptCode: z
            .string()
            .max(20, { message: "Department code cannot exceed 20 characters" })
            .optional()
            .or(z.literal("")),

        deptType: z
            .enum(DEPT_TYPES, { message: "Invalid department type" })
            .optional()
            .or(z.literal("")),

        programDurationYears: z
            .number({ message: "Program duration must be a number" })
            .int({ message: "Program duration must be a whole number" })
            .min(1, { message: "Program duration must be at least 1 year" })
            .max(6, { message: "Program duration cannot exceed 6 years" })
            .optional(),

        totalSemesters: z
            .number({ message: "Total semesters must be a number" })
            .int({ message: "Total semesters must be a whole number" })
            .min(1, { message: "Total semesters must be at least 1" })
            .max(12, { message: "Total semesters cannot exceed 12" })
            .optional(),
    });

export type DepartmentUpdateInput = z.infer<typeof departmentUpdateSchema>;

// Keep backward compat alias
export const departmentSchema = departmentCreateSchema;
export type DepartmentSchemaType = DepartmentCreateInput;
