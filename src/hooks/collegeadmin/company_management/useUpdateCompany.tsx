import { useState, useCallback, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { companyUpdateSchema } from "@/validators/CompanySchema";

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
    const [formData, setFormData] = useState<UpdateCompanyForm>({
        companyName: "",
        companyDescription: "",
        companyWebsite: "",
        industry: "",
        companyLogo: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);

    // ========================
    // FETCH EXISTING DATA
    // ========================

    useEffect(() => {
        if (!companyId) {
            setFetching(false);
            setFetchError("Company ID not found");
            return;
        }

        const fetchCompany = async () => {
            setFetching(true);
            setFetchError(null);
            try {
                const response = await CollegeAdminService.getCompany(companyId);
                const company = response?.data;
                if (company) {
                    setFormData({
                        companyName: company.company_name || "",
                        companyDescription: company.company_description || "",
                        companyWebsite: company.company_website || "",
                        industry: company.industry || "",
                        companyLogo: company.company_logo || "",
                    });
                }
            } catch (err: unknown) {
                const msg =
                    err instanceof Error
                        ? err.message
                        : "Failed to fetch company details";
                setFetchError(msg);
                showToast({
                    type: "error",
                    title: "Error",
                    description: msg,
                });
            } finally {
                setFetching(false);
            }
        };

        fetchCompany();
    }, [companyId]);

    // ========================
    // HANDLERS
    // ========================

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;

            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));

            // Clear field-level error on change
            if (errors[name as keyof UpdateCompanyForm]) {
                setErrors((prev) => ({ ...prev, [name]: undefined }));
            }
        },
        [errors]
    );

    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
            e.preventDefault();

            if (!companyId) return;

            // Zod validation
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

            setErrors({});
            setLoading(true);

            try {
                // Convert camelCase → snake_case for API
                const response = await CollegeAdminService.updateCompany(companyId, {
                    company_name: formData.companyName,
                    company_description: formData.companyDescription || undefined,
                    company_website: formData.companyWebsite || undefined,
                    industry: formData.industry || undefined,
                    company_logo: formData.companyLogo || undefined,
                });

                showToast({
                    type: "success",
                    title: "Success",
                    description:
                        response?.message || "Company updated successfully",
                });

                navigate(`/college/company/${companyId}`);
            } catch (error: unknown) {
                const axiosErr = error as AxiosError<{
                    error?: string;
                    message?: string;
                }>;
                const status = axiosErr?.response?.status;
                const errorMsg =
                    axiosErr?.response?.data?.error ||
                    axiosErr?.response?.data?.message ||
                    (error instanceof Error ? error.message : "Something went wrong, please try again");

                // 409 — duplicate name → highlight field
                if (status === 409) {
                    setErrors({ companyName: errorMsg });
                }

                showToast({
                    type: "error",
                    title: "Error Updating Company",
                    description: errorMsg,
                });
            } finally {
                setLoading(false);
            }
        },
        [formData, companyId, navigate]
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
        errors,
        loading,
        fetching,
        fetchError,
        handleChange,
        handleSubmit,
        handleCancel,
    };
};
