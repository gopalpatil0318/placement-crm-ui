import { useState, useEffect, useCallback, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

// ========================
// TYPES
// ========================

interface UpdateDepartmentForm {
    deptName: string;
    deptCode: string;
    deptType: string;
    programDurationYears: number;
    totalSemesters: number;
}

type FormErrors = Partial<Record<keyof UpdateDepartmentForm, string>>;

// ========================
// HOOK
// ========================

export const useUpdateDepartment = (deptId: string) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState<UpdateDepartmentForm>({
        deptName: "",
        deptCode: "",
        deptType: "",
        programDurationYears: 4,
        totalSemesters: 8,
    });
    const originalDataRef = useRef<UpdateDepartmentForm | null>(null);

    const [errors, setErrors] = useState<FormErrors>({});
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);

    // ==============================
    // FETCH DEPARTMENT (PRELOAD DATA)
    // ==============================
    useEffect(() => {
        if (!deptId) return;

        const fetchDepartment = async () => {
            setFetching(true);
            try {
                const response = await CollegeAdminService.getDepartment(deptId);
                const dept = response.data || response;

                const loaded: UpdateDepartmentForm = {
                    deptName: dept?.dept_name || "",
                    deptCode: dept?.dept_code || "",
                    deptType: dept?.dept_type || "",
                    programDurationYears: dept?.program_duration_years ?? 4,
                    totalSemesters: dept?.total_semesters ?? 8,
                };

                setFormData(loaded);
                originalDataRef.current = loaded;
            } catch (error: unknown) {
                const msg =
                    error instanceof Error
                        ? error.message
                        : "Failed to fetch department data";
                showToast({ type: "error", title: "Error", description: msg });
            } finally {
                setFetching(false);
            }
        };

        fetchDepartment();
    }, [deptId]);

    // ==============================
    // HANDLE INPUT CHANGE
    // ==============================
    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
            const { name, value } = e.target;

            setFormData((prev) => ({
                ...prev,
                [name]:
                    name === "programDurationYears" || name === "totalSemesters"
                        ? Number(value)
                        : name === "deptCode"
                            ? value.toUpperCase()
                            : value,
            }));

            // Clear field error on change
            if (errors[name as keyof UpdateDepartmentForm]) {
                setErrors((prev) => ({ ...prev, [name]: undefined }));
            }
        },
        [errors]
    );

    // ==============================
    // HANDLE UPDATE SUBMIT (PARTIAL)
    // ==============================
    const handleSubmit = useCallback(
        async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
            e.preventDefault();

            if (!originalDataRef.current) return;

            // Build partial payload — only changed fields
            const payload: Record<string, string | number> = {};
            const orig = originalDataRef.current;

            if (formData.deptName !== orig.deptName) {
                if (formData.deptName.length < 2) {
                    setErrors({ deptName: "Department name must be at least 2 characters" });
                    return;
                }
                payload.dept_name = formData.deptName;
            }
            if (formData.deptCode !== orig.deptCode) {
                payload.dept_code = formData.deptCode;
            }
            if (formData.deptType !== orig.deptType) {
                payload.dept_type = formData.deptType;
            }
            if (formData.programDurationYears !== orig.programDurationYears) {
                payload.program_duration_years = formData.programDurationYears;
            }
            if (formData.totalSemesters !== orig.totalSemesters) {
                payload.total_semesters = formData.totalSemesters;
            }

            if (Object.keys(payload).length === 0) {
                showToast({
                    type: "info",
                    title: "No Changes",
                    description: "No fields were modified",
                });
                return;
            }

            setErrors({});
            setLoading(true);

            try {
                const response = await CollegeAdminService.updateDepartment(
                    deptId,
                    payload as Parameters<typeof CollegeAdminService.updateDepartment>[1]
                );

                showToast({
                    type: "success",
                    title: "Success",
                    description:
                        response?.message || "Department updated successfully",
                });

                navigate(`/college/department/${deptId}`);
            } catch (error: unknown) {
                const axiosErr = error as AxiosError<{
                    error?: string;
                    message?: string;
                }>;
                const status = axiosErr?.response?.status;
                const errorMsg =
                    axiosErr?.response?.data?.error ||
                    axiosErr?.response?.data?.message ||
                    "Something went wrong";

                if (status === 409) {
                    setErrors({ deptName: errorMsg });
                }

                showToast({
                    type: "error",
                    title: "Error Updating Department",
                    description: errorMsg,
                });
            } finally {
                setLoading(false);
            }
        },
        [formData, deptId, navigate]
    );

    const handleCancel = useCallback(() => {
        navigate(`/college/department/${deptId}`);
    }, [navigate, deptId]);

    return {
        formData,
        errors,
        loading,
        fetching,
        handleChange,
        handleSubmit,
        handleCancel,
    };
};
