import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast, getErrorTitle } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";
import type { TrainingSession } from "@/validators/TrainingProgramSchema";

// ========================
// HOOK
// ========================

export const useTrainingSessions = (programId: string | undefined) => {
    const queryClient = useQueryClient();
    const pid = programId ?? "";

    const { data, isLoading, isError, refetch } = useQuery({
        queryKey: queryKeys.trainingPrograms.sessions(pid),
        queryFn: () => CollegeAdminService.getTrainingSessions(pid),
        enabled: !!programId,
    });

    const sessions: TrainingSession[] = Array.isArray(data?.data?.sessions)
        ? data.data.sessions
        : [];
    const totalEnrolled: number = data?.data?.total_enrolled ?? 0;

    // ── Create Session ──
    const [showCreateForm, setShowCreateForm] = useState(false);

    const createMutation = useMutation({
        mutationFn: (payload: { session_number: number; session_date?: string; session_topic?: string; venue?: string }) =>
            CollegeAdminService.createTrainingSession(pid, payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.trainingPrograms.sessions(pid) });
            showToast({ type: "success", title: "Session Created", description: response?.message || "Session added" });
            setShowCreateForm(false);
        },
        onError: (error: unknown) => {
            const msg = error instanceof ApiError ? error.message : "Failed to create session";
            const status = error instanceof ApiError ? error.status : undefined;
            showToast({ type: "error", title: getErrorTitle(status), description: msg });
        },
    });

    // ── Update Session ──
    const [editingSessionId, setEditingSessionId] = useState<string | null>(null);

    const updateMutation = useMutation({
        mutationFn: ({ sessionId, payload }: { sessionId: string; payload: Record<string, unknown> }) =>
            CollegeAdminService.updateTrainingSession(sessionId, payload as Parameters<typeof CollegeAdminService.updateTrainingSession>[1]),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.trainingPrograms.sessions(pid) });
            showToast({ type: "success", title: "Session Updated", description: response?.message || "Session updated" });
            setEditingSessionId(null);
        },
        onError: (error: unknown) => {
            const msg = error instanceof ApiError ? error.message : "Failed to update session";
            const status = error instanceof ApiError ? error.status : undefined;
            showToast({ type: "error", title: getErrorTitle(status), description: msg });
        },
    });

    // ── Delete Session ──
    const [deletingSessionId, setDeletingSessionId] = useState<string | null>(null);

    const deleteMutation = useMutation({
        mutationFn: (sessionId: string) =>
            CollegeAdminService.deleteTrainingSession(sessionId),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.trainingPrograms.sessions(pid) });
            showToast({ type: "success", title: "Session Deleted", description: response?.message || "Session deleted" });
            setDeletingSessionId(null);
        },
        onError: (error: unknown) => {
            const msg = error instanceof ApiError ? error.message : "Failed to delete session";
            const status = error instanceof ApiError ? error.status : undefined;
            showToast({ type: "error", title: getErrorTitle(status), description: msg });
        },
    });

    // ── Mark Attendance ──
    const [attendanceSessionId, setAttendanceSessionId] = useState<string | null>(null);

    const attendanceMutation = useMutation({
        mutationFn: ({ sessionId, attendance }: { sessionId: string; attendance: { enrollment_id: string; present: boolean }[] }) =>
            CollegeAdminService.markSessionAttendance(sessionId, attendance),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.trainingPrograms.sessions(pid) });
            queryClient.invalidateQueries({ queryKey: queryKeys.trainingPrograms.enrollments(pid) });
            showToast({ type: "success", title: "Attendance Marked", description: response?.message || "Attendance saved" });
            setAttendanceSessionId(null);
        },
        onError: (error: unknown) => {
            const msg = error instanceof ApiError ? error.message : "Failed to mark attendance";
            const status = error instanceof ApiError ? error.status : undefined;
            showToast({ type: "error", title: getErrorTitle(status), description: msg });
        },
    });

    const createSession = useCallback((payload: { session_number: number; session_date?: string; session_topic?: string; venue?: string }) => {
        createMutation.mutate(payload);
    }, [createMutation]);

    const updateSession = useCallback((sessionId: string, payload: Record<string, unknown>) => {
        updateMutation.mutate({ sessionId, payload });
    }, [updateMutation]);

    const deleteSession = useCallback((sessionId: string) => {
        deleteMutation.mutate(sessionId);
    }, [deleteMutation]);

    const markAttendance = useCallback((sessionId: string, attendance: { enrollment_id: string; present: boolean }[]) => {
        attendanceMutation.mutate({ sessionId, attendance });
    }, [attendanceMutation]);

    return {
        sessions,
        totalEnrolled,
        isLoading,
        isError,
        refetch,
        // Create
        showCreateForm,
        setShowCreateForm,
        createSession,
        isCreating: createMutation.isPending,
        // Update
        editingSessionId,
        setEditingSessionId,
        updateSession,
        isUpdating: updateMutation.isPending,
        // Delete
        deletingSessionId,
        setDeletingSessionId,
        deleteSession,
        isDeleting: deleteMutation.isPending,
        // Attendance
        attendanceSessionId,
        setAttendanceSessionId,
        markAttendance,
        isMarkingAttendance: attendanceMutation.isPending,
    };
};
