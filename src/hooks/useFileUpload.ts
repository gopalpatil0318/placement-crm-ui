import { useState, useCallback, useRef } from "react"
import imageCompression from "browser-image-compression"
import api from "@/lib/api"

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface UploadOptions {
  /** Supabase storage bucket name */
  bucket: "placenex-public" | "placenex-private"
  /** Storage category for path building */
  category: string
  /** Entity ID (student, company, college, etc.) */
  entityId: string
  /** Max file size in bytes (default: 2MB for images, 5MB for docs) */
  maxSizeBytes?: number
  /** Allowed MIME types (default: images + PDF) */
  allowedTypes?: string[]
  /** Auto-compress images to WebP (default: true for images) */
  compressImages?: boolean
  /** Max image dimension after compression (default: 1200) */
  maxImageDimension?: number
}

export interface UploadResult {
  /** Storage path to save in DB (e.g. c_1/photos/42_1713...) */
  storagePath: string
}

export interface UseFileUploadReturn {
  upload: (file: File, options: UploadOptions) => Promise<UploadResult>
  isUploading: boolean
  progress: number
  error: string | null
  reset: () => void
  abort: () => void
}

// ─── Constants ──────────────────────────────────────────────────────────────────

const IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"]
const DOCUMENT_TYPES = ["application/pdf"]
const DEFAULT_ALLOWED = [...IMAGE_TYPES, ...DOCUMENT_TYPES]

const IMAGE_MAX_BYTES = 2 * 1024 * 1024 // 2 MB
const DOCUMENT_MAX_BYTES = 5 * 1024 * 1024 // 5 MB

// ─── Hook ───────────────────────────────────────────────────────────────────────

export const useFileUpload = (): UseFileUploadReturn => {
  const [isUploading, setIsUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const xhrRef = useRef<XMLHttpRequest | null>(null)

  const reset = useCallback(() => {
    setIsUploading(false)
    setProgress(0)
    setError(null)
  }, [])

  const abort = useCallback(() => {
    xhrRef.current?.abort()
    xhrRef.current = null
    reset()
  }, [reset])

  const upload = useCallback(
    async (file: File, options: UploadOptions): Promise<UploadResult> => {
      const {
        bucket,
        category,
        entityId,
        maxSizeBytes,
        allowedTypes = DEFAULT_ALLOWED,
        compressImages = true,
        maxImageDimension = 1200,
      } = options

      setError(null)
      setProgress(0)
      setIsUploading(true)

      try {
        // ── 1. Validate MIME type ─────────────────────────────────────────
        if (!allowedTypes.includes(file.type)) {
          throw new Error(
            `File type not allowed. Accepted: ${allowedTypes
              .map((t) => t.split("/")[1])
              .join(", ")}`
          )
        }

        // ── 2. Validate size ──────────────────────────────────────────────
        const isImage = IMAGE_TYPES.includes(file.type)
        const limit = maxSizeBytes ?? (isImage ? IMAGE_MAX_BYTES : DOCUMENT_MAX_BYTES)
        if (file.size > limit) {
          const limitMB = (limit / (1024 * 1024)).toFixed(1)
          throw new Error(`File too large. Maximum size is ${limitMB} MB`)
        }

        // ── 3. Compress image if applicable ───────────────────────────────
        let processedFile: File | Blob = file
        let contentType = file.type
        let fileName = file.name

        if (isImage && compressImages) {
          setProgress(5)
          processedFile = await imageCompression(file, {
            maxSizeMB: limit / (1024 * 1024),
            maxWidthOrHeight: maxImageDimension,
            useWebWorker: true,
            fileType: "image/webp",
          })
          contentType = "image/webp"
          fileName = fileName.replace(/\.[^.]+$/, ".webp")
          setProgress(15)
        }

        // ── 4. Request signed upload URL ──────────────────────────────────
        setProgress(20)
        const { data } = await api.post("/storage/upload-url", {
          bucket,
          category,
          fileName,
          contentType,
          fileSize: processedFile.size,
          entityId,
        })

        const { signedUrl, storagePath } = data.data

        // ── 5. Upload via XHR (for progress tracking) ─────────────────────
        await new Promise<void>((resolve, reject) => {
          const xhr = new XMLHttpRequest()
          xhrRef.current = xhr

          xhr.upload.addEventListener("progress", (e) => {
            if (e.lengthComputable) {
              // Map upload progress to 25-95% of total progress
              const uploadPercent = 25 + Math.round((e.loaded / e.total) * 70)
              setProgress(uploadPercent)
            }
          })

          xhr.addEventListener("load", () => {
            xhrRef.current = null
            if (xhr.status >= 200 && xhr.status < 300) {
              resolve()
            } else {
              reject(new Error(`Upload failed (${xhr.status})`))
            }
          })

          xhr.addEventListener("error", () => {
            xhrRef.current = null
            reject(new Error("Upload failed — check your connection"))
          })

          xhr.addEventListener("abort", () => {
            xhrRef.current = null
            reject(new Error("Upload cancelled"))
          })

          xhr.open("PUT", signedUrl)
          xhr.setRequestHeader("Content-Type", contentType)
          xhr.send(processedFile)
        })

        setProgress(100)
        return { storagePath }
      } catch (err: unknown) {
        const message =
          err instanceof Error ? err.message : "Upload failed"
        setError(message)
        setProgress(0)
        throw err
      } finally {
        setIsUploading(false)
      }
    },
    []
  )

  return { upload, isUploading, progress, error, reset, abort }
}
