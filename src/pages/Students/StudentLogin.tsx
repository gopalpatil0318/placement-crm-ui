import type React from "react"
import { useState, useCallback } from "react"
import { useNavigate, Link } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Mail, Lock, ArrowRight, Eye, EyeOff, GraduationCap } from "lucide-react"
import { useStudentAuth } from "@/hooks/student/useStudentAuth"

export default function StudentLogin() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [formError, setFormError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const navigate = useNavigate()
    const { login } = useStudentAuth()

    const handleLogin = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError("")
        setIsSubmitting(true)

        try {
            await login(email.trim(), password)

            // Read user from localStorage after login sets it
            const stored = localStorage.getItem("student_user")
            if (stored) {
                const user = JSON.parse(stored)

                // Profile-based redirect logic
                if (!user.profileComplete) {
                    navigate("/student/profile", { replace: true })
                } else if (!user.profileIsApproved) {
                    navigate("/student/profile", { replace: true })
                } else {
                    navigate("/student/dashboard", { replace: true })
                }
            } else {
                navigate("/student/dashboard", { replace: true })
            }
        } catch (err: unknown) {
            // Extract error message from API response
            let errorMessage = "Invalid credentials"
            if (err && typeof err === "object" && "response" in err) {
                const axiosErr = err as { response?: { data?: { error?: string; message?: string }; status?: number } }
                const status = axiosErr.response?.status
                const apiMsg = axiosErr.response?.data?.error || axiosErr.response?.data?.message

                if (status === 429) {
                    errorMessage = "Too many login attempts. Try again in 15 minutes."
                } else if (apiMsg) {
                    errorMessage = apiMsg
                }
            } else if (err instanceof Error) {
                errorMessage = err.message
            }
            setFormError(errorMessage)
        } finally {
            setIsSubmitting(false)
        }
    }, [email, password, login, navigate])

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
                        <p className="text-white/80 text-lg font-medium italic">Student Portal</p>
                    </div>
                    <div className="max-w-md">
                        <h2 className="text-5xl font-bold leading-tight mb-6 tracking-tight">Welcome Back</h2>
                        <p className="text-white/80 mb-8 text-lg leading-relaxed font-medium">
                            Access your student dashboard securely and efficiently.
                        </p>
                    </div>
                    <p className="text-white/60 text-sm">© 2026 College CRM System</p>
                </div>
            </div>

            {/* Right Section */}
            <div className="w-full lg:w-2/5 flex items-center justify-center p-6 md:p-12 bg-card">
                <div className="w-full max-w-sm space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">Student Login</h1>
                        <p className="text-muted-foreground text-sm font-medium">
                            Enter your credentials to access your dashboard
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">
                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email" className="font-semibold text-slate-700 dark:text-slate-300">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    placeholder="student@college.ac.in"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 h-11 border border-[#cccccc]"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password" className="font-semibold text-slate-700 dark:text-slate-300">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type={showPassword ? "text" : "password"}
                                    autoComplete="current-password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 pr-10 h-11 border border-[#cccccc]"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
                                    aria-label={showPassword ? "Hide password" : "Show password"}
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        {/* Default Password Hint */}
                        <div className="bg-blue-50 dark:bg-blue-950/30 border border-blue-100 dark:border-blue-900/50 rounded-lg px-4 py-3">
                            <p className="text-xs text-blue-700 dark:text-blue-300 font-medium">
                                💡 First-time login? Your default password is your <strong>first name (lowercase)</strong> followed by <strong>@</strong> and your <strong>passout year</strong>.
                            </p>
                            <p className="text-xs text-blue-500 dark:text-blue-400 mt-1">
                                Example: <code className="bg-blue-100 dark:bg-blue-900/40 px-1 rounded">rahul@2026</code>
                            </p>
                        </div>

                        {/* Error Message */}
                        {formError && (
                            <Alert className="bg-destructive/10 border-destructive/20 rounded-lg">
                                <AlertCircle className="h-4 w-4 text-destructive" />
                                <AlertDescription className="text-destructive text-sm ml-2 font-medium">
                                    {formError}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-11 font-bold text-white transition-all duration-300 hover:shadow-xl rounded-xl cursor-pointer shadow-lg"
                            style={{ background: "linear-gradient(135deg, #694ed6 0%, #c137a2 100%)" }}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-2">
                                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                                    Signing in...
                                </div>
                            ) : (
                                <>
                                    Login <ArrowRight className="h-4 w-4 ml-2" />
                                </>
                            )}
                        </Button>

                        {/* Forgot Password Link */}
                        <div className="text-center">
                            <Link
                                to="/student/forgot-password"
                                className="text-sm text-blue-600 dark:text-blue-400 hover:underline font-semibold"
                            >
                                Forgot Password?
                            </Link>
                        </div>
                    </form>

                    <p className="text-center text-xs text-muted-foreground">
                        Protected by encryption • Student Access Only
                    </p>
                </div>
            </div>
        </div>
    )
}