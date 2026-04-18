import { useMemo, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Loader2, AlertCircle } from "lucide-react";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";
import SessionList from "@/components/collegeadmin/training_programs/SessionList";
import MarkAttendanceSheet from "@/components/collegeadmin/training_programs/MarkAttendanceSheet";
import { useTrainingSessions } from "@/hooks/collegeadmin/training_programs/useTrainingSessions";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";
import type { Enrollment } from "@/hooks/collegeadmin/training_programs/useViewEnrollments";

const TrainingSessions = () => {
    const { programId } = useParams<{ programId: string }>();
    const navigate = useNavigate();

    const {
        sessions,
        attendanceSessionId,
        markAttendance,
        isLoading,
        isError,
        refetch,
        totalEnrolled,
        showCreateForm,
        setShowCreateForm,
        isCreating,
        createSession,
        editingSessionId,
        setEditingSessionId,
        isUpdating,
        updateSession,
        deletingSessionId,
        setDeletingSessionId,
        isDeleting,
        deleteSession,
        setAttendanceSessionId,
        isMarkingAttendance,
    } = useTrainingSessions(programId);

    // Fetch program name for breadcrumbs
    const pid = programId ?? "";

    const { data: detailData } = useQuery({
        queryKey: queryKeys.trainingPrograms.detail(pid),
        queryFn: () => CollegeAdminService.getTrainingProgram(pid),
        enabled: !!programId,
    });

    const programName: string = detailData?.data?.program_name ?? "";

    // Prefetch enrollments when page loads (avoids "no active enrollments" race condition)
    const { data: enrollmentData, isLoading: enrollmentsLoading } = useQuery({
        queryKey: queryKeys.trainingPrograms.enrollments(pid),
        queryFn: () => CollegeAdminService.getTrainingEnrollments(pid, { limit: 100 }),
        enabled: !!programId,
    });

    const enrollments: Enrollment[] = Array.isArray(enrollmentData?.data?.enrollments)
        ? enrollmentData.data.enrollments
        : [];

    // Fetch existing attendance for the selected session (pre-populate checkboxes)
    const { data: existingAttendanceData } = useQuery({
        queryKey: queryKeys.trainingPrograms.sessionAttendance(attendanceSessionId ?? ""),
        queryFn: () => CollegeAdminService.getSessionAttendance(attendanceSessionId!),
        enabled: !!attendanceSessionId,
    });

    const existingAttendance: Map<string, boolean> = useMemo(() => {
        const map = new Map<string, boolean>();
        const records = existingAttendanceData?.data?.records;
        if (Array.isArray(records)) {
            for (const r of records) {
                map.set(r.enrollment_id, r.present);
            }
        }
        return map;
    }, [existingAttendanceData]);

    const attendanceSession = useMemo(
        () => sessions.find((s) => s.session_id === attendanceSessionId),
        [sessions, attendanceSessionId],
    );

    const handleAttendanceSubmit = useCallback(
        (attendance: { enrollment_id: string; present: boolean }[]) => {
            if (attendanceSessionId) {
                markAttendance(attendanceSessionId, attendance);
            }
        },
        [attendanceSessionId, markAttendance],
    );

    const breadcrumbs = useMemo(
        () => [
            { label: "Dashboard", path: "/college/dashboard" },
            { label: "Training Programs", path: "/college/training-programs" },
            { label: programName || "Program", path: `/college/training-program/${programId}` },
            { label: "Sessions", active: true },
        ],
        [programName, programId],
    );

    if (isLoading) {
        return (
            <AnimatedPage>
                <div className="flex items-center justify-center min-h-[40vh]">
                    <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
                </div>
            </AnimatedPage>
        );
    }

    if (isError) {
        return (
            <AnimatedPage>
                <div className="flex flex-col items-center justify-center min-h-[40vh] gap-4">
                    <AlertCircle className="h-10 w-10 text-red-400" />
                    <p className="text-sm text-gray-600 dark:text-gray-400">Failed to load sessions</p>
                    <div className="flex items-center gap-3">
                        <button type="button" onClick={() => navigate(-1)} className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition">
                            <ArrowLeft className="h-4 w-4" /> Go Back
                        </button>
                        <button type="button" onClick={() => refetch()} className="px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition">Retry</button>
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title={programName ? `${programName} — Sessions` : "Sessions"}
                    breadcrumbs={breadcrumbs}
                />

                <SessionList
                    sessions={sessions}
                    totalEnrolled={totalEnrolled}
                    isLoading={false}
                    showCreateForm={showCreateForm}
                    isCreating={isCreating}
                    editingSessionId={editingSessionId}
                    isUpdating={isUpdating}
                    deletingSessionId={deletingSessionId}
                    isDeleting={isDeleting}
                    onShowCreateForm={setShowCreateForm}
                    onCreateSession={createSession}
                    onEditSession={setEditingSessionId}
                    onUpdateSession={updateSession}
                    onDeleteSession={setDeletingSessionId}
                    onConfirmDelete={deleteSession}
                    onMarkAttendance={setAttendanceSessionId}
                />

                <MarkAttendanceSheet
                    isOpen={!!attendanceSessionId}
                    sessionNumber={attendanceSession?.session_number ?? 0}
                    enrollments={enrollments}
                    existingAttendance={existingAttendance}
                    loading={isMarkingAttendance || enrollmentsLoading}
                    onSubmit={handleAttendanceSubmit}
                    onClose={() => setAttendanceSessionId(null)}
                />
            </div>
        </AnimatedPage>
    );
};

export default TrainingSessions;
