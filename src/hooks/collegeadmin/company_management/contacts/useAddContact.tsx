import { useState, useCallback } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { contactSchema } from "@/validators/ContactSchema";
import { queryKeys } from "@/lib/queryKeys";

// ========================
// TYPES
// ========================

interface AddContactForm {
    contactName: string;
    contactDesignation: string;
    contactEmail: string;
    contactPhone: string;
    isPrimary: boolean;
    notes: string;
}

type FormErrors = Partial<Record<keyof AddContactForm, string>>;

const INITIAL_FORM: AddContactForm = {
    contactName: "",
    contactDesignation: "",
    contactEmail: "",
    contactPhone: "",
    isPrimary: false,
    notes: "",
};

// ========================
// HOOK
// ========================

export const useAddContact = (companyId: string, onSuccess: () => void) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<AddContactForm>({ ...INITIAL_FORM });
    const [errors, setErrors] = useState<FormErrors>({});

    const mutation = useMutation({
        mutationFn: (payload: { contact_name: string; contact_designation?: string; contact_email?: string; contact_phone?: string; is_primary?: boolean; notes?: string }) =>
            CollegeAdminService.addContact(companyId, payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.companies.contacts(companyId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.companies.detail(companyId) });
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Contact added successfully",
            });
            onSuccess();
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;

            if (status === 409) {
                setErrors({ contactEmail: message });
            }

            showToast({ type: "error", title: "Error Adding Contact", description: message });
        },
    });

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
            setErrors((prev) => {
                if (!prev[name as keyof AddContactForm]) return prev;
                return { ...prev, [name]: undefined };
            });
        },
        []
    );

    const handleCheckboxChange = useCallback((field: keyof AddContactForm, value: boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleSubmit = useCallback(async (): Promise<void> => {
        const result = contactSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: FormErrors = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof AddContactForm;
                if (!fieldErrors[field]) fieldErrors[field] = issue.message;
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
            contact_name: formData.contactName.trim(),
            contact_designation: formData.contactDesignation.trim() || undefined,
            contact_email: formData.contactEmail.trim() || undefined,
            contact_phone: formData.contactPhone.trim() || undefined,
            is_primary: formData.isPrimary,
            notes: formData.notes.trim() || undefined,
        });
    }, [formData, mutation]);

    const reset = useCallback(() => {
        setFormData({ ...INITIAL_FORM });
        setErrors({});
    }, []);

    return {
        formData,
        errors,
        loading: mutation.isPending,
        handleChange,
        handleCheckboxChange,
        handleSubmit,
        reset,
    };
};
