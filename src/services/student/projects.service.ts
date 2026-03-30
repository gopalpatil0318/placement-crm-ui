import api from "@/lib/api";

export interface ProjectData {
    project_id?: string;
    project_title: string;
    project_description: string;
    project_type: string;
    project_url?: string | null;
    github_link?: string | null;
    demo_link?: string | null;
    technologies_used: string[];
    start_date: string;
    end_date: string | null;
    is_ongoing: boolean;
    team_size: number;
    role_in_project: string;
    display_order: number;
    is_featured: boolean;
    is_verified?: boolean;
    created_at?: string;
    updated_at?: string;
}

export const StudentProjectsService = {
    getAllProjects: async () => {
        const response = await api.get("/student/get_all_projects");
        return response.data;
    },

    addProject: async (data: Omit<ProjectData, "project_id">) => {
        const response = await api.post("/student/add_project", data);
        return response.data;
    },

    updateProject: async (projectId: string, data: Partial<ProjectData>) => {
        const response = await api.put(`/student/update_project/${projectId}`, data);
        return response.data;
    },

    deleteProject: async (projectId: string) => {
        const response = await api.delete(`/student/delete_project/${projectId}`);
        return response.data;
    },
};
