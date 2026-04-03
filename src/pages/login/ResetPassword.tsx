import type React from "react"
import { useState, useCallback } from "react"
import { Link, useSearchParams, useNavigate } from "react-router-dom"
import { motion, AnimatePresence, useReducedMotion } from "framer-motion"
import { useCollegeTenant } from "@/context/CollegeTenantContext"
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services"
import { StudentProfileService } from "@/services/student/student.services"

import AuthLayout from "@/components/ui/AuthLayout"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Alert, AlertDescription } from "@/components/ui/alert"
import {
  ArrowLeft,
  CheckCircle,
  Eye,
  EyeOff,
  Lock,
  AlertCircle,
} from "lucide-react"
import { formFadeIn } from "@/lib/animations"

type UserType = "student" | "staff"

function validatePassword(password: string): string | null {
  if (password.length < 8) return "Password must be at least 8 characters"
  if (!/[a-z]/.test(password))
    return "Password must contain a lowercase letter"
  if (!/[A-Z]/.test(password))
    return "Password must contain an uppercase letter"
  if (!/\d/.test(password)) return "Password must contain a number"
  return null
}

function getForgotPath(isAdmin: boolean, userType: UserType): string {
  if (isAdmin) return "/sysadmin/login"
  if (userType === "student") return "/forgot-password?type=student"
  return "/forgot-password?type=staff"
}

async function submitResetPassword(
  userType: UserType,
  payload: { token: string; new_password: string; confirm_password: string },
) {
  if (userType === "student") {
    await StudentProfileService.resetPassword(payload)
  } else {
    await CollegeAdminService.resetPassword(payload)
  }
}

function extractResetError(err: unknown): string {
  const msg = err instanceof Error ? err.message : "Something went wrong"
  const lower = msg.toLowerCase()
  if (lower.includes("expired") || lower.includes("invalid")) {
    return "This reset link has expired or is invalid. Please request a new one."
  }
  return msg
}

// ─── Missing Token View ─────────────────────────────────────────────────────

function MissingTokenView({ forgotPath, college }: Readonly<{ forgotPath: string; college: ReturnType<typeof useCollegeTenant>["college"] }>) {
  const { isAdmin } = useCollegeTenant()
  return (
    <AuthLayout college={college} variant={isAdmin ? "admin" : "college"}>
      <div className="space-y-5 text-center">
        <Alert className="bg-red-500/10 border-red-500/20 rounded-lg">
          <AlertCircle className="h-4 w-4 text-red-400" />
          <AlertDescription className="text-red-400 text-sm ml-2 font-medium">
            Invalid or missing reset token. Please request a new password
            reset link.
          </AlertDescription>
        </Alert>
        <Link
          to={forgotPath}
          className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 hover:underline font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Request New Reset Link
        </Link>
      </div>
    </AuthLayout>
  )
}

// ─── Reset Form ─────────────────────────────────────────────────────────────

interface ResetFormProps {
  token: string
  userType: UserType
  loginPath: string
  onSuccess: () => void
}

function ResetForm({ token, userType, loginPath, onSuccess }: Readonly<ResetFormProps>) {
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")

  const shouldReduce = useReducedMotion()

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError("")

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
        await submitResetPassword(userType, {
          token,
          new_password: newPassword,
          confirm_password: confirmPassword,
        })
        onSuccess()
      } catch (err: unknown) {
        setError(extractResetError(err))
      } finally {
        setIsSubmitting(false)
      }
    },
    [token, newPassword, confirmPassword, userType, onSuccess],
  )

  return (
    <motion.form
      onSubmit={handleSubmit}
      variants={shouldReduce ? undefined : formFadeIn}
      initial="initial"
      animate="animate"
      className="space-y-5"
    >
      {/* New Password */}
      <div className="space-y-2">
        <Label htmlFor="new-password" className="font-semibold text-zinc-200">
          New Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            id="new-password"
            type={showNewPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Enter new password"
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            className="pl-10 pr-10 h-11 bg-white/[0.06] border-white/[0.08] text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowNewPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded-sm"
            aria-label={showNewPassword ? "Hide new password" : "Show new password"}
          >
            {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-zinc-500">
          Min 8 characters, one uppercase, one lowercase, and one number.
        </p>
      </div>

      {/* Confirm Password */}
      <div className="space-y-2">
        <Label htmlFor="confirm-password" className="font-semibold text-zinc-200">
          Confirm Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input
            id="confirm-password"
            type={showConfirmPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Re-enter new password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="pl-10 pr-10 h-11 bg-white/[0.06] border-white/[0.08] text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
            required
            minLength={8}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword((prev) => !prev)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 cursor-pointer transition-colors duration-150 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500 rounded-sm"
            aria-label={showConfirmPassword ? "Hide confirm password" : "Show confirm password"}
          >
            {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -4 }}
            transition={{ duration: 0.15 }}
          >
            <div className="flex items-start gap-2.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3.5 py-3" role="alert">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <p className="text-red-400 text-sm font-medium leading-snug">
                {error}
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
              Resetting...
            </div>
          ) : (
            "Reset Password"
          )}
        </Button>
      </div>

      <div className="text-center">
        <Link
          to={loginPath}
          className="inline-flex items-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 hover:underline font-semibold"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
      </div>
    </motion.form>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const token = searchParams.get("token") ?? ""
  const typeParam = searchParams.get("type")
  const userType: UserType = typeParam === "staff" ? "staff" : "student"

  const [isSuccess, setIsSuccess] = useState(false)
  const shouldReduce = useReducedMotion()

  const { college, isAdmin } = useCollegeTenant()

  const loginPath = isAdmin ? "/sysadmin/login" : "/login"
  const forgotPath = getForgotPath(isAdmin, userType)

  // Missing or malformed token — show error state
  if (!token || !/^[a-zA-Z0-9_-]+$/.test(token)) {
    return <MissingTokenView forgotPath={forgotPath} college={college} />
  }

  return (
    <AuthLayout college={college} variant={isAdmin ? "admin" : "college"}>
      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Reset Password</h2>
        <p className="text-sm text-zinc-400 mt-1">
          Choose a strong password to secure your account
        </p>
      </div>

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={shouldReduce ? undefined : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <Alert className="bg-emerald-500/10 border-emerald-500/20 rounded-lg">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <AlertDescription className="text-emerald-300 text-sm ml-2 font-medium">
                Password has been reset successfully. Please log in with your
                new password.
              </AlertDescription>
            </Alert>
            <Button
              onClick={() => navigate(loginPath)}
              className="w-full h-11 font-bold rounded-xl cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/15 transition-all duration-150 hover:shadow-md hover:shadow-indigo-500/20 active:scale-[0.98]"
            >
              Go to Login
            </Button>
          </motion.div>
        ) : (
          <motion.div
            key="form"
            initial={shouldReduce ? undefined : { opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
          >
            <ResetForm
              token={token}
              userType={userType}
              loginPath={loginPath}
              onSuccess={() => setIsSuccess(true)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer (mobile only) */}
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
