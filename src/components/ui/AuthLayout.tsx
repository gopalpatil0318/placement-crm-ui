import { motion, useReducedMotion } from "framer-motion"
import { type TenantCollege } from "@/context/CollegeTenantContext"
import { sanitizeImageUrl } from "@/utils/sanitize"
import PlaceNexLogo from "@/components/ui/PlaceNexLogo"
import {
  GraduationCap,
  Building2,
  MapPin,
  Award,
  Shield,
  BarChart3,
  Users,
  Settings,
  Calendar,
  Globe,
} from "lucide-react"
import { slideInFromLeft, slideInFromRight } from "@/lib/animations"

// ─── Types ──────────────────────────────────────────────────────────────────

interface AuthLayoutProps {
  children: React.ReactNode
  college?: TenantCollege | null
  variant?: "college" | "admin"
}

// ─── Left Panel — College Branding ──────────────────────────────────────────

function CollegeBrandPanel({ college }: Readonly<{ college: TenantCollege | null | undefined }>) {
  const logoUrl = sanitizeImageUrl(college?.college_logo_url)

  return (
    <div className="flex flex-col items-center justify-center gap-8 px-8 xl:px-12 text-center w-full max-w-md mx-auto">
      {/* Logo with glow ring */}
      <div className="relative">
        <div
          className="absolute inset-0 rounded-3xl blur-2xl opacity-40 pointer-events-none"
          style={{ background: "radial-gradient(circle, rgba(99,102,241,0.35) 0%, transparent 70%)" }}
        />
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`${college?.college_name} logo`}
            width={88}
            height={88}
            loading="eager"
            decoding="async"
            className="relative h-22 w-22 rounded-2xl object-cover ring-1 ring-white/15 shadow-lg shadow-black/30"
            onError={(e) => {
              ;(e.target as HTMLImageElement).style.display = "none"
            }}
          />
        ) : (
          <div className="relative flex h-22 w-22 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/15">
            <GraduationCap className="h-10 w-10 text-indigo-400/80" />
          </div>
        )}
      </div>

      {/* College Name & Description */}
      <div className="space-y-3">
        <h1 className="text-2xl font-bold text-white leading-tight tracking-[-0.02em]">
          {college?.college_name ?? "Welcome"}
        </h1>
        {college?.college_description && (
          <p className="text-[13px] text-zinc-400 max-w-sm leading-relaxed mx-auto">
            {college.college_description}
          </p>
        )}
      </div>

      {/* Info Grid — structured cards instead of flat badges */}
      {college && (
        <div className="w-full space-y-2.5">
          {/* Primary info row */}
          <div className="grid grid-cols-2 gap-2.5">
            {college.college_type && (
              <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-3.5 py-3 ring-1 ring-white/[0.06]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-500/10 ring-1 ring-indigo-500/20">
                  <Building2 className="h-3.5 w-3.5 text-indigo-400" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Type</p>
                  <p className="text-xs text-zinc-200 font-medium truncate">{college.college_type}</p>
                </div>
              </div>
            )}
            {college.college_established_year && (
              <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-3.5 py-3 ring-1 ring-white/[0.06]">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 ring-1 ring-emerald-500/20">
                  <Calendar className="h-3.5 w-3.5 text-emerald-400" />
                </div>
                <div className="text-left min-w-0">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Est.</p>
                  <p className="text-xs text-zinc-200 font-medium">{college.college_established_year}</p>
                </div>
              </div>
            )}
          </div>

          {/* Location — full width */}
          {college.college_city && (
            <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-3.5 py-3 ring-1 ring-white/[0.06]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 ring-1 ring-amber-500/20">
                <MapPin className="h-3.5 w-3.5 text-amber-400" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Location</p>
                <p className="text-xs text-zinc-200 font-medium truncate">
                  {college.college_city}
                  {college.college_state ? `, ${college.college_state}` : ""}
                </p>
              </div>
            </div>
          )}

          {/* Affiliation — full width */}
          {college.college_affiliation && (
            <div className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-3.5 py-3 ring-1 ring-white/[0.06]">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-500/10 ring-1 ring-violet-500/20">
                <Award className="h-3.5 w-3.5 text-violet-400" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Affiliation</p>
                <p className="text-xs text-zinc-200 font-medium truncate">{college.college_affiliation}</p>
              </div>
            </div>
          )}

          {/* Website link */}
          {college.college_website && (
            <a
              href={college.college_website}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2.5 rounded-xl bg-white/[0.04] px-3.5 py-3 ring-1 ring-white/[0.06] hover:bg-white/[0.06] hover:ring-white/[0.1] transition-colors duration-200 group"
            >
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-cyan-500/10 ring-1 ring-cyan-500/20">
                <Globe className="h-3.5 w-3.5 text-cyan-400" />
              </div>
              <div className="text-left min-w-0">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Website</p>
                <p className="text-xs text-indigo-400 font-medium truncate group-hover:text-indigo-300 transition-colors">
                  {college.college_website.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, "")}
                </p>
              </div>
            </a>
          )}
        </div>
      )}

      {/* Footer */}
      <div className="mt-auto pt-6">
        <p className="text-[11px] text-zinc-500 mb-4">
          Empowering campus placements with a smarter, streamlined platform.
        </p>
        <div className="flex items-center justify-center gap-1.5 rounded-full bg-white/[0.04] px-4 py-2 ring-1 ring-white/[0.06]">
          <span className="text-[11px] text-zinc-500 leading-none">Powered by</span>
          <PlaceNexLogo variant="icon" size={16} className="[&_rect]:fill-white [&_text]:fill-indigo-400" />
          <span className="text-xs font-bold text-white tracking-tight leading-none">PlaceNex</span>
        </div>
      </div>
    </div>
  )
}

// ─── Left Panel — Admin Branding ────────────────────────────────────────────

function AdminBrandPanel() {
  return (
    <div className="flex flex-col items-center justify-center gap-7 px-10 text-center">
      <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-white/[0.06] ring-1 ring-white/10">
        <Shield className="h-9 w-9 text-white/70" />
      </div>
      <div>
        <h1 className="text-[22px] font-semibold text-white leading-tight tracking-[-0.01em]">
          PlaceNex Admin
        </h1>
        <p className="mt-2.5 text-[13px] text-zinc-400 max-w-xs leading-relaxed">
          System administration portal
        </p>
      </div>

      <ul className="space-y-3 text-left">
        {[
          { icon: Building2, label: "Manage colleges & tenants" },
          { icon: Users, label: "Monitor users & placements" },
          { icon: BarChart3, label: "Platform analytics & reports" },
          { icon: Settings, label: "System configuration" },
        ].map(({ icon: Icon, label }) => (
          <li key={label} className="flex items-center gap-3 text-[13px] text-zinc-300">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-white/[0.06] ring-1 ring-white/[0.06] shrink-0">
              <Icon className="h-3.5 w-3.5 text-zinc-500" />
            </div>
            {label}
          </li>
        ))}
      </ul>

      <div className="mt-auto pt-8">
        <div className="flex items-center justify-center gap-1.5 rounded-full bg-white/[0.04] px-4 py-2 ring-1 ring-white/[0.06]">
          <span className="text-[11px] text-zinc-500 leading-none">Powered by</span>
          <PlaceNexLogo variant="icon" size={16} className="[&_rect]:fill-white [&_text]:fill-indigo-400" />
          <span className="text-xs font-bold text-white tracking-tight leading-none">PlaceNex</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Layout ────────────────────────────────────────────────────────────

export default function AuthLayout({
  children,
  college,
  variant = "college",
}: Readonly<AuthLayoutProps>) {
  const shouldReduce = useReducedMotion()

  const LeftWrapper = shouldReduce ? "div" : motion.div
  const RightWrapper = shouldReduce ? "div" : motion.div

  const leftProps = shouldReduce
    ? {}
    : { variants: slideInFromLeft, initial: "initial", animate: "animate" }
  const rightProps = shouldReduce
    ? {}
    : { variants: slideInFromRight, initial: "initial", animate: "animate" }

  return (
    <div className="min-h-screen flex bg-[#09090b]">
      {/* ─── Left Brand Panel ─── */}
      <LeftWrapper
        {...leftProps}
        className="hidden lg:flex lg:w-[45%] xl:w-[42%] relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-[#09090b]" />

        {/* Soft radial glow */}
        <div
          className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.08) 0%, transparent 70%)",
          }}
        />

        <div className="relative z-10 flex flex-1 flex-col items-center justify-center py-12 border-r border-white/[0.06]">
          {variant === "admin" ? (
            <AdminBrandPanel />
          ) : (
            <CollegeBrandPanel college={college} />
          )}
        </div>
      </LeftWrapper>

      {/* ─── Right Form Panel ─── */}
      <RightWrapper
        {...rightProps}
        className="flex-1 flex items-center justify-center px-4 py-12 sm:px-8 relative"
      >
        <div
          className="absolute top-1/3 right-1/4 w-[400px] h-[400px] pointer-events-none"
          style={{
            background: "radial-gradient(circle, rgba(99,102,241,0.05) 0%, transparent 70%)",
          }}
        />
        <div className="relative z-10 w-full max-w-[420px]">
          {children}
        </div>
      </RightWrapper>
    </div>
  )
}
