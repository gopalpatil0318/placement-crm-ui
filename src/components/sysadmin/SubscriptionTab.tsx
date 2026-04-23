import { useState } from "react"
import {
  CreditCard,
  Plus,
  Banknote,
  Calendar,
  Users,
  Clock,
  AlertTriangle,
  Loader2,
  ChevronDown,
  ChevronUp,
  Receipt,
} from "lucide-react"
import ModalWrapper from "@/components/ui/ModalWrapper"
import { useCollegeSubscription, useSubscriptionPayments } from "@/hooks/sysadmin/useBilling"
import type {
  SubscriptionStatus,
  CreateSubscriptionPayload,
  RecordPaymentPayload,
  Subscription,
  Payment,
} from "@/services/sysadmin/subscription.services"

// ─── Constants ──────────────────────────────────────────────────────────────────

const PAYMENT_METHODS = ["bank_transfer", "upi", "cheque", "cash", "online"] as const
const PASSOUT_YEARS = Array.from({ length: 10 }, (_, i) => new Date().getFullYear() + i - 2)

// ─── Helpers ────────────────────────────────────────────────────────────────────

function formatCurrency(amount: number | null | undefined): string {
  if (amount == null || amount === 0) return "—"
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount)
}

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "—"
  return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

function getStatusStyle(status: SubscriptionStatus | null): { bg: string; text: string; dot: string } {
  switch (status) {
    case "active": return { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" }
    case "trial": return { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" }
    case "expired": return { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" }
    case "suspended": return { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-400", dot: "bg-gray-500" }
    default: return { bg: "bg-gray-50 dark:bg-gray-800", text: "text-gray-500 dark:text-gray-400", dot: "bg-gray-400" }
  }
}

function getDaysRemaining(dateStr: string | null): number | null {
  if (!dateStr) return null
  const diff = new Date(dateStr).getTime() - Date.now()
  return Math.ceil(diff / 86_400_000)
}

function getQuotaPercent(used: number, quota: number | null | undefined): number {
  if (!quota) return 0
  return Math.min(Math.round((used / quota) * 100), 100)
}

function getQuotaColor(percent: number): string {
  if (percent >= 100) return "bg-red-500"
  if (percent >= 90) return "bg-red-400"
  if (percent >= 80) return "bg-amber-400"
  return "bg-emerald-500"
}

function getQuotaTextColor(percent: number): string {
  if (percent >= 90) return "text-red-600 dark:text-red-400"
  if (percent >= 80) return "text-amber-600 dark:text-amber-400"
  return "text-emerald-600 dark:text-emerald-400"
}

function today(): string {
  return new Date().toISOString().split("T")[0]
}

const INPUT_CLASS =
  "w-full h-10 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors"

const TEXTAREA_CLASS =
  "w-full rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-colors resize-none"

// ─── Main Component ─────────────────────────────────────────────────────────────

interface SubscriptionTabProps {
  collegeId: string
  collegeName: string
}

export default function SubscriptionTab({ collegeId, collegeName }: Readonly<SubscriptionTabProps>) {
  const {
    current,
    subscriptions,
    loadingCurrent,
    createSubscription,
    creatingSubscription,
    recordPayment,
    recordingPayment,
  } = useCollegeSubscription(collegeId)

  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showPaymentModal, setShowPaymentModal] = useState(false)
  const [showHistory, setShowHistory] = useState(false)

  const sub = current?.subscription
  const studentsUsed = current?.students_used ?? 0
  const quotaPercent = getQuotaPercent(studentsUsed, sub?.student_quota)
  const quotaColor = getQuotaColor(quotaPercent)
  const quotaTextColor = getQuotaTextColor(quotaPercent)
  const due = sub ? (sub.total_amount ?? 0) - (sub.amount_paid ?? 0) : 0
  const daysLeft = getDaysRemaining(sub?.subscription_status === "trial" ? sub.trial_ends_at : sub?.valid_to ?? null)
  const statusStyle = getStatusStyle(sub?.subscription_status ?? current?.subscription_status ?? "none")
  const hasSub = !!sub

  if (loadingCurrent) return <SubscriptionSkeleton />

  return (
    <div className="space-y-6">
      {/* ─── Header ──────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <CreditCard className="h-4.5 w-4.5 text-blue-500" />
          <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wider">
            Subscription & Billing
          </h3>
        </div>
        <div className="flex items-center gap-2">
          {hasSub && (
            <button
              type="button"
              onClick={() => setShowPaymentModal(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-900/20 dark:text-emerald-400 dark:hover:bg-emerald-900/30 transition-colors"
            >
              <Banknote className="h-3.5 w-3.5" />
              Record Payment
            </button>
          )}
          <button
            type="button"
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium bg-blue-50 text-blue-700 hover:bg-blue-100 dark:bg-blue-900/20 dark:text-blue-400 dark:hover:bg-blue-900/30 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            {hasSub ? "New Subscription" : "Create Subscription"}
          </button>
        </div>
      </div>

      {/* ─── No subscription ──────────────────────────────────────── */}
      {!hasSub && (
        <div className="border border-dashed border-gray-300 dark:border-gray-600 rounded-xl p-8 text-center">
          <CreditCard className="h-10 w-10 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-1">No Active Subscription</p>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            {collegeName} does not have an active subscription. Create one to enable quota management.
          </p>
        </div>
      )}

      {/* ─── Current Subscription Card ───────────────────────────── */}
      {hasSub && (
        <div className="rounded-xl border border-gray-200 dark:border-gray-800 overflow-hidden">
          {/* Status banner */}
          <div className={`px-5 py-3 flex items-center justify-between ${statusStyle.bg}`}>
            <div className="flex items-center gap-2">
              <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold capitalize ${statusStyle.bg} ${statusStyle.text}`}>
                <span className={`h-1.5 w-1.5 rounded-full ${statusStyle.dot}`} />
                {sub.subscription_status}
              </span>
              {daysLeft !== null && daysLeft > 0 && daysLeft <= 30 && (
                <span className={`inline-flex items-center gap-1 text-xs font-semibold ${
                  daysLeft <= 7
                    ? "text-red-600 dark:text-red-400"
                    : "text-amber-600 dark:text-amber-400"
                }`}>
                  <AlertTriangle className="h-3 w-3" />
                  {daysLeft}d remaining
                </span>
              )}
              {daysLeft !== null && daysLeft <= 0 && sub.subscription_status !== "expired" && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-red-600 dark:text-red-400">
                  <AlertTriangle className="h-3 w-3" />
                  Grace period
                </span>
              )}
            </div>
            <span className="text-xs text-gray-500 dark:text-gray-400 font-mono">
              {sub.subscription_id.slice(0, 8)}
            </span>
          </div>

          {/* Info grid */}
          <div className="p-5">
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Quota */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Users className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Student Quota</span>
                </div>
                <div className="mb-2">
                  <span className={`text-xl font-bold tabular-nums ${quotaTextColor}`}>{studentsUsed}</span>
                  <span className="text-sm text-gray-400 dark:text-gray-500"> / {sub.student_quota}</span>
                </div>
                <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                  <div className={`h-full rounded-full transition-all ${quotaColor}`} style={{ width: `${quotaPercent}%` }} />
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1 tabular-nums">
                  {current?.students_remaining ?? (sub.student_quota - studentsUsed)} remaining
                </p>
              </div>

              {/* Period */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Calendar className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Period</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                  {formatDate(sub.valid_from)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                  to {formatDate(sub.valid_to)}
                </p>
                {sub.trial_ends_at && (
                  <p className="text-xs text-blue-600 dark:text-blue-400 mt-1 font-medium">
                    Trial ends {formatDate(sub.trial_ends_at)}
                  </p>
                )}
              </div>

              {/* Billing */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Banknote className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Billing</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                  {formatCurrency(sub.total_amount)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 tabular-nums">
                  {formatCurrency(sub.price_per_student)}/student
                </p>
              </div>

              {/* Payment status */}
              <div>
                <div className="flex items-center gap-1.5 mb-2">
                  <Clock className="h-3.5 w-3.5 text-gray-400" />
                  <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Payment</span>
                </div>
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">
                  {formatCurrency(sub.amount_paid)} <span className="text-xs text-gray-400 font-normal">paid</span>
                </p>
                {due > 0 ? (
                  <p className="text-sm font-semibold text-red-600 dark:text-red-400 tabular-nums mt-0.5">
                    {formatCurrency(due)} <span className="text-xs font-normal">due</span>
                  </p>
                ) : (
                  <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5 font-semibold">Fully paid</p>
                )}
              </div>
            </div>

            {/* Allowed passout years */}
            {sub.allowed_passout_years && sub.allowed_passout_years.length > 0 && (
              <div className="mt-5 pt-5 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-2">Allowed Passout Years</p>
                <div className="flex flex-wrap gap-1.5">
                  {sub.allowed_passout_years.map((y) => (
                    <span key={y} className="px-2 py-0.5 rounded-md text-xs font-mono font-medium bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300">
                      {y}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Notes */}
            {sub.notes && (
              <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400 mb-1">Notes</p>
                <p className="text-sm text-gray-700 dark:text-gray-300">{sub.notes}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ─── Payment History (for current sub) ─────────────────────── */}
      {hasSub && (
        <PaymentHistory subscriptionId={sub.subscription_id} />
      )}

      {/* ─── Subscription History Toggle ─────────────────────────── */}
      {subscriptions.length > 1 && (
        <div>
          <button
            type="button"
            onClick={() => setShowHistory(!showHistory)}
            className="inline-flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 font-medium transition-colors"
          >
            {showHistory ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            Previous Subscriptions ({subscriptions.length - 1})
          </button>

          {showHistory && (
            <div className="mt-3 space-y-3">
              {subscriptions
                .filter((s) => s.subscription_id !== sub?.subscription_id)
                .map((s) => (
                  <PreviousSubscriptionCard key={s.subscription_id} subscription={s} />
                ))
              }
            </div>
          )}
        </div>
      )}

      {/* ─── Modals ──────────────────────────────────────────────── */}
      {showCreateModal && (
        <CreateSubscriptionModal
          isOpen={showCreateModal}
          onClose={() => setShowCreateModal(false)}
          onSubmit={createSubscription}
          saving={creatingSubscription}
          collegeName={collegeName}
        />
      )}

      {hasSub && showPaymentModal && (
        <RecordPaymentModal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          onSubmit={(data) => recordPayment({ subId: sub.subscription_id, data })}
          saving={recordingPayment}
          collegeName={collegeName}
          due={due}
        />
      )}
    </div>
  )
}

// ─── Payment History ────────────────────────────────────────────────────────────

function PaymentHistory({ subscriptionId }: Readonly<{ subscriptionId: string }>) {
  const { payments, loading, pagination, page, setPage } = useSubscriptionPayments(subscriptionId)

  if (loading) {
    return (
      <div className="animate-pulse space-y-2">
        {[1, 2].map((i) => (
          <div key={`pay-skel-${i}`} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg" />
        ))}
      </div>
    )
  }

  if (payments.length === 0) return null

  return (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <Receipt className="h-4 w-4 text-gray-400" />
        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
          Payment History
        </h4>
      </div>
      <div className="overflow-x-auto rounded-lg border border-gray-200 dark:border-gray-800">
        <table className="w-full">
          <thead>
            <tr className="bg-gray-50 dark:bg-gray-800/50">
              {["Date", "Amount", "Method", "Reference", "Receipt"].map((h) => (
                <th key={h} className="px-4 py-2.5 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {payments.map((p: Payment) => (
              <tr key={p.payment_id} className="border-t border-gray-100 dark:border-gray-800">
                <td className="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300">{formatDate(p.payment_date)}</td>
                <td className="px-4 py-2.5 text-sm font-semibold text-gray-900 dark:text-gray-100 tabular-nums">{formatCurrency(p.amount)}</td>
                <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 capitalize">{p.payment_method?.replaceAll("_", " ")}</td>
                <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400 font-mono text-xs">{p.transaction_reference || "—"}</td>
                <td className="px-4 py-2.5 text-sm text-gray-600 dark:text-gray-400">{p.receipt_number || "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-end gap-2 mt-2">
          <button
            type="button"
            disabled={page <= 1}
            onClick={() => setPage(page - 1)}
            className="px-2.5 h-7 rounded text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Prev
          </button>
          <span className="text-xs text-gray-500">{page}/{pagination.totalPages}</span>
          <button
            type="button"
            disabled={page >= pagination.totalPages}
            onClick={() => setPage(page + 1)}
            className="px-2.5 h-7 rounded text-xs font-medium text-gray-600 dark:text-gray-400 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-800 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}

// ─── Previous Subscription Card ─────────────────────────────────────────────────

function PreviousSubscriptionCard({ subscription: s }: Readonly<{ subscription: Subscription }>) {
  const style = getStatusStyle(s.subscription_status)
  return (
    <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-gray-50/50 dark:bg-gray-800/30">
      <div className="flex items-center justify-between mb-2">
        <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-semibold capitalize ${style.bg} ${style.text}`}>
          <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
          {s.subscription_status}
        </span>
        <span className="text-xs text-gray-400 dark:text-gray-500 font-mono">{s.subscription_id.slice(0, 8)}</span>
      </div>
      <div className="flex flex-wrap gap-x-6 gap-y-1 text-xs text-gray-500 dark:text-gray-400">
        <span>Quota: <span className="font-semibold text-gray-700 dark:text-gray-300">{s.student_quota}</span></span>
        <span>Amount: <span className="font-semibold text-gray-700 dark:text-gray-300 tabular-nums">{formatCurrency(s.total_amount)}</span></span>
        <span>Paid: <span className="font-semibold text-gray-700 dark:text-gray-300 tabular-nums">{formatCurrency(s.amount_paid)}</span></span>
        <span>{formatDate(s.valid_from)} → {formatDate(s.valid_to)}</span>
      </div>
    </div>
  )
}

// ─── Subscription Skeleton ──────────────────────────────────────────────────────

function SubscriptionSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 w-48 bg-gray-200 dark:bg-gray-700 rounded" />
        <div className="flex gap-2">
          <div className="h-8 w-28 bg-gray-200 dark:bg-gray-700 rounded-lg" />
          <div className="h-8 w-32 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        </div>
      </div>
      <div className="h-48 bg-gray-100 dark:bg-gray-800 rounded-xl" />
    </div>
  )
}

// ─── Create Subscription Modal ──────────────────────────────────────────────────

function CreateSubscriptionModal({ isOpen, onClose, onSubmit, saving, collegeName }: Readonly<{
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: CreateSubscriptionPayload) => Promise<unknown>
  saving: boolean
  collegeName: string
}>) {
  const [form, setForm] = useState<CreateSubscriptionPayload>({
    subscription_status: "trial",
    student_quota: 50,
    price_per_student: 0,
    total_amount: 0,
    trial_ends_at: "",
    valid_from: today(),
    valid_to: "",
    grace_period_days: 7,
    allowed_passout_years: null,
    notes: "",
  })
  const [selectedYears, setSelectedYears] = useState<number[]>([])

  const isTrial = form.subscription_status === "trial"

  const handleChange = (field: string, value: string | number | null) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const toggleYear = (year: number) => {
    setSelectedYears((prev) =>
      prev.includes(year) ? prev.filter((y) => y !== year) : [...prev, year]
    )
  }

  const handleSubmit = async () => {
    const payload: CreateSubscriptionPayload = {
      ...form,
      allowed_passout_years: selectedYears.length > 0 ? [...selectedYears].sort((a, b) => a - b) : null,
      trial_ends_at: isTrial && form.trial_ends_at ? form.trial_ends_at : undefined,
      price_per_student: isTrial ? undefined : form.price_per_student,
      total_amount: isTrial ? undefined : form.total_amount,
    }

    try {
      await onSubmit(payload)
      onClose()
    } catch {
      // Toast shown by mutation
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      disabled={saving}
      size="xl"
      title="Create Subscription"
      titleIcon={<CreditCard className="h-5 w-5 text-blue-500" />}
    >
      <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Create a new subscription for <span className="font-semibold text-gray-900 dark:text-gray-100">{collegeName}</span>
        </p>

        {/* Plan Type */}
        <div className="grid grid-cols-2 gap-3">
          {(["trial", "active"] as const).map((type) => (
            <button
              key={type}
              type="button"
              onClick={() => handleChange("subscription_status", type)}
              className={`p-4 rounded-xl border-2 text-left transition-all ${
                form.subscription_status === type
                  ? "border-blue-500 bg-blue-50/50 dark:bg-blue-900/10 dark:border-blue-400"
                  : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
              }`}
            >
              <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 capitalize">{type}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                {type === "trial" ? "Free trial with limited quota (default 50)" : "Paid plan with custom quota"}
              </p>
            </button>
          ))}
        </div>

        {/* Quota */}
        <FormField label="Student Quota" hint="Maximum students allowed">
          <input
            type="number"
            min={1}
            value={form.student_quota}
            onChange={(e) => handleChange("student_quota", Number(e.target.value))}
            className={INPUT_CLASS}
          />
        </FormField>

        {/* Dates */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Valid From">
            <input
              type="date"
              value={form.valid_from}
              onChange={(e) => handleChange("valid_from", e.target.value)}
              className={INPUT_CLASS}
            />
          </FormField>
          <FormField label="Valid To">
            <input
              type="date"
              value={form.valid_to}
              onChange={(e) => handleChange("valid_to", e.target.value)}
              className={INPUT_CLASS}
            />
          </FormField>
        </div>

        {/* Trial ends at */}
        {isTrial && (
          <FormField label="Trial Ends At" hint="Leave blank to use valid_to">
            <input
              type="date"
              value={form.trial_ends_at ?? ""}
              onChange={(e) => handleChange("trial_ends_at", e.target.value || null)}
              className={INPUT_CLASS}
            />
          </FormField>
        )}

        {/* Pricing (active only) */}
        {!isTrial && (
          <div className="grid grid-cols-2 gap-4">
            <FormField label="Price per Student (₹)">
              <input
                type="number"
                min={0}
                value={form.price_per_student ?? 0}
                onChange={(e) => handleChange("price_per_student", Number(e.target.value))}
                className={INPUT_CLASS}
              />
            </FormField>
            <FormField label="Total Amount (₹)">
              <input
                type="number"
                min={0}
                value={form.total_amount ?? 0}
                onChange={(e) => handleChange("total_amount", Number(e.target.value))}
                className={INPUT_CLASS}
              />
            </FormField>
          </div>
        )}

        {/* Grace period */}
        <FormField label="Grace Period (days)" hint="Extra days after expiry">
          <input
            type="number"
            min={0}
            max={90}
            value={form.grace_period_days ?? 7}
            onChange={(e) => handleChange("grace_period_days", Number(e.target.value))}
            className={INPUT_CLASS}
          />
        </FormField>

        {/* Passout Years */}
        <fieldset>
          <legend className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
            Allowed Passout Years
          </legend>
          <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
            Leave empty for default (current academic year only). Select specific years to restrict.
          </p>
          <div className="flex flex-wrap gap-2">
            {PASSOUT_YEARS.map((yr) => (
              <button
                key={yr}
                type="button"
                onClick={() => toggleYear(yr)}
                className={`px-3 py-1 rounded-lg text-xs font-medium transition-colors ${
                  selectedYears.includes(yr)
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-400 dark:hover:bg-gray-700"
                }`}
              >
                {yr}
              </button>
            ))}
          </div>
        </fieldset>

        {/* Notes */}
        <FormField label="Notes" hint="Optional">
          <textarea
            value={form.notes ?? ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            rows={2}
            className={TEXTAREA_CLASS}
          />
        </FormField>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || !form.valid_from || !form.valid_to || form.student_quota < 1}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Creating..." : "Create Subscription"}
        </button>
      </div>
    </ModalWrapper>
  )
}

// ─── Record Payment Modal ───────────────────────────────────────────────────────

function RecordPaymentModal({ isOpen, onClose, onSubmit, saving, collegeName, due }: Readonly<{
  isOpen: boolean
  onClose: () => void
  onSubmit: (data: RecordPaymentPayload) => Promise<unknown>
  saving: boolean
  collegeName: string
  due: number
}>) {
  const [form, setForm] = useState<RecordPaymentPayload>({
    amount: 0,
    payment_date: today(),
    payment_method: "bank_transfer",
    transaction_reference: "",
    receipt_number: "",
    notes: "",
  })

  const handleChange = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async () => {
    try {
      await onSubmit(form)
      onClose()
    } catch {
      // Toast shown by mutation
    }
  }

  return (
    <ModalWrapper
      isOpen={isOpen}
      onClose={onClose}
      disabled={saving}
      size="md"
      title="Record Payment"
      titleIcon={<Banknote className="h-5 w-5 text-emerald-500" />}
    >
      <div className="p-6 space-y-5">
        <p className="text-sm text-gray-500 dark:text-gray-400">
          Record a payment for <span className="font-semibold text-gray-900 dark:text-gray-100">{collegeName}</span>
        </p>
        {due > 0 && (
          <div className="p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/50">
            <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">
              Amount Due: {formatCurrency(due)}
            </p>
          </div>
        )}

        {/* Amount */}
        <FormField label="Amount (₹)">
          <input
            type="number"
            min={1}
            value={form.amount}
            onChange={(e) => handleChange("amount", Number(e.target.value))}
            className={INPUT_CLASS}
          />
        </FormField>

        {/* Date + Method */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Payment Date">
            <input
              type="date"
              value={form.payment_date}
              onChange={(e) => handleChange("payment_date", e.target.value)}
              className={INPUT_CLASS}
            />
          </FormField>
          <FormField label="Payment Method">
            <select
              value={form.payment_method}
              onChange={(e) => handleChange("payment_method", e.target.value)}
              className={INPUT_CLASS}
            >
              {PAYMENT_METHODS.map((m) => (
                <option key={m} value={m}>{m.replaceAll("_", " ")}</option>
              ))}
            </select>
          </FormField>
        </div>

        {/* Reference + Receipt */}
        <div className="grid grid-cols-2 gap-4">
          <FormField label="Transaction Reference" hint="Optional">
            <input
              type="text"
              value={form.transaction_reference ?? ""}
              onChange={(e) => handleChange("transaction_reference", e.target.value)}
              className={INPUT_CLASS}
              placeholder="e.g. TXN123456"
            />
          </FormField>
          <FormField label="Receipt Number" hint="Optional">
            <input
              type="text"
              value={form.receipt_number ?? ""}
              onChange={(e) => handleChange("receipt_number", e.target.value)}
              className={INPUT_CLASS}
              placeholder="e.g. REC-001"
            />
          </FormField>
        </div>

        {/* Notes */}
        <FormField label="Notes" hint="Optional">
          <textarea
            value={form.notes ?? ""}
            onChange={(e) => handleChange("notes", e.target.value)}
            rows={2}
            className={TEXTAREA_CLASS}
          />
        </FormField>
      </div>

      {/* Footer */}
      <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-800">
        <button
          type="button"
          onClick={onClose}
          disabled={saving}
          className="px-4 py-2 rounded-lg text-sm font-medium text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={handleSubmit}
          disabled={saving || form.amount < 1 || !form.payment_date}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 transition-colors disabled:opacity-50"
        >
          {saving && <Loader2 className="h-4 w-4 animate-spin" />}
          {saving ? "Recording..." : "Record Payment"}
        </button>
      </div>
    </ModalWrapper>
  )
}

// ─── Form Field ─────────────────────────────────────────────────────────────────

function FormField({ label, hint, children }: Readonly<{ label: string; hint?: string; children: React.ReactNode }>) {
  return (
    <label className="block">
      <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5">
        {label}
        {hint && <span className="ml-1 text-xs text-gray-400 font-normal">({hint})</span>}
      </span>
      {children}
    </label>
  )
}
