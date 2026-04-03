/**
 * Subdomain detection utility for PlaceNex multi-tenant architecture.
 *
 * Production:  "rcpit.placenex.in"          → "rcpit"
 * Local:       "rcpit.lvh.me:5173"          → "rcpit"
 * Fallback:    "localhost:5173?subdomain=rcpit" → "rcpit"
 * No sub:      "placenex.in"                → null
 * Reserved:    "admin.placenex.in"          → "admin" (handled by caller)
 */

const KNOWN_DOMAINS = ["placenex.in", "lvh.me"] as const;

/**
 * Extract the subdomain from the current browser URL.
 *
 * @returns The subdomain string, or `null` if none was detected.
 */
export function getSubdomain(): string | null {
  const hostname = globalThis.location.hostname;

  // 1. Production / local lvh.me — check known base domains
  for (const base of KNOWN_DOMAINS) {
    if (hostname.endsWith(`.${base}`)) {
      const sub = hostname.slice(0, -(base.length + 1)); // strip ".placenex.in"
      return sub.length > 0 ? sub : null;
    }
    // Bare domain — no subdomain
    if (hostname === base || hostname === `www.${base}`) {
      return null;
    }
  }

  // 2. Dev fallback — localhost / 127.0.0.1 with ?subdomain= query param
  if (hostname === "localhost" || hostname === "127.0.0.1") {
    const params = new URLSearchParams(globalThis.location.search);
    return params.get("subdomain") ?? null;
  }

  return null;
}
