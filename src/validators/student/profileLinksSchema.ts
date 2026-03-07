import { z } from "zod";

const optionalUrl = z.string().url("Must be a valid URL").max(500).or(z.literal("")).optional();

export const profileLinksSchema = z.object({
    // Portfolio & Resume
    personal_portfolio_url: optionalUrl,
    resume_url: optionalUrl,
    profile_image_url: optionalUrl,

    // Professional
    github_url: optionalUrl,
    linkedin_url: optionalUrl,

    // Competitive Programming
    leetcode_url: optionalUrl,
    codechef_url: optionalUrl,
    codeforces_url: optionalUrl,
    hackerrank_url: optionalUrl,
    geeksforgeeks_url: optionalUrl,

    // Blog
    medium_url: optionalUrl,

    // About
    bio: z.string().max(500, "Bio must be 500 characters or less").optional().or(z.literal("")),
    area_of_interest: z
        .array(z.string().max(50, "Max 50 chars per interest"))
        .max(10, "Maximum 10 interests")
        .default([]),
});

export type ProfileLinksSchemaType = z.infer<typeof profileLinksSchema>;
