import { z } from "zod";

const yearRange = z
    .union([z.number(), z.string()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 2000 && val <= 2100, {
        message: "Year must be between 2000 and 2100",
    });

const percentage = z
    .union([z.number(), z.string()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0 && val <= 100, {
        message: "Percentage must be between 0 and 100",
    });

const cgpa = z
    .union([z.number(), z.string()])
    .transform((val) => Number(val))
    .refine((val) => !isNaN(val) && val >= 0 && val <= 10, {
        message: "CGPA must be between 0 and 10",
    });

export const academicInfoSchema = z
    .object({
        roll_number: z.string().max(50, "Max 50 characters").optional().or(z.literal("")),
        enrollment_number: z.string().max(50, "Max 50 characters").optional().or(z.literal("")),
        admission_year: yearRange,
        admission_based_on: z.enum(["JEE", "MHT-CET", "GATE", "Direct", "Management", "CAT", "Other"], {
            message: "Please select a valid admission type",
        }),

        // 10th Details
        tenth_percentage: percentage,
        tenth_board: z.string().min(1, "Board is required").max(100),
        tenth_passing_year: yearRange,

        // 12th or Diploma toggle
        twelfth_or_diploma: z.enum(["12th", "Diploma"], {
            message: "Please select 12th or Diploma",
        }),

        // 12th fields (conditional)
        twelfth_percentage: z.union([z.number(), z.string()]).optional().or(z.literal("")),
        twelfth_board: z.string().max(100).optional().or(z.literal("")),

        // Diploma fields (conditional)
        diploma_percentage: z.union([z.number(), z.string()]).optional().or(z.literal("")),
        diploma_branch: z.string().max(100).optional().or(z.literal("")),

        higher_education_passing_year: yearRange,

        // Current Performance
        overall_cgpa: cgpa,
        total_live_kts: z
            .union([z.number(), z.string()])
            .transform((val) => Number(val))
            .refine((val) => !isNaN(val) && val >= 0, { message: "Must be 0 or more" }),
        total_dead_kts: z
            .union([z.number(), z.string()])
            .transform((val) => Number(val))
            .refine((val) => !isNaN(val) && val >= 0, { message: "Must be 0 or more" }),

        // Education Gap
        any_gap_during_education: z.boolean().default(false),
        gap_years: z.union([z.number(), z.string()]).optional().or(z.literal("")),
        gap_reason: z.string().max(500).optional().or(z.literal("")),
    })
    .refine(
        (data) => {
            if (data.twelfth_or_diploma === "12th") {
                const pct = Number(data.twelfth_percentage);
                return !isNaN(pct) && pct >= 0 && pct <= 100 && !!data.twelfth_board;
            }
            return true;
        },
        { message: "12th percentage and board are required", path: ["twelfth_percentage"] }
    )
    .refine(
        (data) => {
            if (data.twelfth_or_diploma === "Diploma") {
                const pct = Number(data.diploma_percentage);
                return !isNaN(pct) && pct >= 0 && pct <= 100 && !!data.diploma_branch;
            }
            return true;
        },
        { message: "Diploma percentage and branch are required", path: ["diploma_percentage"] }
    )
    .refine(
        (data) => {
            if (data.any_gap_during_education) {
                const years = Number(data.gap_years);
                return !isNaN(years) && years >= 0 && years <= 10;
            }
            return true;
        },
        { message: "Gap years (0-10) required when gap is selected", path: ["gap_years"] }
    );

export type AcademicInfoSchemaType = z.infer<typeof academicInfoSchema>;
