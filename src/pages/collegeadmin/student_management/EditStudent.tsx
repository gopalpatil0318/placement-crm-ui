import { useState, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Save } from "lucide-react";
import DashboardLayout from "@/components/collegeadmin/DashboardLayout";
import PageHeader from "@/components/collegeadmin/PageHeader";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";

// ========================
// COMPONENT
// ========================

export default function EditStudent() {
    const { studentId } = useParams<{ studentId: string }>();
    const navigate = useNavigate();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [departments, setDepartments] = useState<any[]>([]);

    // Original values (for partial update diff)
    const [original, setOriginal] = useState<Record<string, any>>({});

    const [formData, setFormData] = useState({
        first_name: "",
        middle_name: "",
        last_name: "",
        student_email: "",
        dept_name: "",
        student_passout_year: new Date().getFullYear(),
        current_year: 1,
    });

    // Fetch student + departments
    useEffect(() => {
        const loadData = async () => {
            setLoading(true);
            try {
                const [studentRes, deptRes] = await Promise.all([
                    CollegeAdminService.getStudent(studentId || ""),
                    CollegeAdminService.getDepartments({ is_active: true, limit: 100 }),
                ]);

                const s = studentRes.data || studentRes;
                const data = {
                    first_name: s.first_name || "",
                    middle_name: s.middle_name || "",
                    last_name: s.last_name || "",
                    student_email: s.student_email || "",
                    dept_name: s.dept_name || "",
                    student_passout_year: s.student_passout_year || new Date().getFullYear(),
                    current_year: s.current_year || 1,
                };
                setFormData(data);
                setOriginal(data);

                const deptList = Array.isArray(deptRes?.data) ? deptRes.data : Array.isArray(deptRes) ? deptRes : [];
                setDepartments(deptList);
            } catch (err: any) {
                showToast({
                    type: "error",
                    title: "Error",
                    description: err?.response?.data?.error || "Failed to load student data",
                });
                navigate("/college/students");
            } finally {
                setLoading(false);
            }
        };
        loadData();
    }, [studentId, navigate]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: name === "student_passout_year" || name === "current_year" ? Number(value) : value,
        }));
    }, []);

    const handleSubmit = useCallback(async (e: React.FormEvent) => {
        e.preventDefault();
        if (!studentId) return;

        // Build partial update — only send changed fields
        const changed: Record<string, any> = {};
        for (const key of Object.keys(formData) as (keyof typeof formData)[]) {
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
            showToast({
                type: "success",
                title: "Updated",
                description: response?.message || "Student updated successfully",
            });
            navigate(`/college/student/${studentId}`);
        } catch (err: any) {
            const errMsg = err?.response?.data?.error || err?.message || "Failed to update student";
            showToast({ type: "error", title: "Error", description: errMsg });
        } finally {
            setSaving(false);
        }
    }, [studentId, formData, original, navigate]);

    const breadcrumbs = useMemo(() => [
        { label: "Dashboard", path: "/college/dashboard" },
        { label: "Students", path: "/college/students" },
        { label: "Edit Student", active: true },
    ], []);

    // Passout year options 2020–2040
    const passoutYearOptions = useMemo(
        () => Array.from({ length: 21 }, (_, i) => 2020 + i),
        []
    );

    if (loading) {
        return (
            <DashboardLayout>
                <div className="space-y-6">
                    <PageHeader title="Edit Student" breadcrumbs={breadcrumbs} />
                    <div className="bg-white rounded-xl border p-8 animate-pulse space-y-6">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="h-12 bg-gray-100 rounded-lg" />
                        ))}
                    </div>
                </div>
            </DashboardLayout>
        );
    }

    return (
        <DashboardLayout>
            <div className="space-y-6">
                <PageHeader title="Edit Student" breadcrumbs={breadcrumbs} />

                <button
                    type="button"
                    onClick={() => navigate(`/college/student/${studentId}`)}
                    className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 font-medium transition"
                >
                    <ArrowLeft size={16} />
                    Back to Student Detail
                </button>

                <div className="bg-white rounded-xl border p-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-6">Update Student Information</h2>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Row 1 — Names */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">First Name *</label>
                                <input
                                    name="first_name"
                                    value={formData.first_name}
                                    onChange={handleChange}
                                    required
                                    minLength={2}
                                    maxLength={100}
                                    className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Middle Name</label>
                                <input
                                    name="middle_name"
                                    value={formData.middle_name}
                                    onChange={handleChange}
                                    maxLength={100}
                                    className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Last Name *</label>
                                <input
                                    name="last_name"
                                    value={formData.last_name}
                                    onChange={handleChange}
                                    required
                                    minLength={1}
                                    maxLength={100}
                                    className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                        </div>

                        {/* Row 2 — Email + Department */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Student Email *</label>
                                <input
                                    type="email"
                                    name="student_email"
                                    value={formData.student_email}
                                    onChange={handleChange}
                                    required
                                    maxLength={255}
                                    className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Department *</label>
                                <select
                                    name="dept_name"
                                    value={formData.dept_name}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value="">Select Department</option>
                                    {departments.map((d: any) => (
                                        <option key={d.dept_id} value={d.dept_name}>
                                            {d.dept_name}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Row 3 — Year + Passout */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Current Year *</label>
                                <select
                                    name="current_year"
                                    value={formData.current_year}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    <option value={1}>1st Year</option>
                                    <option value={2}>2nd Year</option>
                                    <option value={3}>3rd Year</option>
                                    <option value={4}>4th Year</option>
                                    <option value={5}>5th Year</option>
                                    <option value={6}>6th Year</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">Passout Year *</label>
                                <select
                                    name="student_passout_year"
                                    value={formData.student_passout_year}
                                    onChange={handleChange}
                                    required
                                    className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                                >
                                    {passoutYearOptions.map((y) => (
                                        <option key={y} value={y}>{y}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Buttons */}
                        <div className="flex items-center gap-4 pt-2">
                            <button
                                type="submit"
                                disabled={saving}
                                className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-50"
                            >
                                {saving ? (
                                    <>
                                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save size={16} />
                                        Save Changes
                                    </>
                                )}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate(`/college/student/${studentId}`)}
                                className="px-6 py-2.5 text-gray-600 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </DashboardLayout>
    );
}
