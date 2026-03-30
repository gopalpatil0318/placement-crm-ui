import { useState, useEffect, useCallback, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { academicInfoSchema } from "@/validators/student/academicInfoSchema";
import { StudentAcademicInfoService } from "@/services/student/academicInfo.service";

const initialFormData = {
    roll_number: "",
    enrollment_number: "",
    admission_year: "",
    admission_based_on: "",
    tenth_percentage: "",
    tenth_board: "",
    tenth_passing_year: "",
    twelfth_or_diploma: "12th",
    twelfth_percentage: "",
    twelfth_board: "",
    diploma_percentage: "",
    diploma_branch: "",
    higher_education_passing_year: "",
    overall_cgpa: "",
    total_live_kts: "0",
    total_dead_kts: "0",
    any_gap_during_education: false,
    gap_years: "",
    gap_reason: "",
};

type FormErrors = Partial<Record<string, string>>;

export const useAcademicInfo = () => {
    const queryClient = useQueryClient();
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const baselineRef = useRef<string>("");
    const [isDirty, setIsDirty] = useState(false);

    // Fetch existing academic data
    const { data: fetchedData, isLoading: fetching } = useQuery({
        queryKey: queryKeys.studentPortal.academicInfo(),
        queryFn: async () => {
            const response = await StudentAcademicInfoService.getAcademicInfo();
            return response.data ?? null;
        },
        staleTime: 2 * 60 * 1000,
    });

    // Prefill from fetched academic data
    /* eslint-disable react-hooks/set-state-in-effect -- one-time form initialization from query data */
    useEffect(() => {
        if (fetchedData) {
            const filled = {
                ...initialFormData,
                ...fetchedData,
                twelfth_percentage: fetchedData.twelfth_percentage ?? "",
                twelfth_board: fetchedData.twelfth_board ?? "",
                diploma_percentage: fetchedData.diploma_percentage ?? "",
                diploma_branch: fetchedData.diploma_branch ?? "",
                gap_years: fetchedData.gap_years ?? "",
                gap_reason: fetchedData.gap_reason ?? "",
                total_live_kts: String(fetchedData.total_live_kts ?? "0"),
                total_dead_kts: String(fetchedData.total_dead_kts ?? "0"),
            };
            setFormData(filled);
            baselineRef.current = JSON.stringify(filled);
            setIsDirty(false);
        }
    }, [fetchedData]);
    /* eslint-enable react-hooks/set-state-in-effect */

    // Track dirty state + beforeunload
    useEffect(() => {
        if (baselineRef.current) {
            setIsDirty(JSON.stringify(formData) !== baselineRef.current);
        }
    }, [formData]);

    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => {
            if (isDirty) {
                e.preventDefault();
            }
        };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

    const handleChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev) => ({ ...prev, [name]: newValue }));
        setErrors((prev) => {
            if (!prev[name]) return prev;
            return { ...prev, [name]: undefined };
        });
    }, []);

    const handleCheckboxChange = useCallback((name: string, checked: boolean) => {
        setFormData((prev) => ({ ...prev, [name]: checked }));
    }, []);

    const saveMutation = useMutation({
        mutationFn: (payload: Record<string, unknown>) =>
            StudentAcademicInfoService.saveAcademicInfo(payload),
        onSuccess: (response) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.academicInfo() });
            queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.fullProfile() });
            baselineRef.current = JSON.stringify(formData);
            setIsDirty(false);
            showToast({
                type: "success",
                title: "Success",
                description: response.message || "Academic info saved successfully",
            });
        },
        onError: (error) => {
            showToast({
                type: "error",
                title: "Error Saving Academic Info",
                description: error instanceof ApiError ? error.message : "Something went wrong, please try again",
            });
        },
    });

    const handleSubmit = () => {
        const result = academicInfoSchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors: FormErrors = {};
            result.error.issues.forEach((issue) => {
                const fieldName = issue.path[0] as string;
                if (!fieldErrors[fieldName]) {
                    fieldErrors[fieldName] = issue.message;
                }
            });
            setErrors(fieldErrors);
            showToast({
                type: "warning",
                title: "Validation Failed",
                description: result.error.issues[0].message,
            });
            return;
        }

        setErrors({});

        const is12th = formData.twelfth_or_diploma === "12th";
        const hasGap = formData.any_gap_during_education;

        const payload = {
            roll_number: formData.roll_number.trim() || undefined,
            enrollment_number: formData.enrollment_number.trim() || undefined,
            admission_year: Number(formData.admission_year),
            admission_based_on: formData.admission_based_on.trim(),
            tenth_percentage: Number(formData.tenth_percentage),
            tenth_board: formData.tenth_board.trim(),
            tenth_passing_year: Number(formData.tenth_passing_year),
            twelfth_or_diploma: formData.twelfth_or_diploma,
            twelfth_percentage: is12th ? Number(formData.twelfth_percentage) : null,
            twelfth_board: is12th ? formData.twelfth_board.trim() : null,
            diploma_percentage: is12th ? null : Number(formData.diploma_percentage),
            diploma_branch: is12th ? null : formData.diploma_branch.trim(),
            higher_education_passing_year: Number(formData.higher_education_passing_year),
            overall_cgpa: Number(formData.overall_cgpa),
            total_live_kts: Number(formData.total_live_kts),
            total_dead_kts: Number(formData.total_dead_kts),
            any_gap_during_education: hasGap,
            gap_years: hasGap ? Number(formData.gap_years) : null,
            gap_reason: hasGap ? formData.gap_reason.trim() : null,
        };

        saveMutation.mutate(payload as Record<string, unknown>);
    };

    return {
        formData,
        errors,
        loading: saveMutation.isPending,
        fetching,
        isDirty,
        handleChange,
        handleCheckboxChange,
        handleSubmit,
    };
};
