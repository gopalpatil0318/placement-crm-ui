import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface FloatingTextareaProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  error?: string
  required?: boolean
  maxLength?: number
  rows?: number
  disabled?: boolean
  className?: string
  placeholder?: string
}

/**
 * Modern titled textarea with animated character counter.
 * Label sits above as a title. Counter color transitions: gray → amber (80%) → red (95%).
 * Dark mode + accessibility built-in.
 */
export default function FloatingTextarea({
  label,
  name,
  value,
  onChange,
  error,
  required,
  maxLength,
  rows = 4,
  disabled,
  className = "",
  placeholder,
}: FloatingTextareaProps) {
  const [focused, setFocused] = useState(false)

  const charRatio = maxLength ? value.length / maxLength : 0
  const counterColor =
    charRatio >= 0.95
      ? "text-red-500 dark:text-red-400"
      : charRatio >= 0.8
        ? "text-amber-500 dark:text-amber-400"
        : "text-gray-400 dark:text-gray-500"

  return (
    <div className={className}>
      <label
        htmlFor={name}
        className={`block text-sm font-medium mb-1.5 transition-colors duration-200
          ${error
            ? "text-red-500 dark:text-red-400"
            : focused
              ? "text-blue-600 dark:text-blue-400"
              : "text-gray-700 dark:text-gray-300"
          }
        `}
      >
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>

      <textarea
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        maxLength={maxLength}
        rows={rows}
        disabled={disabled}
        placeholder={placeholder ?? label}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-colors duration-200 resize-y
          ${error
            ? "border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
          }
          disabled:opacity-60 disabled:cursor-not-allowed
        `}
      />

      <div className="flex items-center justify-between mt-1.5 min-h-[1.25rem]">
        <AnimatePresence>
          {error && (
            <motion.p
              id={`${name}-error`}
              role="alert"
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -4 }}
              transition={{ duration: 0.15 }}
              className="text-xs text-red-500 dark:text-red-400"
            >
              {error}
            </motion.p>
          )}
        </AnimatePresence>

        {maxLength != null && (
          <p className={`text-xs ml-auto tabular-nums transition-colors duration-200 ${counterColor}`}>
            {value.length}/{maxLength}
          </p>
        )}
      </div>
    </div>
  )
}
