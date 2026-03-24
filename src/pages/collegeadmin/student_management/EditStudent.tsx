import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AlertCircle } from "lucide-react";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";
import StudentForm from "@/components/collegeadmin/student_management/StudentForm";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

// ========================
// SKELETON
// ========================

const FormSkeleton = () => (
    <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 p-8 animate-pulse space-y-8">
        {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="space-y-4">
                <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-xl" />
                    <div className="space-y-1"><div className="h-4 w-28 bg-gray-200 dark:bg-gray-700 rounded" /><div className="h-3 w-40 bg-gray-100 dark:bg-gray-800 rounded" /></div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {Array.from({ length: 3 }).map((_, j) => (
                        <div key={j} className="h-12 bg-gray-100 dark:bg-gray-800 rounded-lg" />
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

    const [pageLoading, setPageLoading] = useState(true);
    const [fetchError, setFetchError] = useState("");
    const [saving, setSaving] = useState(false);
    const [fetchedName, setFetchedName] = useState("");

    // Original values (for partial update diff)
    const [original, setOriginal] = useState<Record<string, unknown>>({});

    const [formData, setFormData] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        student_email: "",
        student_password: "",
        dept_name: "",
        student_passout_year: new Date().getFullYear(),
        current_year: 1,
    });

    // Fetch student data
    useEffect(() => {
        const loadData = async () => {
            setPageLoading(true);
            setFetchError("");
            try {
                const res = await CollegeAdminService.getStudent(studentId || "");
                const s = res.data || res;
                const data = {
                    first_name: s.first_name || "",
                    middle_name: s.middle_name || "",
                    last_name: s.last_name || "",
                    student_email: s.student_email || "",
                    student_password: "",
                    dept_name: s.dept_name || "",
                    student_passout_year: s.student_passout_year || new Date().getFullYear(),
                    current_year: s.current_year || 1,
                };
                setFormData(data);
                setOriginal(data);
                setFetchedName([s.first_name, s.last_name].filter(Boolean).join(" "));
            } catch (err: unknown) {
                const msg = err instanceof Error ? err.message : "Failed to load student data";
                setFetchError(msg);
            } finally {
                setPageLoading(false);
            }
        };
        loadData();
    }, [studentId]);

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: name === "student_passout_year" || name === "current_year" ? Number(value) : value,
            }));
        },
        []
    );

    const handleSubmit = useCallback(async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!studentId) return;

        // Build partial update — only send changed fields
        const changed: Record<string, unknown> = {};
        for (const key of Object.keys(formData) as (keyof typeof formData)[]) {
            if (key === "student_password") continue; // skip password in edit
            if (formData[key] !== original[key]) {
                changed[key] = formData[key];
            }
        }

        if (Object.keys(changed).length === 0) {
            showToast({ type: "warning", title: "No Changes", description: "No fields were modified" });
            return;
        }

        setSaving(true);
        try {
            const response = await CollegeAdminService.updateStudent(studentId, changed);
            showToast({ type: "success", title: "Updated", description: response?.message || "Student updated successfully" });
            navigate(`/college/student/${studentId}`);
        } catch (err: unknown) {
            const msg = err instanceof Error ? err.message : "Failed to update student";
            showToast({ type: "error", title: "Error", description: msg });
        } finally {
            setSaving(false);
        }
    }, [studentId, formData, original, navigate]);

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
                    loading={saving}
                    fetchedStudentName={fetchedName}
                    handleChange={handleChange}
                    handleSubmit={handleSubmit}
                    handleCancel={() => navigate(`/college/student/${studentId}`)}
                />
            </div>
        </AnimatedPage>
    );
}
