import { useState, useCallback, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import { notifyStudentsSchema } from "@/validators/EligibleDenialSchema";

// ========================
// TYPES
// ========================

interface NotifyFormErrors {
    title?: string;
    body?: string;
}

interface NotifyResult {
    notified_count: number;
    skipped_count: number;
}

// ========================
// HOOK
// ========================

export const useNotifyStudents = (onSuccess?: () => void) => {
    const queryClient = useQueryClient();
    const [title, setTitle] = useState("");
    const [body, setBody] = useState("");
    const [errors, setErrors] = useState<NotifyFormErrors>({});
    const titleRef = useRef("");
    const bodyRef = useRef("");
    const [notifyResult, setNotifyResult] = useState<NotifyResult | null>(null);

    const mutation = useMutation({
        mutationFn: (params: { jobId: string; payload: { title: string; body: string; student_ids?: string[] } }) =>
            CollegeAdminService.notifyEligibleStudents(params.jobId, params.payload),
        onSuccess: (response, variables) => {
            const data = response.data || response;
            const notified = data.notified_count ?? 0;
            const skipped = data.skipped_count ?? 0;

            setNotifyResult({ notified_count: notified, skipped_count: skipped });

            const parts: string[] = [];
            if (notified > 0) parts.push(`${notified} student${notified > 1 ? "s" : ""} notified`);
            if (skipped > 0) parts.push(`${skipped} skipped (already notified)`);

            showToast({
                type: "success",
                title: "Notification Sent",
                description: parts.join(", ") || "Notification processed",
            });

            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.eligibleNotApplied(variables.jobId) });
            onSuccess?.();
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;

            if (status === 400) {
                showToast({ type: "error", title: "Validation Error", description: message });
            } else if (status === 404) {
                showToast({ type: "error", title: "Not Found", description: message });
            } else {
                showToast({ type: "error", title: "Error", description: message });
            }
        },
    });

    const handleTitleChange = useCallback((value: string) => {
        setTitle(value);
        titleRef.current = value;
        setErrors((prev) => {
            if (!prev.title) return prev;
            return { ...prev, title: undefined };
        });
    }, []);

    const handleBodyChange = useCallback((value: string) => {
        setBody(value);
        bodyRef.current = value;
        setErrors((prev) => {
            if (!prev.body) return prev;
            return { ...prev, body: undefined };
        });
    }, []);

    const handleSubmit = useCallback(
        (jobId: string, studentIds?: string[]) => {
            const currentTitle = titleRef.current;
            const currentBody = bodyRef.current;

            const payload = {
                title: currentTitle,
                body: currentBody,
                student_ids: studentIds && studentIds.length > 0 ? studentIds : undefined,
            };

            const result = notifyStudentsSchema.safeParse(payload);
            if (!result.success) {
                const fieldErrors: NotifyFormErrors = {};
                for (const issue of result.error.issues) {
                    const field = issue.path[0] as keyof NotifyFormErrors;
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
            setNotifyResult(null);
            mutation.mutate({
                jobId,
                payload: {
                    title: currentTitle.trim(),
                    body: currentBody.trim(),
                    student_ids: studentIds && studentIds.length > 0 ? studentIds : undefined,
                },
            });
        },
        [mutation],
    );

    const reset = useCallback(() => {
        setTitle("");
        setBody("");
        titleRef.current = "";
        bodyRef.current = "";
        setErrors({});
        setNotifyResult(null);
    }, []);

    return {
        title,
        body,
        errors,
        loading: mutation.isPending,
        notifyResult,
        handleTitleChange,
        handleBodyChange,
        handleSubmit,
        reset,
    };
};
