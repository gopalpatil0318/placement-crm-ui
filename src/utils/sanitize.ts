/**
 * Validates that a URL uses a safe scheme (https or http) for rendering in <img> tags.
 * Prevents XSS via javascript: or data: URL injection.
 *
 * @returns The original URL if safe, or `null` if unsafe/empty.
 */
export function sanitizeImageUrl(url: string | null | undefined): string | null {
  if (!url) return null
  const trimmed = url.trim()
  if (trimmed.startsWith("https://") || trimmed.startsWith("http://")) {
    return trimmed
  }
  return null
}
