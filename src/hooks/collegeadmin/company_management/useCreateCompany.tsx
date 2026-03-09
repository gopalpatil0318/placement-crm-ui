import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { companyCreateSchema } from "@/validators/CompanySchema";

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
    const [formData, setFormData] = useState<CreateCompanyForm>({
        companyName: "",
        companyDescription: "",
        companyWebsite: "",
        industry: "",
        companyLogo: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;

            setFormData((prev) => ({
                ...prev,
                [name]: value,
            }));

            // Clear field-level error on change
            if (errors[name as keyof CreateCompanyForm]) {
                setErrors((prev) => ({ ...prev, [name]: undefined }));
            }
        },
        [errors]
    );

    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
            e.preventDefault();

            // Zod validation
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
            setLoading(true);

            try {
                // Convert camelCase → snake_case for API
                const response = await CollegeAdminService.createCompany({
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
                        response?.message || "Company created successfully",
                });

                navigate("/college/companies");
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
                    title: "Error Creating Company",
                    description: errorMsg,
                });
            } finally {
                setLoading(false);
            }
        },
        [formData, navigate]
    );

    const handleCancel = useCallback(() => {
        navigate("/college/companies");
    }, [navigate]);

    return {
        formData,
        errors,
        loading,
        handleChange,
        handleSubmit,
        handleCancel,
    };
};
