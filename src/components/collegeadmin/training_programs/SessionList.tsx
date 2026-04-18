import { useState } from "react";
import {
    Calendar,
    Clock,
    Edit2,
    Loader2,
    MapPin,
    Plus,
    Trash2,
    Users,
    ClipboardCheck,
} from "lucide-react";
import ModalWrapper from "@/components/ui/ModalWrapper";
import FloatingInput from "@/components/ui/FloatingInput";
import type { TrainingSession } from "@/validators/TrainingProgramSchema";

// ========================
// HELPERS
// ========================

function formatDate(d: string | null): string {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
    });
}

// ========================
// SESSION FORM (inline for create/edit)
// ========================

interface SessionFormData {
    session_number: string;
    session_date: string;
    session_topic: string;
    venue: string;
}

interface SessionFormProps {
    initial?: SessionFormData;
    nextNumber?: number;
    loading: boolean;
    onSubmit: (data: { session_number: number; session_date?: string; session_topic?: string; venue?: string }) => void;
    onCancel: () => void;
}

const SessionForm = ({ initial, nextNumber, loading, onSubmit, onCancel }: Readonly<SessionFormProps>) => {
    const [form, setForm] = useState<SessionFormData>(initial ?? {
        session_number: String(nextNumber ?? 1),
        session_date: "",
        session_topic: "",
        venue: "",
    });

    const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = () => {
        const payload: { session_number: number; session_date?: string; session_topic?: string; venue?: string } = {
            session_number: Number(form.session_number),
        };
        if (form.session_date) payload.session_date = form.session_date;
        if (form.session_topic) payload.session_topic = form.session_topic;
        if (form.venue) payload.venue = form.venue;
        onSubmit(payload);
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-blue-200 dark:border-blue-800 p-4 space-y-3">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <FloatingInput label="Session #" name="session_number" type="number" value={form.session_number} onChange={onChange} required />
                <FloatingInput label="Date" name="session_date" type="date" value={form.session_date} onChange={onChange} />
                <FloatingInput label="Topic" name="session_topic" value={form.session_topic} onChange={onChange} maxLength={500} />
                <FloatingInput label="Venue" name="venue" value={form.venue} onChange={onChange} maxLength={300} />
            </div>
            <div className="flex items-center justify-end gap-2">
                <button type="button" onClick={onCancel} disabled={loading} className="px-3 py-1.5 text-xs font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">Cancel</button>
                <button type="button" onClick={handleSubmit} disabled={loading} className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-60">
                    {loading && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                    Save
                </button>
            </div>
        </div>
    );
};

// ========================
// COMPONENT
// ========================

interface SessionListProps {
    sessions: TrainingSession[];
    totalEnrolled: number;
    isLoading: boolean;
    showCreateForm: boolean;
    isCreating: boolean;
    editingSessionId: string | null;
    isUpdating: boolean;
    deletingSessionId: string | null;
    isDeleting: boolean;
    onShowCreateForm: (show: boolean) => void;
    onCreateSession: (data: { session_number: number; session_date?: string; session_topic?: string; venue?: string }) => void;
    onEditSession: (id: string | null) => void;
    onUpdateSession: (id: string, data: Record<string, unknown>) => void;
    onDeleteSession: (id: string | null) => void;
    onConfirmDelete: (id: string) => void;
    onMarkAttendance: (sessionId: string) => void;
}

const SessionList = ({
    sessions,
    totalEnrolled,
    isLoading,
    showCreateForm,
    isCreating,
    editingSessionId,
    isUpdating,
    deletingSessionId,
    isDeleting,
    onShowCreateForm,
    onCreateSession,
    onEditSession,
    onUpdateSession,
    onDeleteSession,
    onConfirmDelete,
    onMarkAttendance,
}: Readonly<SessionListProps>) => {
    const nextNumber = sessions.length > 0
        ? Math.max(...sessions.map((s) => s.session_number)) + 1
        : 1;

    if (isLoading) {
        return (
            <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={`sess-skel-${String(i)}`} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4 animate-pulse">
                        <div className="h-4 w-40 bg-gray-100 dark:bg-gray-800 rounded mb-2" />
                        <div className="h-3 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="space-y-4">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <Clock className="h-4 w-4 text-gray-400" />
                    <span className="text-sm font-semibold text-gray-700 dark:text-gray-300">
                        {sessions.length} Session{sessions.length === 1 ? "" : "s"}
                    </span>
                    <span className="text-xs text-gray-500 dark:text-gray-400">
                        · {totalEnrolled} enrolled
                    </span>
                </div>
                {!showCreateForm && (
                    <button
                        type="button"
                        onClick={() => onShowCreateForm(true)}
                        className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition"
                    >
                        <Plus className="h-3.5 w-3.5" /> Add Session
                    </button>
                )}
            </div>

            {/* Create Form */}
            {showCreateForm && (
                <SessionForm
                    nextNumber={nextNumber}
                    loading={isCreating}
                    onSubmit={onCreateSession}
                    onCancel={() => onShowCreateForm(false)}
                />
            )}

            {/* Session Cards */}
            {sessions.length === 0 && !showCreateForm && (
                <div className="text-center py-10">
                    <Clock className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-2" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No sessions yet</p>
                </div>
            )}

            {sessions.map((session) => {
                const isEditing = editingSessionId === session.session_id;

                if (isEditing) {
                    return (
                        <SessionForm
                            key={session.session_id}
                            initial={{
                                session_number: String(session.session_number),
                                session_date: session.session_date || "",
                                session_topic: session.session_topic || "",
                                venue: session.venue || "",
                            }}
                            loading={isUpdating}
                            onSubmit={(data) => onUpdateSession(session.session_id, data)}
                            onCancel={() => onEditSession(null)}
                        />
                    );
                }

                return (
                    <div key={session.session_id} className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-4">
                        <div className="flex items-start justify-between gap-3">
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                                        Session {session.session_number}
                                    </span>
                                    {session.session_topic && (
                                        <span className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                            — {session.session_topic}
                                        </span>
                                    )}
                                </div>
                                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-400">
                                    {session.session_date && (
                                        <span className="inline-flex items-center gap-1">
                                            <Calendar className="h-3 w-3" /> {formatDate(session.session_date)}
                                        </span>
                                    )}
                                    {session.venue && (
                                        <span className="inline-flex items-center gap-1">
                                            <MapPin className="h-3 w-3" /> {session.venue}
                                        </span>
                                    )}
                                    {session.total_marked != null && (
                                        <span className="inline-flex items-center gap-1">
                                            <Users className="h-3 w-3" />
                                            {session.present_count}/{session.total_marked} present
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1 shrink-0">
                                <button
                                    type="button"
                                    onClick={() => onMarkAttendance(session.session_id)}
                                    title="Mark Attendance"
                                    className="p-2 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition"
                                >
                                    <ClipboardCheck className="h-4 w-4" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onEditSession(session.session_id)}
                                    title="Edit Session"
                                    className="p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                                >
                                    <Edit2 className="h-3.5 w-3.5" />
                                </button>
                                <button
                                    type="button"
                                    onClick={() => onDeleteSession(session.session_id)}
                                    title="Delete Session"
                                    className="p-2 rounded-lg text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                                >
                                    <Trash2 className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        </div>
                    </div>
                );
            })}

            {/* Delete Confirmation */}
            <ModalWrapper
                isOpen={deletingSessionId !== null}
                onClose={() => onDeleteSession(null)}
                disabled={isDeleting}
                size="sm"
                title="Delete Session"
                titleIcon={<Trash2 className="h-5 w-5 text-red-500" />}
                footer={
                    <div className="flex items-center justify-end gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
                        <button type="button" onClick={() => onDeleteSession(null)} disabled={isDeleting} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition">Cancel</button>
                        <button type="button" onClick={() => deletingSessionId && onConfirmDelete(deletingSessionId)} disabled={isDeleting} className="inline-flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60">
                            {isDeleting && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                            Delete
                        </button>
                    </div>
                }
            >
                <div className="px-6 py-5">
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                        Are you sure you want to delete this session? Any attendance records for this session will also be removed.
                    </p>
                    {(() => {
                        const ds = sessions.find((s) => s.session_id === deletingSessionId);
                        return ds?.total_marked ? (
                            <p className="mt-2 text-xs font-medium text-amber-600 dark:text-amber-400">
                                This session has {ds.total_marked} attendance record{ds.total_marked === 1 ? "" : "s"}.
                            </p>
                        ) : null;
                    })()}
                </div>
            </ModalWrapper>
        </div>
    );
};

export default SessionList;
