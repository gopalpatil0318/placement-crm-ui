import api from "@/lib/api";

export interface CatalogSkill {
    skill_id: string;
    skill_name: string;
    skill_category: string;
}

export interface StudentSkill {
    skill_id: string;
    skill_name: string;
    skill_category: string;
    proficiency_level: string;
}

export interface SyncSkillItem {
    skill_id: string;
    proficiency_level: string;
}

export const StudentSkillsService = {
    // Master catalog — all available skills
    getAllSkills: async () => {
        const response = await api.get("/student/get_all_skills");
        return response.data;
    },

    // Student's current skills
    getMySkills: async () => {
        const response = await api.get("/student/get_my_skills");
        return response.data;
    },

    // Add a new skill to the catalog
    addSkill: async (data: { skill_name: string; skill_category: string }) => {
        const response = await api.post("/student/add_skill", data);
        return response.data;
    },

    // Smart sync — send complete array
    syncMySkills: async (skills: SyncSkillItem[]) => {
        const response = await api.put("/student/sync_my_skills", { skills });
        return response.data;
    },
};
