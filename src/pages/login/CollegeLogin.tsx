import type React from "react"
import { useState, useCallback } from "react"
import { useNavigate, Link, Navigate } from "react-router-dom"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useAuth } from "@/hooks/collegeadmin/useAuth"
import { useStudentAuth } from "@/hooks/student/useStudentAuth"
import { useCollegeTenant } from "@/context/CollegeTenantContext"
import { getFirstAccessiblePath } from "@/constants/permissionMap"

import AuthLayout from "@/components/ui/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  AlertCircle,
  Mail,
  Lock,
  ArrowRight,
  Eye,
  EyeOff,
  GraduationCap,
} from "lucide-react"
import { formFadeIn } from "@/lib/animations"
import { sanitizeImageUrl } from "@/utils/sanitize"

type LoginTab = "student" | "staff"

function extractErrorMessage(err: unknown): string {
  if (err && typeof err === "object" && "response" in err) {
    const axiosErr = err as {
      response?: {
        data?: { error?: string; message?: string }
        status?: number
      }
    }
    if (axiosErr.response?.status === 429) {
      return "Too many login attempts. Please try again in 15 minutes."
    }
    const apiMsg =
      axiosErr.response?.data?.error || axiosErr.response?.data?.message
    if (apiMsg) return apiMsg
  }
  if (err instanceof Error) return err.message
  return "Invalid credentials"
}

function redirectStudentAfterLogin(navigate: ReturnType<typeof useNavigate>) {
  navigate("/student/dashboard", { replace: true })
}

export default function CollegeLogin() {
  const [activeTab, setActiveTab] = useState<LoginTab>("student")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [formError, setFormError] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [fieldErrors, setFieldErrors] = useState<{ email?: string; password?: string }>({})

  const navigate = useNavigate()
  const shouldReduce = useReducedMotion()
  const { login: collegeLogin } = useAuth()
  const { login: studentLogin } = useStudentAuth()
  const { college, isLoading: tenantLoading, isAdmin, error: tenantError, subdomain } = useCollegeTenant()

  const validateEmail = useCallback((value: string) => {
    if (!value) return undefined
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(value) ? undefined : "Enter a valid email address"
  }, [])

  const validatePassword = useCallback((value: string) => {
    if (!value) return undefined
    return value.length < 4 ? "Password is too short" : undefined
  }, [])

  const switchTab = useCallback(
    (tab: LoginTab) => {
      if (tab !== activeTab) {
        setActiveTab(tab)
        setFormError("")
        setFieldErrors({})
        setEmail("")
        setPassword("")
        setShowPassword(false)
      }
    },
    [activeTab],
  )

  const handleLogin = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setFormError("")
      setIsSubmitting(true)

      try {
        if (activeTab === "student") {
          await studentLogin(email.trim(), password)
          redirectStudentAfterLogin(navigate)
        } else {
          const loggedInUser = await collegeLogin(email.trim(), password)
          const target = getFirstAccessiblePath(
            loggedInUser?.permissions ?? null,
            loggedInUser?.role ?? null,
          )
          navigate(target, { replace: true })
        }
      } catch (err: unknown) {
        setFormError(extractErrorMessage(err))
      } finally {
        setIsSubmitting(false)
      }
    },
    [activeTab, email, password, studentLogin, collegeLogin, navigate],
  )

  if (tenantLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#09090b]">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-indigo-500/20 border-t-indigo-500" />
      </div>
    )
  }

  if (isAdmin) {
    return <Navigate to="/sysadmin/login" replace />
  }

  const forgotPasswordPath =
    activeTab === "student"
      ? "/forgot-password?type=student"
      : "/forgot-password?type=staff"

  const logoUrl = sanitizeImageUrl(college?.college_logo_url)

  return (
    <AuthLayout college={college} variant="college">
      {/* Mobile-only branding (hidden on desktop where left panel shows) */}
      <div className="flex flex-col items-center text-center mb-6 lg:hidden">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`${college?.college_name} logo`}
            width={56}
            height={56}
            loading="eager"
            decoding="async"
            className="h-14 w-14 rounded-xl object-cover ring-1 ring-white/10 mb-3"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = "none"
            }}
          />
        ) : (
          <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white/[0.06] ring-1 ring-white/10 mb-3">
            <GraduationCap className="h-7 w-7 text-white" />
          </div>
        )}
        <h1 className="text-xl font-bold text-white leading-tight">
          {college?.college_name ?? "PlaceNex"}
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Sign in to your placement portal
        </p>
      </div>

      {/* Desktop heading (left panel has branding) */}
      <div className="hidden lg:block mb-8">
        <h2 className="text-2xl font-bold text-white">Welcome back</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Sign in to your placement portal
        </p>
      </div>

      {tenantError && subdomain && (
        <Alert className="mb-6 bg-red-500/10 border-red-500/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400 text-sm ml-2 font-medium">
            College not found. Please check the URL.
          </AlertDescription>
        </Alert>
      )}

      {/* ─── Tab Switcher ─── */}
      <div className="flex rounded-lg bg-white/[0.06] p-1 mb-6" role="tablist">
        {(["student", "staff"] as const).map((tab) => (
          <button
            key={tab}
            type="button"
            role="tab"
            aria-selected={activeTab === tab}
            onClick={() => switchTab(tab)}
            className="relative flex-1 rounded-md py-2.5 text-sm font-semibold cursor-pointer transition-colors duration-150 text-zinc-400 hover:text-white active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
          >
            {activeTab === tab && (
              <motion.div
                layoutId="activeTab"
                className="absolute inset-0 rounded-md bg-white/[0.1] shadow-sm"
                transition={{ type: "spring", stiffness: 400, damping: 30 }}
              />
            )}
            <span className={`relative z-10 ${activeTab === tab ? "text-white" : ""}`}>
              {tab === "student" ? "Student" : "Staff"}
            </span>
          </button>
        ))}
      </div>

      {/* ─── Form ─── */}
      <motion.form
        onSubmit={handleLogin}
        variants={shouldReduce ? undefined : formFadeIn}
        initial="initial"
        animate="animate"
        key={activeTab}
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
              placeholder={
                activeTab === "student"
                  ? "student@college.ac.in"
                  : "admin@college.edu"
              }
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
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="font-semibold text-zinc-200">
              Password
            </Label>
            <Link
              to={forgotPasswordPath}
              className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline font-semibold"
            >
              Forgot Password?
            </Link>
          </div>
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

        {/* Default password hint — student tab only */}
        <AnimatePresence>
          {activeTab === "student" && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              className="overflow-hidden"
            >
              <div className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-4 py-3">
                <p className="text-xs text-indigo-300 font-medium">
                  First-time login? Your default password is your{" "}
                  <strong>first name (lowercase)</strong> followed by{" "}
                  <strong>@</strong> and your{" "}
                  <strong>passout year</strong>.
                </p>
                <p className="text-xs text-indigo-400 mt-1">
                  Example:{" "}
                  <code className="rounded bg-indigo-500/15 px-1">
                    rahul@2026
                  </code>
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Error — shown near submit for visibility */}
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

      {/* Footer (mobile only — desktop has it in left panel) */}
      <p className="text-center text-xs text-zinc-500 mt-8 lg:hidden">
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
