import { type ChangeEvent, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Building2, Hash, Clock, Loader2, Lightbulb } from "lucide-react";
import { DEPT_TYPES } from "@/validators/DepartmentSchema";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingSelect from "@/components/ui/FloatingSelect";

// ========================
// TYPES
// ========================

interface DepartmentFormData {
    deptName: string;
    deptCode: string;
    deptType: string;
    programDurationYears: number;
    totalSemesters: number;
}

type FormErrors = Partial<Record<keyof DepartmentFormData, string>>;

interface DepartmentFormProps {
    mode: "create" | "edit";
    formData: DepartmentFormData;
    errors: FormErrors;
    loading: boolean;
    fetchedDeptName?: string;
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => void;
    handleSubmit: (e: FormEvent<HTMLFormElement>) => void | Promise<void>;
    handleCancel: () => void;
}

// ========================
// CONSTANTS
// ========================

const DEPT_TYPE_OPTIONS = DEPT_TYPES.map((t) => ({
    value: t,
    label: t.charAt(0).toUpperCase() + t.slice(1),
}));

// ========================
// SUB-COMPONENTS
// ========================

interface SectionHeaderProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    subtitle: string;
}

const SectionHeader = ({ icon: Icon, title, subtitle }: SectionHeaderProps) => (
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

// ========================
// HELPERS
// ========================

const getButtonText = (loading: boolean, mode: "create" | "edit") => {
    if (loading) return mode === "create" ? "Creating..." : "Saving...";
    return mode === "create" ? "Create Department" : "Save Changes";
};

// ========================
// COMPONENT
// ========================

const DepartmentForm = ({
    mode,
    formData,
    errors,
    loading,
    fetchedDeptName,
    handleChange,
    handleSubmit,
    handleCancel,
}: DepartmentFormProps) => {
    const shouldReduce = useReducedMotion();

    // Dynamic semester/year hint
    const semYearHint =
        formData.programDurationYears && formData.totalSemesters
            ? `${formData.totalSemesters} semesters = ${formData.programDurationYears} years × ${Math.round(formData.totalSemesters / formData.programDurationYears)} semesters/year`
            : null;

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            {/* ── Edit-mode context bar ── */}
            {mode === "edit" && (
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">
                            Editing Department
                        </p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                            {fetchedDeptName || "Loading…"}
                        </p>
                    </div>
                </div>
            )}

            {/* ── Form body ── */}
            <form onSubmit={handleSubmit} className="p-6 space-y-8">

                {/* Section 1 — Department Identity */}
                <div>
                    <SectionHeader
                        icon={Building2}
                        title="Department Identity"
                        subtitle="Core details that identify this department in the system"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FloatingInput
                            label="Department Name"
                            name="deptName"
                            value={formData.deptName}
                            onChange={handleChange}
                            error={errors.deptName}
                            required
                            maxLength={150}
                            placeholder="e.g. Computer Engineering"
                        />
                        <div>
                            <FloatingInput
                                label="Department Code"
                                name="deptCode"
                                value={formData.deptCode}
                                onChange={handleChange}
                                error={errors.deptCode}
                                maxLength={20}
                                placeholder="e.g. CE"
                            />
                            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1 ml-1">
                                Short code like CE, IT, MECH — auto-uppercased
                            </p>
                        </div>
                    </div>
                </div>

                {/* Section 2 — Program Configuration */}
                <div>
                    <SectionHeader
                        icon={Hash}
                        title="Classification"
                        subtitle="Department type and categorization"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FloatingSelect
                            label="Department Type"
                            name="deptType"
                            value={formData.deptType}
                            onChange={handleChange}
                            options={DEPT_TYPE_OPTIONS}
                            error={errors.deptType}
                        />
                    </div>
                </div>

                {/* Section 3 — Duration & Semesters */}
                <div>
                    <SectionHeader
                        icon={Clock}
                        title="Academic Structure"
                        subtitle="Program duration and semester configuration"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FloatingInput
                            label="Program Duration (Years)"
                            name="programDurationYears"
                            type="number"
                            value={String(formData.programDurationYears)}
                            onChange={handleChange}
                            error={errors.programDurationYears}
                        />
                        <FloatingInput
                            label="Total Semesters"
                            name="totalSemesters"
                            type="number"
                            value={String(formData.totalSemesters)}
                            onChange={handleChange}
                            error={errors.totalSemesters}
                        />
                    </div>

                    {/* Semester/Year hint */}
                    {semYearHint && (
                        <div className="mt-4 flex items-center gap-2.5 px-4 py-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-100 dark:border-blue-800 rounded-lg">
                            <Lightbulb className="h-4 w-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                            <p className="text-sm text-blue-700 dark:text-blue-300 font-medium">
                                {semYearHint}
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Actions ── */}
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                    {shouldReduce ? (
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl text-sm font-medium transition shadow-sm shadow-blue-200 dark:shadow-none disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {getButtonText(loading, mode)}
                        </button>
                    ) : (
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl text-sm font-medium transition shadow-sm shadow-blue-200 dark:shadow-none disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {getButtonText(loading, mode)}
                        </motion.button>
                    )}
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default DepartmentForm;
