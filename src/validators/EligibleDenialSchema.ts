import { z } from "zod/v4";

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const notifyStudentsSchema = z.object({
  title: z
    .string()
    .min(2, "Title must be at least 2 characters")
    .max(200, "Title must not exceed 200 characters"),
  body: z
    .string()
    .min(2, "Message body must be at least 2 characters")
    .max(2000, "Message body must not exceed 2000 characters"),
  student_ids: z
    .array(z.string().regex(UUID_REGEX, "Invalid student ID"))
    .max(100, "Cannot notify more than 100 students at once")
    .optional(),
});

export type NotifyStudentsInput = z.infer<typeof notifyStudentsSchema>;
