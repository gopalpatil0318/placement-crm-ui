import { useState, useCallback, useEffect } from "react"
import { Loader2, Star, MessageSquare } from "lucide-react"
import ModalWrapper from "@/components/ui/ModalWrapper"
import { useSubmitTrainingFeedback } from "@/hooks/student/training-programs/useSubmitTrainingFeedback"
import type { StudentEnrollment } from "@/validators/TrainingProgramSchema"

// ─── Helpers ────────────────────────────────────────────────────────────────────

function charCountColor(count: number): string {
  if (count > 2000) return "text-red-500"
  if (count >= 10) return "text-gray-400"
  return "text-amber-500"
}

// ─── Component ──────────────────────────────────────────────────────────────────

interface FeedbackModalProps {
  enrollment: StudentEnrollment | null
  isOpen: boolean
  onClose: () => void
}

export default function FeedbackModal({ enrollment, isOpen, onClose }: Readonly<FeedbackModalProps>) {
  const {
    rating,
    feedback,
    errors,
    setRating,
    setFeedback,
    validate,
    submitFeedback,
    isSubmitting,
    resetForm,
    prefill,
  } = useSubmitTrainingFeedback()

  const isEdit = !!(enrollment?.has_submitted_feedback)

  const [hoverRating, setHoverRating] = useState(0)

  // Prefill when opening in edit mode
  useEffect(() => {
    if (isOpen && isEdit && enrollment) {
      prefill(enrollment.student_rating ?? 0, enrollment.student_feedback ?? "")
    }
  }, [isOpen, isEdit, enrollment, prefill])

  const handleSubmit = useCallback(() => {
    if (!enrollment) return
    const data = validate()
    if (!data) return
    submitFeedback(
      { enrollmentId: enrollment.enrollment_id, data, isEdit },
      { onSuccess: () => onClose() },
    )
  }, [enrollment, validate, submitFeedback, onClose, isEdit])

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      resetForm()
      setHoverRating(0)
      onClose()
    }
  }, [isSubmitting, resetForm, onClose])

  const charCount = feedback.length

  const submitLabel = isEdit ? "Update Feedback" : "Submit Feedback"
  const submittingLabel = isEdit ? "Updating…" : "Submitting…"

  const footer = (
    <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
      <button
        type="button"
        onClick={handleClose}
        disabled={isSubmitting}
        className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-xl transition-colors disabled:opacity-40 cursor-pointer"
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={isSubmitting || rating === 0}
        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors disabled:opacity-60 cursor-pointer"
      >
        {isSubmitting && <Loader2 size={16} className="animate-spin" />}
        {isSubmitting ? submittingLabel : submitLabel}
      </button>
    </div>
  )

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={handleClose}
      disabled={isSubmitting}
      size="md"
      title={isEdit ? "Update Feedback" : "Submit Feedback"}
      titleIcon={
        <div className="h-8 w-8 rounded-full bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center">
          <MessageSquare size={18} className="text-amber-600 dark:text-amber-400" />
        </div>
      }
      footer={footer}
    >
      {enrollment && (
        <div className="p-6 space-y-5">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Rate your experience with{" "}
            <span className="font-semibold text-gray-800 dark:text-gray-200">
              {enrollment.program_name}
            </span>
          </p>

          {/* Star Rating */}
          <div>
            <span id="rating-label" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Rating
            </span>
            <div className="flex items-center gap-1" role="radiogroup" aria-labelledby="rating-label">
              {Array.from({ length: 5 }).map((_, i) => {
                const starValue = i + 1
                const isFilled = starValue <= (hoverRating || rating)
                return (
                  <button
                    key={`star-${String(i)}`}
                    type="button"
                    onClick={() => setRating(starValue)}
                    onMouseEnter={() => setHoverRating(starValue)}
                    onMouseLeave={() => setHoverRating(0)}
                    className="min-h-[44px] min-w-[44px] flex items-center justify-center rounded transition-transform hover:scale-110 cursor-pointer"
                    role="radio"
                    aria-checked={starValue === rating}
                    aria-label={`${starValue} star${starValue === 1 ? "" : "s"}`}
                  >
                    <Star
                      size={28}
                      className={
                        isFilled
                          ? "text-amber-400 fill-amber-400"
                          : "text-gray-300 dark:text-gray-600"
                      }
                    />
                  </button>
                )
              })}
              {rating > 0 && (
                <span className="ml-2 text-sm text-gray-500 dark:text-gray-400">
                  {rating}/5
                </span>
              )}
            </div>
            {errors.student_rating && (
              <p className="mt-1 text-xs text-red-500">{errors.student_rating}</p>
            )}
          </div>

          {/* Feedback Textarea */}
          <div>
            <label
              htmlFor="training-feedback"
              className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2"
            >
              Your Feedback
            </label>
            <textarea
              id="training-feedback"
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              rows={5}
              maxLength={2000}
              placeholder="Share your experience with this training program... (min 10 characters)"
              className="w-full rounded-xl border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-4 py-3 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
            />
            <div className="flex items-center justify-between mt-1">
              {errors.student_feedback ? (
                <p className="text-xs text-red-500">{errors.student_feedback}</p>
              ) : (
                <span />
              )}
              <span
                className={`text-xs ${charCountColor(charCount)}`}
              >
                {charCount}/2000
              </span>
            </div>
          </div>
        </div>
      )}
    </ModalWrapper>
  )
}
