import { useState } from "react"
import { Link } from "react-router-dom"
import {
  Building2, Award, Clock, FileCheck2, FileX2, AlertTriangle, MinusCircle,
  ChevronRight, Loader2, ArrowUpRight,
} from "lucide-react"
import { useAcceptPlacement } from "@/hooks/student/placements/useAcceptPlacement"
import { useRejectPlacement } from "@/hooks/student/placements/useRejectPlacement"
import { cn } from "@/lib/utils"
import type {
  PlacementContext,
  OfferItem,
  CurrentPlacement,
  DocChecklist,
  DocStatus,
} from "@/services/student/dashboard.service"

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatCountdown(deadline: string): string {
  const diff = new Date(deadline).getTime() - Date.now()
  if (diff <= 0) return "Expired"
  const hours = Math.floor(diff / (1000 * 60 * 60))
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
  if (hours >= 48) return `${Math.floor(hours / 24)} days left`
  if (hours > 0) return `${hours}h ${minutes}m left`
  return `${minutes}m left`
}

function isUrgent(deadline: string): boolean {
  return (new Date(deadline).getTime() - Date.now()) < 24 * 60 * 60 * 1000
}

function companyInitials(name: string): string {
  return name.split(/\s+/).slice(0, 2).map(w => w.charAt(0).toUpperCase()).join("")
}

function statusTextColor(status: DocStatus): string {
  if (status === "verified") return "text-emerald-600 dark:text-emerald-400"
  if (status === "rejected") return "text-red-600 dark:text-red-400"
  if (status === "uploaded") return "text-amber-600 dark:text-amber-400"
  return "text-gray-400 dark:text-gray-500"
}

const DOC_STATUS_ICON: Record<DocStatus, { icon: React.ElementType; color: string }> = {
  verified: { icon: FileCheck2, color: "text-emerald-500" },
  uploaded: { icon: Clock, color: "text-amber-500" },
  rejected: { icon: FileX2, color: "text-red-500" },
  missing: { icon: AlertTriangle, color: "text-gray-400 dark:text-gray-500" },
  not_applicable: { icon: MinusCircle, color: "text-gray-300 dark:text-gray-600" },
}

// ─── Offer Card ─────────────────────────────────────────────────────────────────

function OfferCard({ offer }: Readonly<{ offer: OfferItem }>) {
  const { acceptPlacement, isAccepting } = useAcceptPlacement()
  const { rejectPlacement, isRejecting, formData, handleChange, validate, errors, resetForm } = useRejectPlacement()
  const [showDecline, setShowDecline] = useState(false)

  const urgent = offer.offer_expires_at ? isUrgent(offer.offer_expires_at) : false

  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 overflow-hidden">
      <div className="p-5">
        {/* Header: Company + Package */}
        <div className="flex items-start gap-3">
          <div className="h-11 w-11 rounded-xl bg-indigo-50 dark:bg-indigo-900/30 flex items-center justify-center shrink-0">
            <span className="text-sm font-bold text-indigo-600 dark:text-indigo-400">
              {companyInitials(offer.company_name)}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
              {offer.job_title}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {offer.company_name}
            </p>
          </div>
        </div>

        {/* Package */}
        {offer.fulltime_package != null && (
          <div className="mt-3 flex items-center gap-2">
            <Award className="h-4 w-4 text-emerald-500 shrink-0" />
            <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
              ₹{Number(offer.fulltime_package).toLocaleString("en-IN")} LPA
            </span>
          </div>
        )}

        {/* Deadline countdown */}
        {offer.offer_expires_at && (
          <div
            role="timer"
            aria-live="polite"
            aria-label={`Offer deadline: ${formatCountdown(offer.offer_expires_at)}`}
            className={cn(
              "mt-3 flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium",
              urgent
                ? "bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-400"
                : "bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400"
            )}
          >
            <Clock className={cn("h-3.5 w-3.5 shrink-0", urgent && "animate-pulse motion-reduce:animate-none")} />
            Respond by: {formatCountdown(offer.offer_expires_at)}
          </div>
        )}

        {/* Action buttons */}
        <div className="mt-4 flex gap-2">
          <button
            type="button"
            aria-label={`Accept offer from ${offer.company_name}`}
            onClick={() => acceptPlacement(offer.placement_id)}
            disabled={isAccepting || isRejecting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 disabled:opacity-50 transition-all shadow-sm hover:shadow-md"
          >
            {isAccepting ? <Loader2 className="h-4 w-4 animate-spin motion-reduce:animate-none" /> : null}
            Accept
          </button>
          <button
            type="button"
            aria-label={`Decline offer from ${offer.company_name}`}
            onClick={() => setShowDecline(!showDecline)}
            disabled={isAccepting || isRejecting}
            className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 transition-all"
          >
            Decline
          </button>
        </div>

        {/* Decline form */}
        {showDecline && (
          <DeclineForm
            offer={offer}
            formData={formData}
            errors={errors}
            isRejecting={isRejecting}
            handleChange={handleChange}
            validate={validate}
            rejectPlacement={rejectPlacement}
            resetForm={resetForm}
            onCancel={() => setShowDecline(false)}
          />
        )}

        {/* Doc checklist */}
        <DocumentChecklist docs={offer.doc_checklist} />
      </div>
    </div>
  )
}

// ─── Decline Form (extracted for complexity) ────────────────────────────────────

interface DeclineFormProps {
  offer: OfferItem
  formData: { rejection_reason: string }
  errors: { rejection_reason?: string }
  isRejecting: boolean
  handleChange: (value: string) => void
  validate: () => { rejection_reason: string } | null
  rejectPlacement: (args: { placementId: string; payload: { rejection_reason: string } }) => void
  resetForm: () => void
  onCancel: () => void
}

function DeclineForm({ offer, formData, errors, isRejecting, handleChange, validate, rejectPlacement, resetForm, onCancel }: Readonly<DeclineFormProps>) {
  return (
    <div className="mt-3 space-y-2">
      <textarea
        value={formData.rejection_reason}
        onChange={(e) => handleChange(e.target.value)}
        placeholder="Reason for declining (required)…"
        aria-label="Reason for declining the offer"
        rows={2}
        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
      />
      {errors.rejection_reason && (
        <p className="text-xs text-red-500" role="alert">{errors.rejection_reason}</p>
      )}
      <div className="flex gap-2">
        <button
          type="button"
          onClick={() => {
            const validated = validate()
            if (validated) {
              rejectPlacement({ placementId: offer.placement_id, payload: validated })
            }
          }}
          disabled={isRejecting}
          className="flex-1 inline-flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-medium text-red-700 dark:text-red-300 bg-red-50 dark:bg-red-900/30 hover:bg-red-100 dark:hover:bg-red-900/50 disabled:opacity-50 transition"
        >
          {isRejecting ? <Loader2 className="h-3 w-3 animate-spin motion-reduce:animate-none" /> : null}
          Confirm Decline
        </button>
        <button
          type="button"
          onClick={() => { onCancel(); resetForm() }}
          className="px-3 py-2 rounded-lg text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}

// ─── Doc Checklist ──────────────────────────────────────────────────────────────

function DocumentChecklist({ docs }: Readonly<{ docs: DocChecklist }>) {
  const items = Object.entries(docs).filter(([, status]) => status !== "not_applicable")
  if (items.length === 0) return null

  return (
    <div className="mt-4 space-y-1.5">
      <p className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wide mb-2">
        Documents
      </p>
      {items.map(([key, status]: [string, DocStatus]) => {
        const cfg = DOC_STATUS_ICON[status]
        const Icon = cfg.icon
        return (
          <div key={key} className="flex items-center gap-2 text-xs">
            <Icon className={cn("h-3.5 w-3.5 shrink-0", cfg.color)} />
            <span className="text-gray-700 dark:text-gray-300 capitalize">
              {key.replaceAll("_", " ")}
            </span>
            <span className={cn(
              "ml-auto text-[10px] font-medium capitalize",
              statusTextColor(status),
            )}>
              {status}
            </span>
          </div>
        )
      })}
    </div>
  )
}

// ─── Current Placement Summary ──────────────────────────────────────────────────

function PlacedCard({ placement }: Readonly<{ placement: CurrentPlacement }>) {
  return (
    <div className="rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 p-5">
      <div className="flex items-start gap-3">
        <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center shrink-0">
          <Building2 className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
            {placement.job_title}
          </p>
          <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
            {placement.company_name}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 dark:bg-emerald-900/30 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 dark:text-emerald-400 uppercase shrink-0">
          {placement.placement_status.replaceAll("_", " ")}
        </span>
      </div>

      {placement.fulltime_package != null && (
        <div className="mt-3 flex items-center gap-2">
          <Award className="h-4 w-4 text-emerald-500 shrink-0" />
          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
            ₹{Number(placement.fulltime_package).toLocaleString("en-IN")} LPA
          </span>
        </div>
      )}

      {placement.tier_name && (
        <span className="inline-block mt-2 text-[10px] font-semibold uppercase px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400">
          {placement.tier_name}
        </span>
      )}

      <DocumentChecklist docs={placement.doc_checklist} />

      <Link
        to="/student/placements"
        className="mt-4 inline-flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
      >
        View Details <ChevronRight className="h-3 w-3" />
      </Link>
    </div>
  )
}

// ─── Main Component ─────────────────────────────────────────────────────────────

export default function PlacementContextCard({ context }: Readonly<{ context: PlacementContext }>) {
  const hasMultipleOffers = context.offers.length > 1

  return (
    <div className="space-y-4">
      {/* Pending offers — scrollable row when multiple */}
      {context.offers.length > 0 && (
        <div className={hasMultipleOffers ? "flex gap-4 overflow-x-auto pb-2 snap-x snap-mandatory -mx-1 px-1" : ""}>
          {context.offers.map((offer) => (
            <div key={offer.placement_id} className={hasMultipleOffers ? "min-w-[300px] sm:min-w-[340px] snap-start shrink-0" : ""}>
              <OfferCard offer={offer} />
            </div>
          ))}
        </div>
      )}

      {/* Current placement */}
      {context.current_placement && (
        <PlacedCard placement={context.current_placement} />
      )}

      {/* Dream upgrade banner */}
      {context.dream_upgrade_allowed && (
        <Link
          to="/student/jobs"
          className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-purple-50 to-indigo-50 dark:from-purple-950/20 dark:to-indigo-950/20 border border-purple-100 dark:border-purple-800/40 px-4 py-3 hover:shadow-md transition-all group"
        >
          <ArrowUpRight className="h-5 w-5 text-purple-500 shrink-0" />
          <div className="flex-1">
            <p className="text-sm font-medium text-purple-800 dark:text-purple-300">
              Dream Upgrade Available
            </p>
            <p className="text-xs text-purple-600/80 dark:text-purple-400/60">
              You can apply for higher-tier positions.
            </p>
          </div>
          <ChevronRight className="h-4 w-4 text-purple-300 dark:text-purple-600 group-hover:text-purple-500 transition-colors shrink-0" />
        </Link>
      )}
    </div>
  )
}
