import { useState, useEffect, useCallback } from "react";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

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
}

// ========================
// HOOK
// ========================

export const useViewCompany = (companyId: string | undefined) => {
    const [company, setCompany] = useState<CompanyDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchCompany = useCallback(async () => {
        if (!companyId) return;
        setLoading(true);
        setError(null);

        try {
            const response = await CollegeAdminService.getCompany(companyId);
            setCompany(response.data || response);
        } catch (err: unknown) {
            const msg =
                err instanceof Error ? err.message : "Failed to fetch company";
            setError(msg);
            showToast({ type: "error", title: "Error", description: msg });
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    useEffect(() => {
        fetchCompany();
    }, [fetchCompany]);

    return { company, loading, error, refresh: fetchCompany };
};
