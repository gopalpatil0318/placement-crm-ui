import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Loader2, AlertCircle, Send, Mail, Phone, Building2, MapPin, Calendar, Clock, MessageSquare, User, Users } from "lucide-react"
import AnimatedPage from "@/components/ui/AnimatedPage"
import PageHeader from "@/components/sysadmin/PageHeader"
import { useDemoRequestDetail } from "@/hooks/sysadmin/useDemoRequestDetail"

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
    new: { bg: "bg-blue-50 dark:bg-blue-900/20", text: "text-blue-700 dark:text-blue-400", dot: "bg-blue-500" },
    contacted: { bg: "bg-amber-50 dark:bg-amber-900/20", text: "text-amber-700 dark:text-amber-400", dot: "bg-amber-500" },
    demo_scheduled: { bg: "bg-purple-50 dark:bg-purple-900/20", text: "text-purple-700 dark:text-purple-400", dot: "bg-purple-500" },
    demo_completed: { bg: "bg-teal-50 dark:bg-teal-900/20", text: "text-teal-700 dark:text-teal-400", dot: "bg-teal-500" },
    converted: { bg: "bg-emerald-50 dark:bg-emerald-900/20", text: "text-emerald-700 dark:text-emerald-400", dot: "bg-emerald-500" },
    lost: { bg: "bg-gray-100 dark:bg-gray-800", text: "text-gray-700 dark:text-gray-400", dot: "bg-gray-500" },
    rejected: { bg: "bg-red-50 dark:bg-red-900/20", text: "text-red-700 dark:text-red-400", dot: "bg-red-500" },
}

const TRANSITION_STYLES: Record<string, string> = {
    contacted: "border-amber-300 dark:border-amber-700 text-amber-700 dark:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-900/20",
    demo_scheduled: "border-purple-300 dark:border-purple-700 text-purple-700 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-900/20",
    demo_completed: "border-teal-300 dark:border-teal-700 text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-900/20",
    converted: "border-emerald-300 dark:border-emerald-700 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20",
    lost: "border-gray-300 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800",
    rejected: "border-red-300 dark:border-red-700 text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20",
}

const TRANSITIONS: Record<string, string[]> = {
    new: ["contacted", "rejected"],
    contacted: ["demo_scheduled", "lost"],
    demo_scheduled: ["demo_completed", "lost"],
    demo_completed: ["converted", "lost"],
    converted: [],
    lost: [],
    rejected: [],
}

function formatDate(dateStr: string | null) {
    if (!dateStr) return "—"
    return new Date(dateStr).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })
}

function formatDateTime(dateStr: string) {
    return new Date(dateStr).toLocaleString("en-IN", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit" })
}

function StatusBadge({ status }: Readonly<{ status: string }>) {
    const s = STATUS_STYLES[status] ?? STATUS_STYLES.new
    return (
        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold capitalize ${s.bg} ${s.text}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
            {status.replaceAll("_", " ")}
        </span>
    )
}

function InfoItem({ icon: Icon, label, value }: Readonly<{ icon: typeof Mail; label: string; value: string | null | undefined }>) {
    if (!value) return null
    return (
        <div className="flex items-start gap-3">
            <div className="mt-0.5 h-8 w-8 shrink-0 rounded-lg bg-gray-100 dark:bg-gray-800 flex items-center justify-center">
                <Icon className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </div>
            <div className="min-w-0">
                <p className="text-xs font-medium text-gray-500 dark:text-gray-400">{label}</p>
                <p className="text-sm text-gray-900 dark:text-gray-100 mt-0.5 break-words">{value}</p>
            </div>
        </div>
    )
}

export default function DemoRequestDetail() {
    const { id = "" } = useParams<{ id: string }>()
    const navigate = useNavigate()
    const {
        demoRequest, loading, error,
        noteText, setNoteText, handleStatusChange, handleAddNote,
        isUpdatingStatus, isAddingNote, statusError, noteError,
    } = useDemoRequestDetail(id)

    const breadcrumbs = [
        { label: "Dashboard", path: "/sysadmin/dashboard" },
        { label: "Demo Requests", path: "/sysadmin/demo-requests" },
        { label: demoRequest?.college_name ?? "Detail", active: true },
    ]

    if (loading) {
        return (
            <AnimatedPage>
                <div className="space-y-8">
                    <PageHeader title="Demo Request" breadcrumbs={breadcrumbs} />
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                </div>
            </AnimatedPage>
        )
    }

    if (error || !demoRequest) {
        return (
            <AnimatedPage>
                <div className="space-y-8">
                    <PageHeader title="Demo Request" breadcrumbs={breadcrumbs} />
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-red-200 dark:border-red-800/50 shadow-sm p-10 flex flex-col items-center gap-4 text-center">
                        <div className="h-12 w-12 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center">
                            <AlertCircle className="h-6 w-6 text-red-500 dark:text-red-400" />
                        </div>
                        <p className="font-semibold text-gray-800 dark:text-gray-100">{error ?? "Demo request not found"}</p>
                        <button type="button" onClick={() => navigate("/sysadmin/demo-requests")} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                            ← Back to Demo Requests
                        </button>
                    </div>
                </div>
            </AnimatedPage>
        )
    }

    const nextStatuses = TRANSITIONS[demoRequest.status] ?? []

    return (
        <AnimatedPage>
            <div className="space-y-8">
                <PageHeader title="Demo Request" breadcrumbs={breadcrumbs} />

                <button type="button" onClick={() => navigate("/sysadmin/demo-requests")} className="inline-flex items-center gap-1.5 text-sm font-medium text-gray-500 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors -mt-4">
                    <ArrowLeft className="h-4 w-4" /> Back to Demo Requests
                </button>

                <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
                    {/* Main Content */}
                    <div className="lg:col-span-2 space-y-6">
                        {/* Header Card */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                                <div className="flex flex-wrap items-start justify-between gap-3">
                                    <div>
                                        <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{demoRequest.college_name}</h2>
                                        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">{demoRequest.contact_person} · {demoRequest.designation}</p>
                                    </div>
                                    <StatusBadge status={demoRequest.status} />
                                </div>
                            </div>
                            <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-5">
                                <InfoItem icon={Mail} label="Email" value={demoRequest.email} />
                                <InfoItem icon={Phone} label="Phone" value={demoRequest.phone} />
                                <InfoItem icon={Building2} label="College Type" value={demoRequest.college_type} />
                                <InfoItem icon={Users} label="Students" value={demoRequest.number_of_students?.toString()} />
                                <InfoItem icon={MapPin} label="City" value={demoRequest.city} />
                                <InfoItem icon={MapPin} label="State" value={demoRequest.state} />
                                <InfoItem icon={Calendar} label="Preferred Date" value={formatDate(demoRequest.preferred_demo_date)} />
                                <InfoItem icon={Clock} label="Preferred Time" value={demoRequest.preferred_demo_time ? demoRequest.preferred_demo_time.charAt(0).toUpperCase() + demoRequest.preferred_demo_time.slice(1) : null} />
                                <InfoItem icon={MessageSquare} label="Referral Source" value={demoRequest.referral_source} />
                                <InfoItem icon={User} label="Assigned To" value={demoRequest.assigned_to} />
                            </div>
                            <div className="px-6 pb-4">
                                <p className="text-xs text-gray-400 dark:text-gray-500">Submitted {formatDateTime(demoRequest.created_at)}</p>
                            </div>
                        </div>

                        {/* Notes Card */}
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Internal Notes</h3>
                            </div>
                            <div className="p-5">
                                {demoRequest.notes && demoRequest.notes.length > 0 ? (
                                    <div className="space-y-3 mb-5">
                                        {demoRequest.notes.map((n) => (
                                            <div key={n.id} className="rounded-lg bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700 p-4">
                                                <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{n.note}</p>
                                                <p className="mt-2 text-xs text-gray-400 dark:text-gray-500">{n.created_by} · {formatDateTime(n.created_at)}</p>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 dark:text-gray-500 mb-5">No notes yet</p>
                                )}
                                <div className="flex gap-3">
                                    <textarea
                                        value={noteText}
                                        onChange={(e) => setNoteText(e.target.value)}
                                        placeholder="Add a note…"
                                        rows={2}
                                        className="flex-1 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 px-3 py-2 text-sm text-gray-900 dark:text-gray-100 placeholder-gray-400 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-colors resize-y"
                                    />
                                    <button
                                        type="button"
                                        onClick={handleAddNote}
                                        disabled={isAddingNote || !noteText.trim()}
                                        className="self-end inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium disabled:opacity-50 transition-colors"
                                    >
                                        {isAddingNote ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                                        Add
                                    </button>
                                </div>
                                {noteError && <p className="mt-2 text-xs text-red-600 dark:text-red-400">{noteError}</p>}
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="space-y-6">
                        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm">
                            <div className="p-5 border-b border-gray-100 dark:border-gray-800">
                                <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">Update Status</h3>
                            </div>
                            <div className="p-5">
                                {nextStatuses.length > 0 ? (
                                    <div className="flex flex-col gap-2">
                                        {nextStatuses.map((s) => (
                                            <button
                                                key={s}
                                                type="button"
                                                onClick={() => handleStatusChange(s)}
                                                disabled={isUpdatingStatus}
                                                className={`w-full rounded-lg border px-4 py-2.5 text-left text-sm font-medium capitalize disabled:opacity-50 transition-colors ${TRANSITION_STYLES[s] ?? "border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800"}`}
                                            >
                                                {isUpdatingStatus && <Loader2 className="inline h-3.5 w-3.5 animate-spin mr-2" />}
                                                Move to {s.replaceAll("_", " ")}
                                            </button>
                                        ))}
                                    </div>
                                ) : (
                                    <p className="text-sm text-gray-400 dark:text-gray-500">No further transitions — terminal status.</p>
                                )}
                                {statusError && <p className="mt-3 text-xs text-red-600 dark:text-red-400">{statusError}</p>}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    )
}
