import { useQuery } from "@tanstack/react-query";
import { useReducedMotion, motion } from "framer-motion";
import {
    BookOpen,
    User,
    Calendar,
    Loader2,
    ChevronRight,
    ChevronLeft,
    Check,
} from "lucide-react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingTextarea from "@/components/ui/FloatingTextarea";
import FloatingSelect from "@/components/ui/FloatingSelect";
import {
    PROGRAM_TYPE_OPTIONS,
    PROGRAM_TYPE_LABELS,
    type CreateTrainingProgramInput,
} from "@/validators/TrainingProgramSchema";

// ========================
// TYPES
// ========================

type FormErrors = Partial<Record<string, string>>;

interface TrainingFormProps {
    mode: "create" | "edit";
    step: number;
    formData: CreateTrainingProgramInput;
    errors: FormErrors;
    loading: boolean;
    fetchedProgramName?: string;
    handleChange: (name: string, value: unknown) => void;
    handleNext: () => void;
    handleBack: () => void;
    handleSubmit: () => void;
    handleCancel: () => void;
}

// ========================
// CONSTANTS
// ========================

const currentYear = new Date().getFullYear();
const PASSOUT_YEARS = Array.from({ length: 7 }, (_, i) => currentYear - 2 + i);

const TYPE_SELECT_OPTIONS = [
    { value: "", label: "" },
    ...PROGRAM_TYPE_OPTIONS.map((t) => ({
        value: t,
        label: PROGRAM_TYPE_LABELS[t],
    })),
];

const PASSOUT_YEAR_OPTIONS = [
    { value: "", label: "" },
    ...PASSOUT_YEARS.map((y) => ({ value: String(y), label: String(y) })),
];

const STEPS = [
    { number: 1, label: "Basic Info" },
    { number: 2, label: "Training Details" },
    { number: 3, label: "Schedule & Targeting" },
];

// ========================
// HELPERS — extracted for cognitive complexity
// ========================

function getStepIndicatorClass(currentStep: number, stepNumber: number): string {
    if (currentStep === stepNumber) return "bg-blue-600 text-white";
    if (currentStep > stepNumber) return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400";
    return "bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400";
}

function getButtonText(mode: "create" | "edit", isLoading: boolean): string {
    if (isLoading) return mode === "create" ? "Creating..." : "Saving...";
    return mode === "create" ? "Create Program" : "Save Changes";
}

// ========================
// SUB-COMPONENTS
// ========================

interface SectionHeaderProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    subtitle: string;
}

const SectionHeader = ({ icon: Icon, title, subtitle }: Readonly<SectionHeaderProps>) => (
    <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
    </div>
);

interface SubmitButtonProps {
    loading: boolean;
    mode: "create" | "edit";
    shouldReduce: boolean | null;
    onClick: () => void;
}

const SubmitButton = ({ loading, mode, shouldReduce, onClick }: Readonly<SubmitButtonProps>) => {
    const text = getButtonText(mode, loading);
    const btnClass = "inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 min-h-[44px] rounded-xl text-sm font-medium transition shadow-sm shadow-blue-200 dark:shadow-none disabled:opacity-60 disabled:cursor-not-allowed";

    if (shouldReduce) {
        return (
            <button type="button" onClick={onClick} disabled={loading} className={btnClass}>
                {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                {text}
            </button>
        );
    }

    return (
        <motion.button type="button" onClick={onClick} disabled={loading} whileTap={{ scale: 0.97 }} className={btnClass}>
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            {text}
        </motion.button>
    );
};

// ========================
// COMPONENT
// ========================

const TrainingForm = ({
    mode,
    step,
    formData,
    errors,
    loading,
    fetchedProgramName,
    handleChange,
    handleNext,
    handleBack,
    handleSubmit,
    handleCancel,
}: Readonly<TrainingFormProps>) => {
    const shouldReduce = useReducedMotion();

    // Fetch departments for multi-select
    const { data: deptData } = useQuery({
        queryKey: queryKeys.departments.all(),
        queryFn: () => CollegeAdminService.getDepartments(),
    });
    const departments: { dept_id: string; dept_name: string }[] =
        Array.isArray(deptData?.data) ? deptData.data : [];

    // Wrap native change events for our handleChange(name, value) pattern
    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        handleChange(e.target.name, e.target.value);
    };

    const onDeptToggle = (deptId: string) => {
        const current = formData.target_dept_ids ?? [];
        const next = current.includes(deptId)
            ? current.filter((id) => id !== deptId)
            : [...current, deptId];
        handleChange("target_dept_ids", next);
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            {/* ── Edit-mode context bar ── */}
            {mode === "edit" && (
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                        <BookOpen className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">
                            Editing Program
                        </p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                            {fetchedProgramName || "Loading…"}
                        </p>
                    </div>
                </div>
            )}

            {/* ── Step Indicator ── */}
            <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800">
                <div className="flex items-center gap-2">
                    {STEPS.map((s, i) => (
                        <div key={s.number} className="flex items-center gap-2">
                            <div className={`flex items-center gap-2 px-3 py-1.5 min-h-[44px] rounded-lg text-xs font-medium transition-colors ${getStepIndicatorClass(step, s.number)}`}>
                                {step > s.number ? (
                                    <Check className="h-3 w-3" />
                                ) : (
                                    <span>{s.number}</span>
                                )}
                                <span className="hidden sm:inline">{s.label}</span>
                            </div>
                            {i < STEPS.length - 1 && (
                                <ChevronRight className="h-3.5 w-3.5 text-gray-300 dark:text-gray-600" />
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* ── Form Body ── */}
            <div className="p-6">
                {/* Step 1: Basic Info */}
                {step === 1 && (
                    <div className="space-y-6">
                        <SectionHeader
                            icon={BookOpen}
                            title="Basic Information"
                            subtitle="Program name and type are required"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FloatingInput
                                label="Program Name"
                                name="program_name"
                                value={formData.program_name}
                                onChange={onChange}
                                error={errors.program_name}
                                required
                                maxLength={200}
                            />
                            <FloatingSelect
                                label="Program Type"
                                name="program_type"
                                value={formData.program_type}
                                onChange={onChange}
                                options={TYPE_SELECT_OPTIONS}
                                error={errors.program_type}
                                required
                            />
                        </div>
                        <FloatingTextarea
                            label="Description"
                            name="program_description"
                            value={formData.program_description ?? ""}
                            onChange={onChange}
                            error={errors.program_description}
                            rows={4}
                            maxLength={3000}
                        />
                    </div>
                )}

                {/* Step 2: Training Details */}
                {step === 2 && (
                    <div className="space-y-6">
                        <SectionHeader
                            icon={User}
                            title="Training Details"
                            subtitle="Trainer information and session configuration"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FloatingInput
                                label="Trainer Name"
                                name="trainer_name"
                                value={formData.trainer_name ?? ""}
                                onChange={onChange}
                                error={errors.trainer_name}
                                maxLength={200}
                            />
                            <FloatingInput
                                label="Trainer Organization"
                                name="trainer_organization"
                                value={formData.trainer_organization ?? ""}
                                onChange={onChange}
                                error={errors.trainer_organization}
                                maxLength={200}
                            />
                            <FloatingInput
                                label="Total Sessions"
                                name="total_sessions"
                                type="number"
                                value={formData.total_sessions ?? ""}
                                onChange={onChange}
                                error={errors.total_sessions}
                            />
                            <FloatingInput
                                label="Session Duration (hours)"
                                name="session_duration_hours"
                                type="number"
                                value={formData.session_duration_hours ?? ""}
                                onChange={onChange}
                                error={errors.session_duration_hours}
                            />
                        </div>
                    </div>
                )}

                {/* Step 3: Schedule & Targeting */}
                {step === 3 && (
                    <div className="space-y-6">
                        <SectionHeader
                            icon={Calendar}
                            title="Schedule & Targeting"
                            subtitle="Program dates, enrollment limits, and target audience"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                            <FloatingInput
                                label="Start Date"
                                name="start_date"
                                type="date"
                                value={formData.start_date ?? ""}
                                onChange={onChange}
                                error={errors.start_date}
                            />
                            <FloatingInput
                                label="End Date"
                                name="end_date"
                                type="date"
                                value={formData.end_date ?? ""}
                                onChange={onChange}
                                error={errors.end_date}
                            />
                            <FloatingInput
                                label="Max Enrollment"
                                name="max_enrollment"
                                type="number"
                                value={formData.max_enrollment ?? ""}
                                onChange={onChange}
                                error={errors.max_enrollment}
                            />
                            <FloatingInput
                                label="Enrollment Deadline"
                                name="enrollment_deadline"
                                type="date"
                                value={formData.enrollment_deadline ?? ""}
                                onChange={onChange}
                                error={errors.enrollment_deadline}
                            />
                            <FloatingSelect
                                label="Target Passout Year"
                                name="target_passout_year"
                                value={formData.target_passout_year ?? ""}
                                onChange={onChange}
                                options={PASSOUT_YEAR_OPTIONS}
                                error={errors.target_passout_year}
                            />
                        </div>

                        {/* Department Multi-select */}
                        {departments.length > 0 && (
                            <div>
                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 block">
                                    Target Departments
                                </span>
                                <div className="flex flex-wrap gap-2">
                                    {departments.map((dept) => {
                                        const selected = (formData.target_dept_ids ?? []).includes(dept.dept_id);
                                        return (
                                            <button
                                                key={dept.dept_id}
                                                type="button"
                                                onClick={() => onDeptToggle(dept.dept_id)}
                                                className={`inline-flex items-center gap-1.5 px-3 py-2 min-h-[44px] rounded-lg text-xs font-medium border transition-colors ${
                                                    selected
                                                        ? "border-blue-300 dark:border-blue-700 bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400"
                                                        : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800"
                                                }`}
                                            >
                                                {selected && <Check className="h-3 w-3" />}
                                                {dept.dept_name}
                                            </button>
                                        );
                                    })}
                                </div>
                                {errors.target_dept_ids && (
                                    <p className="mt-1 text-xs text-red-500">{errors.target_dept_ids}</p>
                                )}
                            </div>
                        )}
                    </div>
                )}

                {/* ── Navigation Buttons ── */}
                <div className="flex items-center justify-between gap-3 pt-6 mt-6 border-t border-gray-100 dark:border-gray-800">
                    <div>
                        {step > 1 && (
                            <button
                                type="button"
                                onClick={handleBack}
                                className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Back
                            </button>
                        )}
                    </div>
                    <div className="flex items-center gap-3">
                        <button
                            type="button"
                            onClick={handleCancel}
                            disabled={loading}
                            className="px-5 py-2.5 min-h-[44px] rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-40"
                        >
                            Cancel
                        </button>
                        {step < 3 ? (
                            <button
                                type="button"
                                onClick={handleNext}
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 min-h-[44px] rounded-xl text-sm font-medium transition shadow-sm shadow-blue-200 dark:shadow-none"
                            >
                                Next
                                <ChevronRight className="h-4 w-4" />
                            </button>
                        ) : (
                            <SubmitButton loading={loading} mode={mode} shouldReduce={shouldReduce} onClick={handleSubmit} />
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TrainingForm;
