import { useSemesterGrades } from "@/hooks/student/useSemesterGrades";
import { Plus, Pencil, X, BookOpen, AlertTriangle } from "lucide-react";
import type { SemesterGradeData } from "@/services/student/semesterGrade.service";
import ModalWrapper from "@/components/ui/ModalWrapper";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingSelect from "@/components/ui/FloatingSelect";
import { SEMESTER_STATUS_OPTIONS } from "@/constants/semesterGrades";

const SemInfoForm = () => {
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
                return "bg-green-100 dark:bg-green-900/20 text-green-700 dark:text-green-300 border-green-200 dark:border-green-800";
            case "in_progress":
                return "bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800";
            case "detained":
                return "bg-orange-100 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800";
            case "failed":
                return "bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300 border-red-200 dark:border-red-800";
            default:
                return "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-700";
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
            <div className="p-8 bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="h-5 w-36 rounded bg-gray-200 dark:bg-gray-700/60 animate-pulse" />
                        <div className="h-3.5 w-28 rounded bg-gray-200 dark:bg-gray-700/60 animate-pulse mt-2" />
                    </div>
                    <div className="h-9 w-28 rounded-full bg-gray-200 dark:bg-gray-700/60 animate-pulse" />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {["a", "b", "c"].map((id) => (
                        <div key={id} className="p-6 rounded-xl border border-gray-200 dark:border-gray-700 min-h-[180px] space-y-4">
                            <div className="flex items-center gap-3">
                                <div className="h-10 w-10 rounded-lg bg-gray-200 dark:bg-gray-700/60 animate-pulse" />
                                <div>
                                    <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700/60 animate-pulse" />
                                    <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700/60 animate-pulse mt-1" />
                                </div>
                            </div>
                            <div className="flex gap-5">
                                <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700/60 animate-pulse" />
                                <div className="h-4 w-20 rounded bg-gray-200 dark:bg-gray-700/60 animate-pulse" />
                            </div>
                            <div className="h-6 w-24 rounded-full bg-gray-200 dark:bg-gray-700/60 animate-pulse" />
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    let submitLabel = "Save";
    if (saving) submitLabel = "Saving...";
    else if (editingGradeId) submitLabel = "Update";

    return (
        <div className="p-8 bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800">
            {/* ================= Header with Add Button ================= */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Semester Grades</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
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
                    {[...grades]
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
            <ModalWrapper isOpen={isFormOpen} onClose={closeForm} title={`${editingGradeId ? "Edit" : "Add"} Semester Grade`} disabled={saving} size="lg" footer={
                <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700">
                    <button
                        type="button"
                        onClick={closeForm}
                        className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={saving}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition cursor-pointer disabled:opacity-50"
                    >
                        {submitLabel}
                    </button>
                </div>
            }>
                        {/* Form Body */}
                        <div className="p-6 space-y-5">
                            {/* Semester Number — keep raw due to complex filtering + disabled */}
                            <div>
                                <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                    Semester Number <span className="text-red-500">*</span>
                                </p>
                                <select
                                    name="semester_number"
                                    value={formData.semester_number}
                                    onChange={handleChange}
                                    disabled={!!editingGradeId}
                                    className={`w-full rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 px-4 py-2.5 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 ${editingGradeId ? "bg-gray-100 dark:bg-gray-700 cursor-not-allowed" : ""}`}
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

                            <FloatingInput label="Academic Year" name="academic_year" value={formData.academic_year} onChange={handleChange} error={errors.academic_year} required placeholder="e.g. 2022-23" />

                            <FloatingSelect label="Semester Status" name="semester_status" value={formData.semester_status} onChange={handleChange} error={errors.semester_status} required options={SEMESTER_STATUS_OPTIONS} />

                            {/* SGPA, CGPA, Backlogs — only when NOT in_progress */}
                            {formData.semester_status !== "in_progress" && (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <FloatingInput label="SGPA" name="sgpa" value={formData.sgpa} onChange={handleChange} error={errors.sgpa} required type="number" inputMode="decimal" placeholder="0.00 - 10.00" />
                                        <FloatingInput label="CGPA" name="cgpa" value={formData.cgpa} onChange={handleChange} error={errors.cgpa} required type="number" inputMode="decimal" placeholder="0.00 - 10.00" />
                                    </div>

                                    <FloatingInput label="Backlogs in Semester" name="backlogs_in_semester" value={formData.backlogs_in_semester} onChange={handleChange} error={errors.backlogs_in_semester} type="number" inputMode="numeric" />

                                    {/* Backlog Subjects — only show if backlogs > 0 */}
                                    {Number(formData.backlogs_in_semester) > 0 && (
                                        <div>
                                            <p className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                                Backlog Subjects
                                            </p>
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
                                                    className="flex-1 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 px-4 py-2.5 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={addBacklogSubject}
                                                    className="px-4 py-2.5 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition cursor-pointer"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                            {formData.backlog_subjects.length > 0 && (
                                                <div className="flex flex-wrap gap-2 mt-2">
                                                    {formData.backlog_subjects.map((subject) => (
                                                        <span
                                                            key={subject}
                                                            className="inline-flex items-center gap-1 px-3 py-1 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 text-sm rounded-full border border-red-200 dark:border-red-800"
                                                        >
                                                            {subject}
                                                            <button
                                                                type="button"
                                                                onClick={() => removeBacklogSubject(subject)}
                                                                className="hover:text-red-900 dark:hover:text-red-100 cursor-pointer"
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
            </ModalWrapper>
        </div>
    );
};

export default SemInfoForm;

/* ================= Grade Card ================= */

const getAccentColor = (status: string) => {
    switch (status) {
        case "completed": return "border-l-green-500";
        case "in_progress": return "border-l-blue-500";
        case "detained": return "border-l-orange-500";
        case "failed": return "border-l-red-500";
        default: return "border-l-gray-400";
    }
};

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
    <div className={`relative bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700 border-l-4 ${getAccentColor(grade.semester_status)} hover:shadow-lg transition group min-h-[180px] overflow-hidden`}>
        {/* Edit button */}
        <button
            type="button"
            onClick={onEdit}
            aria-label="Edit semester grade"
            className="absolute top-3 right-3 p-2 rounded-full bg-gray-50 dark:bg-gray-700 hover:bg-blue-50 dark:hover:bg-blue-900/30 text-gray-400 hover:text-blue-600 opacity-70 md:opacity-0 md:group-hover:opacity-100 transition cursor-pointer"
        >
            <Pencil className="h-4 w-4" />
        </button>

        <div className="p-5">
            {/* Top row — Semester + Academic Year + Status */}
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2.5">
                    <div className="p-2 bg-blue-50 dark:bg-blue-900/30 rounded-lg">
                        <BookOpen className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Semester {grade.semester_number}</h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500">{grade.academic_year}</p>
                    </div>
                </div>
                <span className={`text-xs px-2.5 py-1 rounded-full border font-medium ${getStatusColor(grade.semester_status)}`}>
                    {getStatusLabel(grade.semester_status)}
                </span>
            </div>

            {/* Hero SGPA + secondary CGPA */}
            <div className="flex items-end gap-4 mb-4">
                <div>
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">SGPA</p>
                    <p className="text-2xl font-bold text-gray-900 dark:text-gray-50 leading-none">{Number(grade.sgpa).toFixed(2)}</p>
                </div>
                <div className="pb-0.5">
                    <p className="text-xs text-gray-400 dark:text-gray-500 mb-0.5">CGPA</p>
                    <p className="text-base font-semibold text-gray-500 dark:text-gray-400 leading-none">{Number(grade.cgpa).toFixed(2)}</p>
                </div>
            </div>

            {/* Backlogs compact indicator */}
            {Number(grade.backlogs_in_semester) > 0 && (
                <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 px-2.5 py-1 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-100 dark:border-orange-800">
                        <AlertTriangle className="h-3.5 w-3.5 text-orange-500" />
                        <span className="text-xs font-medium text-orange-700 dark:text-orange-400">
                            {grade.backlogs_in_semester} backlog{Number(grade.backlogs_in_semester) > 1 ? "s" : ""}
                        </span>
                    </div>
                    {grade.backlog_subjects && grade.backlog_subjects.length > 0 && (
                        <span className="text-xs text-gray-400 dark:text-gray-500 truncate" title={grade.backlog_subjects.join(", ")}>
                            {grade.backlog_subjects.slice(0, 2).join(", ")}
                            {grade.backlog_subjects.length > 2 && ` +${grade.backlog_subjects.length - 2}`}
                        </span>
                    )}
                </div>
            )}
        </div>
    </div>
);
