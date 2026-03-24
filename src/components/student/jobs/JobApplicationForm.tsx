import { useState, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  Send,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  CircleDot,
  Type,
  ToggleLeft,
  ListChecks,
  CircleCheck,
  AlertCircle,
} from "lucide-react"
import { fadeInUp } from "@/lib/animations"
import type { JobPosition, JobQuestion, ApplyPayload } from "@/services/student/jobBrowsing.service"

interface JobApplicationFormProps {
  positions: JobPosition[]
  questions: JobQuestion[]
  jobTitle: string
  companyName: string
  isSubmitting: boolean
  onSubmit: (payload: ApplyPayload) => void
  onCancel: () => void
}

type AnswerMap = Record<
  string,
  { answer_text?: string; answer_options?: string[]; answer_boolean?: boolean }
>

const STEPS = ["Position", "Questions", "Review"] as const
type Step = (typeof STEPS)[number]

export default function JobApplicationForm({
  positions,
  questions,
  jobTitle,
  companyName,
  isSubmitting,
  onSubmit,
  onCancel,
}: JobApplicationFormProps) {
  const hasPositions = positions.length > 0
  const hasQuestions = questions.length > 0

  // Determine active steps
  const activeSteps = useMemo(() => {
    const steps: Step[] = []
    if (hasPositions) steps.push("Position")
    if (hasQuestions) steps.push("Questions")
    steps.push("Review")
    return steps
  }, [hasPositions, hasQuestions])

  const [currentStepIdx, setCurrentStepIdx] = useState(0)
  const currentStep = activeSteps[currentStepIdx]

  const [selectedPosition, setSelectedPosition] = useState<string | null>(
    positions.length === 1 ? positions[0].position_id : null,
  )
  const [answers, setAnswers] = useState<AnswerMap>({})

  // Validation
  const positionValid = !hasPositions || !!selectedPosition
  const questionsValid = useMemo(() => {
    return questions
      .filter((q) => q.is_required)
      .every((q) => {
        const a = answers[q.question_id]
        if (!a) return false
        if (q.question_type === "text") return !!a.answer_text?.trim()
        if (q.question_type === "boolean") return a.answer_boolean !== undefined
        if (q.question_type === "single_choice" || q.question_type === "multiple_choice")
          return a.answer_options && a.answer_options.length > 0
        return false
      })
  }, [questions, answers])

  const canProceed =
    currentStep === "Position"
      ? positionValid
      : currentStep === "Questions"
        ? questionsValid
        : true

  const handleNext = () => {
    if (currentStepIdx < activeSteps.length - 1) setCurrentStepIdx((i) => i + 1)
  }
  const handleBack = () => {
    if (currentStepIdx > 0) setCurrentStepIdx((i) => i - 1)
  }

  const handleSubmit = () => {
    const payload: ApplyPayload = {
      position_id: selectedPosition,
      answers: Object.entries(answers).map(([question_id, a]) => ({
        question_id,
        ...a,
      })),
    }
    onSubmit(payload)
  }

  const updateAnswer = (questionId: string, value: Partial<AnswerMap[string]>) => {
    setAnswers((prev) => ({ ...prev, [questionId]: { ...prev[questionId], ...value } }))
  }

  const selectedPositionObj = positions.find((p) => p.position_id === selectedPosition)

  return (
    <div className="space-y-6">
      {/* Step indicator */}
      {activeSteps.length > 1 && (
        <div className="flex items-center justify-center gap-2">
          {activeSteps.map((step, i) => (
            <div key={step} className="flex items-center gap-2">
              <div
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                  i < currentStepIdx
                    ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                    : i === currentStepIdx
                      ? "bg-indigo-100 text-indigo-700 dark:bg-indigo-900/30 dark:text-indigo-300"
                      : "bg-gray-100 text-gray-400 dark:bg-gray-800 dark:text-gray-500"
                }`}
              >
                {i < currentStepIdx ? (
                  <CheckCircle2 className="h-3.5 w-3.5" />
                ) : (
                  <CircleDot className="h-3.5 w-3.5" />
                )}
                {step}
              </div>
              {i < activeSteps.length - 1 && (
                <div className="w-6 h-px bg-gray-200 dark:bg-gray-700" />
              )}
            </div>
          ))}
        </div>
      )}

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          variants={fadeInUp}
          initial="initial"
          animate="animate"
          exit="exit"
        >
          {/* ─── Position Selection ─── */}
          {currentStep === "Position" && (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Select a position you'd like to apply for:
              </p>
              <div className="grid gap-3">
                {positions.map((pos) => (
                  <button
                    key={pos.position_id}
                    type="button"
                    onClick={() => setSelectedPosition(pos.position_id)}
                    className={`text-left rounded-xl border-2 p-4 transition-all ${
                      selectedPosition === pos.position_id
                        ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 dark:border-indigo-400 ring-2 ring-indigo-500/20"
                        : "border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium text-gray-900 dark:text-gray-100">
                          {pos.position_name}
                        </h4>
                        {pos.position_description && (
                          <p className="mt-1 text-sm text-gray-500 dark:text-gray-400 line-clamp-2">
                            {pos.position_description}
                          </p>
                        )}
                      </div>
                      <span className="shrink-0 text-xs font-medium px-2 py-1 rounded-lg bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                        {pos.vacancies} {pos.vacancies === 1 ? "vacancy" : "vacancies"}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* ─── Questions ─── */}
          {currentStep === "Questions" && (
            <div className="space-y-5">
              {questions
                .sort((a, b) => a.question_order - b.question_order)
                .map((q, idx) => (
                  <div
                    key={q.question_id}
                    className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-4 space-y-3"
                  >
                    <div className="flex items-start gap-2">
                      <span className="shrink-0 flex items-center justify-center h-6 w-6 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 text-xs font-semibold">
                        {idx + 1}
                      </span>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                          {q.question_text}
                          {q.is_required && <span className="text-red-500 ml-1">*</span>}
                        </p>
                        <div className="mt-0.5 flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
                          {q.question_type === "text" && <Type className="h-3 w-3" />}
                          {q.question_type === "boolean" && <ToggleLeft className="h-3 w-3" />}
                          {q.question_type === "single_choice" && <CircleCheck className="h-3 w-3" />}
                          {q.question_type === "multiple_choice" && <ListChecks className="h-3 w-3" />}
                          <span className="capitalize">{q.question_type.replace("_", " ")}</span>
                        </div>
                      </div>
                    </div>

                    {/* Text answer */}
                    {q.question_type === "text" && (
                      <textarea
                        value={answers[q.question_id]?.answer_text ?? ""}
                        onChange={(e) =>
                          updateAnswer(q.question_id, { answer_text: e.target.value })
                        }
                        placeholder="Type your answer..."
                        rows={3}
                        maxLength={5000}
                        aria-required={q.is_required}
                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2.5 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/40 focus:border-indigo-400 transition resize-none"
                      />
                    )}

                    {/* Single choice */}
                    {q.question_type === "single_choice" && q.question_options && (
                      <div className="grid gap-2">
                        {q.question_options.map((opt) => (
                          <label
                            key={opt}
                            className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm cursor-pointer transition ${
                              answers[q.question_id]?.answer_options?.[0] === opt
                                ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300"
                                : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                            }`}
                          >
                            <input
                              type="radio"
                              name={q.question_id}
                              checked={answers[q.question_id]?.answer_options?.[0] === opt}
                              onChange={() =>
                                updateAnswer(q.question_id, { answer_options: [opt] })
                              }
                              aria-required={q.is_required}
                              className="accent-indigo-500"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    )}

                    {/* Multiple choice */}
                    {q.question_type === "multiple_choice" && q.question_options && (
                      <div className="grid gap-2">
                        {q.question_options.map((opt) => {
                          const selected =
                            answers[q.question_id]?.answer_options?.includes(opt) ?? false
                          return (
                            <label
                              key={opt}
                              className={`flex items-center gap-3 rounded-lg border px-3 py-2.5 text-sm cursor-pointer transition ${
                                selected
                                  ? "border-indigo-500 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-700 dark:text-indigo-300"
                                  : "border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:border-gray-300 dark:hover:border-gray-600"
                              }`}
                            >
                              <input
                                type="checkbox"
                                checked={selected}
                                onChange={() => {
                                  const current =
                                    answers[q.question_id]?.answer_options ?? []
                                  const next = selected
                                    ? current.filter((o) => o !== opt)
                                    : [...current, opt]
                                  updateAnswer(q.question_id, { answer_options: next })
                                }}
                                aria-required={q.is_required}
                                className="accent-indigo-500"
                              />
                              {opt}
                            </label>
                          )
                        })}
                      </div>
                    )}

                    {/* Boolean */}
                    {q.question_type === "boolean" && (
                      <div className="flex gap-3">
                        {[true, false].map((val) => (
                          <button
                            key={String(val)}
                            type="button"
                            onClick={() =>
                              updateAnswer(q.question_id, { answer_boolean: val })
                            }
                            className={`flex-1 rounded-lg border px-4 py-2.5 text-sm font-medium transition ${
                              answers[q.question_id]?.answer_boolean === val
                                ? val
                                  ? "border-emerald-500 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-700 dark:text-emerald-300"
                                  : "border-red-500 bg-red-50 dark:bg-red-950/20 text-red-700 dark:text-red-300"
                                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300 dark:hover:border-gray-600"
                            }`}
                          >
                            {val ? "Yes" : "No"}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                ))}

              {!hasQuestions && (
                <div className="text-center py-8 text-sm text-gray-400 dark:text-gray-500">
                  No additional questions for this job.
                </div>
              )}
            </div>
          )}

          {/* ─── Review ─── */}
          {currentStep === "Review" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-4">
                <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  Application Summary
                </h4>

                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Job</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{jobTitle}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Company</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">{companyName}</span>
                  </div>
                  {selectedPositionObj && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 dark:text-gray-400">Position</span>
                      <span className="font-medium text-gray-900 dark:text-gray-100">
                        {selectedPositionObj.position_name}
                      </span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">Questions Answered</span>
                    <span className="font-medium text-gray-900 dark:text-gray-100">
                      {Object.keys(answers).length} / {questions.length}
                    </span>
                  </div>
                </div>
              </div>

              {/* Answers preview */}
              {Object.keys(answers).length > 0 && (
                <div className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 p-5 space-y-3">
                  <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                    Your Answers
                  </h4>
                  {questions
                    .filter((q) => answers[q.question_id])
                    .sort((a, b) => a.question_order - b.question_order)
                    .map((q) => {
                      const a = answers[q.question_id]
                      let display = ""
                      if (a.answer_text) display = a.answer_text
                      else if (a.answer_options) display = a.answer_options.join(", ")
                      else if (a.answer_boolean !== undefined)
                        display = a.answer_boolean ? "Yes" : "No"
                      return (
                        <div key={q.question_id} className="text-sm">
                          <p className="text-gray-500 dark:text-gray-400">{q.question_text}</p>
                          <p className="mt-0.5 font-medium text-gray-900 dark:text-gray-100">
                            {display || <span className="text-gray-400 italic">No answer</span>}
                          </p>
                        </div>
                      )
                    })}
                </div>
              )}

              {/* Required fields warning */}
              {!questionsValid && hasQuestions && (
                <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 rounded-lg p-3">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  Some required questions are unanswered. Go back to complete them.
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>

      {/* Navigation */}
      <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
        {currentStepIdx > 0 ? (
          <button
            onClick={handleBack}
            disabled={isSubmitting}
            className="flex items-center gap-1.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
          >
            <ChevronLeft className="h-4 w-4" />
            Back
          </button>
        ) : (
          <button
            onClick={onCancel}
            disabled={isSubmitting}
            className="rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900 px-4 py-2.5 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
          >
            Cancel
          </button>
        )}

        <div className="flex-1" />

        {currentStep !== "Review" ? (
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
            <ChevronRight className="h-4 w-4" />
          </button>
        ) : (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting || (!questionsValid && hasQuestions)}
            className="flex items-center gap-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 text-sm font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <>
                <span className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Application
              </>
            )}
          </button>
        )}
      </div>
    </div>
  )
}
