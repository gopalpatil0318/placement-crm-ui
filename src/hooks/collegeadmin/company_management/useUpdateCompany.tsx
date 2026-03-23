import { useState, useCallback, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { companyUpdateSchema } from "@/validators/CompanySchema";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

interface UpdateCompanyForm {
    companyName: string;
    companyDescription: string;
    companyWebsite: string;
    industry: string;
    companyLogo: string;
}

type FormErrors = Partial<Record<keyof UpdateCompanyForm, string>>;

// ========================
// HOOK
// ========================

export const useUpdateCompany = (companyId: string | undefined) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<UpdateCompanyForm>({
        companyName: "",
        companyDescription: "",
        companyWebsite: "",
        industry: "",
        companyLogo: "",
    });
    const originalData = useRef<UpdateCompanyForm | null>(null);
    const [fetchedCompanyName, setFetchedCompanyName] = useState<string>("");
    const [errors, setErrors] = useState<FormErrors>({});

    // ── Fetch existing data via React Query ──
    const { data: queryData, isLoading: fetching, error: queryFetchError } = useQuery({
        queryKey: queryKeys.companies.detail(companyId!),
        queryFn: () => CollegeAdminService.getCompany(companyId!),
        enabled: !!companyId,
    });

    // Sync fetched data into form state (runs once when query resolves)
    useEffect(() => {
        const company = queryData?.data ?? queryData;
        if (company && !originalData.current) {
            const loaded: UpdateCompanyForm = {
                companyName: company.company_name || "",
                companyDescription: company.company_description || "",
                companyWebsite: company.company_website || "",
                industry: company.industry || "",
                companyLogo: company.company_logo || "",
            };
            setFormData(loaded);
            originalData.current = loaded;
            setFetchedCompanyName(company.company_name || "");
        }
    }, [queryData]);

    const fetchError = !companyId
        ? "Company ID not found"
        : queryFetchError
            ? (queryFetchError instanceof Error ? queryFetchError.message : "Failed to fetch company details")
            : null;

    // ── Update mutation ──
    const mutation = useMutation({
        mutationFn: (payload: Record<string, string | undefined>) =>
            CollegeAdminService.updateCompany(companyId!, payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.companies.all() });
            queryClient.invalidateQueries({ queryKey: queryKeys.companies.detail(companyId!) });
            showToast({ type: "success", title: "Success", description: response?.message || "Company updated successfully" });
            navigate(`/college/company/${companyId}`);
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong, please try again";
            const status = error instanceof ApiError ? error.status : undefined;

            if (status === 409) {
                setErrors({ companyName: message });
            }

            showToast({ type: "error", title: "Error Updating Company", description: message });
        },
    });

    // ── Handlers ──

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;

            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));

            setErrors((prev) => {
                if (!prev[name as keyof UpdateCompanyForm]) return prev;
                return { ...prev, [name]: undefined };
            });
        },
        []
    );

    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
            e.preventDefault();

            if (!companyId) return;

            const result = companyUpdateSchema.safeParse(formData);
            if (!result.success) {
                const fieldErrors: FormErrors = {};
                for (const issue of result.error.issues) {
                    const field = issue.path[0] as keyof UpdateCompanyForm;
                    if (!fieldErrors[field]) {
                        fieldErrors[field] = issue.message;
                    }
                }
                setErrors(fieldErrors);
                showToast({
                    type: "warning",
                    title: "Validation Failed",
                    description: result.error.issues[0].message,
                });
                return;
            }

            // Build diff — only changed fields
            const orig = originalData.current;
            const payload: Record<string, string | undefined> = {};

            if (!orig || formData.companyName.trim() !== orig.companyName.trim())
                payload.company_name = formData.companyName.trim();
            if (!orig || formData.companyDescription !== orig.companyDescription)
                payload.company_description = formData.companyDescription || undefined;
            if (!orig || formData.companyWebsite !== orig.companyWebsite)
                payload.company_website = formData.companyWebsite || undefined;
            if (!orig || formData.industry !== orig.industry)
                payload.industry = formData.industry || undefined;
            if (!orig || formData.companyLogo !== orig.companyLogo)
                payload.company_logo = formData.companyLogo || undefined;

            if (Object.keys(payload).length === 0) {
                showToast({ type: "warning", title: "No Changes", description: "Nothing has been changed." });
                return;
            }

            setErrors({});
            mutation.mutate(payload);
        },
        [formData, companyId, mutation]
    );

    const handleCancel = useCallback(() => {
        if (companyId) {
            navigate(`/college/company/${companyId}`);
        } else {
            navigate("/college/companies");
        }
    }, [companyId, navigate]);

    return {
        formData,
        fetchedCompanyName,
        errors,
        loading: mutation.isPending,
        fetching,
        fetchError,
        handleChange,
        handleSubmit,
        handleCancel,
    };
};
