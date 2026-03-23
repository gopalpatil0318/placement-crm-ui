import { z } from "zod"

const answerSchema = z
  .object({
    question_id: z.string().uuid("Invalid question ID"),
    answer_text: z.string().max(5000, "Answer must be under 5000 characters").optional(),
    answer_options: z.array(z.string()).optional(),
    answer_boolean: z.boolean().optional(),
  })
  .refine(
    (a) =>
      a.answer_text !== undefined ||
      a.answer_options !== undefined ||
      a.answer_boolean !== undefined,
    { message: "At least one answer field must be provided" },
  )

export const jobApplicationSchema = z.object({
  position_id: z.string().uuid("Invalid position").nullable().optional(),
  answers: z.array(answerSchema).default([]),
})

export type JobApplicationFormData = z.infer<typeof jobApplicationSchema>

export const denyJobSchema = z.object({
  denial_reason: z
    .string()
    .min(3, "Reason must be at least 3 characters")
    .max(500, "Reason must be under 500 characters"),
  additional_comments: z
    .string()
    .max(2000, "Comments must be under 2000 characters")
    .optional()
    .or(z.literal("")),
})

export type DenyJobFormData = z.infer<typeof denyJobSchema>

export const withdrawApplicationSchema = z.object({
  withdrawal_reason: z
    .string()
    .max(1000, "Reason must be under 1000 characters")
    .optional()
    .or(z.literal("")),
})

export type WithdrawFormData = z.infer<typeof withdrawApplicationSchema>
