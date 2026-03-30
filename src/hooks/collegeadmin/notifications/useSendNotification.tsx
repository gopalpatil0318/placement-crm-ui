import { useState, useCallback, useRef, useMemo, useEffect } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { showToast, getErrorTitle } from "@/utils/ToastUtils";
import {
    sendNotificationSchema,
    bulkNotificationSchema,
    type NotificationType,
    type RecipientType,
    type RelatedEntityType,
    type SendNotificationResponse,
    type BulkNotificationResponse,
    type BulkNotificationFilters,
} from "@/validators/NotificationSchema";

// ========================
// TYPES
// ========================

interface FormData {
    title: string;
    body: string;
    notification_type: NotificationType | "";
    related_entity_type: RelatedEntityType | "";
    related_entity_id: string;
}

interface TargetedData {
    recipient_type: RecipientType;
    recipient_ids: string[];
}

interface BulkData {
    recipient_type: RecipientType;
    dept_ids: string[];
    passout_years: number[];
    student_status: string;
    profile_status: string;
    is_profile_complete: string; // "true" | "false" | "" (empty = not set)
    user_roles: string[];
    exclude_ids: string[];
}

export type SendMode = "targeted" | "bulk";

const INITIAL_FORM: FormData = {
    title: "",
    body: "",
    notification_type: "",
    related_entity_type: "",
    related_entity_id: "",
};

const INITIAL_TARGETED: TargetedData = {
    recipient_type: "student",
    recipient_ids: [],
};

const INITIAL_BULK: BulkData = {
    recipient_type: "student",
    dept_ids: [],
    passout_years: [],
    student_status: "",
    profile_status: "",
    is_profile_complete: "",
    user_roles: [],
    exclude_ids: [],
};

// ========================
// HOOK
// ========================

export function useSendNotification() {
    const queryClient = useQueryClient();

    // Wizard state
    const [step, setStep] = useState(1);
    const [sendMode, setSendMode] = useState<SendMode>("targeted");
    const [formData, setFormData] = useState<FormData>(INITIAL_FORM);
    const [targetedData, setTargetedData] = useState<TargetedData>(INITIAL_TARGETED);
    const [bulkData, setBulkData] = useState<BulkData>(INITIAL_BULK);
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [sendResult, setSendResult] = useState<SendNotificationResponse | BulkNotificationResponse | null>(null);

    // Recipient search (for targeted mode)
    const [recipientSearch, setRecipientSearch] = useState("");
    const [debouncedRecipientSearch, setDebouncedRecipientSearch] = useState("");
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const invalidateCache = useCallback(() => {
        queryClient.invalidateQueries({ queryKey: queryKeys.notifications.sent() });
    }, [queryClient]);

    // ── Form field handlers ──────────────────────────────────────────────────

    const handleFormChange = useCallback((field: keyof FormData, value: string) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }, []);

    const handleTargetedChange = useCallback((field: keyof TargetedData, value: RecipientType | string[]) => {
        setTargetedData(prev => ({ ...prev, [field]: value }));
        setErrors(prev => {
            if (!prev[field]) return prev;
            const next = { ...prev };
            delete next[field];
            return next;
        });
    }, []);

    const handleBulkChange = useCallback((field: keyof BulkData, value: string | string[] | number[]) => {
        setBulkData(prev => ({ ...prev, [field]: value }));
    }, []);

    const addRecipient = useCallback((id: string) => {
        setTargetedData(prev => {
            if (prev.recipient_ids.includes(id)) return prev;
            return { ...prev, recipient_ids: [...prev.recipient_ids, id] };
        });
        setErrors(prev => {
            if (!prev.recipient_ids) return prev;
            const next = { ...prev };
            delete next.recipient_ids;
            return next;
        });
    }, []);

    const removeRecipient = useCallback((id: string) => {
        setTargetedData(prev => ({
            ...prev,
            recipient_ids: prev.recipient_ids.filter(r => r !== id),
        }));
    }, []);

    const handleRecipientSearchChange = useCallback((value: string) => {
        setRecipientSearch(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        searchTimerRef.current = setTimeout(() => {
            setDebouncedRecipientSearch(value);
        }, 300);
    }, []);

    // ── Template apply ───────────────────────────────────────────────────────

    const applyTemplate = useCallback((template: {
        notification_type: NotificationType;
        title: string;
        body: string;
        related_entity_type?: RelatedEntityType;
    }) => {
        setFormData({
            title: template.title,
            body: template.body,
            notification_type: template.notification_type,
            related_entity_type: template.related_entity_type ?? "",
            related_entity_id: "",
        });
        setErrors({});
    }, []);

    // ── Step validation ──────────────────────────────────────────────────────

    const validateStep1 = useCallback((): boolean => {
        const newErrors: Record<string, string> = {};
        const title = formData.title.trim();
        const body = formData.body.trim();

        if (!title || title.length < 2) {
            newErrors.title = "Title must be at least 2 characters";
        } else if (title.length > 200) {
            newErrors.title = "Title must be at most 200 characters";
        }
        if (body.length > 3000) {
            newErrors.body = "Body must be at most 3000 characters";
        }
        if (!formData.notification_type) {
            newErrors.notification_type = "Please select a notification type";
        }
        if (formData.related_entity_type && !formData.related_entity_id.trim()) {
            newErrors.related_entity_id = "Entity ID is required when entity type is selected";
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [formData]);

    const validateStep2 = useCallback((): boolean => {
        const newErrors: Record<string, string> = {};

        if (sendMode === "targeted") {
            if (targetedData.recipient_ids.length === 0) {
                newErrors.recipient_ids = "Select at least one recipient";
            } else if (targetedData.recipient_ids.length > 100) {
                newErrors.recipient_ids = "Maximum 100 recipients allowed";
            }
        }
        // Bulk mode: recipient_type is always set, other filters are optional

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    }, [sendMode, targetedData.recipient_ids]);

    // ── Step navigation ──────────────────────────────────────────────────────

    const goToStep = useCallback((target: number) => {
        if (target === 2 && !validateStep1()) return;
        if (target === 3 && !validateStep2()) return;
        setStep(target);
    }, [validateStep1, validateStep2]);

    const goNext = useCallback(() => {
        goToStep(step + 1);
    }, [step, goToStep]);

    const goBack = useCallback(() => {
        if (step > 1) setStep(step - 1);
    }, [step]);

    // ── Build payloads ───────────────────────────────────────────────────────

    const buildTargetedPayload = useCallback(() => ({
        recipient_type: targetedData.recipient_type,
        recipient_ids: targetedData.recipient_ids,
        title: formData.title.trim(),
        body: formData.body.trim() || undefined,
        notification_type: formData.notification_type as NotificationType,
        related_entity_type: formData.related_entity_type || undefined,
        related_entity_id: formData.related_entity_id.trim() || undefined,
    }), [formData, targetedData]);

    const buildBulkPayload = useCallback(() => {
        const filters: BulkNotificationFilters = {
            recipient_type: bulkData.recipient_type,
        };
        if (bulkData.dept_ids.length > 0) filters.dept_ids = bulkData.dept_ids;
        if (bulkData.passout_years.length > 0) filters.passout_years = bulkData.passout_years;
        if (bulkData.student_status) filters.student_status = bulkData.student_status;
        if (bulkData.profile_status) filters.profile_status = bulkData.profile_status;
        if (bulkData.is_profile_complete === "true") filters.is_profile_complete = true;
        if (bulkData.is_profile_complete === "false") filters.is_profile_complete = false;
        if (bulkData.user_roles.length > 0) filters.user_roles = bulkData.user_roles;
        if (bulkData.exclude_ids.length > 0) filters.exclude_ids = bulkData.exclude_ids;

        return {
            title: formData.title.trim(),
            body: formData.body.trim() || undefined,
            notification_type: formData.notification_type as NotificationType,
            related_entity_type: formData.related_entity_type || undefined,
            related_entity_id: formData.related_entity_id.trim() || undefined,
            filters,
        };
    }, [formData, bulkData]);

    // ── Mutations ────────────────────────────────────────────────────────────

    const sendMutation = useMutation({
        mutationFn: (payload: ReturnType<typeof buildTargetedPayload>) =>
            CollegeAdminService.sendNotification(payload),
        onSuccess: (response: { data: SendNotificationResponse; message?: string }) => {
            invalidateCache();
            setSendResult(response.data);
            setStep(4); // success state
            showToast({ type: "success", title: "Sent", description: response.message || "Notification sent successfully" });
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Failed to send notification";
            const status = error instanceof ApiError ? error.status : undefined;
            showToast({ type: "error", title: getErrorTitle(status), description: message });
        },
    });

    const bulkMutation = useMutation({
        mutationFn: (payload: ReturnType<typeof buildBulkPayload>) =>
            CollegeAdminService.sendBulkNotification(payload),
        onSuccess: (response: { data: BulkNotificationResponse; message?: string }) => {
            invalidateCache();
            setSendResult(response.data);
            setStep(4); // success state
            showToast({ type: "success", title: "Sent", description: response.message || "Bulk notifications sent successfully" });
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Failed to send bulk notification";
            const status = error instanceof ApiError ? error.status : undefined;
            showToast({ type: "error", title: getErrorTitle(status), description: message });
        },
    });

    // ── Submit ────────────────────────────────────────────────────────────────

    const parseAndSetErrors = useCallback((result: { success: false; error: { issues: Array<{ path: PropertyKey[]; message: string }> } }) => {
        const newErrors: Record<string, string> = {};
        for (const issue of result.error.issues) {
            const key = String(issue.path[0] ?? "form");
            if (!newErrors[key]) newErrors[key] = issue.message;
        }
        setErrors(newErrors);
        showToast({ type: "error", title: "Validation Error", description: "Please fix the errors before sending" });
    }, []);

    const handleSubmit = useCallback(() => {
        if (sendMode === "targeted") {
            const payload = buildTargetedPayload();
            const result = sendNotificationSchema.safeParse(payload);
            if (!result.success) { parseAndSetErrors(result); return; }
            sendMutation.mutate(payload);
        } else {
            const payload = buildBulkPayload();
            const result = bulkNotificationSchema.safeParse(payload);
            if (!result.success) { parseAndSetErrors(result); return; }
            bulkMutation.mutate(payload);
        }
    }, [sendMode, buildTargetedPayload, buildBulkPayload, sendMutation, bulkMutation, parseAndSetErrors]);

    // ── Reset (send another) ─────────────────────────────────────────────────

    const reset = useCallback(() => {
        setStep(1);
        setFormData(INITIAL_FORM);
        setTargetedData(INITIAL_TARGETED);
        setBulkData(INITIAL_BULK);
        setErrors({});
        setSendResult(null);
        setRecipientSearch("");
        setDebouncedRecipientSearch("");
        setSendMode("targeted");
    }, []);

    // ── isDirty + beforeunload ────────────────────────────────────────────────

    const isDirty = useMemo(() => {
        if (step === 4) return false; // success page
        if (formData.title.trim() || formData.body.trim()) return true;
        if (sendMode === "targeted" && targetedData.recipient_ids.length > 0) return true;
        if (sendMode === "bulk" && (
            bulkData.dept_ids.length > 0 ||
            bulkData.passout_years.length > 0 ||
            bulkData.user_roles.length > 0 ||
            bulkData.exclude_ids.length > 0
        )) return true;
        return false;
    }, [step, formData.title, formData.body, sendMode, targetedData.recipient_ids.length, bulkData.dept_ids.length, bulkData.passout_years.length, bulkData.user_roles.length, bulkData.exclude_ids.length]);

    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (isDirty) e.preventDefault();
        };
        globalThis.addEventListener("beforeunload", handler);
        return () => globalThis.removeEventListener("beforeunload", handler);
    }, [isDirty]);

    return {
        // Wizard
        step,
        sendMode,
        setSendMode,
        goNext,
        goBack,
        goToStep,

        // Form data
        formData,
        handleFormChange,

        // Targeted
        targetedData,
        handleTargetedChange,
        addRecipient,
        removeRecipient,
        recipientSearch,
        debouncedRecipientSearch,
        handleRecipientSearchChange,

        // Bulk
        bulkData,
        handleBulkChange,

        // Template
        applyTemplate,

        // Errors & validation
        errors,

        // Submission
        handleSubmit,
        isSending: sendMutation.isPending || bulkMutation.isPending,

        // Result
        sendResult,

        // Reset
        reset,
    };
}
