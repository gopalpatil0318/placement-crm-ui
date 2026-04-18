import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { ApiError } from "@/lib/api";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";
import { showToast } from "@/utils/ToastUtils";
import { jobUpdateSchema } from "@/validators/JobPostingSchema";

// ========================
// TYPES
// ========================

interface UpdateJobFormData {
    job_title: string;
    job_description: string;
    job_location: string;
    salary_package: string;
    salary_min: number | "";
    salary_max: number | "";
    bond_duration: string;
    bond_details: string;
    application_deadline: string;
    passout_years: number[];
    drive_type: string;
    allow_applications: boolean;
}

type FormErrors = Partial<Record<keyof UpdateJobFormData, string>>;

// Convert UTC ISO string to local datetime-local input value
const toLocalDatetimeValue = (iso: string): string => {
    const d = new Date(iso);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
        .toISOString()
        .slice(0, 16);
};

function coerceInputValue(type: string, value: string): string | number {
    if (type === "number") {
        return value === "" ? "" : Number(value);
    }
    return value;
}

function diffTrimmed(payload: Record<string, unknown>, key: string, current: string, original: string): void {
    if (current.trim() !== original.trim()) {
        payload[key] = current.trim();
    }
}

function computePayloadDiff(
    formData: UpdateJobFormData,
    orig: UpdateJobFormData | null,
): Record<string, unknown> {
    const payload: Record<string, unknown> = {};
    const o = orig ?? ({} as UpdateJobFormData);
    diffTrimmed(payload, "job_title", formData.job_title, o.job_title ?? "");
    diffTrimmed(payload, "job_description", formData.job_description, o.job_description ?? "");
    diffTrimmed(payload, "job_location", formData.job_location, o.job_location ?? "");
    diffTrimmed(payload, "salary_package", formData.salary_package, o.salary_package ?? "");
    if (formData.salary_min !== o.salary_min) {
        payload.salary_min = formData.salary_min === "" ? null : formData.salary_min;
    }
    if (formData.salary_max !== o.salary_max) {
        payload.salary_max = formData.salary_max === "" ? null : formData.salary_max;
    }
    diffTrimmed(payload, "bond_duration", formData.bond_duration, o.bond_duration ?? "");
    diffTrimmed(payload, "bond_details", formData.bond_details, o.bond_details ?? "");
    if (formData.application_deadline !== o.application_deadline) {
        payload.application_deadline = formData.application_deadline;
    }
    const currentYears = [...formData.passout_years].sort((a, b) => a - b).join(",");
    const origYears = orig ? [...orig.passout_years].sort((a, b) => a - b).join(",") : "";
    if (currentYears !== origYears) {
        payload.passout_years = formData.passout_years;
    }
    if (formData.drive_type !== o.drive_type) {
        payload.drive_type = formData.drive_type;
    }
    if (formData.allow_applications !== o.allow_applications) {
        payload.allow_applications = formData.allow_applications;
    }
    return payload;
}

// ========================
// HOOK
// ========================

export const useUpdateJob = (
    jobId: string | undefined,
    onItemLoaded?: (title: string) => void,
) => {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState<UpdateJobFormData>({
        job_title: "",
        job_description: "",
        job_location: "",
        salary_package: "",
        salary_min: "",
        salary_max: "",
        bond_duration: "",
        bond_details: "",
        application_deadline: "",
        passout_years: [],
        drive_type: "on_campus",
        allow_applications: true,
    });
    const [originalData, setOriginalData] = useState<UpdateJobFormData | null>(null);
    const [fetchedJobTitle, setFetchedJobTitle] = useState("");
    const [applicationCount, setApplicationCount] = useState(0);
    const [errors, setErrors] = useState<FormErrors>({});
    const [fetchError] = useState<string | null>(null);

    // ========================
    // FETCH EXISTING DATA (React Query)
    // ========================

    const { isLoading: fetching } = useQuery({
        queryKey: queryKeys.jobs.detail(jobId!),
        queryFn: async () => {
            const response = await CollegeAdminService.getJob(jobId!);
            return response.data || response;
        },
        enabled: !!jobId,
        select: (data) => {
            const loaded: UpdateJobFormData = {
                job_title: data.job_title || "",
                job_description: data.job_description || "",
                job_location: data.job_location || "",
                salary_package: data.salary_package || "",
                salary_min: data.salary_min ? Number(data.salary_min) : "",
                salary_max: data.salary_max ? Number(data.salary_max) : "",
                bond_duration: data.bond_duration || "",
                bond_details: data.bond_details || "",
                application_deadline: data.application_deadline
                    ? toLocalDatetimeValue(data.application_deadline)
                    : "",
                passout_years: Array.isArray(data.passout_years) ? data.passout_years : [],
                drive_type: data.drive_type || "on_campus",
                allow_applications: data.allow_applications !== false,
            };
            return { loaded, title: data.job_title || "" };
        },
    });

    // Populate form from query cache — runs once when data arrives
    const populatedRef = useRef(false);
    const queryData = queryClient.getQueryData<Record<string, unknown>>(queryKeys.jobs.detail(jobId!));

    useEffect(() => {
        if (!queryData || populatedRef.current) return;
        populatedRef.current = true;
        const loaded: UpdateJobFormData = {
            job_title: (queryData.job_title as string) || "",
            job_description: (queryData.job_description as string) || "",
            job_location: (queryData.job_location as string) || "",
            salary_package: (queryData.salary_package as string) || "",
            salary_min: queryData.salary_min ? Number(queryData.salary_min) : "",
            salary_max: queryData.salary_max ? Number(queryData.salary_max) : "",
            bond_duration: (queryData.bond_duration as string) || "",
            bond_details: (queryData.bond_details as string) || "",
            application_deadline: queryData.application_deadline
                ? toLocalDatetimeValue(queryData.application_deadline as string)
                : "",
            passout_years: Array.isArray(queryData.passout_years) ? queryData.passout_years as number[] : [],
            drive_type: (queryData.drive_type as string) || "on_campus",
            allow_applications: queryData.allow_applications !== false,
        };
        // eslint-disable-next-line react-hooks/set-state-in-effect -- data prefill from query
        setFormData(loaded);
        setOriginalData(loaded);
        setFetchedJobTitle((queryData.job_title as string) || "");
        const appStats = queryData.application_stats as { total?: number } | undefined;
        setApplicationCount(appStats?.total ?? 0);
        onItemLoaded?.((queryData.job_title as string) || "");
    }, [queryData, onItemLoaded]);

    // ========================
    // UPDATE MUTATION
    // ========================

    const mutation = useMutation({
        mutationFn: (payload: Record<string, unknown>) =>
            CollegeAdminService.updateJob(jobId!, payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.all() });
            queryClient.invalidateQueries({ queryKey: queryKeys.jobs.detail(jobId!) });
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Job updated successfully",
            });
            navigate(`/college/job/${jobId}`);
        },
        onError: (error: unknown) => {
            const message = error instanceof ApiError ? error.message : "Something went wrong";
            const status = error instanceof ApiError ? error.status : undefined;

            if (status === 409) {
                setErrors({ job_title: message });
            }

            showToast({
                type: "error",
                title: "Error Updating Job",
                description: message,
            });
        },
    });

    // ========================
    // HANDLERS
    // ========================

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value, type } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: coerceInputValue(type, value),
            }));
            setErrors((prev) => {
                if (!prev[name as keyof UpdateJobFormData]) return prev;
                return { ...prev, [name]: undefined };
            });
        },
        []
    );

    // ========================
    // SUBMIT — DIFF-BASED
    // ========================

    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
            e.preventDefault();
            if (!jobId) return;

            // Build validation object from current form
            const validationData = {
                job_title: formData.job_title.trim() || undefined,
                job_description: formData.job_description.trim() || undefined,
                job_location: formData.job_location.trim() || undefined,
                salary_package: formData.salary_package.trim() || undefined,
                salary_min: formData.salary_min === "" ? undefined : formData.salary_min,
                salary_max: formData.salary_max === "" ? undefined : formData.salary_max,
                bond_duration: formData.bond_duration.trim() || undefined,
                bond_details: formData.bond_details.trim() || undefined,
                application_deadline: formData.application_deadline || undefined,
                passout_years: formData.passout_years.length > 0 ? formData.passout_years : undefined,
            };

            // Zod validation
            const result = jobUpdateSchema.safeParse(validationData);
            if (!result.success) {
                const fieldErrors: FormErrors = {};
                for (const issue of result.error.issues) {
                    const field = issue.path[0] as keyof UpdateJobFormData;
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

            // Compute diff — only send changed fields
            const payload = computePayloadDiff(formData, originalData);

            // No-changes guard
            if (Object.keys(payload).length === 0) {
                showToast({
                    type: "warning",
                    title: "No Changes",
                    description: "Nothing has been changed.",
                });
                return;
            }

            mutation.mutate(payload);
        },
        [formData, originalData, jobId, mutation]
    );

    const handleCancel = useCallback(() => {
        if (jobId) {
            navigate(`/college/job/${jobId}`);
        } else {
            navigate("/college/jobs");
        }
    }, [jobId, navigate]);

    const updateField = useCallback(
        (field: keyof UpdateJobFormData, value: UpdateJobFormData[keyof UpdateJobFormData]) => {
            setFormData((prev) => ({ ...prev, [field]: value }));
            setErrors((prev) => {
                if (!prev[field]) return prev;
                return { ...prev, [field]: undefined };
            });
        },
        []
    );

    // isDirty: warn on unsaved changes
    const isDirty = useMemo(() => {
        if (!originalData) return false;
        return Object.keys(computePayloadDiff(formData, originalData)).length > 0;
    }, [formData, originalData]);

    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
            }
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

    return {
        formData,
        fetchedJobTitle,
        applicationCount,
        errors,
        loading: mutation.isPending,
        fetching,
        fetchError,
        handleChange,
        updateField,
        handleSubmit,
        handleCancel,
    };
};
