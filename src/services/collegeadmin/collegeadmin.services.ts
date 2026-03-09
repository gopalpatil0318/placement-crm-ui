import api from "@/lib/api";

// ========================
// TYPE DEFINITIONS
// ========================

interface GetUsersParams {
    page?: number;
    limit?: number;
    search?: string;
    role?: string;
    status?: string;
}

interface CreateUserData {
    user_name: string;
    user_email: string;
    user_password: string;
    user_role: string;
    dept_id?: string | null;
}

interface UpdateUserData {
    user_name?: string;
    user_email?: string;
    user_role?: string;
    dept_id?: string | null;
}

// ========================
// COLLEGE ADMIN SERVICE
// ========================

export const CollegeAdminService = {

    // ========================
    // AUTH APIs
    // ========================

    forgotPassword: async (email: string) => {
        const response = await api.post("/college/forgot_password", { email });
        return response.data;
    },

    changePassword: async (data: {
        current_password: string;
        new_password: string;
        confirm_password: string;
    }) => {
        const response = await api.post("/college/change_password", data);
        return response.data;
    },

    // ========================
    // USER MANAGEMENT
    // ========================

    createUser: async (data: CreateUserData) => {
        const response = await api.post("/college/create_user", data);
        return response.data;
    },

    getUsers: async (params: GetUsersParams = {}) => {
        const query = new URLSearchParams();
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));
        if (params.search) query.append("search", params.search);
        if (params.role) query.append("role", params.role);
        if (params.status) query.append("status", params.status);

        const queryStr = query.toString();
        const url = queryStr ? `/college/get_all_users?${queryStr}` : "/college/get_all_users";
        const response = await api.get(url);
        return response.data;
    },

    getUser: async (id: string) => {
        const response = await api.get(`/college/get_user/${id}`);
        return response.data;
    },

    updateUser: async (id: string, data: UpdateUserData) => {
        const response = await api.put(`/college/update_user/${id}`, data);
        return response.data;
    },

    toggleUserStatus: async (userId: string, userStatus: string) => {
        const response = await api.patch(`/college/toggle_user_status/${userId}`, {
            user_status: userStatus,
        });
        return response.data;
    },

    // ========================
    // DEPARTMENT MANAGEMENT
    // ========================

    createDepartment: async (data: {
        dept_name: string;
        dept_code: string;
        dept_type: string;
        program_duration_years: number;
        total_semesters: number;
    }) => {
        const response = await api.post("/college/create_department", data);
        return response.data;
    },

    getDepartments: async (params?: {
        page?: number;
        limit?: number;
        is_active?: boolean;
        search?: string;
    }) => {
        const response = await api.get("/college/get_all_departments", { params });
        return response.data;
    },

    getDepartment: async (id: string) => {
        const response = await api.get(`/college/get_department/${id}`);
        return response.data;
    },

    updateDepartment: async (id: string, data: {
        dept_name?: string;
        dept_code?: string;
        dept_type?: string;
        program_duration_years?: number;
        total_semesters?: number;
    }) => {
        const response = await api.put(`/college/update_department/${id}`, data);
        return response.data;
    },

    toggleDepartmentStatus: async (id: string, isActive: boolean) => {
        const response = await api.patch(`/college/toggle_department_status/${id}`, {
            is_active: isActive,
        });
        return response.data;
    },

    // ========================
    // STUDENT MANAGEMENT
    // ========================

    bulkRegistration: async (students: Record<string, unknown>[]) => {
        const response = await api.post("/college/bulk_register_students", { students });
        return response.data;
    },

    getAllStudents: async (params: {
        dept_id?: string;
        student_passout_year?: number;
        student_status?: string;
        search?: string;
        profile_complete?: boolean;
        profile_is_approved?: boolean;
        page?: number;
        limit?: number;
    }) => {
        const query = new URLSearchParams();
        if (params.dept_id) query.append("dept_id", params.dept_id);
        if (params.student_passout_year) query.append("student_passout_year", String(params.student_passout_year));
        if (params.student_status) query.append("student_status", params.student_status);
        if (params.search) query.append("search", params.search);
        if (params.profile_complete !== undefined) query.append("profile_complete", String(params.profile_complete));
        if (params.profile_is_approved !== undefined) query.append("profile_is_approved", String(params.profile_is_approved));
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));
        const queryStr = query.toString();
        const url = queryStr ? `/college/get_all_students?${queryStr}` : "/college/get_all_students";
        const response = await api.get(url);
        return response.data;
    },

    getStudent: async (studentId: string) => {
        const response = await api.get(`/college/get_student/${studentId}`);
        return response.data;
    },

    createStudent: async (data: Record<string, unknown>) => {
        const response = await api.post("/college/register_student", data);
        return response.data;
    },

    updateStudent: async (studentId: string, data: Record<string, unknown>) => {
        const response = await api.put(`/college/update_student/${studentId}`, data);
        return response.data;
    },

    updateStudentStatus: async (studentId: string, status: string) => {
        const response = await api.patch(`/college/toggle_student_status/${studentId}`, {
            student_status: status,
        });
        return response.data;
    },

    approveStudentProfile: async (studentId: string, approved: boolean) => {
        const response = await api.patch(`/college/approve_student_profile/${studentId}`, {
            profile_is_approved: approved,
        });
        return response.data;
    },

    // ========================
    // COMPANY MANAGEMENT
    // ========================

    createCompany: async (data: {
        company_name: string;
        company_description?: string;
        company_website?: string;
        industry?: string;
        company_logo?: string;
    }) => {
        const response = await api.post("/college/create_company", data);
        return response.data;
    },

    getAllCompanies: async (params: {
        company_status?: string;
        industry?: string;
        search?: string;
        sort_by?: string;
        sort_order?: string;
        page?: number;
        limit?: number;
    } = {}) => {
        const query = new URLSearchParams();
        if (params.company_status) query.append("company_status", params.company_status);
        if (params.industry) query.append("industry", params.industry);
        if (params.search) query.append("search", params.search);
        if (params.sort_by) query.append("sort_by", params.sort_by);
        if (params.sort_order) query.append("sort_order", params.sort_order);
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));

        const queryStr = query.toString();
        const url = queryStr ? `/college/get_all_companies?${queryStr}` : "/college/get_all_companies";
        const response = await api.get(url);
        return response.data;
    },

    getCompany: async (companyId: string) => {
        const response = await api.get(`/college/get_company/${companyId}`);
        return response.data;
    },

    updateCompany: async (companyId: string, data: {
        company_name?: string;
        company_description?: string;
        company_website?: string;
        industry?: string;
        company_logo?: string;
    }) => {
        const response = await api.put(`/college/update_company/${companyId}`, data);
        return response.data;
    },

    toggleCompanyStatus: async (companyId: string, companyStatus: string) => {
        const response = await api.patch(`/college/toggle_company_status/${companyId}`, {
            company_status: companyStatus,
        });
        return response.data;
    },
};
