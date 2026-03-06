import api from "@/lib/api";

export interface ExperienceData {
    experience_id?: string;
    company_name: string;
    company_website?: string | null;
    position_title: string;
    employment_type: string;
    job_description: string;
    responsibilities: string[];
    technologies_used: string[];
    work_location: string;
    work_mode: string;
    start_date: string;
    end_date: string | null;
    is_current: boolean;
    duration_months?: number | null;
    stipend_amount?: number | null;
    offer_letter_url?: string | null;
    completion_certificate_url?: string | null;
    is_verified?: boolean;
}

export const StudentExperienceService = {
    getAllExperience: async () => {
        const response = await api.get("/student/get_all_experience");
        return response.data;
    },

    addExperience: async (data: Omit<ExperienceData, "experience_id">) => {
        const response = await api.post("/student/add_experience", data);
        return response.data;
    },

    updateExperience: async (experienceId: string, data: Partial<ExperienceData>) => {
        const response = await api.put(`/student/update_experience/${experienceId}`, data);
        return response.data;
    },

    deleteExperience: async (experienceId: string) => {
        const response = await api.delete(`/student/delete_experience/${experienceId}`);
        return response.data;
    },
};
