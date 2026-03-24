import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ApiError } from "@/lib/api";
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
    const queryClient = useQueryClient();

    // Fetch grades via React Query
    const { data: gradesData, isLoading: loading } = useQuery({
        queryKey: queryKeys.studentPortal.semesterGrades(),
        queryFn: async () => {
            const response = await StudentSemesterGradeService.getAllGrades();
            return response.data ?? { grades: [], total_semesters_in_dept: 0 };
        },
    });

    const grades: SemesterGradeData[] = gradesData?.grades ?? [];
    const totalSemesters: number = gradesData?.total_semesters_in_dept ?? 0;

    // Modal state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingGradeId, setEditingGradeId] = useState<string | null>(null);
    const [formData, setFormData] = useState(initialFormData);
    const [errors, setErrors] = useState<FormErrors>({});
    const [backlogInput, setBacklogInput] = useState("");

    const openAddForm = (semesterNumber: number) => {
        setFormData({ ...initialFormData, semester_number: semesterNumber });
        setEditingGradeId(null);
        setErrors({});
        setBacklogInput("");
        setIsFormOpen(true);
    };

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

    const handleChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
        setErrors((prev) => {
            if (!prev[name]) return prev;
            return { ...prev, [name]: undefined };
        });
    }, []);

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

    const removeBacklogSubject = (subject: string) => {
        setFormData((prev) => ({
            ...prev,
            backlog_subjects: prev.backlog_subjects.filter((s) => s !== subject),
        }));
    };

    const saveMutation = useMutation({
        mutationFn: async ({ payload, gradeId }: { payload: Omit<SemesterGradeData, "grade_id">; gradeId: string | null }) => {
            if (gradeId) {
                const { semester_number: _, ...updatePayload } = payload;
                return StudentSemesterGradeService.updateGrade(gradeId, updatePayload);
            }
            return StudentSemesterGradeService.addGrade(payload);
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.semesterGrades() });
            queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.fullProfile() });
            closeForm();
        },
        onError: (error, { gradeId }) => {
            showToast({
                type: "error",
                title: gradeId ? "Error Updating Grade" : "Error Adding Grade",
                description: error instanceof ApiError ? error.message : "Something went wrong, please try again",
            });
        },
    });

    const handleSubmit = () => {
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

        const payload = {
            ...formData,
            semester_number: Number(formData.semester_number),
            sgpa: Number(formData.sgpa),
            cgpa: Number(formData.cgpa),
            backlogs_in_semester: Number(formData.backlogs_in_semester),
        };

        const isEditing = !!editingGradeId;
        saveMutation.mutate(
            { payload, gradeId: editingGradeId },
            {
                onSuccess: () => {
                    showToast({
                        type: "success",
                        title: "Success",
                        description: isEditing ? "Semester grade updated successfully" : "Semester grade added successfully",
                    });
                },
            },
        );
    };

    return {
        grades,
        totalSemesters,
        loading,
        saving: saveMutation.isPending,
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
