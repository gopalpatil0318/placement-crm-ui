import { useState, useCallback } from "react";
import { Eye, EyeOff, Lock, ShieldCheck, Check, X, Loader2 } from "lucide-react";
import { showToast } from "@/utils/ToastUtils";

// ========================
// TYPES
// ========================

interface ChangePasswordFormProps {
    onSubmit: (payload: {
        current_password: string;
        new_password: string;
        confirm_password: string;
    }) => Promise<{ message?: string }>;
}

// ========================
// HELPERS
// ========================

function getPasswordStrength(password: string) {
    if (!password) return { label: "", barColor: "", textColor: "", width: "0%" };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2)
        return { label: "Weak", barColor: "bg-red-500", textColor: "text-red-600 dark:text-red-400", width: "33%" };
    if (score <= 4)
        return { label: "Medium", barColor: "bg-amber-500", textColor: "text-amber-600 dark:text-amber-400", width: "66%" };
    return { label: "Strong", barColor: "bg-emerald-500", textColor: "text-emerald-600 dark:text-emerald-400", width: "100%" };
}

const PASSWORD_RULES = [
    { key: "length", label: "At least 8 characters", test: (p: string) => p.length >= 8 },
    { key: "upper", label: "One uppercase letter", test: (p: string) => /[A-Z]/.test(p) },
    { key: "lower", label: "One lowercase letter", test: (p: string) => /[a-z]/.test(p) },
    { key: "number", label: "One number", test: (p: string) => /\d/.test(p) },
] as const;

// ========================
// SUB-COMPONENTS
// ========================

const PasswordField = ({
    label,
    value,
    onChange,
    show,
    onToggle,
    disabled,
    error,
    placeholder,
    ariaLabel,
}: {
    label: string;
    value: string;
    onChange: (v: string) => void;
    show: boolean;
    onToggle: () => void;
    disabled: boolean;
    error?: string;
    placeholder: string;
    ariaLabel: string;
}) => (
    <div>
        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            {label} <span className="text-red-500">*</span>
        </label>
        <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
            <input
                type={show ? "text" : "password"}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                required
                disabled={disabled}
                className={`w-full pl-10 pr-10 rounded-lg border py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400 transition disabled:opacity-50 disabled:cursor-not-allowed ${
                    error
                        ? "border-red-500 dark:border-red-400"
                        : "border-gray-300 dark:border-gray-600"
                }`}
            />
            <button
                type="button"
                onClick={onToggle}
                tabIndex={-1}
                aria-label={ariaLabel}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition"
            >
                {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
        </div>
        {error && <p className="text-xs text-red-500 dark:text-red-400 mt-1">{error}</p>}
    </div>
);

// ========================
// COMPONENT
// ========================

export default function ChangePasswordForm({ onSubmit }: ChangePasswordFormProps) {
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [loading, setLoading] = useState(false);
    const [currentPasswordError, setCurrentPasswordError] = useState("");

    const strength = getPasswordStrength(newPassword);
    const passwordsMatch = !!(newPassword && confirmPassword && newPassword === confirmPassword);
    const passwordsMismatch = !!(confirmPassword && newPassword !== confirmPassword);
    const allRulesPass = PASSWORD_RULES.every((r) => r.test(newPassword));

    const handleSubmit = useCallback(
        async (e: React.FormEvent) => {
            e.preventDefault();
            setCurrentPasswordError("");

            if (!allRulesPass) {
                showToast({
                    type: "warning",
                    title: "Validation",
                    description: "Password does not meet all requirements",
                });
                return;
            }
            if (newPassword !== confirmPassword) {
                showToast({
                    type: "warning",
                    title: "Validation",
                    description: "Passwords do not match",
                });
                return;
            }

            setLoading(true);
            try {
                const response = await onSubmit({
                    current_password: currentPassword,
                    new_password: newPassword,
                    confirm_password: confirmPassword,
                });

                showToast({
                    type: "success",
                    title: "Success",
                    description: response?.message || "Password changed successfully",
                });

                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Something went wrong";
                if (msg.toLowerCase().includes("current password")) {
                    setCurrentPasswordError(msg);
                } else {
                    showToast({ type: "error", title: "Error", description: msg });
                }
            } finally {
                setLoading(false);
            }
        },
        [currentPassword, newPassword, confirmPassword, allRulesPass, onSubmit]
    );

    return (
        <div className="max-w-lg">
            <div className="p-8 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <div className="h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900/20 flex items-center justify-center">
                        <ShieldCheck className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                            Update Your Password
                        </h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                            Ensure your account stays secure
                        </p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-5">
                    {/* Current Password */}
                    <PasswordField
                        label="Current Password"
                        value={currentPassword}
                        onChange={(v) => {
                            setCurrentPassword(v);
                            setCurrentPasswordError("");
                        }}
                        show={showCurrent}
                        onToggle={() => setShowCurrent((p) => !p)}
                        disabled={loading}
                        error={currentPasswordError}
                        placeholder="Enter current password"
                        ariaLabel={showCurrent ? "Hide current password" : "Show current password"}
                    />

                    {/* New Password */}
                    <div>
                        <PasswordField
                            label="New Password"
                            value={newPassword}
                            onChange={setNewPassword}
                            show={showNew}
                            onToggle={() => setShowNew((p) => !p)}
                            disabled={loading}
                            placeholder="Enter new password"
                            ariaLabel={showNew ? "Hide new password" : "Show new password"}
                        />

                        {/* Strength bar */}
                        {newPassword && (
                            <div className="mt-2.5">
                                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                                    <div
                                        className={`h-1.5 rounded-full transition-all duration-300 ${strength.barColor}`}
                                        style={{ width: strength.width }}
                                    />
                                </div>
                                <p className={`text-xs mt-1 font-medium ${strength.textColor}`}>
                                    {strength.label}
                                </p>
                            </div>
                        )}

                        {/* Requirements checklist */}
                        <div className="mt-3 space-y-1">
                            {PASSWORD_RULES.map((rule) => {
                                const passes = newPassword ? rule.test(newPassword) : false;
                                return (
                                    <div key={rule.key} className="flex items-center gap-2">
                                        {newPassword ? (
                                            passes ? (
                                                <Check className="h-3.5 w-3.5 text-emerald-500 dark:text-emerald-400 flex-shrink-0" />
                                            ) : (
                                                <X className="h-3.5 w-3.5 text-red-400 dark:text-red-500 flex-shrink-0" />
                                            )
                                        ) : (
                                            <div className="h-3.5 w-3.5 rounded-full border border-gray-300 dark:border-gray-600 flex-shrink-0" />
                                        )}
                                        <span
                                            className={`text-xs ${
                                                !newPassword
                                                    ? "text-gray-400 dark:text-gray-500"
                                                    : passes
                                                      ? "text-emerald-600 dark:text-emerald-400"
                                                      : "text-red-500 dark:text-red-400"
                                            }`}
                                        >
                                            {rule.label}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    </div>

                    {/* Confirm Password */}
                    <div>
                        <PasswordField
                            label="Confirm Password"
                            value={confirmPassword}
                            onChange={setConfirmPassword}
                            show={showConfirm}
                            onToggle={() => setShowConfirm((p) => !p)}
                            disabled={loading}
                            placeholder="Confirm new password"
                            ariaLabel={showConfirm ? "Hide confirm password" : "Show confirm password"}
                        />
                        {passwordsMismatch && (
                            <p className="text-xs text-red-500 dark:text-red-400 mt-1">
                                Passwords do not match
                            </p>
                        )}
                        {passwordsMatch && (
                            <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                                <Check className="h-3 w-3" />
                                Passwords match
                            </p>
                        )}
                    </div>

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={loading || passwordsMismatch || !allRulesPass}
                        className="w-full inline-flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin" />
                                Updating...
                            </>
                        ) : (
                            "Change Password"
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
}
