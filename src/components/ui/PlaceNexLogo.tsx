interface PlaceNexLogoProps {
  /** "icon" = just the P icon, "full" = icon + PlaceNex text */
  variant?: "icon" | "full"
  /** Icon size in px (default 28) */
  size?: number
  className?: string
}

export default function PlaceNexLogo({
  variant = "full",
  size = 28,
  className = "",
}: Readonly<PlaceNexLogoProps>) {
  return (
    <span className={`inline-flex items-center gap-2 ${className}`}>
      {/* Icon — stylised "P" in a rounded square */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 32 32"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <rect width="32" height="32" rx="8" fill="#2563EB" />
        <text
          x="50%"
          y="54%"
          dominantBaseline="central"
          textAnchor="middle"
          fill="#fff"
          fontSize="20"
          fontWeight="700"
          fontFamily="system-ui, sans-serif"
        >
          P
        </text>
      </svg>

      {variant === "full" && (
        <span className="text-xl font-bold tracking-tight text-blue-600 dark:text-blue-400 whitespace-nowrap">
          PlaceNex
        </span>
      )}
    </span>
  )
}
