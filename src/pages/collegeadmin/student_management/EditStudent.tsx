import { useState, useCallback, useMemo, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";
import StudentForm from "@/components/collegeadmin/student_management/StudentForm";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { ApiError } from "@/lib/api";
import { queryKeys } from "@/lib/queryKeys";
import { showToast } from "@/utils/ToastUtils";
import { useStudentDetail } from "@/hooks/collegeadmin/student_management/useStudentDetail";

// ========================
// SKELETON
// ========================

const FormSkeleton = () => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 animate-pulse space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
            <div key={`skeleton-section-${String(i)}`} className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                    <div className="space-y-1"><div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" /><div className="h-3 w-40 bg-gray-100 dark:bg-gray-800 rounded" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, j) => (
                        <div key={`skeleton-field-${String(j)}`} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg" />
                    ))}
                </div>
            </div>
        ))}
    </div>
);

// ========================
// COMPONENT
// ========================

export default function EditStudent() {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();
    const queryClient = useQueryClient();

    // Fetch student via React Query (cached, retries, stale-while-revalidate)
    const { student, loading: pageLoading, error: fetchError } = useStudentDetail(studentId || "");

    // Build form data from fetched student — only recalc when student changes
    const [original] = useState<Record<string, unknown>>(() => ({}));
    const [formData, setFormData] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        student_email: "",
        student_password: "",
        dept_name: "",
        student_passout_year: new Date().getFullYear(),
    });
    const [formInitialized, setFormInitialized] = useState(false);

    // Sync form data when student loads (only once per student load)
    if (student && !formInitialized) {
        const data = {
            first_name: student.first_name || "",
            middle_name: student.middle_name || "",
            last_name: student.last_name || "",
            student_email: student.student_email || "",
            student_password: "",
            dept_name: student.dept_name || "",
            student_passout_year: student.student_passout_year || new Date().getFullYear(),
        };
        setFormData(data);
        // Store original for diff — mutate the ref-like state directly during render
        Object.assign(original, data);
        setFormInitialized(true);
    }

    const fetchedName = student ? [student.first_name, student.last_name].filter(Boolean).join(" ") : "";

    // Unsaved changes warning
    const isDirty = useMemo(() => {
        if (!formInitialized) return false;
        return Object.keys(formData).some(
            (key) => key !== "student_password" && formData[key as keyof typeof formData] !== original[key]
        );
    }, [formData, original, formInitialized]);

    useEffect(() => {
        if (!isDirty) return;
        const handler = (e: BeforeUnloadEvent) => { e.preventDefault(); };
        window.addEventListener("beforeunload", handler);
        return () => window.removeEventListener("beforeunload", handler);
    }, [isDirty]);

    // Update mutation
    const updateMutation = useMutation({
        mutationFn: (changed: Record<string, unknown>) =>
            CollegeAdminService.updateStudent(studentId!, changed),
        onSuccess: (response) => {
            const message = (response as { message?: string })?.message || "Student updated successfully";
            showToast({ type: "success", title: "Updated", description: message });
            queryClient.invalidateQueries({ queryKey: queryKeys.students.detail(studentId!) });
            queryClient.invalidateQueries({ queryKey: queryKeys.students.all() });
            navigate(`/college/student/${studentId}`);
        },
        onError: (error: unknown) => {
            const msg = error instanceof ApiError ? error.message : "Failed to update student";
            showToast({ type: "error", title: "Error", description: msg });
        },
    });

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: name === "student_passout_year" ? Number(value) : value,
            }));
        },
        []
    );

    const handleSubmit = useCallback((e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!studentId) return;

        // Build partial update — only send changed fields
        const changed: Record<string, unknown> = {};
        for (const key of Object.keys(formData) as (keyof typeof formData)[]) {
            if (key === "student_password") continue;
            if (formData[key] !== original[key]) {
                changed[key] = formData[key];
            }
        }

        if (Object.keys(changed).length === 0) {
            showToast({ type: "warning", title: "No Changes", description: "No fields were modified" });
            return;
        }

        updateMutation.mutate(changed);
    }, [studentId, formData, original, updateMutation]);

    const breadcrumbs = useMemo(() => [
        { label: "Dashboard", path: "/college/dashboard" },
        { label: "Students", path: "/college/students" },
        { label: fetchedName ? `Edit ${fetchedName}` : "Edit Student", active: true },
    ], [fetchedName]);

    // Loading state
    if (pageLoading) {
        return (
            <AnimatedPage>
                <div className="space-y-6">
                    <PageHeader title="Edit Student" breadcrumbs={breadcrumbs} />
                    <FormSkeleton />
                </div>
            </AnimatedPage>
        );
    }

    // Error state
    if (fetchError) {
        return (
            <AnimatedPage>
                <div className="space-y-6">
                    <PageHeader title="Edit Student" breadcrumbs={breadcrumbs} />
                    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-12 text-center">
                        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
                        <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-4">{fetchError}</p>
                        <button type="button" onClick={() => navigate("/college/students")} className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">
                            Return to Students
                        </button>
                    </div>
                </div>
            </AnimatedPage>
        );
    }

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader title="Edit Student" breadcrumbs={breadcrumbs} />
                <StudentForm
                    mode="edit"
                    formData={formData}
                    errors={{}}
                    loading={updateMutation.isPending}
                    fetchedStudentName={fetchedName}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    handleCancel={() => navigate(`/college/student/${studentId}`)}
                />
            </div>
        </AnimatedPage>
    );
}
