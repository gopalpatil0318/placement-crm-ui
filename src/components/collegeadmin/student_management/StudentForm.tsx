import { useState, useEffect, useMemo, type ChangeEvent, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import { User, Building2, Lock, Loader2, Eye, EyeOff, Wand2, AlertCircle } from "lucide-react";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingSelect from "@/components/ui/FloatingSelect";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

interface StudentFormData {
    first_name: string;
    middle_name: string;
    last_name: string;
    student_email: string;
    student_password: string;
    dept_name: string;
    student_passout_year: number;
}

type FormErrors = Partial<Record<keyof StudentFormData, string>>;

interface StudentFormProps {
    mode: "create" | "edit";
    formData: StudentFormData;
    errors: FormErrors;
    loading: boolean;
    fetchedStudentName?: string;
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => void;
    handleSubmit: (e: FormEvent<HTMLFormElement>) => void | Promise<void>;
    handleCancel: () => void;
}

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

function getPasswordStrength(password: string): { label: string; color: string; barColor: string; width: string } {
    if (!password) return { label: "", color: "", barColor: "", width: "0%" };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { label: "Weak", color: "text-red-600 dark:text-red-400", barColor: "bg-red-500", width: "33%" };
    if (score <= 4) return { label: "Medium", color: "text-amber-600 dark:text-amber-400", barColor: "bg-amber-500", width: "66%" };
    return { label: "Strong", color: "text-emerald-600 dark:text-emerald-400", barColor: "bg-emerald-500", width: "100%" };
}

// ========================
// CONSTANTS
// ========================

// ========================
// HELPERS
// ========================

function getButtonLabel(isEdit: boolean, isLoading: boolean): string {
    if (isLoading) return isEdit ? "Saving..." : "Registering...";
    return isEdit ? "Save Changes" : "Register Student";
}

// ========================
// SUB-COMPONENT: Password Section
// ========================

interface PasswordSectionProps {
    formData: { student_password: string };
    errors: Partial<Record<string, string>>;
    showPassword: boolean;
    setShowPassword: (fn: (prev: boolean) => boolean) => void;
    handleChange: StudentFormProps["handleChange"];
    strength: ReturnType<typeof getPasswordStrength> | null;
    defaultPassword: string;
    handleGeneratePassword: () => void;
}

function PasswordSection({
    formData,
    errors,
    showPassword,
    setShowPassword,
    handleChange,
    strength,
    defaultPassword,
    handleGeneratePassword,
}: Readonly<PasswordSectionProps>) {
    return (
        <section>
            <SectionHeader
                icon={Lock}
                title="Security"
                subtitle="Set a password for the student account"
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className="relative">
                        <FloatingInput
                            label="Password"
                            name="student_password"
                            value={formData.student_password}
                            onChange={handleChange}
                            error={errors.student_password}
                            required
                            type={showPassword ? "text" : "password"}
                            maxLength={128}
                            placeholder="Min 8 characters"
                        />
                        <div className="absolute right-3 top-[38px] flex items-center gap-1">
                            {defaultPassword && (
                                <button
                                    type="button"
                                    onClick={handleGeneratePassword}
                                    title={`Generate: ${defaultPassword}`}
                                    aria-label="Generate default password"
                                    className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition"
                                    tabIndex={-1}
                                >
                                    <Wand2 className="h-4 w-4" />
                                </button>
                            )}
                            <button
                                type="button"
                                onClick={() => setShowPassword((p) => !p)}
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:text-gray-300 transition"
                                tabIndex={-1}
                            >
                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </button>
                        </div>
                    </div>
                    {strength && formData.student_password && (
                        <div className="mt-2">
                            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                <div
                                    className={`h-1.5 rounded-full transition-all duration-300 ${strength.barColor}`}
                                    style={{ width: strength.width }}
                                />
                            </div>
                            <p className={`text-xs mt-1 font-medium ${strength.color}`}>
                                {strength.label}
                            </p>
                        </div>
                    )}
                    {defaultPassword && (
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                            Suggested: <code className="bg-gray-100 dark:bg-gray-800 px-1.5 py-0.5 rounded text-xs">{defaultPassword}</code>
                        </p>
                    )}
                </div>
            </div>
        </section>
    );
}

// ========================
// COMPONENT
// ========================

const StudentForm = ({
    mode,
    formData,
    errors,
    loading,
    fetchedStudentName,
    handleChange,
    handleSubmit,
    handleCancel,
}: StudentFormProps) => {
    const shouldReduce = useReducedMotion();
    const [showPassword, setShowPassword] = useState(false);
    const isEdit = mode === "edit";
    const strength = mode === "create" ? getPasswordStrength(formData.student_password) : null;

    // Fetch departments via React Query (cached across navigations)
    const { data: deptData, isError: deptLoadError } = useQuery({
        queryKey: queryKeys.departments.all({ status: "active" }),
        queryFn: () => CollegeAdminService.getDepartments({ is_active: true, limit: 100 }),
    });

    const departments: { dept_id: string; dept_name: string }[] = useMemo(() => {
        const raw = deptData?.data || deptData;
        return Array.isArray(raw) ? raw : [];
    }, [deptData]);

    // Unsaved changes warning
    const [initialData] = useState(() => JSON.stringify(formData));
    const isDirty = useMemo(
        () => JSON.stringify(formData) !== initialData,
        [formData, initialData]
    );

    useEffect(() => {
        if (!isDirty) return;
        const handler = (e: BeforeUnloadEvent) => {
            e.preventDefault();
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

    const deptOptions = useMemo(
        () => departments.map((d) => ({ value: d.dept_name, label: d.dept_name })),
        [departments]
    );

    const passoutYearOptions = useMemo(
        () => Array.from({ length: 21 }, (_, i) => ({
            value: String(2020 + i),
            label: String(2020 + i),
        })),
        []
    );

    // Auto-generate password hint
    const defaultPassword = formData.first_name && formData.student_passout_year
        ? `${formData.first_name.toLowerCase()}@${formData.student_passout_year}`
        : "";

    const handleGeneratePassword = () => {
        if (!defaultPassword) return;
        const event = {
            target: { name: "student_password", value: defaultPassword },
        } as ChangeEvent<HTMLInputElement>;
        handleChange(event);
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Edit-mode context bar */}
            {isEdit && fetchedStudentName && (
                <div className="px-8 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                        Editing <span className="font-semibold">{fetchedStudentName}</span>
                    </span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Identity Section */}
                <section>
                    <SectionHeader
                        icon={User}
                        title="Personal Information"
                        subtitle="Student's basic identity details"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <FloatingInput
                            label="First Name"
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            error={errors.first_name}
                            required
                            maxLength={100}
                            placeholder="e.g. Rohan"
                        />
                        <FloatingInput
                            label="Middle Name"
                            name="middle_name"
                            value={formData.middle_name}
                            onChange={handleChange}
                            maxLength={100}
                            placeholder="Optional"
                        />
                        <FloatingInput
                            label="Last Name"
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            error={errors.last_name}
                            required
                            maxLength={100}
                            placeholder="e.g. Sharma"
                        />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                        <FloatingInput
                            label="Student Email"
                            name="student_email"
                            value={formData.student_email}
                            onChange={handleChange}
                            error={errors.student_email}
                            required
                            type="email"
                            maxLength={255}
                            placeholder="student@college.ac.in"
                        />
                    </div>
                </section>

                {/* Department & Academic Section */}
                <section>
                    <SectionHeader
                        icon={Building2}
                        title="Academic Details"
                        subtitle="Department and year information"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <FloatingSelect
                                label="Department"
                                name="dept_name"
                                value={formData.dept_name}
                                onChange={handleChange}
                                options={[{ value: "", label: deptLoadError ? "Failed to load" : "Select Department" }, ...deptOptions]}
                                error={errors.dept_name}
                                required
                            />
                            {deptLoadError && (
                                <p className="mt-1 flex items-center gap-1 text-xs text-red-500 dark:text-red-400">
                                    <AlertCircle className="h-3 w-3" />
                                    Failed to load departments
                                </p>
                            )}
                        </div>
                        <FloatingSelect
                            label="Passout Year"
                            name="student_passout_year"
                            value={String(formData.student_passout_year)}
                            onChange={handleChange}
                            options={passoutYearOptions}
                            error={errors.student_passout_year}
                            required
                        />
                    </div>
                </section>

                {/* Password Section (create mode only) */}
                {mode === "create" && (
                    <PasswordSection
                        formData={formData}
                        errors={errors}
                        showPassword={showPassword}
                        setShowPassword={setShowPassword}
                        handleChange={handleChange}
                        strength={strength}
                        defaultPassword={defaultPassword}
                        handleGeneratePassword={handleGeneratePassword}
                    />
                )}

                {/* Action Buttons — sticky on mobile */}
                <div className="hidden md:flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    {shouldReduce ? (
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold transition shadow-sm disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {getButtonLabel(isEdit, loading)}
                        </button>
                    ) : (
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            className="inline-flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold transition shadow-sm disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {getButtonLabel(isEdit, loading)}
                        </motion.button>
                    )}
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-2.5 rounded-xl font-medium text-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                        Cancel
                    </button>
                </div>

                {/* Mobile sticky action bar */}
                <div className="fixed bottom-0 left-0 right-0 z-30 md:hidden bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 px-4 py-3 pb-safe flex items-center gap-3">
                    <button
                        type="submit"
                        disabled={loading}
                        className="flex-1 inline-flex items-center justify-center gap-2 py-3 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold transition shadow-sm disabled:cursor-not-allowed min-h-[48px]"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {getButtonLabel(isEdit, loading)}
                    </button>
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-5 py-3 rounded-xl font-medium text-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition min-h-[48px]"
                    >
                        Cancel
                    </button>
                </div>
                {/* Spacer for mobile sticky bar */}
                <div className="h-20 md:hidden" />
            </form>
        </div>
    );
};

export default StudentForm;
