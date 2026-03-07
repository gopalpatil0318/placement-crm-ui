import { z } from "zod";

const optionalNumber = z
    .union([z.number(), z.string()])
    .transform((val) => (val === "" ? undefined : Number(val)))
    .optional();

export const semesterGradeSchema = z
    .object({
        semester_number: z
            .union([z.number(), z.string()])
            .transform((val) => Number(val))
            .refine((val) => !isNaN(val) && val >= 1 && val <= 12, {
                message: "Semester number must be between 1 and 12",
            }),
        academic_year: z
            .string()
            .min(1, { message: "Academic year is required" })
            .regex(/^\d{4}-\d{2}$/, { message: "Academic year must be in format YYYY-YY (e.g. 2022-23)" }),
        semester_status: z.enum(["in_progress", "completed", "detained", "failed"], {
            message: "Please select a valid semester status",
        }),
        sgpa: optionalNumber,
        cgpa: optionalNumber,
        backlogs_in_semester: optionalNumber,
        backlog_subjects: z.array(z.string()).default([]),
    })
    // SGPA required only when NOT in_progress
    .refine(
        (data) => {
            if (data.semester_status !== "in_progress") {
                return data.sgpa !== undefined && !isNaN(data.sgpa) && data.sgpa >= 0 && data.sgpa <= 10;
            }
            return true;
        },
        { message: "SGPA (0-10) is required for completed semesters", path: ["sgpa"] }
    )
    // CGPA required only when NOT in_progress
    .refine(
        (data) => {
            if (data.semester_status !== "in_progress") {
                return data.cgpa !== undefined && !isNaN(data.cgpa) && data.cgpa >= 0 && data.cgpa <= 10;
            }
            return true;
        },
        { message: "CGPA (0-10) is required for completed semesters", path: ["cgpa"] }
    )
    // Backlog subjects must match count
    .refine(
        (data) => {
            const count = data.backlogs_in_semester ?? 0;
            if (count > 0) {
                return data.backlog_subjects.length === count;
            }
            return true;
        },
        {
            message: "Number of backlog subjects must match the backlog count",
            path: ["backlog_subjects"],
        }
    );

export type SemesterGradeSchemaType = z.infer<typeof semesterGradeSchema>;
