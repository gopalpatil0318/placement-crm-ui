import { useCallback, useState } from "react"
import { AnimatePresence, motion, useReducedMotion } from "framer-motion"
import { FileText, ExternalLink, Eye, Loader2, Image as ImageIcon } from "lucide-react"
import { cn } from "@/lib/utils"
import { fadeIn } from "@/lib/animations"
import api from "@/lib/api"

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface DocumentPreviewProps {
  /** Storage path (c_1/...) or legacy URL (https://...) */
  value?: string | null
  /** Bucket for fetching signed download URL (only for storage paths) */
  bucket?: "placenex-public" | "placenex-private"
  /** Display label (defaults to extracted filename) */
  label?: string
  /** Show as inline compact or full card */
  variant?: "inline" | "card"
  /** Additional class names */
  className?: string
}

// ─── Helpers ────────────────────────────────────────────────────────────────────

function getFileName(path: string): string {
  const parts = path.split("/")
  const name = parts.at(-1) ?? path
  // Remove UUID/timestamp prefixes like 42_1713000000_abc.pdf → abc.pdf
  const match = /^\d+_\d+_(.+)$/.exec(name)
  return match ? match[1] : name
}

function isPdf(path: string): boolean {
  return path.toLowerCase().endsWith(".pdf")
}

function isImage(path: string): boolean {
  return /\.(jpe?g|png|webp|gif)$/i.test(path)
}

function isLegacyUrl(value: string): boolean {
  return value.startsWith("http://") || value.startsWith("https://")
}

const ICON_SIZE_CLASSES = {
  4: "h-4 w-4",
  5: "h-5 w-5",
} as const

function FileIcon({ isPdf: isPdfFile, isImg, size = 4 }: Readonly<{ isPdf: boolean; isImg: boolean; size?: keyof typeof ICON_SIZE_CLASSES }>) {
  const cls = `${ICON_SIZE_CLASSES[size]} shrink-0`
  if (isPdfFile) return <FileText className={cn(cls, "text-red-500")} />
  if (isImg) return <ImageIcon className={cn(cls, "text-blue-500")} />
  return <FileText className={cn(cls, "text-gray-500")} />
}

function getFileTypeLabel(isPdfFile: boolean, isImg: boolean): string {
  if (isPdfFile) return "PDF Document"
  if (isImg) return "Image"
  return "File"
}

function getIconBg(isPdfFile: boolean, isImg: boolean): string {
  if (isPdfFile) return "bg-red-50 dark:bg-red-950/30"
  if (isImg) return "bg-blue-50 dark:bg-blue-950/30"
  return "bg-gray-50 dark:bg-gray-800"
}

function ViewAction({
  legacy,
  value,
  displayName,
  isLoading,
  onView,
  variant,
}: Readonly<{
  legacy: boolean
  value: string
  displayName: string
  isLoading: boolean
  onView: () => void
  variant: "inline" | "card"
}>) {
  const isCard = variant === "card"
  if (legacy) {
    return (
      <a
        href={value}
        target="_blank"
        rel="noopener noreferrer"
        className={
          isCard
            ? "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 dark:text-blue-400 dark:hover:bg-blue-950/30"
            : "shrink-0 text-blue-600 transition-colors hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
        }
        aria-label={isCard ? undefined : `Open ${displayName}`}
      >
        <ExternalLink className={isCard ? "h-3.5 w-3.5" : "h-4 w-4"} />
        {isCard && "Open"}
      </a>
    )
  }
  return (
    <button
      type="button"
      onClick={onView}
      disabled={isLoading}
      className={
        isCard
          ? "inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-blue-600 transition-colors hover:bg-blue-50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:opacity-50 dark:text-blue-400 dark:hover:bg-blue-950/30"
          : "shrink-0 text-blue-600 transition-colors hover:text-blue-700 disabled:opacity-50 dark:text-blue-400 dark:hover:text-blue-300"
      }
      aria-label={isCard ? undefined : `View ${displayName}`}
    >
      {isLoading ? (
        <Loader2 className={cn(isCard ? "h-3.5 w-3.5" : "h-4 w-4", "animate-spin")} />
      ) : (
        <Eye className={isCard ? "h-3.5 w-3.5" : "h-4 w-4"} />
      )}
      {isCard && "View"}
    </button>
  )
}

// ─── Component ──────────────────────────────────────────────────────────────────

export function DocumentPreview({
  value,
  bucket = "placenex-private",
  label,
  variant = "inline",
  className,
}: Readonly<DocumentPreviewProps>) {
  const prefersReducedMotion = useReducedMotion()
  const [isLoading, setIsLoading] = useState(false)
  const Wrapper = prefersReducedMotion ? "div" : motion.div

  const handleView = useCallback(async () => {
    if (!value) return

    // Legacy URL — open directly
    if (isLegacyUrl(value)) {
      window.open(value, "_blank", "noopener,noreferrer")
      return
    }

    // Storage path — fetch signed download URL
    setIsLoading(true)
    try {
      const { data } = await api.post("/storage/download-url", {
        bucket,
        storagePath: value,
      })
      window.open(data.data.signedUrl, "_blank", "noopener,noreferrer")
    } catch {
      // Storage path failed — don't open raw path as it would 404
      console.error("[DocumentPreview] Failed to fetch signed URL for:", value)
    } finally {
      setIsLoading(false)
    }
  }, [value, bucket])

  if (!value) return null

  const displayName = label ?? getFileName(value)
  const isPdfFile = isPdf(value)
  const isImageFile = isImage(value)
  const legacy = isLegacyUrl(value)

  // ── Inline variant ────────────────────────────────────────────────────────
  if (variant === "inline") {
    return (
      <AnimatePresence>
        <Wrapper
          {...(!prefersReducedMotion && fadeIn)}
          className={cn("inline-flex items-center gap-2", className)}
        >
          <FileIcon isPdf={isPdfFile} isImg={isImageFile} />

          <span className="max-w-[200px] truncate text-sm text-gray-700 dark:text-gray-300">
            {displayName}
          </span>

          <ViewAction
            legacy={legacy}
            value={value}
            displayName={displayName}
            isLoading={isLoading}
            onView={handleView}
            variant="inline"
          />
        </Wrapper>
      </AnimatePresence>
    )
  }

  // ── Card variant ──────────────────────────────────────────────────────────
  return (
    <AnimatePresence>
      <Wrapper
        {...(!prefersReducedMotion && fadeIn)}
        className={cn(
          "flex items-center gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-gray-700 dark:bg-gray-800",
          className
        )}
      >
        {/* Icon / Thumbnail */}
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            getIconBg(isPdfFile, isImageFile)
          )}
        >
          <FileIcon isPdf={isPdfFile} isImg={isImageFile} size={5} />
        </div>

        {/* Name */}
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
            {displayName}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {getFileTypeLabel(isPdfFile, isImageFile)}
          </p>
        </div>

        {/* View button */}
        <ViewAction
          legacy={legacy}
          value={value}
          displayName={displayName}
          isLoading={isLoading}
          onView={handleView}
          variant="card"
        />
      </Wrapper>
    </AnimatePresence>
  )
}
