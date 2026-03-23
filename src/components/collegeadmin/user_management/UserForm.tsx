import { useState, type ChangeEvent, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { User, Shield, Lock, Loader2, Eye, EyeOff, Lightbulb } from "lucide-react";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingSelect from "@/components/ui/FloatingSelect";

// ========================
// TYPES
// ========================

interface UserFormData {
    userName: string;
    userEmail: string;
    userPassword: string;
    userRole: string;
    deptId: string | null;
}

type FormErrors = Partial<Record<keyof UserFormData, string>>;

interface Department {
    dept_id: string;
    dept_name: string;
}

interface UserFormProps {
    mode: "create" | "edit";
    formData: UserFormData;
    errors: FormErrors;
    loading: boolean;
    departments: Department[];
    fetchingDepts?: boolean;
    fetchedUserName?: string;
    isCollegeAdmin?: boolean;
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => void;
    handleSubmit: (e: FormEvent<HTMLFormElement>) => void | Promise<void>;
    handleCancel: () => void;
}

// ========================
// CONSTANTS
// ========================

const ROLE_OPTIONS = [
    { value: "tpo", label: "TPO (Training & Placement Officer)" },
    { value: "tpc", label: "TPC (Training & Placement Coordinator)" },
    { value: "hod", label: "HOD (Head of Department)" },
    { value: "teacher", label: "Teacher" },
];

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
// COMPONENT
// ========================

const UserForm = ({
    mode,
    formData,
    errors,
    loading,
    departments,
    fetchingDepts,
    fetchedUserName,
    isCollegeAdmin,
    handleChange,
    handleSubmit,
    handleCancel,
}: UserFormProps) => {
    const shouldReduce = useReducedMotion();
    const [showPassword, setShowPassword] = useState(false);
    const isEdit = mode === "edit";
    const strength = mode === "create" ? getPasswordStrength(formData.userPassword) : null;

    const deptOptions = departments.map((d) => ({
        value: d.dept_id,
        label: d.dept_name,
    }));

    // College admin read-only state
    if (isEdit && isCollegeAdmin) {
        return (
            <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8">
                <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-xl p-4 mb-6">
                    <div className="flex items-start gap-3">
                        <Shield className="h-5 w-5 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">
                                Protected Account
                            </p>
                            <p className="text-xs text-amber-700 dark:text-amber-300 mt-0.5">
                                College admin accounts cannot be modified. Only the system administrator can change college admin details.
                            </p>
                        </div>
                    </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Name</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{formData.userName}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Email</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mt-1">{formData.userEmail}</p>
                    </div>
                    <div>
                        <p className="text-xs font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">Role</p>
                        <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300 mt-1">
                            College Admin
                        </span>
                    </div>
                </div>
                <div className="mt-8 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={handleCancel}
                        className="px-6 py-2.5 rounded-xl font-medium text-sm border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 transition"
                    >
                        Back to Users
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
            {/* Edit-mode context bar */}
            {isEdit && fetchedUserName && (
                <div className="px-8 py-3 bg-blue-50 dark:bg-blue-900/20 border-b border-blue-100 dark:border-blue-800 flex items-center gap-2">
                    <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    <span className="text-sm text-blue-700 dark:text-blue-300">
                        Editing <span className="font-semibold">{fetchedUserName}</span>
                    </span>
                </div>
            )}

            <form onSubmit={handleSubmit} className="p-8 space-y-8">
                {/* Identity Section */}
                <section>
                    <SectionHeader
                        icon={User}
                        title="Identity"
                        subtitle="Basic user information"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FloatingInput
                            label="Full Name"
                            name="userName"
                            value={formData.userName}
                            onChange={handleChange}
                            error={errors.userName}
                            required
                            maxLength={100}
                            placeholder="e.g. Prof. Suresh Kumar"
                        />
                        <FloatingInput
                            label="Email Address"
                            name="userEmail"
                            value={formData.userEmail}
                            onChange={handleChange}
                            error={errors.userEmail}
                            required
                            type="email"
                            maxLength={255}
                            placeholder="user@college.edu"
                        />
                    </div>
                </section>

                {/* Role & Department Section */}
                <section>
                    <SectionHeader
                        icon={Shield}
                        title="Role & Department"
                        subtitle="Assign role and department affiliation"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <FloatingSelect
                            label="User Role"
                            name="userRole"
                            value={formData.userRole}
                            onChange={handleChange}
                            options={ROLE_OPTIONS}
                            error={errors.userRole}
                            required
                        />
                        <FloatingSelect
                            label="Department"
                            name="deptId"
                            value={formData.deptId || ""}
                            onChange={handleChange}
                            options={[{ value: "", label: "No Department" }, ...deptOptions]}
                            disabled={fetchingDepts}
                        />
                    </div>
                    {(formData.userRole === "hod" || formData.userRole === "teacher") && (
                        <div className="mt-3 flex items-start gap-2 text-xs text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded-lg">
                            <Lightbulb className="h-3.5 w-3.5 mt-0.5 flex-shrink-0" />
                            Assigning a department is recommended for {formData.userRole === "hod" ? "HOD" : "Teacher"} roles.
                        </div>
                    )}
                </section>

                {/* Password Section (create mode only) */}
                {mode === "create" && (
                    <section>
                        <SectionHeader
                            icon={Lock}
                            title="Security"
                            subtitle="Set a strong password for the account"
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <div className="relative">
                                    <FloatingInput
                                        label="Password"
                                        name="userPassword"
                                        value={formData.userPassword}
                                        onChange={handleChange}
                                        error={errors.userPassword}
                                        required
                                        type={showPassword ? "text" : "password"}
                                        maxLength={128}
                                        placeholder="Min 8 characters"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword((prev) => !prev)}
                                        className="absolute right-3 top-[38px] text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition"
                                        tabIndex={-1}
                                    >
                                        {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                {strength && formData.userPassword && (
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
                                ? isEdit ? "Saving..." : "Creating..."
                                : isEdit ? "Save Changes" : "Create User"}
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
                                ? isEdit ? "Saving..." : "Creating..."
                                : isEdit ? "Save Changes" : "Create User"}
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

export default UserForm;
