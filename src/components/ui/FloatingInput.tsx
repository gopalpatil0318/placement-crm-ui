import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"

interface FloatingInputProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  error?: string
  required?: boolean
  type?: string
  maxLength?: number
  min?: string
  max?: string
  disabled?: boolean
  className?: string
  placeholder?: string
  inputMode?: "none" | "text" | "tel" | "url" | "email" | "numeric" | "decimal" | "search"
}

/**
 * Modern titled input with animated error state.
 * Label sits above the input as a title. Placeholder shows inside when empty.
 * Focus turns the label blue. Dark mode + accessibility built-in.
 */
export default function FloatingInput({
  label,
  name,
  value,
  onChange,
  error,
  required,
  type = "text",
  maxLength,
  min,
  max,
  disabled,
  className = "",
  placeholder,
  inputMode,
}: FloatingInputProps) {
  const [focused, setFocused] = useState(false)

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

      <input
        id={name}
        name={name}
        type={type}
        value={value}
        onChange={onChange}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        maxLength={maxLength}
        min={min}
        max={max}
        disabled={disabled}
        inputMode={inputMode}
        placeholder={placeholder ?? label}
        aria-invalid={!!error}
        aria-describedby={error ? `${name}-error` : undefined}
        className={`w-full px-4 py-2.5 rounded-xl border bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 text-sm placeholder-gray-400 dark:placeholder-gray-500 outline-none transition-colors duration-200
          ${error
            ? "border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
          }
          disabled:opacity-60 disabled:cursor-not-allowed
        `}
      />

      <AnimatePresence>
        {error && (
          <motion.p
            id={`${name}-error`}
            role="alert"
            initial={{ opacity: 0, y: -4, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -4, height: 0 }}
            transition={{ duration: 0.15 }}
            className="mt-1.5 text-xs text-red-500 dark:text-red-400"
          >
            {error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  )
}
