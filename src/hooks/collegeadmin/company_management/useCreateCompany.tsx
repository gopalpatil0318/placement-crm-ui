import { useState, useCallback, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { companyCreateSchema } from "@/validators/CompanySchema";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

interface CreateCompanyForm {
    companyName: string;
    companyDescription: string;
    companyWebsite: string;
    industry: string;
    companyLogo: string;
}

type FormErrors = Partial<Record<keyof CreateCompanyForm, string>>;

// ========================
// HOOK
// ========================

export const useCreateCompany = () => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<CreateCompanyForm>({
        companyName: "",
        companyDescription: "",
        companyWebsite: "",
        industry: "",
        companyLogo: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});

    // ── Unsaved-changes guard ──
    const isDirty = useMemo(() => {
        return (
            formData.companyName.trim() !== "" ||
            formData.companyDescription.trim() !== "" ||
            formData.companyWebsite.trim() !== "" ||
            formData.industry.trim() !== "" ||
            formData.companyLogo.trim() !== ""
        );
    }, [formData]);

    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (isDirty) e.preventDefault();
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

    const mutation = useMutation({
        mutationFn: (payload: {
            company_name: string;
            company_description?: string;
            company_website?: string;
            industry?: string;
            company_logo?: string;
        }) => CollegeAdminService.createCompany(payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.companies.all() });
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Company created successfully",
            });
            navigate("/college/companies");
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong, please try again";
            const status = error instanceof ApiError ? error.status : undefined;

            if (status === 409) {
                setErrors({ companyName: message });
            }

            showToast({ type: "error", title: "Error Creating Company", description: message });
        },
    });

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;

            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));

            setErrors((prev) => {
                if (!prev[name as keyof CreateCompanyForm]) return prev;
                return { ...prev, [name]: undefined };
            });
        },
        []
    );

    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
            e.preventDefault();

            const result = companyCreateSchema.safeParse(formData);
            if (!result.success) {
                const fieldErrors: FormErrors = {};
                for (const issue of result.error.issues) {
                    const field = issue.path[0] as keyof CreateCompanyForm;
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

            setErrors({});
            mutation.mutate({
                company_name: formData.companyName.trim(),
                company_description: formData.companyDescription || undefined,
                company_website: formData.companyWebsite || undefined,
                industry: formData.industry || undefined,
                company_logo: formData.companyLogo || undefined,
            });
        },
        [formData, mutation]
    );

    const handleCancel = useCallback(() => {
        navigate("/college/companies");
    }, [navigate]);

    return {
        formData,
        errors,
        loading: mutation.isPending,
        handleChange,
        handleSubmit,
        handleCancel,
    };
};
