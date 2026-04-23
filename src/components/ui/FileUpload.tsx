import { useCallback, useId, useRef, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { Upload, X, FileText, AlertCircle, CheckCircle2 } from "lucide-react"
import { cn } from "@/lib/utils"
import { fadeIn } from "@/lib/animations"

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface FileUploadProps {
  /** Current file name or storage path (controlled) */
  value?: string | null
  /** Called with the selected File, or null on remove */
  onFileSelect: (file: File | null) => void
  /** Upload progress 0-100 (pass from useFileUpload) */
  progress?: number
  /** Whether upload is in progress */
  isUploading?: boolean
  /** Error message to display */
  error?: string | null
  /** Accepted MIME types for the file input */
  accept?: string
  /** Max file size in bytes (for display hint) */
  maxSizeBytes?: number
  /** Label displayed in the drop zone */
  label?: string
  /** Helper text below the label */
  hint?: string
  /** Disable interaction */
  disabled?: boolean
  /** Additional class names on the root container */
  className?: string
  /** Unique id for accessibility */
  id?: string
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
}

function getDisplayName(value: string): string {
  // Storage paths like c_1/photos/42_171300_abc.webp → show filename
  const parts = value.split("/")
  return parts.at(-1) ?? value
}

function getDropZoneStyle(isDragOver: boolean, hasError: boolean): string {
  if (isDragOver) {
    return "border-blue-400 bg-blue-50/50 dark:border-blue-500 dark:bg-blue-950/30"
  }
  if (hasError) {
    return "border-red-300 bg-red-50/30 dark:border-red-700 dark:bg-red-950/20"
  }
  return "border-gray-200 bg-gray-50/50 hover:border-gray-300 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800/50 dark:hover:border-gray-600 dark:hover:bg-gray-800"
}

function UploadingState({
  progress,
  prefersReducedMotion,
  className,
}: Readonly<{ progress: number; prefersReducedMotion: boolean | null; className?: string }>) {
  const Wrapper = prefersReducedMotion ? "div" : motion.div
  return (
    <div className={cn("w-full", className)}>
      <div className="rounded-xl border border-blue-200 bg-blue-50/50 p-4 dark:border-blue-800 dark:bg-blue-950/30">
        <div className="mb-2 flex items-center gap-2 text-sm font-medium text-blue-700 dark:text-blue-300">
          <Upload className="h-4 w-4 animate-pulse" />
          Uploading…
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-blue-100 dark:bg-blue-900">
          <Wrapper
            className="h-full rounded-full bg-blue-500"
            {...(!prefersReducedMotion && {
              initial: { width: 0 },
              animate: { width: `${progress}%` },
              transition: { duration: 0.3, ease: "easeOut" },
            })}
            style={prefersReducedMotion ? { width: `${progress}%` } : undefined}
          />
        </div>
        <p className="mt-1 text-xs text-blue-600 dark:text-blue-400">{progress}%</p>
      </div>
    </div>
  )
}

function FileSelectedState({
  value,
  disabled,
  onRemove,
  className,
}: Readonly<{ value: string; disabled: boolean; onRemove: () => void; className?: string }>) {
  return (
    <div className={cn("w-full", className)}>
      <div className="flex items-center gap-3 rounded-xl border border-green-200 bg-green-50/50 p-3 dark:border-green-800 dark:bg-green-950/30">
        <CheckCircle2 className="h-5 w-5 shrink-0 text-green-600 dark:text-green-400" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
            {getDisplayName(value)}
          </p>
        </div>
        <button
          type="button"
          onClick={onRemove}
          disabled={disabled}
          className="rounded-lg p-1.5 text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:hover:bg-gray-800 dark:hover:text-gray-300"
          aria-label="Remove file"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function FileUpload({
  value,
  onFileSelect,
  progress = 0,
  isUploading = false,
  error,
  accept,
  maxSizeBytes,
  label = "Upload file",
  hint,
  disabled = false,
  className,
  id,
}: Readonly<FileUploadProps>) {
  const prefersReducedMotion = useReducedMotion()
  const inputRef = useRef<HTMLInputElement>(null)
  const dragCountRef = useRef(0)
  const [isDragOver, setIsDragOver] = useState(false)
  const autoId = useId()
  const inputId = id ?? autoId

  const Wrapper = prefersReducedMotion ? "div" : motion.div

  const handleFileChange = useCallback(
    (file: File | null) => {
      if (disabled || isUploading) return
      onFileSelect(file)
    },
    [disabled, isUploading, onFileSelect]
  )

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0] ?? null
      handleFileChange(file)
      // Reset input so the same file can be re-selected
      e.target.value = ""
    },
    [handleFileChange]
  )

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      dragCountRef.current = 0
      setIsDragOver(false)
      const file = e.dataTransfer.files?.[0] ?? null
      if (!file) return
      // Validate MIME type against accept prop (drag-drop bypasses <input accept>)
      if (accept) {
        const acceptedTypes = accept.split(",").map((t) => t.trim())
        if (!acceptedTypes.includes(file.type)) return
      }
      handleFileChange(file)
    },
    [handleFileChange, accept]
  )

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
  }, [])

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCountRef.current += 1
    if (dragCountRef.current === 1) setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    dragCountRef.current -= 1
    if (dragCountRef.current === 0) setIsDragOver(false)
  }, [])

  const handleRemove = useCallback(() => {
    onFileSelect(null)
  }, [onFileSelect])

  const hasFile = !!value

  // ── Uploading state ───────────────────────────────────────────────────────
  if (isUploading) {
    return <UploadingState progress={progress} prefersReducedMotion={prefersReducedMotion} className={className} />
  }

  // ── File selected state ───────────────────────────────────────────────────
  if (hasFile && !error) {
    return <FileSelectedState value={value} disabled={disabled} onRemove={handleRemove} className={className} />
  }

  // ── Default / error / empty drop zone ─────────────────────────────────────
  const dropZoneStyle = getDropZoneStyle(isDragOver, !!error)

  return (
    <div className={cn("w-full", className)}>
      <label
        htmlFor={inputId}
        aria-describedby={error ? `${inputId}-error` : undefined}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        className={cn(
          "group relative flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed p-6 text-center transition-colors",
          "focus-within:outline-none focus-within:ring-2 focus-within:ring-blue-500/20",
          dropZoneStyle,
          disabled && "pointer-events-none opacity-50"
        )}
      >
        <input
          ref={inputRef}
          id={inputId}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="sr-only"
        />

        {error ? (
          <AlertCircle className="h-8 w-8 text-red-400 dark:text-red-500" />
        ) : (
          <FileText className="h-8 w-8 text-gray-400 transition-colors group-hover:text-gray-500 dark:text-gray-500 dark:group-hover:text-gray-400" />
        )}

        <div>
          <p className="text-sm font-medium text-gray-700 dark:text-gray-300">{label}</p>
          <p className="mt-0.5 text-xs text-gray-500 dark:text-gray-400">
            {hint ?? (maxSizeBytes ? `Max ${formatFileSize(maxSizeBytes)}` : "Drag & drop or click to browse")}
          </p>
        </div>
      </label>

      {/* Error message */}
      <AnimatePresence>
        {error && (
          <Wrapper
            {...(!prefersReducedMotion && fadeIn)}
            id={`${inputId}-error`}
            role="alert"
            className="mt-1.5 flex items-center gap-1.5 text-xs text-red-500 dark:text-red-400"
          >
            <AlertCircle className="h-3.5 w-3.5 shrink-0" />
            {error}
          </Wrapper>
        )}
      </AnimatePresence>
    </div>
  )
}
