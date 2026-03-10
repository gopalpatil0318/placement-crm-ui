import { useState, useCallback, useEffect } from "react";
import { AxiosError } from "axios";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

// ========================
// TYPES
// ========================

export interface CompanyContact {
    contact_id: string;
    company_id: string;
    contact_name: string;
    contact_designation: string | null;
    contact_email: string | null;
    contact_phone: string | null;
    is_primary: boolean;
    notes: string | null;
    created_at: string;
    updated_at: string;
}

// ========================
// HOOK
// ========================

export const useViewCompanyContacts = (companyId: string) => {
    const [contacts, setContacts] = useState<CompanyContact[]>([]);
    const [loading, setLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const fetchContacts = useCallback(async () => {
        if (!companyId) return;

        setLoading(true);
        setError(null);

        try {
            const response = await CollegeAdminService.getCompanyContacts(companyId);
            setContacts(response.data?.contacts || []);
        } catch (err: unknown) {
            const axiosErr = err as AxiosError<{ message?: string; error?: string }>;
            const errorMsg =
                axiosErr?.response?.data?.error ||
                axiosErr?.response?.data?.message ||
                "Failed to fetch company contacts.";

            setError(errorMsg);
            showToast({
                type: "error",
                title: "Error fetching contacts",
                description: errorMsg,
            });
        } finally {
            setLoading(false);
        }
    }, [companyId]);

    // Fetch on mount or when companyId changes
    useEffect(() => {
        fetchContacts();
    }, [fetchContacts]);

    return {
        contacts,
        loading,
        error,
        fetchContacts,
    };
};