import { useCallback, useEffect, useId, useMemo, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Camera, X, AlertCircle, User } from "lucide-react"
import { cn } from "@/lib/utils"
import { fadeIn } from "@/lib/animations"

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface ImageUploadProps {
  /** Current image URL or storage path (controlled) */
  value?: string | null
  /** Called with selected File, or null on remove */
  onFileSelect: (file: File | null) => void
  /** Upload progress 0-100 */
  progress?: number
  /** Whether upload is in progress */
  isUploading?: boolean
  /** Error message */
  error?: string | null
  /** "avatar" = circular, "logo" = square rounded */
  variant?: "avatar" | "logo"
  /** Size in px (default: 96 for avatar, 80 for logo) */
  size?: number
  /** Initials fallback when no image */
  initials?: string
  /** Fallback background color for initials */
  initialsColor?: string
  /** Label for accessibility */
  label?: string
  /** Accepted image types */
  accept?: string
  /** Disable interaction */
  disabled?: boolean
  /** Additional class names */
  className?: string
  /** Unique id */
  id?: string
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp"
const DEFAULT_SIZES = { avatar: 96, logo: 80 } as const

// ─── Helpers ────────────────────────────────────────────────────────────────────

function ImagePlaceholder({
  initials,
  initialsColor,
  isCircular,
}: Readonly<{ initials?: string; initialsColor: string; isCircular: boolean }>) {
  if (initials) {
    return (
      <div
        className={cn(
          "flex h-full w-full items-center justify-center text-lg font-semibold text-blue-600 dark:text-blue-300",
          isCircular ? "rounded-full" : "rounded-xl",
          initialsColor
        )}
      >
        {initials.slice(0, 2).toUpperCase()}
      </div>
    )
  }
  return <User className="h-8 w-8 text-gray-400 dark:text-gray-500" />
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function ImageUpload({
  value,
  onFileSelect,
  progress = 0,
  isUploading = false,
  error,
  variant = "avatar",
  size,
  initials,
  initialsColor = "bg-blue-100 dark:bg-blue-900",
  label = "Upload image",
  accept = IMAGE_ACCEPT,
  disabled = false,
  className,
  id,
}: Readonly<ImageUploadProps>) {
  const prefersReducedMotion = useReducedMotion()
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const Wrapper = prefersReducedMotion ? "div" : motion.div

  const resolvedSize = size ?? DEFAULT_SIZES[variant]
  const isCircular = variant === "avatar"
  const autoId = useId()
  const inputId = id ?? autoId

  // ── Build local preview from File object ────────────────────────────────
  // value can be: a storage path (c_1/...), a URL (https://...), or null
  const displayUrl = useMemo(() => {
    if (previewUrl) return previewUrl
    if (!value) return null
    // If value looks like a URL, show it directly
    if (value.startsWith("http://") || value.startsWith("https://")) return value
    // Storage path in public bucket — construct CDN URL client-side
    const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
    if (supabaseUrl && /^c_\w+\/[a-z-]+\/\w+_\d+_[a-f0-9]+\.\w+$/.test(value)) {
      return `${supabaseUrl}/storage/v1/object/public/placenex-public/${value}`
    }
    return null
  }, [value, previewUrl])

  // Cleanup blob URL on unmount or change
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl)
    }
  }, [previewUrl])

  const handleFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0]
      if (!file || disabled || isUploading) return

      // Create local preview
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(URL.createObjectURL(file))

      onFileSelect(file)
      e.target.value = ""
    },
    [disabled, isUploading, onFileSelect, previewUrl]
  )

  const handleRemove = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation()
      if (previewUrl) URL.revokeObjectURL(previewUrl)
      setPreviewUrl(null)
      onFileSelect(null)
    },
    [onFileSelect, previewUrl]
  )

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className={cn("inline-flex flex-col items-center gap-2", className)}>
      <div
        className="group relative"
        style={{ width: resolvedSize, height: resolvedSize }}
      >
        {/* Hidden input */}
        <input
          id={inputId}
          type="file"
          accept={accept}
          onChange={handleFileChange}
          disabled={disabled || isUploading}
          className="sr-only"
          aria-label={label}
        />

        {/* Image / Placeholder */}
        <label
          htmlFor={inputId}
          className={cn(
            "relative flex cursor-pointer items-center justify-center overflow-hidden border-2 border-dashed transition-colors",
            isCircular ? "rounded-full" : "rounded-xl",
            error
              ? "border-red-300 dark:border-red-700"
              : "border-gray-200 hover:border-gray-300 dark:border-gray-700 dark:hover:border-gray-600",
            disabled && "pointer-events-none opacity-50"
          )}
          style={{ width: resolvedSize, height: resolvedSize }}
        >
          {displayUrl ? (
            <img
              src={displayUrl}
              alt={label}
              className={cn(
                "h-full w-full object-cover",
                isCircular ? "rounded-full" : "rounded-xl"
              )}
            />
          ) : (
            <ImagePlaceholder
              initials={initials}
              initialsColor={initialsColor}
              isCircular={isCircular}
            />
          )}

          {/* Upload overlay */}
          {!isUploading && (
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-opacity group-hover:opacity-100",
                isCircular ? "rounded-full" : "rounded-xl"
              )}
            >
              <Camera className="h-6 w-6 text-white" />
            </div>
          )}

          {/* Progress ring for uploading */}
          {isUploading && (
            <div
              className={cn(
                "absolute inset-0 flex items-center justify-center bg-black/50",
                isCircular ? "rounded-full" : "rounded-xl"
              )}
            >
              <svg
                className="h-10 w-10 -rotate-90"
                viewBox="0 0 36 36"
                aria-hidden="true"
              >
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  className="text-white/20"
                />
                <circle
                  cx="18"
                  cy="18"
                  r="15.5"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeDasharray={`${progress * 0.974} 100`}
                  className="text-white transition-all duration-300"
                />
              </svg>
              <span className="absolute text-xs font-semibold text-white">
                {progress}%
              </span>
            </div>
          )}
        </label>

        {/* Remove button */}
        {displayUrl && !isUploading && !disabled && (
          <button
            type="button"
            onClick={handleRemove}
            className={cn(
              "absolute -right-1 -top-1 z-10 rounded-full border-2 border-white bg-gray-800 p-1 text-white shadow-sm transition-colors hover:bg-red-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:border-gray-900",
            )}
            aria-label="Remove image"
          >
            <X className="h-3 w-3" />
          </button>
        )}
      </div>

      {/* Error */}
      <AnimatePresence>
        {error && (
          <Wrapper
            {...(!prefersReducedMotion && fadeIn)}
            role="alert"
            className="flex items-center gap-1 text-xs text-red-500 dark:text-red-400"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </Wrapper>
        )}
      </AnimatePresence>
    </div>
  )
}
