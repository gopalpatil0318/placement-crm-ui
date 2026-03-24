import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";
import { PROGRAM_STATUS_TRANSITIONS, PROGRAM_STATUS_LABELS, type ProgramStatus } from "@/validators/TrainingProgramSchema";

// ========================
// HOOK
// ========================

export const useToggleTrainingStatus = (programId: string, currentStatus: string) => {
    const queryClient = useQueryClient();
    const [showConfirm, setShowConfirm] = useState(false);
    const [selectedStatus, setSelectedStatus] = useState("");

    const allowedTransitions = PROGRAM_STATUS_TRANSITIONS[currentStatus as ProgramStatus] ?? [];

    const mutation = useMutation({
        mutationFn: (newStatus: string) =>
            CollegeAdminService.toggleTrainingStatus(programId, newStatus),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.trainingPrograms.all() });
            queryClient.invalidateQueries({ queryKey: queryKeys.trainingPrograms.detail(programId) });
            showToast({
                type: "success",
                title: "Status Updated",
                description: response?.message || "Program status updated successfully",
            });
            setShowConfirm(false);
            setSelectedStatus("");
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Failed to update status";
            showToast({ type: "error", title: "Error", description: message });
        },
    });

    const handleStatusSelect = useCallback((status: string) => {
        setSelectedStatus(status);
        setShowConfirm(true);
    }, []);

    const handleConfirm = useCallback(() => {
        if (selectedStatus) {
            mutation.mutate(selectedStatus);
        }
    }, [selectedStatus, mutation]);

    const handleCancelConfirm = useCallback(() => {
        setShowConfirm(false);
        setSelectedStatus("");
    }, []);

    return {
        allowedTransitions,
        showConfirm,
        selectedStatus,
        selectedStatusLabel: PROGRAM_STATUS_LABELS[selectedStatus as ProgramStatus] ?? selectedStatus,
        currentStatusLabel: PROGRAM_STATUS_LABELS[currentStatus as ProgramStatus] ?? currentStatus,
        loading: mutation.isPending,
        handleStatusSelect,
        handleConfirm,
        handleCancelConfirm,
    };
};
