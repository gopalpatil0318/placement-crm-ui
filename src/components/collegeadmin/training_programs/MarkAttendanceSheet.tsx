import { useState, useCallback, useMemo, useEffect } from "react";
import { Check, Loader2, X, Users, UserCheck, UserX } from "lucide-react";
import ModalWrapper from "@/components/ui/ModalWrapper";
import type { Enrollment } from "@/hooks/collegeadmin/training_programs/useViewEnrollments";

// ========================
// COMPONENT
// ========================

interface MarkAttendanceSheetProps {
    isOpen: boolean;
    sessionNumber: number;
    enrollments: Enrollment[];
    existingAttendance?: Map<string, boolean>;
    loading: boolean;
    onSubmit: (attendance: { enrollment_id: string; present: boolean }[]) => void;
    onClose: () => void;
}

const MarkAttendanceSheet = ({
    isOpen,
    sessionNumber,
    enrollments,
    existingAttendance,
    loading,
    onSubmit,
    onClose,
}: Readonly<MarkAttendanceSheetProps>) => {
    const [attendance, setAttendance] = useState<Map<string, boolean>>(() => new Map());

    const activeEnrollments = useMemo(
        () => enrollments.filter((e) => e.completion_status !== "dropped" && e.completion_status !== "failed"),
        [enrollments],
    );

    // Pre-populate attendance when modal opens with existing data
    useEffect(() => {
        if (!isOpen) return;
        if (existingAttendance && existingAttendance.size > 0) {
            setAttendance(new Map(existingAttendance));
        } else {
            setAttendance(new Map());
        }
    }, [isOpen, existingAttendance]);

    const togglePresent = useCallback((id: string) => {
        setAttendance((prev) => {
            const next = new Map(prev);
            next.set(id, !(next.get(id) ?? false));
            return next;
        });
    }, []);

    const markAllPresent = useCallback(() => {
        const next = new Map<string, boolean>();
        for (const e of activeEnrollments) {
            next.set(e.enrollment_id, true);
        }
        setAttendance(next);
    }, [activeEnrollments]);

    const markAllAbsent = useCallback(() => {
        const next = new Map<string, boolean>();
        for (const e of activeEnrollments) {
            next.set(e.enrollment_id, false);
        }
        setAttendance(next);
    }, [activeEnrollments]);

    const presentCount = useMemo(
        () => activeEnrollments.filter((e) => attendance.get(e.enrollment_id)).length,
        [activeEnrollments, attendance],
    );

    const handleSubmit = useCallback(() => {
        const records = activeEnrollments.map((e) => ({
            enrollment_id: e.enrollment_id,
            present: attendance.get(e.enrollment_id) ?? false,
        }));
        onSubmit(records);
    }, [activeEnrollments, attendance, onSubmit]);

    const hasExisting = existingAttendance && existingAttendance.size > 0;

    const footer = (
        <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            <span className="text-xs text-gray-500 dark:text-gray-400">
                {presentCount}/{activeEnrollments.length} present
                {hasExisting && <span className="ml-1 text-blue-500">(updating)</span>}
            </span>
            <div className="flex items-center gap-2">
                <button type="button" onClick={onClose} disabled={loading} className="px-4 py-2 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-40">Cancel</button>
                <button type="button" onClick={handleSubmit} disabled={loading || activeEnrollments.length === 0} className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg text-sm font-medium transition disabled:opacity-60">
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {hasExisting ? "Update Attendance" : "Save Attendance"}
                </button>
            </div>
        </div>
    );

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={onClose}
            disabled={loading}
            size="lg"
            title={`Mark Attendance — Session ${sessionNumber}`}
            titleIcon={<Users className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            footer={footer}
        >
            <div className="p-6 max-h-[70vh] sm:max-h-[60vh] overflow-y-auto">
                {/* Sticky Header with Mark All buttons */}
                <div className="sticky top-0 z-10 bg-gray-50 dark:bg-gray-800/80 backdrop-blur-sm border-b border-gray-200 dark:border-gray-700 px-6 py-3 flex items-center justify-between gap-2 flex-wrap">
                    <span className="text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                        Students ({activeEnrollments.length})
                    </span>
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={markAllPresent}
                            disabled={loading || activeEnrollments.length === 0}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition disabled:opacity-40"
                        >
                            <UserCheck className="h-3.5 w-3.5" /> All Present
                        </button>
                        <button
                            type="button"
                            onClick={markAllAbsent}
                            disabled={loading || activeEnrollments.length === 0}
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-medium text-red-700 dark:text-red-400 bg-red-50 dark:bg-red-900/20 hover:bg-red-100 dark:hover:bg-red-900/40 transition disabled:opacity-40"
                        >
                            <UserX className="h-3.5 w-3.5" /> All Absent
                        </button>
                    </div>
                </div>

                {/* Loading state */}
                {loading && activeEnrollments.length === 0 && (
                    <div className="px-6 py-10 flex flex-col items-center gap-2">
                        <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                        <span className="text-sm text-gray-500 dark:text-gray-400">Loading students…</span>
                    </div>
                )}

                {/* Empty state (only show when not loading) */}
                {!loading && activeEnrollments.length === 0 && (
                    <div className="px-6 py-10 text-center text-sm text-gray-500 dark:text-gray-400">
                        No active enrollments to mark attendance for
                    </div>
                )}

                {/* Student Rows */}
                {activeEnrollments.map((e) => {
                    const isPresent = attendance.get(e.enrollment_id) ?? false;
                    return (
                        <div
                            key={e.enrollment_id}
                            className={`px-6 py-3 flex items-center justify-between border-b border-gray-50 dark:border-gray-800/60 last:border-0 hover:bg-gray-50 dark:hover:bg-gray-800/30 transition-colors ${isPresent ? "bg-emerald-50/30 dark:bg-emerald-900/10" : ""}`}
                        >
                            <div className="flex items-center gap-3 min-w-0">
                                <input
                                    type="checkbox"
                                    checked={isPresent}
                                    onChange={() => togglePresent(e.enrollment_id)}
                                    aria-label={`${e.student_name} present`}
                                    className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500/30 shrink-0"
                                />
                                <div className="min-w-0">
                                    <p className="text-sm font-medium text-gray-800 dark:text-gray-100 truncate">{e.student_name}</p>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">{e.dept_name} · Batch {e.passout_year}</p>
                                </div>
                            </div>
                            <div className="shrink-0">
                                {isPresent ? (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                                        <Check className="h-3.5 w-3.5" /> Present
                                    </span>
                                ) : (
                                    <span className="inline-flex items-center gap-1 text-xs font-medium text-gray-400 dark:text-gray-500">
                                        <X className="h-3.5 w-3.5" /> Absent
                                    </span>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </ModalWrapper>
    );
};

export default MarkAttendanceSheet;
