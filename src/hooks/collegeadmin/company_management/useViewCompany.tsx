import { useQuery } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

export interface CompanyContact {
    contact_id: string;
    contact_name: string;
    contact_designation: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    is_primary: boolean;
    is_active: boolean;
    notes: string | null;
}

export interface CompanyDetail {
    company_id: string;
    company_name: string;
    company_description: string | null;
    company_website: string | null;
    industry: string | null;
    company_logo: string | null;
    company_status: string;
    jobs_count: number;
    contacts_count: number;
    active_contacts_count: number;
    contacts: CompanyContact[];
    created_at?: string;
    updated_at?: string;
}

// ========================
// HOOK
// ========================

export const useViewCompany = (companyId: string | undefined) => {
    const { data, isLoading, error: queryError, refetch } = useQuery({
        queryKey: queryKeys.companies.detail(companyId!),
        queryFn: () => CollegeAdminService.getCompany(companyId!),
        enabled: !!companyId,
    });

    const company: CompanyDetail | null = data?.data ?? data ?? null;
    const loading = isLoading;
    const error = queryError
        ? (queryError instanceof Error ? queryError.message : "Failed to fetch company")
        : null;

    return { company, loading, error, refresh: refetch };
};
