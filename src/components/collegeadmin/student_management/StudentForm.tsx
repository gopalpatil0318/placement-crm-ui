import { useState, useEffect, useMemo, type ChangeEvent, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { User, Building2, Lock, Loader2, Eye, EyeOff, Wand2, AlertCircle } from "lucide-react";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingSelect from "@/components/ui/FloatingSelect";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";

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
    current_year: number;
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

const YEAR_OPTIONS = [
    { value: "1", label: "1st Year" },
    { value: "2", label: "2nd Year" },
    { value: "3", label: "3rd Year" },
    { value: "4", label: "4th Year" },
    { value: "5", label: "5th Year" },
    { value: "6", label: "6th Year" },
];

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
    const [departments, setDepartments] = useState<{ dept_id: string; dept_name: string }[]>([]);
    const [deptLoadError, setDeptLoadError] = useState(false);
    const isEdit = mode === "edit";
    const strength = mode === "create" ? getPasswordStrength(formData.student_password) : null;

    // Fetch departments
    useEffect(() => {
        const fetchDepts = async () => {
            try {
                setDeptLoadError(false);
                const res = await CollegeAdminService.getDepartments({ is_active: true, limit: 100 });
                const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
                setDepartments(list);
            } catch {
                setDeptLoadError(true);
            }
        };
        fetchDepts();
    }, []);

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
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
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
                            label="Current Year"
                            name="current_year"
                            value={String(formData.current_year)}
                            onChange={handleChange}
                            options={YEAR_OPTIONS}
                            error={errors.current_year}
                            required
                        />
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
                                                className="text-blue-400 hover:text-blue-600 dark:hover:text-blue-300 transition"
                                                tabIndex={-1}
                                            >
                                                <Wand2 className="h-4 w-4" />
                                            </button>
                                        )}
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword((p) => !p)}
                                            className="text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition"
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
                )}

                {/* Action Buttons */}
                <div className="flex items-center gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    {shouldReduce ? (
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 px-8 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-400 text-white rounded-xl text-sm font-semibold transition shadow-sm disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {loading
                                ? isEdit ? "Saving..." : "Registering..."
                                : isEdit ? "Save Changes" : "Register Student"}
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
                            {loading
                                ? isEdit ? "Saving..." : "Registering..."
                                : isEdit ? "Save Changes" : "Register Student"}
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
            </form>
        </div>
    );
};

export default StudentForm;
