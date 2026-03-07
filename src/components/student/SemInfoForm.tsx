import { useSemesterGrades } from "@/hooks/student/useSemesterGrades";
import { Plus, Pencil, X, BookOpen, TrendingUp, AlertTriangle } from "lucide-react";
import type { SemesterGradeData } from "@/services/student/semesterGrade.service";

interface Props {
    profileData: any;
    refreshProfile: () => Promise<void>;
    nextStep: () => void;
}

const SemInfoForm = ({ }: Props) => {
    const {
        grades,
        totalSemesters,
        loading,
        saving,
        isFormOpen,
        editingGradeId,
        formData,
        errors,
        backlogInput,
        setBacklogInput,
        openAddForm,
        openEditForm,
        closeForm,
        handleChange,
        addBacklogSubject,
        removeBacklogSubject,
        handleSubmit,
    } = useSemesterGrades();

    const getStatusColor = (status: string) => {
        switch (status) {
            case "completed":
                return "bg-green-100 text-green-700 border-green-200";
            case "in_progress":
                return "bg-blue-100 text-blue-700 border-blue-200";
            case "detained":
                return "bg-orange-100 text-orange-700 border-orange-200";
            case "failed":
                return "bg-red-100 text-red-700 border-red-200";
            default:
                return "bg-gray-100 text-gray-700 border-gray-200";
        }
    };

    const getStatusLabel = (status: string) => {
        switch (status) {
            case "in_progress": return "In Progress";
            case "completed": return "Completed";
            case "detained": return "Detained";
            case "failed": return "Failed";
            default: return status;
        }
    };

    if (loading) {
        return (
            <div className="p-8 bg-white rounded-xl border">
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    <span className="ml-3 text-gray-500">Loading semester grades...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-white rounded-xl border">
            {/* ================= Header with Add Button ================= */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Semester Grades</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {grades.length} / {totalSemesters} semesters added
                    </p>
                </div>
                {grades.length < totalSemesters && (
                    <button
                        type="button"
                        onClick={() => openAddForm(0)}
                        className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full font-medium transition cursor-pointer"
                    >
                        <Plus className="h-4 w-4" />
                        Add Sem Info
                    </button>
                )}
            </div>

            {/* ================= Cards Grid ================= */}
            {grades.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-16 text-gray-400">
                    <BookOpen className="h-12 w-12 mb-3 text-gray-300" />
                    <p className="text-lg font-medium text-gray-500">No semester grades added yet</p>
                    <p className="text-sm text-gray-400 mt-1">Click "Add Sem Info" to get started</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {grades
                        .sort((a, b) => a.semester_number - b.semester_number)
                        .map((grade) => (
                            <GradeCard
                                key={grade.grade_id || grade.semester_number}
                                grade={grade}
                                onEdit={() => openEditForm(grade)}
                                getStatusColor={getStatusColor}
                                getStatusLabel={getStatusLabel}
                            />
                        ))}
                </div>
            )}

            {/* ================= Modal Form ================= */}
            {isFormOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={closeForm} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-lg font-semibold text-gray-800">
                                {editingGradeId ? "Edit" : "Add"} Semester Grade
                            </h3>
                            <button
                                type="button"
                                onClick={closeForm}
                                className="p-1 hover:bg-gray-100 rounded-full transition cursor-pointer"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>

                        {/* Form Body */}
                        <div className="p-6 space-y-5">
                            {/* Semester Number */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Semester Number <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="semester_number"
                                    value={formData.semester_number}
                                    onChange={handleChange}
                                    disabled={!!editingGradeId}
                                    className={`w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${editingGradeId ? "bg-gray-100 cursor-not-allowed" : ""}`}
                                >
                                    <option value={0}>Select Semester</option>
                                    {Array.from({ length: totalSemesters }, (_, i) => i + 1)
                                        .filter((num) =>
                                            editingGradeId
                                                ? num === formData.semester_number
                                                : !grades.some((g) => g.semester_number === num)
                                        )
                                        .map((num) => (
                                            <option key={num} value={num}>
                                                Semester {num}
                                            </option>
                                        ))}
                                </select>
                                {errors.semester_number && (
                                    <p className="text-xs text-red-500 mt-1">{errors.semester_number}</p>
                                )}
                            </div>

                            {/* Academic Year */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Academic Year <span className="text-red-500">*</span>
                                </label>
                                <input
                                    name="academic_year"
                                    value={formData.academic_year}
                                    onChange={handleChange}
                                    placeholder="e.g. 2022-23"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {errors.academic_year && (
                                    <p className="text-xs text-red-500 mt-1">{errors.academic_year}</p>
                                )}
                            </div>

                            {/* Status — shown first so conditional fields react */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Semester Status <span className="text-red-500">*</span>
                                </label>
                                <select
                                    name="semester_status"
                                    value={formData.semester_status}
                                    onChange={handleChange}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Status</option>
                                    <option value="in_progress">In Progress</option>
                                    <option value="completed">Completed</option>
                                    <option value="detained">Detained</option>
                                    <option value="failed">Failed</option>
                                </select>
                                {errors.semester_status && (
                                    <p className="text-xs text-red-500 mt-1">{errors.semester_status}</p>
                                )}
                            </div>

                            {/* SGPA, CGPA, Backlogs — only when NOT in_progress */}
                            {formData.semester_status !== "in_progress" && (
                                <>
                                    {/* SGPA & CGPA */}
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                SGPA <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                name="sgpa"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="10"
                                                value={formData.sgpa}
                                                onChange={handleChange}
                                                placeholder="0.00 - 10.00"
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            {errors.sgpa && (
                                                <p className="text-xs text-red-500 mt-1">{errors.sgpa}</p>
                                            )}
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                CGPA <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                name="cgpa"
                                                type="number"
                                                step="0.01"
                                                min="0"
                                                max="10"
                                                value={formData.cgpa}
                                                onChange={handleChange}
                                                placeholder="0.00 - 10.00"
                                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                            />
                                            {errors.cgpa && (
                                                <p className="text-xs text-red-500 mt-1">{errors.cgpa}</p>
                                            )}
                                        </div>
                                    </div>

                                    {/* Backlogs */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Backlogs in Semester
                                        </label>
                                        <input
                                            name="backlogs_in_semester"
                                            type="number"
                                            min="0"
                                            value={formData.backlogs_in_semester}
                                            onChange={handleChange}
                                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                        {errors.backlogs_in_semester && (
                                            <p className="text-xs text-red-500 mt-1">{errors.backlogs_in_semester}</p>
                                        )}
                                    </div>

                                    {/* Backlog Subjects — only show if backlogs > 0 */}
                                    {Number(formData.backlogs_in_semester) > 0 && (
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Backlog Subjects
                                            </label>
                                            <div className="flex gap-2">
                                                <input
                                                    value={backlogInput}
                                                    onChange={(e) => setBacklogInput(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === "Enter") {
                                                            e.preventDefault();
                                                            addBacklogSubject();
                                                        }
                                                    }}
                                                    placeholder="Type subject name & press Enter"
                                                    className="flex-1 rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={addBacklogSubject}
                                                    className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm font-medium transition cursor-pointer"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                            {formData.backlog_subjects.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {formData.backlog_subjects.map((subject) => (
                                                        <span
                                                            key={subject}
                                                            className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 text-red-700 text-sm rounded-full border border-red-200"
                                                        >
                                                            {subject}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeBacklogSubject(subject)}
                                                                className="hover:text-red-900 cursor-pointer"
                                                            >
                                                                <X className="h-3 w-3" />
                                                            </button>
                                                        </span>
                                                    ))}
                                                </div>
                                            )}
                                        </div>
                                    )}
                                </>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="flex justify-end gap-3 p-6 border-t">
                            <button
                                type="button"
                                onClick={closeForm}
                                className="px-6 py-2.5 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 font-medium transition cursor-pointer"
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleSubmit}
                                disabled={saving}
                                className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition cursor-pointer disabled:opacity-50"
                            >
                                {saving ? "Saving..." : editingGradeId ? "Update" : "Save"}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SemInfoForm;

/* ================= Grade Card ================= */

const GradeCard = ({
    grade,
    onEdit,
    getStatusColor,
    getStatusLabel,
}: {
    grade: SemesterGradeData;
    onEdit: () => void;
    getStatusColor: (s: string) => string;
    getStatusLabel: (s: string) => string;
}) => (
    <div className="relative p-6 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-md transition group min-h-[180px]">
        {/* Edit button */}
        <button
            type="button"
            onClick={onEdit}
            className="absolute top-4 right-4 p-2 rounded-full bg-gray-50 hover:bg-blue-50 text-gray-400 hover:text-blue-600 opacity-0 group-hover:opacity-100 transition cursor-pointer"
        >
            <Pencil className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-50 rounded-lg">
                <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            <div>
                <h3 className="text-base font-semibold text-gray-800">Semester {grade.semester_number}</h3>
                <p className="text-xs text-gray-500">{grade.academic_year}</p>
            </div>
        </div>

        {/* SGPA / CGPA */}
        <div className="flex items-center gap-5 mb-4">
            <div className="flex items-center gap-1.5">
                <TrendingUp className="h-4 w-4 text-green-500" />
                <span className="text-sm font-semibold text-gray-700">SGPA: {Number(grade.sgpa).toFixed(2)}</span>
            </div>
            <div className="text-sm font-medium text-gray-500">CGPA: {Number(grade.cgpa).toFixed(2)}</div>
        </div>

        {/* Backlogs */}
        {Number(grade.backlogs_in_semester) > 0 && (
            <div className="flex items-center gap-1.5 mb-3">
                <AlertTriangle className="h-4 w-4 text-orange-500" />
                <span className="text-sm text-orange-700">
                    {grade.backlogs_in_semester} backlog{Number(grade.backlogs_in_semester) > 1 ? "s" : ""}
                </span>
            </div>
        )}

        {/* Backlog Subjects */}
        {grade.backlog_subjects && grade.backlog_subjects.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mb-4">
                {grade.backlog_subjects.map((sub) => (
                    <span key={sub} className="text-xs px-2.5 py-1 bg-red-50 text-red-600 rounded-full border border-red-100">
                        {sub}
                    </span>
                ))}
            </div>
        )}

        {/* Status Badge */}
        <span className={`inline-block text-xs px-3 py-1.5 rounded-full border font-medium ${getStatusColor(grade.semester_status)}`}>
            {getStatusLabel(grade.semester_status)}
        </span>
    </div>
);
