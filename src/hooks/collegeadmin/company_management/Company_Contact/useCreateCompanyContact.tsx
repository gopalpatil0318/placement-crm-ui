import { useState, useCallback } from "react";
import { AxiosError } from "axios";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { companyContactCreateSchema } from "@/validators/CompanySchema";
import type { CompanyContactCreateInput } from "@/validators/CompanySchema";

// ========================
// TYPES
// ========================

type FormErrors = Partial<Record<keyof CompanyContactCreateInput, string>>;

// ========================
// HOOK
// ========================

export const useCreateCompanyContact = (companyId: string, onSuccess?: () => void) => {
    const [formData, setFormData] = useState<CompanyContactCreateInput>({
        contactName: "",
        contactDesignation: "",
        contactEmail: "",
        contactPhone: "",
        isPrimary: false,
        notes: "",
    });
    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
            const { name, value, type } = e.target;

            let val: string | boolean = value;
            if (type === "checkbox") {
                val = (e.target as HTMLInputElement).checked;
            }

            setFormData((prev) => ({
                ...prev,
                [name]: val,
            }));

            // Clear field-level error on change
            if (errors[name as keyof CompanyContactCreateInput]) {
                setErrors((prev) => ({ ...prev, [name]: undefined }));
            }
        },
        [errors]
    );

    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
            e.preventDefault();

            // Zod validation
            const result = companyContactCreateSchema.safeParse(formData);
            if (!result.success) {
                const fieldErrors: FormErrors = {};
                for (const issue of result.error.issues) {
                    const field = issue.path[0] as keyof CompanyContactCreateInput;
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
                const response = await CollegeAdminService.addCompanyContact(companyId, {
                    contact_name: formData.contactName,
                    contact_designation: formData.contactDesignation || undefined,
                    contact_email: formData.contactEmail || undefined,
                    contact_phone: formData.contactPhone || undefined,
                    is_primary: formData.isPrimary,
                    notes: formData.notes || undefined,
                });

                showToast({
                    type: "success",
                    title: "Success",
                    description: response?.message || "Contact created successfully",
                });

                // Reset form
                setFormData({
                    contactName: "",
                    contactDesignation: "",
                    contactEmail: "",
                    contactPhone: "",
                    isPrimary: false,
                    notes: "",
                });

                if (onSuccess) {
                    onSuccess();
                }

            } catch (error: unknown) {
                const axiosErr = error as AxiosError<{
                    error?: string;
                    message?: string;
                }>;
                const errorMsg =
                    axiosErr?.response?.data?.error ||
                    axiosErr?.response?.data?.message ||
                    (error instanceof Error ? error.message : "Something went wrong, please try again");

                showToast({
                    type: "error",
                    title: "Error Creating Contact",
                    description: errorMsg,
                });
            } finally {
                setLoading(false);
            }
        },
        [companyId, formData, onSuccess]
    );

    return {
        formData,
        errors,
        loading,
        handleChange,
        handleSubmit,
    };
};