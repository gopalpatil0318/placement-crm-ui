import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast, getErrorTitle } from "@/utils/ToastUtils";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

export interface CompanyTier {
    tier_id: string;
    college_id: string;
    passout_year: number;
    tier_name: string;
    tier_level: number;
    min_package: number;
    max_package: number | null;
    description: string | null;
    is_active: boolean;
    job_count: number;
    created_at: string;
    updated_at: string;
}

// ========================
// QUERIES
// ========================

export function useCompanyTiers(passoutYear?: number, isActive?: string) {
    const filters: Record<string, unknown> = {};
    if (passoutYear) filters.passout_year = passoutYear;
    if (isActive) filters.is_active = isActive;

    return useQuery({
        queryKey: queryKeys.companyTiers.all(
            Object.keys(filters).length ? filters : undefined,
        ),
        queryFn: async () => {
            const response = await CollegeAdminService.getAllCompanyTiers({
                passout_year: passoutYear,
                is_active: isActive,
            });
            return response.data as CompanyTier[];
        },
    });
}

// ========================
// MUTATIONS
// ========================

export function useCreateCompanyTier(onSuccess?: () => void) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: {
            passout_year: number;
            tier_name: string;
            tier_level: number;
            min_package: number;
            max_package?: number | null;
            description?: string;
            is_active?: boolean;
        }) => CollegeAdminService.createCompanyTier(data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ["companyTiers"] });
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Tier created successfully",
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

export function useUpdateCompanyTier(onSuccess?: () => void) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({
            tierId,
            data,
        }: {
            tierId: string;
            data: Partial<Pick<CompanyTier, "tier_name" | "tier_level" | "min_package" | "max_package" | "description" | "is_active">>;
        }) => CollegeAdminService.updateCompanyTier(tierId, data),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ["companyTiers"] });
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Tier updated successfully",
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

export function useDeleteCompanyTier() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (tierId: string) =>
            CollegeAdminService.deleteCompanyTier(tierId),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: ["companyTiers"] });
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Tier deleted successfully",
            });
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
