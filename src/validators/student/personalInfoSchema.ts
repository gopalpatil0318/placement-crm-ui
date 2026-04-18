import { z } from "zod";

const indianMobile = z
    .string()
    .regex(/^[6-9]\d{9}$/, { message: "Must be a valid 10-digit Indian mobile number" });

const optionalIndianMobile = z
    .string()
    .regex(/^[6-9]\d{9}$/, { message: "Must be a valid 10-digit Indian mobile number" })
    .or(z.literal(""))
    .optional();

const pincode = z
    .string()
    .regex(/^\d{6}$/, { message: "Pincode must be exactly 6 digits" });

export const personalInfoSchema = z
    .object({
        // Contact
        mobile_number: indianMobile,
        alternate_mobile: optionalIndianMobile,

        // Personal
        birth_date: z.string().min(1, { message: "Date of birth is required" })
            .refine(
                (val) => {
                    const d = new Date(val);
                    return !Number.isNaN(d.getTime()) && d <= new Date() && d >= new Date('1970-01-01');
                },
                { message: 'Birth date must be a valid date in the past (after 1970)' }
            ),
        gender: z.enum(["Male", "Female", "Other", "Prefer not to say"], {
            message: "Please select a valid gender",
        }),
        blood_group: z.enum(["A+", "A-", "B+", "B-", "AB+", "AB-", "O+", "O-"], {
            message: "Please select a valid blood group",
        }),
        aadhaar_number: z
            .string()
            .regex(/^\d{12}$/, { message: "Aadhaar must be exactly 12 digits" }),
        caste: z.string().min(1, { message: "Caste is required" }),
        category: z.enum(["General", "OBC", "OBC-NCL", "SC", "ST", "EWS", "NT", "NT-A", "NT-B", "NT-C", "NT-D", "VJ", "VJ-A", "SBC", "SEBC", "DT/DNT", "Open"], {
            message: "Please select a valid category",
        }),
        nationality: z.string().min(1, { message: "Nationality is required" }),

        // Father
        father_name: z.string().min(2, { message: "Father's name is required" }),
        father_mobile: indianMobile,
        father_occupation: z.string().min(1, { message: "Father's occupation is required" }),
        father_annual_income: z
            .union([z.number(), z.string()])
            .transform(Number)
            .refine((val) => !Number.isNaN(val) && val >= 0, { message: "Must be a valid income amount" }),

        // Mother
        mother_name: z.string().min(2, { message: "Mother's name is required" }),
        mother_mobile: indianMobile,
        mother_occupation: z.string().min(1, { message: "Mother's occupation is required" }),
        mother_annual_income: z
            .union([z.number(), z.string()])
            .transform(Number)
            .refine((val) => !Number.isNaN(val) && val >= 0, { message: "Must be a valid income amount" }),

        // Guardian
        guardian_name: z.string().optional().or(z.literal("")),
        guardian_mobile: optionalIndianMobile,

        // Permanent Address
        permanent_address: z.string().min(1, { message: "Permanent address is required" }),
        permanent_city: z.string().min(1, { message: "City is required" }),
        permanent_district: z.string().min(1, { message: "District is required" }),
        permanent_state: z.string().min(1, { message: "State is required" }),
        permanent_pincode: pincode,

        // Current Address
        same_as_permanent: z.boolean(),
        current_address: z.string().optional().or(z.literal("")),
        current_city: z.string().optional().or(z.literal("")),
        current_district: z.string().optional().or(z.literal("")),
        current_state: z.string().optional().or(z.literal("")),
        current_pincode: z.string().optional().or(z.literal("")),
    })
    .refine(
        (data) => {
            if (!data.same_as_permanent) {
                return (
                    !!data.current_address &&
                    !!data.current_city &&
                    !!data.current_district &&
                    !!data.current_state &&
                    !!data.current_pincode
                );
            }
            return true;
        },
        {
            message: "Current address fields are required when not same as permanent",
            path: ["current_address"],
        }
    );

export type PersonalInfoSchemaType = z.infer<typeof personalInfoSchema>;
