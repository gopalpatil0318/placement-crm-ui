import { useState, useEffect, useCallback } from "react";
import { showToast } from "@/utils/ToastUtils";
import { semesterGradeSchema } from "@/validators/student/semesterGradeSchema";
import { StudentSemesterGradeService } from "@/services/student/semesterGrade.service";
import type { SemesterGradeData } from "@/services/student/semesterGrade.service";

const initialFormData = {
    semester_number: 0,
    academic_year: "",
    sgpa: "",
    cgpa: "",
    backlogs_in_semester: "0",
    backlog_subjects: [] as string[],
    semester_status: "",
};

type FormErrors = Partial<Record<string, string>>;

export const useSemesterGrades = () => {
    const [grades, setGrades] = useState<SemesterGradeData[]>([]);
    const [totalSemesters, setTotalSemesters] = useState(0);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Modal state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [backlogInput, setBacklogInput] = useState("");

    const fetchGrades = useCallback(async () => {
        try {
            const response = await StudentSemesterGradeService.getAllGrades();
            if (response.data) {
                setGrades(response.data.grades || []);
                setTotalSemesters(response.data.total_semesters_in_dept || 0);
            }
        } catch (error) {
            console.log("No semester grades found");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchGrades();
    }, [fetchGrades]);

    // Open form for adding a new semester
    const openAddForm = (semesterNumber: number) => {
        setFormData({ ...initialFormData, semester_number: semesterNumber });
        setEditingGradeId(null);
        setErrors({});
        setBacklogInput("");
        setIsFormOpen(true);
    };

    // Open form for editing an existing semester
    const openEditForm = (grade: SemesterGradeData) => {
        setFormData({
            semester_number: grade.semester_number,
            academic_year: grade.academic_year || "",
            sgpa: String(grade.sgpa ?? ""),
            cgpa: String(grade.cgpa ?? ""),
            backlogs_in_semester: String(grade.backlogs_in_semester ?? "0"),
            backlog_subjects: grade.backlog_subjects || [],
            semester_status: grade.semester_status || "",
        });
        setEditingGradeId(grade.grade_id || null);
        setErrors({});
        setBacklogInput("");
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingGradeId(null);
        setFormData(initialFormData);
        setErrors({});
        setBacklogInput("");
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        if (errors[name]) {
            setErrors((prev) => ({ ...prev, [name]: undefined }));
        }
    };

    // Add a backlog subject
    const addBacklogSubject = () => {
        const subject = backlogInput.trim();
        if (subject && !formData.backlog_subjects.includes(subject)) {
            setFormData((prev) => ({
                ...prev,
                backlog_subjects: [...prev.backlog_subjects, subject],
            }));
            setBacklogInput("");
        }
    };

    // Remove a backlog subject
    const removeBacklogSubject = (subject: string) => {
        setFormData((prev) => ({
            ...prev,
            backlog_subjects: prev.backlog_subjects.filter((s) => s !== subject),
        }));
    };

    const handleSubmit = async (): Promise<void> => {
        const result = semesterGradeSchema.safeParse(formData);

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

        setSaving(true);

        try {
            const payload = {
                ...formData,
                semester_number: Number(formData.semester_number),
                sgpa: Number(formData.sgpa),
                cgpa: Number(formData.cgpa),
                backlogs_in_semester: Number(formData.backlogs_in_semester),
            };

            if (editingGradeId) {
                // Update existing
                const { semester_number: _, ...updatePayload } = payload;
                const response = await StudentSemesterGradeService.updateGrade(editingGradeId, updatePayload);
                showToast({
                    type: "success",
                    title: "Success",
                    description: response?.message || "Semester grade updated successfully",
                });
            } else {
                // Add new
                const response = await StudentSemesterGradeService.addGrade(payload);
                showToast({
                    type: "success",
                    title: "Success",
                    description: response?.message || "Semester grade added successfully",
                });
            }

            closeForm();
            await fetchGrades();
        } catch (error: any) {
            showToast({
                type: "error",
                title: editingGradeId ? "Error Updating Grade" : "Error Adding Grade",
                description: error.message || "Something went wrong, please try again",
            });
        } finally {
            setSaving(false);
        }
    };

    return {
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
    };
};
