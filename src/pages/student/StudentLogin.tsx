import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Mail, Lock, ArrowRight, School } from "lucide-react"
import { useStudentAuth } from "@/hooks/student/useStudentAuth"

export default function StudentLogin() {
    const [collegeId, setCollegeId] = useState("")
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [formError, setFormError] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)

    const navigate = useNavigate()
    const { login } = useStudentAuth()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setFormError("")
        setIsSubmitting(true)

        try {
            await login(collegeId, email, password)
            navigate("/student/dashboard")
        } catch (err: any) {
            setFormError(err?.message || "Invalid credentials")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen w-full flex bg-background">
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
                        <div className="text-4xl font-bold mb-2">College CRM</div>
                        <p className="text-white/80 text-lg font-medium">Student Portal</p>
                    </div>
                    <div className="max-w-md">
                        <h2 className="text-5xl font-bold leading-tight mb-6">Welcome Back</h2>
                        <p className="text-white/80 mb-8 text-lg leading-relaxed">
                            Access your student dashboard securely and efficiently.
                        </p>
                    </div>
                    <p className="text-white/60 text-sm">© 2025 College CRM System</p>
                </div>
            </div>

            {/* Right Section */}
            <div className="w-full lg:w-2/5 flex items-center justify-center p-6 md:p-12 bg-card">
                <div className="w-full max-w-sm space-y-8">
                    <div>
                        <h1 className="text-3xl font-bold text-foreground mb-2">Student Login</h1>
                        <p className="text-muted-foreground text-sm">
                            Enter your credentials to access your dashboard
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="space-y-6">

                        {/* Email */}
                        <div className="space-y-2">
                            <Label htmlFor="email">Email Address</Label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="email"
                                    type="email"
                                    placeholder="student@gmail.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="pl-10 h-11 border border-[#cccccc]"
                                    required
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                    id="password"
                                    type="password"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="pl-10 h-11 border border-[#cccccc]"
                                    required
                                />
                            </div>
                        </div>

                        {/* Error Message */}
                        {formError && (
                            <Alert className="bg-destructive/10 border-destructive/20 rounded-lg">
                                <AlertCircle className="h-4 w-4 text-destructive" />
                                <AlertDescription className="text-destructive text-sm ml-2">
                                    {formError}
                                </AlertDescription>
                            </Alert>
                        )}

                        {/* Submit Button */}
                        <Button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full h-11 font-semibold text-white transition-all duration-300 hover:shadow-lg cursor-pointer"
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
                    </form>

                    <p className="text-center text-xs text-muted-foreground">
                        Protected by encryption • Student Access Only
                    </p>
                </div>
            </div>
        </div>
    )
}