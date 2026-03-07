import api from "@/lib/api";

export interface SemesterGradeData {
    grade_id?: string;
    semester_number: number;
    academic_year: string;
    sgpa: number | string;
    cgpa: number | string;
    backlogs_in_semester: number | string;
    backlog_subjects: string[];
    semester_status: string;
}

export interface SemesterGradesResponse {
    total_semesters_in_dept: number;
    completed_semesters: number;
    grades: SemesterGradeData[];
}

export const StudentSemesterGradeService = {
    getAllGrades: async () => {
        const response = await api.get("/student/get_all_semester_grades");
        return response.data;
    },

    addGrade: async (data: Omit<SemesterGradeData, "grade_id">) => {
        const response = await api.post("/student/add_semester_grade", data);
        return response.data;
    },

    updateGrade: async (gradeId: string, data: Omit<SemesterGradeData, "grade_id" | "semester_number">) => {
        const response = await api.put(`/student/update_semester_grade/${gradeId}`, data);
        return response.data;
    },
};
