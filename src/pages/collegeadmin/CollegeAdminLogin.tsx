import type React from "react"
import { useState, useCallback } from "react"
import { useNavigate, Link } from "react-router-dom"
import { useAuth } from "@/hooks/collegeadmin/useAuth"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Mail, Lock, ArrowRight, GraduationCap, Eye, EyeOff } from "lucide-react"

export default function CollegeAdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  const handleLogin = useCallback(async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate("/college/dashboard")
    } catch (err: unknown) {
      // Extract error message — handle both ApiError and raw axios errors
      let errorMessage = "Invalid credentials"
      if (err && typeof err === "object" && "response" in err) {
        const axiosErr = err as { response?: { data?: { error?: string; message?: string }; status?: number } }
        const status = axiosErr.response?.status
        const apiMsg = axiosErr.response?.data?.error || axiosErr.response?.data?.message
        if (status === 429) {
          errorMessage = "Too many login attempts. Please try again in 15 minutes."
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
            <p className="text-white/80 text-lg font-medium italic">Institution Administration Portal</p>
          </div>
          <div className="max-w-md">
            <h2 className="text-5xl font-bold leading-tight mb-6 tracking-tight">Manage Your Campus</h2>
            <p className="text-white/80 mb-8 text-lg leading-relaxed font-medium">
              Empowering institutions with smart tools to manage students, faculty, and daily operations in one secure place.
            </p>
          </div>
          <p className="text-white/60 text-sm">© 2026 College CRM System</p>
        </div>
      </div>

      {/* Right Section - Form */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-6 md:p-12 bg-card">
        <div className="w-full max-w-sm space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-2 tracking-tight">College Admin Login</h1>
            <p className="text-muted-foreground text-sm font-medium">Access your institution management dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold text-slate-700">Official Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@college.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 border-1 border-[#cccccc] focus:ring-2 focus:ring-blue-500/20"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="font-semibold text-slate-700">Password</Label>
                <Link
                  to="/college/forgot-password"
                  className="text-xs text-blue-600 hover:underline font-bold"
                >
                  Forgot Password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 border-1 border-[#cccccc] focus:ring-2 focus:ring-blue-500/20"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            {formError && (
              <Alert className="bg-destructive/10 border-destructive/20 rounded-xl">
                <AlertCircle className="h-4 w-4 text-destructive" />
                <AlertDescription className="text-destructive text-sm ml-2 font-bold">{formError}</AlertDescription>
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
                  Verifying Access...
                </div>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Enter Dashboard <ArrowRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </form>

          <p className="text-center text-[10px] text-muted-foreground uppercase tracking-[0.2em] font-black">
            Authorized Institutional Personnel Only
          </p>
        </div>
      </div>
    </div>
  )
}