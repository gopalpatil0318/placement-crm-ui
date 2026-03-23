import { useState, useCallback, useEffect, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { contactUpdateSchema } from "@/validators/ContactSchema";
import { queryKeys } from "@/lib/queryKeys";
import { type Contact } from "./useViewContacts";

// ========================
// TYPES
// ========================

interface UpdateContactForm {
    contactName: string;
    contactDesignation: string;
    contactEmail: string;
    contactPhone: string;
    isPrimary: boolean;
    notes: string;
}

type FormErrors = Partial<Record<keyof UpdateContactForm, string>>;

// ========================
// HOOK
// ========================

export const useUpdateContact = (companyId: string, contact: Contact | null, onSuccess: () => void) => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<UpdateContactForm>({
        contactName: "",
        contactDesignation: "",
        contactEmail: "",
        contactPhone: "",
        isPrimary: false,
        notes: "",
    });
    const originalData = useRef<UpdateContactForm | null>(null);
    const [errors, setErrors] = useState<FormErrors>({});

    // Pre-fill form from row data when contact changes (no API call)
    useEffect(() => {
        if (!contact) return;
        const loaded: UpdateContactForm = {
            contactName: contact.contact_name || "",
            contactDesignation: contact.contact_designation || "",
            contactEmail: contact.contact_email || "",
            contactPhone: contact.contact_phone || "",
            isPrimary: contact.is_primary,
            notes: contact.notes || "",
        };
        setFormData(loaded);
        originalData.current = loaded;
        setErrors({});
    }, [contact]);

    const mutation = useMutation({
        mutationFn: (payload: { id: string; data: Record<string, unknown> }) =>
            CollegeAdminService.updateContact(payload.id, payload.data),
        onSuccess: (response) => {
            // Invalidate contacts list and company detail for precise cache refresh
            queryClient.invalidateQueries({ queryKey: queryKeys.companies.contacts(companyId) });
            queryClient.invalidateQueries({ queryKey: queryKeys.companies.detail(companyId) });
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Contact updated successfully",
            });
            onSuccess();
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;

            if (status === 409) {
                setErrors({ contactEmail: message });
            }

            showToast({ type: "error", title: "Error Updating Contact", description: message });
        },
    });

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({ ...prev, [name]: value }));
            setErrors((prev) => {
                if (!prev[name as keyof UpdateContactForm]) return prev;
                return { ...prev, [name]: undefined };
            });
        },
        []
    );

    const handleCheckboxChange = useCallback((field: keyof UpdateContactForm, value: boolean) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleSubmit = useCallback(async (): Promise<void> => {
        if (!contact) return;

        // Zod validation
        const result = contactUpdateSchema.safeParse(formData);
        if (!result.success) {
            const fieldErrors: FormErrors = {};
            for (const issue of result.error.issues) {
                const field = issue.path[0] as keyof UpdateContactForm;
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

        // Build diff — only changed fields
        const orig = originalData.current;
        const payload: Record<string, string | boolean | undefined> = {};

        if (!orig || formData.contactName.trim() !== orig.contactName.trim())
            payload.contact_name = formData.contactName.trim();
        if (!orig || formData.contactDesignation.trim() !== (orig.contactDesignation || "").trim())
            payload.contact_designation = formData.contactDesignation.trim() || undefined;
        if (!orig || formData.contactEmail.trim() !== (orig.contactEmail || "").trim())
            payload.contact_email = formData.contactEmail.trim() || undefined;
        if (!orig || formData.contactPhone.trim() !== (orig.contactPhone || "").trim())
            payload.contact_phone = formData.contactPhone.trim() || undefined;
        if (!orig || formData.isPrimary !== orig.isPrimary)
            payload.is_primary = formData.isPrimary;
        if (!orig || formData.notes.trim() !== (orig.notes || "").trim())
            payload.notes = formData.notes.trim() || undefined;

        if (Object.keys(payload).length === 0) {
            showToast({ type: "warning", title: "No Changes", description: "Nothing has been changed." });
            return;
        }

        setErrors({});
        mutation.mutate({ id: contact.contact_id, data: payload });
    }, [formData, contact, mutation]);

    return {
        formData,
        errors,
        loading: mutation.isPending,
        handleChange,
        handleCheckboxChange,
        handleSubmit,
    };
};
