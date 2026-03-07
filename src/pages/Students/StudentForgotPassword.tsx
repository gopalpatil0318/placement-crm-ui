import type React from "react"
import { useState, useCallback } from "react"
import { Link } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Mail, ArrowLeft, GraduationCap, CheckCircle } from "lucide-react"
import { StudentProfileService } from "@/services/student/student.services"

export default function StudentForgotPassword() {
    const [email, setEmail] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isSubmitted, setIsSubmitted] = useState(false)
    const [error, setError] = useState("")

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault()
        setError("")
        setIsSubmitting(true)

        try {
            await StudentProfileService.forgotPassword(email)
            setIsSubmitted(true)
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Something went wrong"
            if (msg.toLowerCase().includes("too many")) {
                setError("Too many requests. Please try again in 15 minutes.")
            } else {
                // Always show generic message for security — don't reveal if email exists
                setIsSubmitted(true)
            }
        } finally {
            setIsSubmitting(false)
        }
    }, [email])

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
                        <h2 className="text-5xl font-bold leading-tight mb-6 tracking-tight">Reset Your Password</h2>
                        <p className="text-white/80 mb-8 text-lg leading-relaxed font-medium">
                            Enter your email address and we'll send you a link to reset your password.
                        </p>
                    </div>
                    <p className="text-white/60 text-sm">© 2026 College CRM System</p>
                </div>
            </div>

            {/* Right Section */}
            <div className="w-full lg:w-2/5 flex items-center justify-center p-6 md:p-12 bg-card">
                <div className="w-full max-w-sm space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">Forgot Password</h1>
                        <p className="text-muted-foreground text-sm font-medium">
                            Enter your registered email and we'll send a reset link
                        </p>
                    </div>

                    {isSubmitted ? (
                        <div className="space-y-6">
                            <Alert className="bg-green-50 border-green-200 rounded-xl">
                                <CheckCircle className="h-4 w-4 text-green-600" />
                                <AlertDescription className="text-green-700 text-sm ml-2 font-medium">
                                    If an account with this email exists, you will receive a password reset link.
                                </AlertDescription>
                            </Alert>
                            <p className="text-sm text-muted-foreground">
                                📧 Check your email inbox and spam folder.
                            </p>
                            <Link
                                to="/student/login"
                                className="flex items-center gap-2 text-sm text-blue-600 hover:underline font-bold"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Back to Login
                            </Link>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="email" className="font-semibold text-slate-700">Email Address</Label>
                                <div className="relative">
                                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                    <Input
                                        id="email"
                                        type="email"
                                        placeholder="student@college.ac.in"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        className="pl-10 h-11 border-1 border-[#cccccc] focus:ring-2 focus:ring-blue-500/20"
                                        required
                                    />
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
                                        Sending...
                                    </div>
                                ) : (
                                    "Send Reset Link"
                                )}
                            </Button>

                            <Link
                                to="/student/login"
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
