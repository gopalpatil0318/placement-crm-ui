import api from "@/lib/api";

export const CollegeAdminService = {
    createUser: async (data: {
        userName: string;
        userEmail: string;
        userPassword: string;
    }) => {
        const response = await api.post("/college/create_user", {
            user_name: data.userName,
            user_email: data.userEmail,
            user_password: data.userPassword,
        });
        return response.data;
    },

    getUser: async (id: string) => {
        const response = await api.get(`/college/get_user/${id}`);
        return response.data.data;
    },

    updateUser: async (id: string, data: {
        userName: string;
        userEmail: string;
    }) => {
        const response = await api.put(`/college/update_user/${id}`, {
            user_name: data.userName,
            user_email: data.userEmail,
        });
        return response.data;
    },

    getUsers: async () => {
        const response = await api.get("/college/get_all_users");
        return response.data.data;
    },

    bulkRegistration: async (students: any[]) => {
        const response = await api.post("/college/bulk_register_students", { students });
        return response.data;
    },

    // ========================
    // DEPARTMENT MANAGEMENT
    // ========================

    createDepartment: async (data: {
        deptName: string;
        deptCode: string;
        deptType: string;
        programDurationYears: number;
        totalSemesters: number;
    }) => {
        const response = await api.post("/college/create_department", {
            dept_name: data.deptName,
            dept_code: data.deptCode,
            dept_type: data.deptType,
            program_duration_years: data.programDurationYears,
            total_semesters: data.totalSemesters,
        });
        return response.data;
    },

    getDepartments: async () => {
        const response = await api.get("/college/get_all_departments");
        return response.data.data;
    },

    getDepartment: async (id: string) => {
        const response = await api.get(`/college/get_department/${id}`);
        return response.data.data;
    },

    updateDepartment: async (id: string, data: {
        deptName: string;
        deptCode: string;
        deptType: string;
        programDurationYears: number;
        totalSemesters: number;
    }) => {
        const response = await api.put(`/college/update_department/${id}`, {
            dept_name: data.deptName,
            dept_code: data.deptCode,
            dept_type: data.deptType,
            program_duration_years: data.programDurationYears,
            total_semesters: data.totalSemesters,
        });
        return response.data;
    },

    toggleDepartmentStatus: async (id: string, isActive: boolean) => {
        const response = await api.patch(`/college/toggle_department_status/${id}`, {
            is_active: isActive,
        });
        return response.data;
    },
};
