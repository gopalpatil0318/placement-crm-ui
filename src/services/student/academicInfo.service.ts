import api from "@/lib/api";

export interface AcademicInfoData {
    roll_number: string;
    enrollment_number: string;
    admission_year: number;
    admission_based_on: string;
    tenth_percentage: number;
    tenth_board: string;
    tenth_passing_year: number;
    twelfth_or_diploma: string;
    twelfth_percentage: number | null;
    twelfth_board: string | null;
    diploma_percentage: number | null;
    diploma_branch: string | null;
    higher_education_passing_year: number;
    overall_cgpa: number;
    total_live_kts: number;
    total_dead_kts: number;
    any_gap_during_education: boolean;
    gap_years: number | null;
    gap_reason: string | null;
}

export const StudentAcademicInfoService = {
    getAcademicInfo: async () => {
        const response = await api.get("/student/get_academic_info");
        return response.data;
    },

    saveAcademicInfo: async (data: Partial<AcademicInfoData>) => {
        const response = await api.put("/student/save_academic_info", data);
        return response.data;
    },
};
