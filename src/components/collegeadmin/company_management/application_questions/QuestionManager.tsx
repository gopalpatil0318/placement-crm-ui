import { useState, useCallback, useEffect, useMemo, useRef } from "react";
import {
    Plus,
    Pencil,
    Trash2,
    X,
    HelpCircle,
    Loader2,
    AlertTriangle,
    Ban,
    CircleDot,
    CheckSquare,
    Type,
    FileText,
    ToggleLeft,
    ListOrdered,
} from "lucide-react";
import ModalWrapper from "@/components/ui/ModalWrapper";
import FloatingTextarea from "@/components/ui/FloatingTextarea";
import FloatingSelect from "@/components/ui/FloatingSelect";
import { useAddQuestion } from "@/hooks/collegeadmin/company_management/application_questions/useAddQuestion";
import { useUpdateQuestion } from "@/hooks/collegeadmin/company_management/application_questions/useUpdateQuestion";
import { useDeleteQuestion } from "@/hooks/collegeadmin/company_management/application_questions/useDeleteQuestion";
import { QUESTION_TYPE_OPTIONS } from "@/validators/JobPostingSchema";

// ========================
// TYPES
// ========================

interface Question {
    question_id: string;
    job_id: string;
    question_text: string;
    question_type: string;
    question_options: string[] | null;
    is_required: boolean;
    question_order: number;
    created_at: string;
}

interface QuestionManagerProps {
    jobId: string;
    jobStatus: string;
    questions: Question[];
    onRefresh: () => void;
}

// ========================
// CONSTANTS
// ========================

const QUESTION_TYPE_LABELS: Record<string, string> = {
    mcq_single: "MCQ (Single)",
    mcq_multiple: "MCQ (Multiple)",
    text: "Short Answer",
    essay: "Essay",
    yes_no: "Yes / No",
};

const QUESTION_TYPE_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
    mcq_single: CircleDot,
    mcq_multiple: CheckSquare,
    text: Type,
    essay: FileText,
    yes_no: ToggleLeft,
};

const QUESTION_TYPE_COLORS: Record<string, { bg: string; text: string; border: string }> = {
    mcq_single: { bg: "bg-violet-50 dark:bg-violet-900/20", text: "text-violet-700 dark:text-violet-400", border: "border-violet-100 dark:border-violet-800" },
    mcq_multiple: { bg: "bg-indigo-50 dark:bg-indigo-900/20", text: "text-indigo-700 dark:text-indigo-400", border: "border-indigo-100 dark:border-indigo-800" },
    text: { bg: "bg-sky-50 dark:bg-sky-900/20", text: "text-sky-700 dark:text-sky-400", border: "border-sky-100 dark:border-sky-800" },
    essay: { bg: "bg-teal-50 dark:bg-teal-900/20", text: "text-teal-700 dark:text-teal-400", border: "border-teal-100 dark:border-teal-800" },
    yes_no: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-400", border: "border-amber-100 dark:border-amber-800" },
};

const MCQ_TYPES = new Set(["mcq_single", "mcq_multiple"]);

const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 transition ${
        hasError
            ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/20 focus:ring-red-500"
            : "border-gray-300 dark:border-gray-700 focus:ring-blue-500 focus:border-blue-500"
    }`;

// ========================
// QUESTION CARD
// ========================

const QuestionCard = ({
    question,
    isLast,
    isReadOnly,
    onEdit,
    onDelete,
}: {
    question: Question;
    isLast: boolean;
    isReadOnly: boolean;
    onEdit: () => void;
    onDelete: () => void;
}) => {
    const typeColors = QUESTION_TYPE_COLORS[question.question_type] || QUESTION_TYPE_COLORS.text;
    const TypeIcon = QUESTION_TYPE_ICONS[question.question_type] || HelpCircle;
    const isMcq = MCQ_TYPES.has(question.question_type);

    return (
        <div className="flex gap-4">
            {/* Left: order number badge + connector */}
            <div className="flex flex-col items-center flex-shrink-0">
                <div className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-bold border-2 bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400">
                    {question.question_order}
                </div>
                {!isLast && (
                    <div className="w-0.5 flex-1 min-h-[24px] mt-1 rounded-full bg-gray-200 dark:bg-gray-700" />
                )}
            </div>

            {/* Right: card content */}
            <div className="flex-1 p-4 rounded-xl border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-gray-300 dark:hover:border-gray-700 hover:shadow-sm transition-all mb-3">
                {/* Card header */}
                <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100 leading-relaxed line-clamp-2">
                            {question.question_text}
                        </p>
                        <div className="flex items-center gap-2 mt-1.5">
                            {question.is_required ? (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 border border-red-100 dark:border-red-800">
                                    Required
                                </span>
                            ) : (
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 border border-gray-200 dark:border-gray-700">
                                    Optional
                                </span>
                            )}
                        </div>

                        {/* MCQ options */}
                        {isMcq && question.question_options && question.question_options.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-2.5">
                                {question.question_options.map((opt) => (
                                    <span
                                        key={opt}
                                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800"
                                    >
                                        {question.question_type === "mcq_single" ? (
                                            <CircleDot className="h-3 w-3 text-blue-400 dark:text-blue-500" />
                                        ) : (
                                            <CheckSquare className="h-3 w-3 text-blue-400 dark:text-blue-500" />
                                        )}
                                        {opt}
                                    </span>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Type badge */}
                    <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium flex-shrink-0 ${typeColors.bg} ${typeColors.text} border ${typeColors.border}`}
                    >
                        <TypeIcon className="h-3 w-3" />
                        {QUESTION_TYPE_LABELS[question.question_type] || question.question_type}
                    </span>
                </div>

                {/* Action buttons */}
                {!isReadOnly && (
                    <div className="flex items-center gap-1 mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                        <button
                            type="button"
                            onClick={onEdit}
                            className="inline-flex items-center gap-1.5 px-3 py-2.5 min-h-[44px] text-xs font-medium text-gray-500 dark:text-gray-400 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-700 dark:hover:text-gray-300 transition"
                            aria-label={`Edit question ${question.question_order}`}
                        >
                            <Pencil className="h-3.5 w-3.5" />
                            Edit
                        </button>
                        <button
                            type="button"
                            onClick={onDelete}
                            className="inline-flex items-center gap-1.5 px-3 py-2.5 min-h-[44px] text-xs font-medium text-gray-500 dark:text-gray-400 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition"
                            aria-label={`Delete question ${question.question_order}`}
                        >
                            <Trash2 className="h-3.5 w-3.5" />
                            Delete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
};

// ========================
// MAIN COMPONENT
// ========================

const QuestionManager = ({ jobId, jobStatus, questions, onRefresh }: QuestionManagerProps) => {
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
    const [deletingQuestion, setDeletingQuestion] = useState<Question | null>(null);
    const timelineRef = useRef<HTMLDivElement>(null);

    const isReadOnly = jobStatus === "cancelled" || jobStatus === "closed";

    // Sort by question_order
    const sortedQuestions = useMemo(
        () => [...questions].sort((a, b) => a.question_order - b.question_order),
        [questions]
    );

    // Stats
    const totalCount = questions.length;
    const requiredCount = questions.filter((q) => q.is_required).length;
    const mcqCount = questions.filter((q) => MCQ_TYPES.has(q.question_type)).length;

    const handleAddSuccess = useCallback(() => {
        setShowAddModal(false);
        onRefresh();
        requestAnimationFrame(() => {
            const container = timelineRef.current;
            if (container) {
                const lastCard = container.lastElementChild as HTMLElement | null;
                lastCard?.scrollIntoView({ behavior: "smooth", block: "nearest" });
            }
        });
    }, [onRefresh]);

    const handleEditSuccess = useCallback(() => {
        setEditingQuestion(null);
        onRefresh();
    }, [onRefresh]);

    const handleDeleteSuccess = useCallback(() => {
        setDeletingQuestion(null);
        onRefresh();
    }, [onRefresh]);

    return (
        <div>
            {/* Cancelled / closed job banner */}
            {isReadOnly && (
                <div className="flex items-start gap-3 p-4 mb-5 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                    <Ban className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                    <div>
                        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
                            This job is {jobStatus}
                        </p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">
                            Questions cannot be added, edited, or deleted.
                        </p>
                    </div>
                </div>
            )}

            {/* Header with stats and Add button */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-indigo-50 dark:bg-indigo-900/20 flex items-center justify-center flex-shrink-0">
                        <HelpCircle className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Application Questions</h3>
                        {totalCount > 0 && (
                            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">
                                    {totalCount} question{totalCount === 1 ? "" : "s"}
                                </span>
                                {requiredCount > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400">
                                        {requiredCount} required
                                    </span>
                                )}
                                {mcqCount > 0 && (
                                    <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-400">
                                        {mcqCount} MCQ
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                {!isReadOnly && (
                    <button
                        type="button"
                        onClick={() => setShowAddModal(true)}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
                    >
                        <Plus className="h-4 w-4" />
                        Add Question
                    </button>
                )}
            </div>

            {/* Cards or empty state */}
            {sortedQuestions.length === 0 ? (
                <EmptyState isReadOnly={isReadOnly} onAdd={() => setShowAddModal(true)} />
            ) : (
                <div ref={timelineRef}>
                    {sortedQuestions.map((question, i) => (
                        <QuestionCard
                            key={question.question_id}
                            question={question}
                            isLast={i === sortedQuestions.length - 1}
                            isReadOnly={isReadOnly}
                            onEdit={() => setEditingQuestion(question)}
                            onDelete={() => setDeletingQuestion(question)}
                        />
                    ))}
                </div>
            )}

            {/* Add Question Modal */}
            {showAddModal && (
                <AddQuestionModal
                    jobId={jobId}
                    onClose={() => setShowAddModal(false)}
                    onSuccess={handleAddSuccess}
                />
            )}

            {/* Edit Question Modal */}
            {editingQuestion && (
                <EditQuestionModal
                    question={editingQuestion}
                    jobId={jobId}
                    onClose={() => setEditingQuestion(null)}
                    onSuccess={handleEditSuccess}
                />
            )}

            {/* Delete Confirm Modal */}
            {deletingQuestion && (
                <DeleteConfirmModal
                    question={deletingQuestion}
                    jobId={jobId}
                    onClose={() => setDeletingQuestion(null)}
                    onSuccess={handleDeleteSuccess}
                />
            )}
        </div>
    );
};

// ========================
// EMPTY STATE
// ========================

const EmptyState = ({ isReadOnly, onAdd }: { isReadOnly: boolean; onAdd: () => void }) => (
    <div className="flex flex-col items-center py-14 text-center">
        <div className="h-14 w-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <HelpCircle className="h-7 w-7 text-gray-400 dark:text-gray-500" />
        </div>
        <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-1">
            {isReadOnly ? "No application questions" : "No application questions yet"}
        </h4>
        <p className="text-xs text-gray-400 dark:text-gray-500 max-w-xs mb-5">
            {isReadOnly
                ? "Questions cannot be added to this job."
                : "Add questions that students must answer when applying for this job, such as preferred location, skills, or motivation."}
        </p>
        {!isReadOnly && (
            <button
                type="button"
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
                <Plus className="h-4 w-4" />
                Add First Question
            </button>
        )}
    </div>
);

// ========================
// MCQ OPTIONS SECTION (shared between add/edit)
// ========================

const McqOptionsSection = ({
    options,
    errors,
    onAdd,
    onRemove,
    onUpdate,
}: {
    options: string[];
    errors?: string;
    onAdd: () => void;
    onRemove: (index: number) => void;
    onUpdate: (index: number, value: string) => void;
}) => (
    <div className="rounded-xl border border-indigo-100 dark:border-indigo-800 bg-indigo-50/30 dark:bg-indigo-900/10 p-4">
        <div className="flex items-center justify-between mb-3">
            <label htmlFor="question-options-section" className="text-sm font-medium text-gray-700 dark:text-gray-300">
                Options <span className="text-red-500">*</span>
                <span className="text-gray-400 dark:text-gray-500 text-xs ml-1">(min 2, max 20)</span>
            </label>
            <button
                type="button"
                onClick={onAdd}
                disabled={options.length >= 20}
                className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 hover:bg-indigo-100 dark:hover:bg-indigo-900/30 rounded-lg transition disabled:opacity-40 disabled:cursor-not-allowed"
            >
                <Plus className="h-3 w-3" />
                Add Option
            </button>
        </div>
        <div className="space-y-2">
            {options.map((opt, i) => (
                <div key={`option-${String(i)}`} className="flex items-center gap-2">
                    <span className="text-xs font-medium text-gray-400 dark:text-gray-500 w-5 text-right flex-shrink-0">
                        {i + 1}.
                    </span>
                    <input
                        value={opt}
                        onChange={(e) => onUpdate(i, e.target.value)}
                        placeholder={`Option ${i + 1}`}
                        maxLength={500}
                        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition"
                    />
                    <button
                        type="button"
                        onClick={() => onRemove(i)}
                        disabled={options.length <= 2}
                        className="p-1.5 text-gray-400 dark:text-gray-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition disabled:opacity-30 disabled:cursor-not-allowed"
                        aria-label={`Remove option ${i + 1}`}
                    >
                        <X className="h-3.5 w-3.5" />
                    </button>
                </div>
            ))}
        </div>
        {errors && (
            <p className="text-xs text-red-500 dark:text-red-400 mt-2">{errors}</p>
        )}
    </div>
);

// ========================
// QUESTION FORM BODY (shared between add/edit modals)
// ========================

const QuestionFormBody = ({
    formData,
    errors,
    loading,
    mode,
    handleChange,
    addOption,
    removeOption,
    updateOption,
    onCancel,
    onSubmit,
    submitLabel,
    loadingLabel,
}: {
    formData: {
        question_text: string;
        question_type: string;
        question_options: string[];
        is_required: boolean;
        question_order?: number;
    };
    errors: Record<string, string>;
    loading: boolean;
    mode: "create" | "edit";
    handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    addOption: () => void;
    removeOption: (index: number) => void;
    updateOption: (index: number, value: string) => void;
    onCancel: () => void;
    onSubmit: () => void;
    submitLabel: string;
    loadingLabel: string;
}) => {
    const isMcq = MCQ_TYPES.has(formData.question_type);

    return (
        <div className="space-y-5">
            {/* Question Text */}
            <FloatingTextarea
                label="Question Text"
                name="question_text"
                value={formData.question_text}
                onChange={handleChange}
                error={errors.question_text}
                placeholder="e.g. What is your preferred work location?"
                rows={3}
                maxLength={2000}
                required
            />

            {/* Question Type */}
            <FloatingSelect
                label="Question Type"
                name="question_type"
                value={formData.question_type}
                onChange={handleChange}
                error={errors.question_type}
                options={QUESTION_TYPE_OPTIONS.map((t) => ({
                    value: t,
                    label: QUESTION_TYPE_LABELS[t] || t,
                }))}
                required
            />

            {/* MCQ Options — conditional */}
            {isMcq && (
                <McqOptionsSection
                    options={formData.question_options}
                    errors={errors.question_options}
                    onAdd={addOption}
                    onRemove={removeOption}
                    onUpdate={updateOption}
                />
            )}

            {/* Question Order — edit mode only */}
            {mode === "edit" && (
                <div>
                    <label htmlFor="question-order-input" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
                        <span className="inline-flex items-center gap-1.5">
                            <ListOrdered className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                            Question Order
                        </span>
                    </label>
                    <input
                        id="question-order-input"
                        type="number"
                        name="question_order"
                        value={formData.question_order ?? 1}
                        onChange={handleChange}
                        min={1}
                        max={100}
                        inputMode="numeric"
                        className={inputClass(!!errors.question_order)}
                    />
                    <div className="flex items-center justify-between mt-1">
                        {errors.question_order ? (
                            <p className="text-xs text-red-500 dark:text-red-400">{errors.question_order}</p>
                        ) : (
                            <p className="text-xs text-gray-400 dark:text-gray-500">Change to reorder (1–100)</p>
                        )}
                    </div>
                </div>
            )}

            {/* Required toggle */}
            <div className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-gray-800 border border-gray-100 dark:border-gray-700">
                <div>
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Required question</p>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Students must answer this to apply</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <span className="sr-only">Required question toggle</span>
                    <input
                        type="checkbox"
                        name="is_required"
                        checked={formData.is_required}
                        onChange={handleChange}
                        className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-300 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-blue-600" />
                </label>
            </div>

            {/* Actions */}
            <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-40"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? loadingLabel : submitLabel}
                </button>
            </div>
        </div>
    );
};

// ========================
// ADD QUESTION MODAL
// ========================

const AddQuestionModal = ({
    jobId,
    onClose,
    onSuccess,
}: {
    jobId: string;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const {
        formData,
        errors,
        loading,
        handleChange,
        handleSubmit,
        resetForm,
        addOption,
        removeOption,
        updateOption,
    } = useAddQuestion(jobId, onSuccess);

    const handleCancel = useCallback(() => {
        resetForm();
        onClose();
    }, [resetForm, onClose]);

    return (
        <ModalWrapper
            isOpen={true}
            onClose={handleCancel}
            disabled={loading}
            title="Add Application Question"
            titleIcon={<HelpCircle className="h-5 w-5 text-blue-600" />}
            size="md"
        >
            <QuestionFormBody
                formData={formData}
                errors={errors}
                loading={loading}
                mode="create"
                handleChange={handleChange}
                addOption={addOption}
                removeOption={removeOption}
                updateOption={updateOption}
                onCancel={handleCancel}
                onSubmit={handleSubmit}
                submitLabel="Add Question"
                loadingLabel="Adding..."
            />
        </ModalWrapper>
    );
};

// ========================
// EDIT QUESTION MODAL
// ========================

const EditQuestionModal = ({
    question,
    jobId,
    onClose,
    onSuccess,
}: {
    question: Question;
    jobId: string;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const {
        formData,
        errors,
        loading,
        handleChange,
        handleSubmit,
        loadQuestion,
        addOption,
        removeOption,
        updateOption,
    } = useUpdateQuestion(jobId, onSuccess);

    useEffect(() => {
        loadQuestion(question);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return (
        <ModalWrapper
            isOpen={true}
            onClose={onClose}
            disabled={loading}
            title="Edit Question"
            titleIcon={<Pencil className="h-5 w-5 text-amber-600" />}
            size="md"
        >
            <QuestionFormBody
                formData={formData}
                errors={errors}
                loading={loading}
                mode="edit"
                handleChange={handleChange}
                addOption={addOption}
                removeOption={removeOption}
                updateOption={updateOption}
                onCancel={onClose}
                onSubmit={handleSubmit}
                submitLabel="Update Question"
                loadingLabel="Updating..."
            />
        </ModalWrapper>
    );
};

// ========================
// DELETE CONFIRM MODAL
// ========================

const DeleteConfirmModal = ({
    question,
    jobId,
    onClose,
    onSuccess,
}: {
    question: Question;
    jobId: string;
    onClose: () => void;
    onSuccess: () => void;
}) => {
    const { deleteQuestion, loading } = useDeleteQuestion(jobId, onSuccess);

    return (
        <ModalWrapper
            isOpen={true}
            onClose={onClose}
            disabled={loading}
            title="Delete Question"
            titleIcon={<Trash2 className="h-5 w-5 text-red-600" />}
            size="md"
        >
            <div className="space-y-4">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure you want to delete{" "}
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                        &quot;Q{question.question_order}. {question.question_text.length > 60
                            ? question.question_text.slice(0, 60) + "..."
                            : question.question_text}&quot;
                    </span>{"?"}
                </p>

                <div className="flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                    <AlertTriangle className="h-4 w-4 mt-0.5 flex-shrink-0 text-amber-600 dark:text-amber-400" />
                    <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                        <p className="font-medium">This action will:</p>
                        <ul className="list-disc pl-4 space-y-0.5">
                            <li>Permanently remove this question</li>
                            <li>Delete all student answers for this question</li>
                            <li>Remaining questions will be auto-reordered</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 pt-4 mt-4 border-t border-gray-100 dark:border-gray-800">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-40"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={() => deleteQuestion(question.question_id)}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-red-600 rounded-lg hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? "Deleting..." : "Delete Question"}
                </button>
            </div>
        </ModalWrapper>
    );
};

export default QuestionManager;
