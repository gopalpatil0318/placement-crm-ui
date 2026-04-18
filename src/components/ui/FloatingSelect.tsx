import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ChevronDown } from "lucide-react"

interface SelectOption {
  value: string
  label: string
}

interface FloatingSelectProps {
  label: string
  name: string
  value: string
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void
  options: SelectOption[]
  error?: string
  required?: boolean
  disabled?: boolean
  className?: string
}

/**
 * Modern titled select with animated chevron and error state.
 * Label sits above as a title. Chevron rotates on focus.
 * Dark mode + accessibility built-in.
 */
export default function FloatingSelect({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required,
  disabled,
  className = "",
}: Readonly<FloatingSelectProps>) {
  const [focused, setFocused] = useState(false)

  function getLabelColor() {
    if (error) return "text-red-500 dark:text-red-400"
    if (focused) return "text-blue-600 dark:text-blue-400"
    return "text-gray-700 dark:text-gray-300"
  }

  return (
    <div className={className}>
      <label
        htmlFor={name}
        className={`block text-sm font-medium mb-1.5 transition-colors duration-200 ${getLabelColor()}`}
      >
        {label}
        {required && <span className="text-red-400 ml-0.5">*</span>}
      </label>

      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          disabled={disabled}
          required={required}
          aria-invalid={!!error}
          aria-describedby={error ? `${name}-error` : undefined}
          className={`w-full px-4 py-2.5 pr-10 rounded-xl border bg-white dark:bg-gray-800 text-sm outline-none transition-colors duration-200 appearance-none cursor-pointer [&>option]:text-gray-900 [&>option]:bg-white dark:[&>option]:text-gray-100 dark:[&>option]:bg-gray-800
            ${value ? "text-gray-900 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}
            ${error
              ? "border-red-400 dark:border-red-500 focus:border-red-500 focus:ring-2 focus:ring-red-500/20"
              : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600 focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
            }
            disabled:opacity-60 disabled:cursor-not-allowed
          `}
        >
          <option value="">Select {label}</option>
          {options
            .filter((opt) => opt.value !== "")
            .map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
        </select>

        <ChevronDown
          className={`absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 pointer-events-none transition-transform duration-200
            ${focused ? "rotate-180" : ""}
            ${error ? "text-red-400" : "text-gray-400 dark:text-gray-500"}
          `}
        />
      </div>

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
