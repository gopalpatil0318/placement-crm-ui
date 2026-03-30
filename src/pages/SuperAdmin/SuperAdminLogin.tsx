import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "@/hooks/sysadmin/useAuth"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react"

export default function SuperAdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const navigate = useNavigate()
  const { login } = useAuth()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError("")
    setIsSubmitting(true)

    try {
      await login(email, password)
      navigate("/sysadmin/dashboard")
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
  }

  return (
    <div className="min-h-screen w-full flex bg-gray-50 dark:bg-gray-950">
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
            <p className="text-white/80 text-lg font-medium">Super Administration Portal</p>
          </div>
          <div className="max-w-md">
            <h2 className="text-5xl font-bold leading-tight mb-6">Welcome Back</h2>
            <p className="text-white/80 mb-8 text-lg leading-relaxed">
              Monitor and control university operations securely and efficiently.
            </p>
          </div>
          <p className="text-white/60 text-sm">© 2025 College CRM System</p>
        </div>
      </div>

      {/* Right Section */}
      <div className="w-full lg:w-2/5 flex items-center justify-center p-6 md:p-12 bg-white dark:bg-gray-900">
        <div className="w-full max-w-sm space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Super Admin Login</h1>
            <p className="text-gray-500 dark:text-gray-400 text-sm">Enter your credentials to access secure dashboard</p>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-gray-700 dark:text-gray-300">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  id="email"
                  type="email"
                  autoComplete="email"
                  placeholder="admin@pcrm.in"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-700 dark:text-gray-300">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10 pr-10 h-11 border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder-gray-500"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((prev) => !prev)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:text-gray-500 dark:hover:text-gray-300 transition-colors"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {formError && (
              <Alert className="bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800 rounded-lg">
                <AlertCircle className="h-4 w-4 text-red-500" />
                <AlertDescription className="text-red-700 dark:text-red-400 text-sm ml-2">{formError}</AlertDescription>
              </Alert>
            )}

            <Button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 font-semibold text-white transition-all duration-300 hover:shadow-lg cursor-pointer"
              style={{ background: "linear-gradient(135deg, #694ed6 0%, #c137a2 100%)" }}
            >
              {isSubmitting ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Signing in...
                </div>
              ) : (
                <>
                  Login <ArrowRight className="h-4 w-4 ml-2" />
                </>
              )}
            </Button>
          </form>

          <p className="text-center text-xs text-gray-400 dark:text-gray-500">
            Protected by encryption • Super Admin Access Only
          </p>
        </div>
      </div>
    </div>
  )
}