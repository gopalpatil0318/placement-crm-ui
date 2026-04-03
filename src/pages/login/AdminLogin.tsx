import type React from "react"
import { useState, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useAuth } from "@/hooks/sysadmin/useAuth"

import AuthLayout from "@/components/ui/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AlertCircle, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react"
import { formFadeIn } from "@/lib/animations"

export default function AdminLogin() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  const navigate = useNavigate()
  const shouldReduce = useReducedMotion()
  const { login } = useAuth()

  const validateEmail = useCallback((value: string) => {
    if (!value) return undefined
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) ? undefined : "Enter a valid email address"
  }, [])

  const validatePassword = useCallback((value: string) => {
    if (!value) return undefined
    return value.length < 4 ? "Password is too short" : undefined
  }, [])

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setFormError("")
      setIsSubmitting(true)

      try {
        await login(email.trim(), password)
        navigate("/sysadmin/dashboard", { replace: true })
      } catch (err: unknown) {
        let errorMessage = "Invalid credentials"
        if (err && typeof err === "object" && "response" in err) {
          const axiosErr = err as {
            response?: {
              data?: { error?: string; message?: string }
              status?: number
            }
          }
          const status = axiosErr.response?.status
          const apiMsg =
            axiosErr.response?.data?.error || axiosErr.response?.data?.message
          if (status === 429) {
            errorMessage =
              "Too many login attempts. Please try again in 15 minutes."
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
    },
    [email, password, login, navigate],
  )

  return (
    <AuthLayout variant="admin">
      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Admin Sign In</h2>
        <p className="text-sm text-zinc-400 mt-1">
          System administration portal
        </p>
      </div>

      {/* ─── Form ─── */}
      <motion.form
        onSubmit={handleLogin}
        variants={shouldReduce ? undefined : formFadeIn}
        initial="initial"
        animate="animate"
        className="space-y-5"
      >
        {/* Email */}
        <div className="space-y-2">
          <Label htmlFor="email" className="font-semibold text-zinc-200">
            Email Address
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              id="email"
              type="email"
              autoComplete="email"
              placeholder="admin@placenex.in"
              value={email}
              onChange={(e) => {
                setEmail(e.target.value)
                if (fieldErrors.email) setFieldErrors((p) => ({ ...p, email: undefined }))
              }}
              onBlur={() => {
                const err = validateEmail(email)
                if (err) setFieldErrors((p) => ({ ...p, email: err }))
              }}
              className={`pl-10 h-11 bg-white/[0.06] border-white/[0.08] text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500 ${fieldErrors.email ? "border-destructive focus-visible:ring-destructive" : ""}`}
              required
            />
          </div>
          {fieldErrors.email && (
            <p className="text-xs text-red-400 font-medium">{fieldErrors.email}</p>
          )}
        </div>

        {/* Password */}
        <div className="space-y-2">
          <Label htmlFor="password" className="font-semibold text-zinc-200">
            Password
          </Label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input
              id="password"
              type={showPassword ? "text" : "password"}
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => {
                setPassword(e.target.value)
                if (fieldErrors.password) setFieldErrors((p) => ({ ...p, password: undefined }))
              }}
              onBlur={() => {
                const err = validatePassword(password)
                if (err) setFieldErrors((p) => ({ ...p, password: err }))
              }}
              className={`pl-10 pr-10 h-11 bg-white/[0.06] border-white/[0.08] text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500 ${fieldErrors.password ? "border-destructive focus-visible:ring-destructive" : ""}`}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded-sm"
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? (
                <EyeOff className="h-4 w-4" />
              ) : (
                <Eye className="h-4 w-4" />
              )}
            </button>
          </div>
          {fieldErrors.password && (
            <p className="text-xs text-red-400 font-medium">{fieldErrors.password}</p>
          )}
        </div>

        {/* Error */}
        <AnimatePresence>
          {formError && (
            <motion.div
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
            >
              <div className="flex items-start gap-2.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3.5 py-3" role="alert">
                <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                <p className="text-red-400 text-sm font-medium leading-snug">
                  {formError}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Submit */}
        <div>
          <Button
            type="submit"
            disabled={isSubmitting}
            className="w-full h-11 font-bold rounded-xl cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/15 transition-all duration-150 hover:shadow-md hover:shadow-indigo-500/20 active:scale-[0.98]"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                Signing in...
              </div>
            ) : (
              <span className="flex items-center justify-center gap-2">
                Sign In <ArrowRight className="h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </motion.form>

      {/* Footer */}
      <p className="text-center text-xs text-zinc-500 mt-8">
        Powered by{" "}
        <a
          href="https://placenex.in"
          target="_blank"
          rel="noopener noreferrer"
          className="font-semibold text-indigo-400 hover:text-indigo-300 hover:underline"
        >
          PlaceNex
        </a>
      </p>
    </AuthLayout>
  )
}
