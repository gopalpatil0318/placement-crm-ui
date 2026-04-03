import type React from "react"
import { useState, useCallback } from "react"
import { Link, useSearchParams } from "react-router-dom"
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
  Mail,
  ArrowLeft,
  CheckCircle,
  AlertCircle,
} from "lucide-react"
import { formFadeIn } from "@/lib/animations"

type UserType = "student" | "staff"

export default function ForgotPassword() {
  const [searchParams] = useSearchParams()
  const typeParam = searchParams.get("type")
  const initialType: UserType =
    typeParam === "staff" ? "staff" : "student"

  const [activeType, setActiveType] = useState<UserType>(initialType)
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState("")

  const shouldReduce = useReducedMotion()
  const { college, isAdmin } = useCollegeTenant()

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault()
      setError("")
      setIsSubmitting(true)

      try {
        if (activeType === "student") {
          await StudentProfileService.forgotPassword(email.trim())
        } else {
          await CollegeAdminService.forgotPassword(email.trim())
        }
        setIsSubmitted(true)
      } catch (err: unknown) {
        const msg =
          err instanceof Error ? err.message : "Something went wrong"
        if (msg.toLowerCase().includes("too many")) {
          setError("Too many requests. Please try again in 15 minutes.")
        } else {
          // Always show generic success for security
          setIsSubmitted(true)
        }
      } finally {
        setIsSubmitting(false)
      }
    },
    [activeType, email],
  )

  const loginPath = isAdmin ? "/sysadmin/login" : "/login"

  return (
    <AuthLayout college={college} variant={isAdmin ? "admin" : "college"}>
      {/* Heading */}
      <div className="mb-8">
        <h2 className="text-2xl font-bold text-white">Forgot Password</h2>
        <p className="text-sm text-zinc-400 mt-1">
          {college?.college_name
            ? `Reset your password for ${college.college_name}`
            : "Enter your email to receive a reset link"}
        </p>
      </div>

      {/* User type toggle (only on college subdomains) */}
      {!isAdmin && (
        <div className="flex rounded-lg bg-white/[0.06] p-1 mb-6">
          {(["student", "staff"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => {
                setActiveType(type)
                setError("")
                setIsSubmitted(false)
              }}
              className="relative flex-1 rounded-md py-2.5 text-sm font-semibold cursor-pointer transition-colors duration-150 text-zinc-400 hover:text-white active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-500"
            >
              {activeType === type && (
                <motion.div
                  layoutId="forgotTab"
                  className="absolute inset-0 rounded-md bg-white/[0.1] shadow-sm"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span className={`relative z-10 ${activeType === type ? "text-white" : ""}`}>
                {type === "student" ? "Student" : "Staff"}
              </span>
            </button>
          ))}
        </div>
      )}

      <AnimatePresence mode="wait">
        {isSubmitted ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.3 }}
            className="space-y-5"
          >
            <Alert className="bg-emerald-500/10 border-emerald-500/20 rounded-lg">
              <CheckCircle className="h-4 w-4 text-emerald-400" />
              <AlertDescription className="text-emerald-300 text-sm ml-2 font-medium">
                If an account with this email exists, you will receive a
                password reset link.
              </AlertDescription>
            </Alert>
            <p className="text-sm text-zinc-400 text-center">
              Check your email inbox and spam folder.
            </p>
            <Link
              to={loginPath}
              className="flex items-center justify-center gap-2 text-sm text-indigo-400 hover:text-indigo-300 hover:underline font-semibold"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to Login
            </Link>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            onSubmit={handleSubmit}
            variants={shouldReduce ? undefined : formFadeIn}
            initial="initial"
            animate="animate"
            exit={{ opacity: 0, y: -8, transition: { duration: 0.15 } }}
            className="space-y-5"
          >
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
                    activeType === "student"
                      ? "student@college.ac.in"
                      : "admin@college.edu"
                  }
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10 h-11 bg-white/[0.06] border-white/[0.08] text-white placeholder:text-zinc-500 focus-visible:ring-indigo-500"
                  required
                />
              </div>
            </div>

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

            <div>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full h-11 font-bold rounded-xl cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white shadow-sm shadow-indigo-500/15 transition-all duration-150 hover:shadow-md hover:shadow-indigo-500/20 active:scale-[0.98]"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/60 border-t-white" />
                    Sending...
                  </div>
                ) : (
                  "Send Reset Link"
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
