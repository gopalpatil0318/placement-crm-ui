import api from "@/lib/api";

export const StudentProfileService = {
    getProfileCompletion: async () => {
        const response = await api.get("/student/get_profile_completion");
        return response.data.data;
    },

    getFullProfile: async () => {
        const response = await api.get("/student/get_full_profile");
        return response.data.data;
    },

    getPersonalInfo: async () => {
        const response = await api.get("/student/get_personal_info");
        return response.data.data;
    },

    getAcademicInfo: async () => {
        const response = await api.get("/student/get_academic_info");
        return response.data.data;
    },

    getAllSemesterGrades: async () => {
        const response = await api.get("/student/get_all_semester_grades");
        return response.data.data;
    },

    getAllSkills: async () => {
        const response = await api.get("/student/get_all_skills");
        return response.data.data;
    },

    getMySkills: async () => {
        const response = await api.get("/student/get_my_skills");
        return response.data.data;
    },

    getAllProjects: async () => {
        const response = await api.get("/student/get_all_projects");
        return response.data.data;
    },

    getAllExperience: async () => {
        const response = await api.get("/student/get_all_experience");
        return response.data.data;
    },

    getAllAchievements: async () => {
        const response = await api.get("/student/get_all_achievements");
        return response.data.data;
    },

    getAllCertificates: async () => {
        const response = await api.get("/student/get_all_certificates");
        return response.data.data;
    },

    getAllActivities: async () => {
        const response = await api.get("/student/get_all_activities");
        return response.data.data;
    },

    getProfileLinks: async () => {
        const response = await api.get("/student/get_profile_links");
        return response.data.data;
    },

    // Auth-related service methods
    forgotPassword: async (email: string) => {
        const response = await api.post("/student/forgot_password", { email });
        return response.data;
    },

    resetPassword: async (data: {
        token: string;
        new_password: string;
        confirm_password: string;
    }) => {
        const response = await api.post("/student/reset_password", data);
        return response.data;
    },

    changePassword: async (data: {
        current_password: string;
        new_password: string;
        confirm_password: string;
    }) => {
        const response = await api.post("/student/change_password", data);
        return response.data;
    },
};
