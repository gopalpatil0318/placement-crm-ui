import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast, getErrorTitle } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

export interface PlacementSettings {
    setting_id: string | null;
    college_id: string;
    passout_year: number;
    max_active_offers: number;
    allow_dream_upgrade: boolean;
    auto_withdrawal_rule: string;
    default_offer_days: number;
    exclude_placed_by_default: boolean;
    auto_reject_on_round_fail: boolean;
    allow_reapply_after_withdrawal: boolean;
    created_by: string | null;
    created_at: string | null;
    updated_at: string | null;
    is_default: boolean;
}

// ========================
// QUERIES
// ========================

export function usePlacementSettings(passoutYear: number) {
    return useQuery({
        queryKey: queryKeys.placementSettings.byYear(passoutYear),
        queryFn: async () => {
            const response = await CollegeAdminService.getPlacementSettings(passoutYear);
            return response.data as PlacementSettings;
        },
        enabled: !!passoutYear,
    });
}

// ========================
// MUTATIONS
// ========================

export function useUpsertPlacementSettings(onSuccess?: () => void) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            passout_year: number;
            max_active_offers?: number;
            allow_dream_upgrade?: boolean;
            auto_withdrawal_rule?: string;
            default_offer_days?: number;
            exclude_placed_by_default?: boolean;
            auto_reject_on_round_fail?: boolean;
            allow_reapply_after_withdrawal?: boolean;
        }) => CollegeAdminService.upsertPlacementSettings(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ["placementSettings"] });
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Settings saved successfully",
            });
            onSuccess?.();
        },
        onError: (err: unknown) => {
            const message = err instanceof ApiError ? err.message : "Something went wrong";
            const status = err instanceof ApiError ? err.status : undefined;
            showToast({
                type: "error",
                title: getErrorTitle(status),
                description: message,
            });
        },
    });
}
