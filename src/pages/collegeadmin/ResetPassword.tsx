import type React from "react"
import { useState, useCallback } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ArrowLeft, GraduationCap, CheckCircle, Eye, EyeOff, Lock } from "lucide-react"
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services"

export default function ResetPassword() {
    const [searchParams] = useSearchParams()
    const navigate = useNavigate()
    const token = searchParams.get("token") || ""

    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const [error, setError] = useState("")

    const validatePassword = (password: string): string | null => {
        if (password.length < 8) return "Password must be at least 8 characters"
        if (!/[a-z]/.test(password)) return "Password must contain a lowercase letter"
        if (!/[A-Z]/.test(password)) return "Password must contain an uppercase letter"
        if (!/\d/.test(password)) return "Password must contain a number"
        return null
    }

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")

        if (!token) {
            setError("Invalid or missing reset token. Please request a new reset link.")
            return
        }

        const validationError = validatePassword(newPassword)
        if (validationError) {
            setError(validationError)
            return
        }

        if (newPassword !== confirmPassword) {
            setError("Passwords do not match")
            return
        }

        setIsSubmitting(true)
        try {
            await CollegeAdminService.resetPassword({
                token,
                new_password: newPassword,
                confirm_password: confirmPassword,
            })
            setIsSuccess(true)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Something went wrong"
            if (msg.toLowerCase().includes("expired") || msg.toLowerCase().includes("invalid")) {
                setError("This reset link has expired or is invalid. Please request a new one.")
            } else {
                setError(msg)
            }
        } finally {
            setIsSubmitting(false)
        }
    }, [token, newPassword, confirmPassword])

    if (!token) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-background p-6">
                <div className="max-w-sm w-full space-y-6 text-center">
                    <Alert className="bg-destructive/10 border-destructive/20 rounded-xl">
                        <AlertDescription className="text-destructive text-sm font-bold">
                            Invalid or missing reset token. Please request a new password reset link.
                        </AlertDescription>
                    </Alert>
                    <Link
                        to="/college/forgot-password"
                        className="flex items-center gap-2 text-sm text-blue-600 hover:underline font-bold justify-center"
                    >
                        <ArrowLeft className="h-4 w-4" />
                        Request New Reset Link
                    </Link>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen w-full flex bg-background font-['Public_Sans',_sans-serif]">
            {/* Left Section */}
            <div className="hidden lg:flex lg:w-3/5 relative overflow-hidden">
                <div
                    className="absolute inset-0 bg-cover bg-center"
                    style={{ backgroundImage: `url('/modern-admin-dashboard-technology-background.jpg')` }}
                />
                <div
                    className="absolute inset-0"
                    style={{
                        background: "linear-gradient(135deg, #694ed6 0%, #c137a2 100%)",
                        opacity: 0.85,
                    }}
                />
                <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <GraduationCap className="h-10 w-10" />
                            <div className="text-4xl font-bold uppercase tracking-tight">College CRM</div>
                        </div>
                        <p className="text-white/80 text-lg font-medium italic">Institution Administration Portal</p>
                    </div>
                    <div className="max-w-md">
                        <h2 className="text-5xl font-bold leading-tight mb-6 tracking-tight">Set New Password</h2>
                        <p className="text-white/80 mb-8 text-lg leading-relaxed font-medium">
                            Choose a strong password to secure your account.
                        </p>
                    </div>
                    <p className="text-white/60 text-sm">&copy; 2026 College CRM System</p>
                </div>
            </div>

            {/* Right Section */}
            <div className="w-full lg:w-2/5 flex items-center justify-center p-6 md:p-12 bg-card">
                <div className="w-full max-w-sm space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">Reset Password</h1>
                        <p className="text-muted-foreground text-sm font-medium">
                            Enter your new password below
                        </p>
                    </div>

                    {isSuccess ? (
                        <div className="space-y-6">
                            <Alert className="bg-green-50 border-green-200 rounded-xl">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-700 text-sm ml-2 font-medium">
                                    Password has been reset successfully. Please log in with your new password.
                                </AlertDescription>
                            </Alert>
                            <Button
                                onClick={() => navigate("/college/login")}
                                className="w-full h-11 font-bold text-white transition-all duration-300 hover:shadow-xl rounded-xl cursor-pointer shadow-lg"
                                style={{ background: "linear-gradient(135deg, #694ed6 0%, #c137a2 100%)" }}
                            >
                                Go to Login
                            </Button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="new-password" className="font-semibold text-slate-700">New Password *</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="new-password"
                                        type={showNewPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        placeholder="Enter new password"
                                        value={newPassword}
                                        onChange={(e) => setNewPassword(e.target.value)}
                                        className="pl-10 pr-10 h-11 border-1 border-[#cccccc] focus:ring-2 focus:ring-blue-500/20"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowNewPassword(!showNewPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                                    >
                                        {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                                <p className="text-xs text-muted-foreground">
                                    Must contain at least 8 characters, an uppercase letter, a lowercase letter, and a number.
                                </p>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="confirm-password" className="font-semibold text-slate-700">Confirm Password *</Label>
                                <div className="relative">
                                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="confirm-password"
                                        type={showConfirmPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        placeholder="Confirm new password"
                                        value={confirmPassword}
                                        onChange={(e) => setConfirmPassword(e.target.value)}
                                        className="pl-10 pr-10 h-11 border-1 border-[#cccccc] focus:ring-2 focus:ring-blue-500/20"
                                        required
                                        minLength={8}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                                        aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
                                    >
                                        {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                    </button>
                                </div>
                            </div>

                            {error && (
                                <Alert className="bg-destructive/10 border-destructive/20 rounded-xl">
                                    <AlertDescription className="text-destructive text-sm font-bold">{error}</AlertDescription>
                                </Alert>
                            )}

                            <Button
                                type="submit"
                                disabled={isSubmitting}
                                className="w-full h-11 font-bold text-white transition-all duration-300 hover:shadow-xl rounded-xl cursor-pointer shadow-lg"
                                style={{ background: "linear-gradient(135deg, #694ed6 0%, #c137a2 100%)" }}
                            >
                                {isSubmitting ? (
                                    <div className="flex items-center gap-2">
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                        Resetting...
                                    </div>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>

                            <Link
                                to="/college/login"
                                className="flex items-center gap-2 text-sm text-blue-600 hover:underline font-bold justify-center"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Login
                            </Link>
                        </form>
                    )}
                </div>
            </div>
        </div>
    )
}
