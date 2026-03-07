import type React from "react"
import { useState, useCallback } from "react"
import { Eye, EyeOff, Lock, ShieldCheck } from "lucide-react"
import DashboardLayout from "@/components/collegeadmin/DashboardLayout"
import PageHeader from "@/components/collegeadmin/PageHeader"
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services"
import { showToast } from "@/utils/ToastUtils"

function getPasswordStrength(password: string): { label: string; color: string; width: string } {
    if (!password) return { label: "", color: "", width: "0%" };
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { label: "Weak", color: "bg-red-500", width: "33%" };
    if (score <= 4) return { label: "Medium", color: "bg-yellow-500", width: "66%" };
    return { label: "Strong", color: "bg-green-500", width: "100%" };
}

export default function ChangePassword() {
    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showCurrent, setShowCurrent] = useState(false)
    const [showNew, setShowNew] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [loading, setLoading] = useState(false)
    const [currentPasswordError, setCurrentPasswordError] = useState("")

    const strength = getPasswordStrength(newPassword);
    const passwordsMatch = newPassword && confirmPassword && newPassword === confirmPassword;
    const passwordsMismatch = confirmPassword && newPassword !== confirmPassword;

    const breadcrumbs = [
        { label: "Dashboard", path: "/college/dashboard" },
        { label: "Settings" },
        { label: "Change Password", active: true },
    ]

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        setCurrentPasswordError("")

        // Client-side validations
        if (newPassword.length < 8) {
            showToast({ type: "warning", title: "Validation", description: "Password must be at least 8 characters" });
            return;
        }
        if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(newPassword)) {
            showToast({ type: "warning", title: "Validation", description: "Password must contain uppercase, lowercase, and numeric characters" });
            return;
        }
        if (newPassword !== confirmPassword) {
            showToast({ type: "warning", title: "Validation", description: "Passwords do not match" });
            return;
        }

        setLoading(true)
        try {
            const response = await CollegeAdminService.changePassword({
                current_password: currentPassword,
                new_password: newPassword,
                confirm_password: confirmPassword,
            })

            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Password changed successfully",
            })

            // Reset form
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Something went wrong"
            if (msg.toLowerCase().includes("current password")) {
                setCurrentPasswordError(msg)
            } else {
                showToast({ type: "error", title: "Error", description: msg })
            }
        } finally {
            setLoading(false)
        }
    }, [currentPassword, newPassword, confirmPassword])

    return (
        <DashboardLayout>
            <div className="space-y-8">
                <PageHeader title="Change Password" breadcrumbs={breadcrumbs} />

                <div className="max-w-lg">
                    <div className="p-8 bg-white rounded-xl border">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="h-10 w-10 rounded-lg bg-blue-100 flex items-center justify-center">
                                <ShieldCheck className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                                <h2 className="text-lg font-semibold text-gray-800">Update Your Password</h2>
                                <p className="text-sm text-gray-500">Ensure your account stays secure</p>
                            </div>
                        </div>

                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Current Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Current Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type={showCurrent ? "text" : "password"}
                                        value={currentPassword}
                                        onChange={(e) => { setCurrentPassword(e.target.value); setCurrentPasswordError(""); }}
                                        placeholder="Enter current password"
                                        required
                                        className={`w-full pl-10 pr-10 rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${currentPasswordError ? "border-red-500" : "border-gray-300"}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowCurrent(!showCurrent)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showCurrent ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {currentPasswordError && (
                                    <p className="text-xs text-red-500 mt-1">{currentPasswordError}</p>
                                )}
                            </div>

                            {/* New Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    New Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type={showNew ? "text" : "password"}
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        placeholder="Enter new password"
                                        required
                                        className="w-full pl-10 pr-10 rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNew(!showNew)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showNew ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {/* Strength indicator */}
                                {newPassword && (
                                    <div className="mt-2">
                                        <div className="w-full bg-gray-200 rounded-full h-1.5">
                                            <div className={`h-1.5 rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
                                        </div>
                                        <p className={`text-xs mt-1 ${strength.color.replace("bg-", "text-")}`}>{strength.label}</p>
                                    </div>
                                )}
                                <p className="text-xs text-gray-400 mt-1">Must contain at least 1 uppercase, 1 lowercase, and 1 number</p>
                            </div>

                            {/* Confirm Password */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Confirm Password <span className="text-red-500">*</span>
                                </label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                                    <input
                                        type={showConfirm ? "text" : "password"}
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        placeholder="Confirm new password"
                                        required
                                        className={`w-full pl-10 pr-10 rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${passwordsMismatch ? "border-red-500" : "border-gray-300"}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirm(!showConfirm)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showConfirm ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                {passwordsMismatch && (
                                    <p className="text-xs text-red-500 mt-1">Passwords do not match</p>
                                )}
                                {passwordsMatch && (
                                    <p className="text-xs text-green-600 mt-1">✓ Passwords match</p>
                                )}
                            </div>

                            <button
                                type="submit"
                                disabled={loading || !!passwordsMismatch}
                                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-60"
                            >
                                {loading ? (
                                    <div className="flex items-center justify-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Updating...
                                    </div>
                                ) : (
                                    "Change Password"
                                )}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </DashboardLayout>
    )
}
