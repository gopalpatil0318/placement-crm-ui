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

    resetPassword: async (data: {
        token: string;
        new_password: string;
        confirm_password: string;
    }) => {
        const response = await api.post("/college/reset_password", data);
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
        passout_year?: number;
    }) => {
        const response = await api.get("/college/get_all_departments", { params });
        return response.data;
    },

    getDepartment: async (id: string, params?: { passout_year?: number }) => {
        const response = await api.get(`/college/get_department/${id}`, { params });
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

    // ========================
    // COMPANY CONTACTS
    // ========================

    addContact: async (companyId: string, data: {
        contact_name: string;
        contact_designation?: string;
        contact_email?: string;
        contact_phone?: string;
        is_primary?: boolean;
        notes?: string;
    }) => {
        const response = await api.post(`/college/add_company_contact/${companyId}`, data);
        return response.data;
    },

    getContacts: async (companyId: string, params: {
        is_active?: boolean;
        search?: string;
    } = {}) => {
        const query = new URLSearchParams();
        if (params.is_active !== undefined) query.append("is_active", String(params.is_active));
        if (params.search) query.append("search", params.search);

        const queryStr = query.toString();
        const url = queryStr
            ? `/college/get_company_contacts/${companyId}?${queryStr}`
            : `/college/get_company_contacts/${companyId}`;
        const response = await api.get(url);
        return response.data;
    },

    updateContact: async (contactId: string, data: {
        contact_name?: string;
        contact_designation?: string;
        contact_email?: string;
        contact_phone?: string;
        is_primary?: boolean;
        notes?: string;
    }) => {
        const response = await api.put(`/college/update_contact/${contactId}`, data);
        return response.data;
    },

    toggleContactStatus: async (contactId: string, isActive: boolean) => {
        const response = await api.patch(`/college/toggle_contact_status/${contactId}`, {
            is_active: isActive,
        });
        return response.data;
    },

    // ========================
    // JOB POSTING MANAGEMENT
    // ========================

    createJob: async (data: Record<string, unknown>) => {
        const response = await api.post("/college/create_job", data);
        return response.data;
    },

    getAllJobs: async (params: {
        passout_year?: number;
        job_status?: string;
        company_id?: string;
        job_type?: string;
        drive_type?: string;
        search?: string;
        sort_by?: string;
        sort_order?: string;
        page?: number;
        limit?: number;
    } = {}) => {
        const query = new URLSearchParams();
        if (params.passout_year) query.append("passout_year", String(params.passout_year));
        if (params.job_status) query.append("job_status", params.job_status);
        if (params.company_id) query.append("company_id", params.company_id);
        if (params.job_type) query.append("job_type", params.job_type);
        if (params.drive_type) query.append("drive_type", params.drive_type);
        if (params.search) query.append("search", params.search);
        if (params.sort_by) query.append("sort_by", params.sort_by);
        if (params.sort_order) query.append("sort_order", params.sort_order);
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));

        const queryStr = query.toString();
        const url = queryStr ? `/college/get_all_jobs?${queryStr}` : "/college/get_all_jobs";
        const response = await api.get(url);
        return response.data;
    },

    getJob: async (jobId: string) => {
        const response = await api.get(`/college/get_job/${jobId}`);
        return response.data;
    },

    updateJob: async (jobId: string, data: Record<string, unknown>) => {
        const response = await api.put(`/college/update_job/${jobId}`, data);
        return response.data;
    },

    updateJobStatus: async (jobId: string, jobStatus: string) => {
        const response = await api.patch(`/college/update_job_status/${jobId}`, {
            job_status: jobStatus,
        });
        return response.data;
    },

    // ========================
    // JOB POSITION MANAGEMENT
    // ========================

    addJobPosition: async (jobId: string, data: { position_name: string; position_description?: string; vacancies?: number }) => {
        const response = await api.post(`/college/add_job_position/${jobId}`, data);
        return response.data;
    },

    updatePosition: async (positionId: string, data: Record<string, unknown>) => {
        const response = await api.put(`/college/update_position/${positionId}`, data);
        return response.data;
    },

    updatePositionStatus: async (positionId: string, positionStatus: string) => {
        const response = await api.patch(`/college/update_position_status/${positionId}`, {
            position_status: positionStatus,
        });
        return response.data;
    },

    // ========================
    // JOB ELIGIBILITY CRITERIA
    // ========================

    setJobCriteria: async (jobId: string, data: Record<string, unknown>) => {
        const response = await api.post(`/college/set_job_criteria/${jobId}`, data);
        return response.data;
    },

    updateJobCriteria: async (jobId: string, data: Record<string, unknown>) => {
        const response = await api.put(`/college/update_job_criteria/${jobId}`, data);
        return response.data;
    },

    getEligibleStudents: async (jobId: string, params: {
        search?: string;
        dept_name?: string;
        page?: number;
        limit?: number;
    } = {}) => {
        const query = new URLSearchParams();
        if (params.search) query.append("search", params.search);
        if (params.dept_name) query.append("dept_name", params.dept_name);
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));

        const queryStr = query.toString();
        const url = queryStr
            ? `/college/get_eligible_students/${jobId}?${queryStr}`
            : `/college/get_eligible_students/${jobId}`;
        const response = await api.get(url);
        return response.data;
    },

    getCriteriaHistory: async (jobId: string) => {
        const response = await api.get(`/college/get_job_criteria_history/${jobId}`);
        return response.data;
    },

    // ========================
    // JOB ROUNDS MANAGEMENT
    // ========================

    addJobRound: async (jobId: string, data: {
        round_name: string;
        round_description?: string;
        round_type?: string;
        round_date?: string;
        round_venue?: string;
    }) => {
        const response = await api.post(`/college/add_job_round/${jobId}`, data);
        return response.data;
    },

    updateRound: async (roundId: string, data: Record<string, unknown>) => {
        const response = await api.put(`/college/update_round/${roundId}`, data);
        return response.data;
    },

    updateRoundStatus: async (roundId: string, roundStatus: string) => {
        const response = await api.patch(`/college/update_round_status/${roundId}`, {
            round_status: roundStatus,
        });
        return response.data;
    },

    // ========================
    // APPLICATION QUESTIONS MANAGEMENT
    // ========================

    addJobQuestion: async (jobId: string, data: {
        question_text: string;
        question_type: string;
        question_options?: string[];
        is_required?: boolean;
    }) => {
        const response = await api.post(`/college/add_job_question/${jobId}`, data);
        return response.data;
    },

    updateQuestion: async (questionId: string, data: Record<string, unknown>) => {
        const response = await api.put(`/college/update_question/${questionId}`, data);
        return response.data;
    },

    deleteQuestion: async (questionId: string) => {
        const response = await api.delete(`/college/delete_question/${questionId}`);
        return response.data;
    },

    getJobQuestions: async (jobId: string) => {
        const response = await api.get(`/college/get_job_questions/${jobId}`);
        return response.data;
    },

    // ========================
    // APPLICATION MANAGEMENT
    // ========================

    getJobApplications: async (
        jobId: string,
        params: {
            application_status?: string;
            is_eligible?: string;
            position_id?: string;
            search?: string;
            applied_after?: string;
            applied_before?: string;
            sort_by?: string;
            sort_order?: string;
            page?: number;
            limit?: number;
        } = {},
    ) => {
        const query = new URLSearchParams();
        if (params.application_status) query.append("application_status", params.application_status);
        if (params.is_eligible) query.append("is_eligible", params.is_eligible);
        if (params.position_id) query.append("position_id", params.position_id);
        if (params.search) query.append("search", params.search);
        if (params.applied_after) query.append("applied_after", params.applied_after);
        if (params.applied_before) query.append("applied_before", params.applied_before);
        if (params.sort_by) query.append("sort_by", params.sort_by);
        if (params.sort_order) query.append("sort_order", params.sort_order);
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));
        const url = query.toString()
            ? `/college/get_job_applications/${jobId}?${query}`
            : `/college/get_job_applications/${jobId}`;
        return (await api.get(url)).data;
    },

    getApplication: async (applicationId: string) => {
        const response = await api.get(`/college/get_application/${applicationId}`);
        return response.data;
    },

    updateApplicationStatus: async (
        applicationId: string,
        data: { application_status: string; remarks?: string },
    ) => {
        const response = await api.patch(
            `/college/update_application_status/${applicationId}`,
            data,
        );
        return response.data;
    },

    bulkUpdateApplicationStatus: async (data: {
        application_ids: string[];
        application_status: string;
        remarks?: string;
    }) => {
        const response = await api.post("/college/bulk_update_application_status", data);
        return response.data;
    },

    // ── Eligible Not Applied & Denials ──────────────────────────────
    getEligibleNotApplied: async (
        jobId: string,
        params: {
            search?: string;
            dept_name?: string;
            sort_by?: string;
            sort_order?: string;
            page?: number;
            limit?: number;
        } = {},
    ) => {
        const query = new URLSearchParams();
        if (params.search) query.append("search", params.search);
        if (params.dept_name) query.append("dept_name", params.dept_name);
        if (params.sort_by) query.append("sort_by", params.sort_by);
        if (params.sort_order) query.append("sort_order", params.sort_order);
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));
        const url = query.toString()
            ? `/college/get_eligible_not_applied/${jobId}?${query}`
            : `/college/get_eligible_not_applied/${jobId}`;
        return (await api.get(url)).data;
    },

    notifyEligibleStudents: async (
        jobId: string,
        data: { title: string; body: string; student_ids?: string[] },
    ) => {
        const response = await api.post(
            `/college/notify_eligible_students/${jobId}`,
            data,
        );
        return response.data;
    },

    getJobDenials: async (
        jobId: string,
        params: {
            search?: string;
            sort_by?: string;
            sort_order?: string;
            page?: number;
            limit?: number;
        } = {},
    ) => {
        const query = new URLSearchParams();
        if (params.search) query.append("search", params.search);
        if (params.sort_by) query.append("sort_by", params.sort_by);
        if (params.sort_order) query.append("sort_order", params.sort_order);
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));
        const url = query.toString()
            ? `/college/get_job_denials/${jobId}?${query}`
            : `/college/get_job_denials/${jobId}`;
        return (await api.get(url)).data;
    },

    // ── Override Requests ──────────────────────────────────────

    getJobOverrideRequests: async (
        jobId: string,
        params: {
            status?: string;
            dept_name?: string;
            sort_by?: string;
            sort_order?: string;
            page?: number;
            limit?: number;
        } = {},
    ) => {
        const query = new URLSearchParams();
        if (params.status) query.append("status", params.status);
        if (params.dept_name) query.append("dept_name", params.dept_name);
        if (params.sort_by) query.append("sort_by", params.sort_by);
        if (params.sort_order) query.append("sort_order", params.sort_order);
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));
        const url = query.toString()
            ? `/college/get_job_override_requests/${jobId}?${query}`
            : `/college/get_job_override_requests/${jobId}`;
        return (await api.get(url)).data;
    },

    getAllOverrideRequests: async (
        params: {
            search?: string;
            status?: string;
            job_id?: string;
            dept_name?: string;
            passout_year?: number;
            date_from?: string;
            date_to?: string;
            sort_by?: string;
            sort_order?: string;
            page?: number;
            limit?: number;
        } = {},
    ) => {
        const query = new URLSearchParams();
        if (params.search) query.append("search", params.search);
        if (params.status) query.append("status", params.status);
        if (params.job_id) query.append("job_id", params.job_id);
        if (params.dept_name) query.append("dept_name", params.dept_name);
        if (params.passout_year)
            query.append("passout_year", String(params.passout_year));
        if (params.date_from) query.append("date_from", params.date_from);
        if (params.date_to) query.append("date_to", params.date_to);
        if (params.sort_by) query.append("sort_by", params.sort_by);
        if (params.sort_order) query.append("sort_order", params.sort_order);
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));
        const url = query.toString()
            ? `/college/get_all_override_requests?${query}`
            : "/college/get_all_override_requests";
        return (await api.get(url)).data;
    },

    reviewOverrideRequest: async (
        overrideId: string,
        data: {
            action: string;
            review_notes?: string;
            rejection_reason?: string;
        },
    ) => {
        const response = await api.patch(
            `/college/review_override_request/${overrideId}`,
            data,
        );
        return response.data;
    },

    bulkReviewOverrides: async (data: {
        override_ids: string[];
        action: string;
        review_notes?: string;
        rejection_reason?: string;
    }) => {
        const response = await api.post(
            "/college/bulk_review_overrides",
            data,
        );
        return response.data;
    },

    // ─── Round Results ───

    getRoundResults: async (
        roundId: string,
        params: {
            result_status?: string;
            attended?: string;
            search?: string;
            sort_by?: string;
            sort_order?: string;
            page?: number;
            limit?: number;
        } = {},
    ) => {
        const query = new URLSearchParams();
        if (params.result_status)
            query.append("result_status", params.result_status);
        if (params.attended) query.append("attended", params.attended);
        if (params.search) query.append("search", params.search);
        if (params.sort_by) query.append("sort_by", params.sort_by);
        if (params.sort_order) query.append("sort_order", params.sort_order);
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));
        const url = query.toString()
            ? `/college/get_round_results/${roundId}?${query}`
            : `/college/get_round_results/${roundId}`;
        return (await api.get(url)).data;
    },

    addRoundResult: async (
        roundId: string,
        data: Record<string, unknown>,
    ) => {
        const response = await api.post(
            `/college/add_round_result/${roundId}`,
            data,
        );
        return response.data;
    },

    bulkAddRoundResults: async (
        roundId: string,
        data: { results: Record<string, unknown>[] },
    ) => {
        const response = await api.post(
            `/college/bulk_add_round_results/${roundId}`,
            data,
        );
        return response.data;
    },

    updateRoundResult: async (
        resultId: string,
        data: Record<string, unknown>,
    ) => {
        const response = await api.put(
            `/college/update_round_result/${resultId}`,
            data,
        );
        return response.data;
    },

    // ─── Round Processing ───

    previewRoundProcessing: async (roundId: string) => {
        const response = await api.get(
            `/college/preview_round_processing/${roundId}`,
        );
        return response.data;
    },

    processRound: async (roundId: string) => {
        const response = await api.post(
            `/college/process_round/${roundId}`,
        );
        return response.data;
    },

    // ─── Placement Results ───

    createPlacement: async (data: Record<string, unknown>) => {
        const response = await api.post("/college/create_placement", data);
        return response.data;
    },

    bulkCreatePlacements: async (items: Record<string, unknown>[]) => {
        const response = await api.post("/college/bulk_create_placements", { items });
        return response.data;
    },

    recordExternalPlacement: async (data: Record<string, unknown>) => {
        const response = await api.post("/college/record_external_placement", data);
        return response.data;
    },

    getAllPlacements: async (
        params: {
            passout_year?: number;
            company_id?: string;
            job_id?: string;
            placement_status?: string;
            placement_type?: string;
            acceptance_status?: string;
            offer_letter_verified?: string;
            search?: string;
            sort_by?: string;
            sort_order?: string;
            page?: number;
            limit?: number;
        } = {},
    ) => {
        const query = new URLSearchParams();
        if (params.passout_year) query.append("passout_year", String(params.passout_year));
        if (params.company_id) query.append("company_id", params.company_id);
        if (params.job_id) query.append("job_id", params.job_id);
        if (params.placement_status) query.append("placement_status", params.placement_status);
        if (params.placement_type) query.append("placement_type", params.placement_type);
        if (params.acceptance_status) query.append("acceptance_status", params.acceptance_status);
        if (params.offer_letter_verified) query.append("offer_letter_verified", params.offer_letter_verified);
        if (params.search) query.append("search", params.search);
        if (params.sort_by) query.append("sort_by", params.sort_by);
        if (params.sort_order) query.append("sort_order", params.sort_order);
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));
        const url = query.toString()
            ? `/college/get_all_placements?${query}`
            : "/college/get_all_placements";
        return (await api.get(url)).data;
    },

    getPlacement: async (placementId: string) => {
        return (await api.get(`/college/get_placement/${placementId}`)).data;
    },

    updatePlacement: async (
        placementId: string,
        data: Record<string, unknown>,
    ) => {
        const response = await api.put(
            `/college/update_placement/${placementId}`,
            data,
        );
        return response.data;
    },

    verifyOfferLetter: async (
        placementId: string,
        data: { action: "approved" | "rejected"; rejection_reason?: string },
    ) => {
        const response = await api.patch(
            `/college/verify_offer_letter/${placementId}`,
            data,
        );
        return response.data;
    },

    verifyJoiningLetter: async (
        placementId: string,
        data: { action: "approved" | "rejected"; rejection_reason?: string },
    ) => {
        const response = await api.patch(
            `/college/verify_joining_letter/${placementId}`,
            data,
        );
        return response.data;
    },

    updatePlacementStatus: async (
        placementId: string,
        data: { placement_status: string; remarks?: string },
    ) => {
        const response = await api.patch(
            `/college/update_placement_status/${placementId}`,
            data,
        );
        return response.data;
    },

    // ========================
    // PLACEMENT POLICIES
    // ========================

    createPlacementPolicy: async (data: {
        passout_year: number;
        policy_title: string;
        policy_description: string;
    }) => {
        const response = await api.post("/college/create_policy", data);
        return response.data;
    },

    getAllPlacementPolicies: async (
        params: {
            passout_year?: number;
            is_active?: string;
            search?: string;
            sort_by?: string;
            sort_order?: string;
            page?: number;
            limit?: number;
        } = {},
    ) => {
        const query = new URLSearchParams();
        if (params.passout_year) query.append("passout_year", String(params.passout_year));
        if (params.is_active) query.append("is_active", params.is_active);
        if (params.search) query.append("search", params.search);
        if (params.sort_by) query.append("sort_by", params.sort_by);
        if (params.sort_order) query.append("sort_order", params.sort_order);
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));
        const url = query.toString()
            ? `/college/get_all_policies?${query}`
            : "/college/get_all_policies";
        return (await api.get(url)).data;
    },

    getPlacementPolicy: async (policyId: string) => {
        return (await api.get(`/college/get_policy/${policyId}`)).data;
    },

    updatePlacementPolicy: async (
        policyId: string,
        data: Record<string, unknown>,
    ) => {
        const response = await api.put(
            `/college/update_policy/${policyId}`,
            data,
        );
        return response.data;
    },

    togglePlacementPolicyStatus: async (
        policyId: string,
        data: { is_active: boolean },
    ) => {
        const response = await api.patch(
            `/college/toggle_policy_status/${policyId}`,
            data,
        );
        return response.data;
    },

    deletePlacementPolicy: async (policyId: string) => {
        const response = await api.delete(
            `/college/delete_policy/${policyId}`,
        );
        return response.data;
    },

    // ======================== Dashboard & Statistics ========================

    getDashboardOverview: async (passoutYear: number) => {
        const params = new URLSearchParams();
        params.append("passout_year", String(passoutYear));
        const response = await api.get(`/college/dashboard_overview?${params}`);
        return response.data;
    },

    getDashboardPlacementStats: async (passoutYear: number) => {
        const params = new URLSearchParams();
        params.append("passout_year", String(passoutYear));
        const response = await api.get(
            `/college/dashboard_placement_stats?${params}`,
        );
        return response.data;
    },

    getDashboardApplicationFunnel: async (passoutYear: number) => {
        const params = new URLSearchParams();
        params.append("passout_year", String(passoutYear));
        const response = await api.get(
            `/college/dashboard_application_funnel?${params}`,
        );
        return response.data;
    },

    getDashboardStudentReadiness: async (passoutYear: number) => {
        const params = new URLSearchParams();
        params.append("passout_year", String(passoutYear));
        const response = await api.get(
            `/college/dashboard_student_readiness?${params}`,
        );
        return response.data;
    },

    getDashboardDiversityStats: async (passoutYear: number) => {
        const params = new URLSearchParams();
        params.append("passout_year", String(passoutYear));
        const response = await api.get(
            `/college/dashboard_diversity_stats?${params}`,
        );
        return response.data;
    },

    getDashboardTrainingStats: async (passoutYear: number) => {
        const params = new URLSearchParams();
        params.append("passout_year", String(passoutYear));
        const response = await api.get(
            `/college/dashboard_training_stats?${params}`,
        );
        return response.data;
    },

    getDashboardDepartmentWise: async (
        passoutYear: number,
        deptId?: string,
    ) => {
        const params = new URLSearchParams();
        params.append("passout_year", String(passoutYear));
        if (deptId) params.append("dept_id", deptId);
        const response = await api.get(
            `/college/dashboard_department_wise?${params}`,
        );
        return response.data;
    },

    getDashboardCompanyWise: async (
        passoutYear: number,
        companyId?: string,
    ) => {
        const params = new URLSearchParams();
        params.append("passout_year", String(passoutYear));
        if (companyId) params.append("company_id", companyId);
        const response = await api.get(
            `/college/dashboard_company_wise?${params}`,
        );
        return response.data;
    },

    getDashboardYearComparison: async (passoutYears: number[]) => {
        const response = await api.get(
            `/college/dashboard_year_comparison?passout_years=${passoutYears.join(",")}`,
        );
        return response.data;
    },

    // ======================== Subscription (College-Side Read) ========================

    getSubscriptionCurrent: async () => {
        const response = await api.get("/college/subscription/current");
        return response.data;
    },

    // ======================== Skills Master ========================

    createSkill: async (data: { skill_name: string; skill_category?: string }) => {
        const response = await api.post("/college/create_skill", data);
        return response.data;
    },

    getAllSkills: async (params: {
        page?: number;
        limit?: number;
        search?: string;
        skill_category?: string;
        sort_by?: string;
        sort_order?: string;
    }) => {
        const query = new URLSearchParams();
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));
        if (params.search) query.append("search", params.search);
        if (params.skill_category) query.append("skill_category", params.skill_category);
        if (params.sort_by) query.append("sort_by", params.sort_by);
        if (params.sort_order) query.append("sort_order", params.sort_order);
        const response = await api.get(`/college/get_all_skills?${query}`);
        return response.data;
    },

    deleteSkill: async (skillId: string) => {
        const response = await api.delete(`/college/delete_skill/${skillId}`);
        return response.data;
    },

    updateSkill: async (skillId: string, data: { skill_name?: string; skill_category?: string }) => {
        const response = await api.put(`/college/update_skill/${skillId}`, data);
        return response.data;
    },

    // ======================== Verification Settings ========================

    getVerificationSettings: async () => {
        const response = await api.get("/college/get_verification_settings");
        return response.data;
    },

    updateVerificationSettings: async (data: Record<string, unknown>) => {
        const response = await api.patch("/college/update_verification_settings", data);
        return response.data;
    },

    // ======================== Verification Center ========================

    getPendingVerificationCounts: async (params?: {
        student_passout_year?: number;
    }) => {
        const response = await api.get("/college/get_pending_verification_counts", { params });
        return response.data;
    },

    getPendingProfiles: async (params: {
        page?: number;
        limit?: number;
        search?: string;
        dept_id?: string;
        student_passout_year?: number;
        sort_by?: string;
        sort_order?: string;
    }) => {
        const query = new URLSearchParams();
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));
        if (params.search) query.append("search", params.search);
        if (params.dept_id) query.append("dept_id", params.dept_id);
        if (params.student_passout_year) query.append("student_passout_year", String(params.student_passout_year));
        if (params.sort_by) query.append("sort_by", params.sort_by);
        if (params.sort_order) query.append("sort_order", params.sort_order);
        const url = query.toString() ? `/college/get_pending_profiles?${query}` : "/college/get_pending_profiles";
        const response = await api.get(url);
        return response.data;
    },

    getPendingExperiences: async (params: {
        page?: number;
        limit?: number;
        search?: string;
        dept_id?: string;
        student_passout_year?: number;
        sort_by?: string;
        sort_order?: string;
    }) => {
        const query = new URLSearchParams();
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));
        if (params.search) query.append("search", params.search);
        if (params.dept_id) query.append("dept_id", params.dept_id);
        if (params.student_passout_year) query.append("student_passout_year", String(params.student_passout_year));
        if (params.sort_by) query.append("sort_by", params.sort_by);
        if (params.sort_order) query.append("sort_order", params.sort_order);
        const url = query.toString() ? `/college/get_pending_experiences?${query}` : "/college/get_pending_experiences";
        const response = await api.get(url);
        return response.data;
    },

    getPendingAchievements: async (params: {
        page?: number;
        limit?: number;
        search?: string;
        dept_id?: string;
        student_passout_year?: number;
        sort_by?: string;
        sort_order?: string;
    }) => {
        const query = new URLSearchParams();
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));
        if (params.search) query.append("search", params.search);
        if (params.dept_id) query.append("dept_id", params.dept_id);
        if (params.student_passout_year) query.append("student_passout_year", String(params.student_passout_year));
        if (params.sort_by) query.append("sort_by", params.sort_by);
        if (params.sort_order) query.append("sort_order", params.sort_order);
        const url = query.toString() ? `/college/get_pending_achievements?${query}` : "/college/get_pending_achievements";
        const response = await api.get(url);
        return response.data;
    },

    getPendingCertificates: async (params: {
        page?: number;
        limit?: number;
        search?: string;
        dept_id?: string;
        student_passout_year?: number;
        sort_by?: string;
        sort_order?: string;
    }) => {
        const query = new URLSearchParams();
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));
        if (params.search) query.append("search", params.search);
        if (params.dept_id) query.append("dept_id", params.dept_id);
        if (params.student_passout_year) query.append("student_passout_year", String(params.student_passout_year));
        if (params.sort_by) query.append("sort_by", params.sort_by);
        if (params.sort_order) query.append("sort_order", params.sort_order);
        const url = query.toString() ? `/college/get_pending_certificates?${query}` : "/college/get_pending_certificates";
        const response = await api.get(url);
        return response.data;
    },

    verifyStudentProfile: async (studentId: string, data: { action: string; rejection_reason?: string }) => {
        const response = await api.patch(`/college/verify_student_profile/${studentId}`, data);
        return response.data;
    },

    verifyExperience: async (experienceId: string, data: { action: string; rejection_reason?: string }) => {
        const response = await api.patch(`/college/verify_experience/${experienceId}`, data);
        return response.data;
    },

    verifyAchievement: async (achievementId: string, data: { action: string; rejection_reason?: string }) => {
        const response = await api.patch(`/college/verify_achievement/${achievementId}`, data);
        return response.data;
    },

    verifyCertificate: async (certificateId: string, data: { action: string; rejection_reason?: string }) => {
        const response = await api.patch(`/college/verify_certificate/${certificateId}`, data);
        return response.data;
    },

    bulkVerifyProfiles: async (data: { ids: string[]; action: string; rejection_reason?: string }) => {
        const response = await api.patch("/college/bulk_verify_profiles", data);
        return response.data;
    },

    bulkVerifyExperiences: async (data: { ids: string[]; action: string; rejection_reason?: string }) => {
        const response = await api.patch("/college/bulk_verify_experiences", data);
        return response.data;
    },

    bulkVerifyAchievements: async (data: { ids: string[]; action: string; rejection_reason?: string }) => {
        const response = await api.patch("/college/bulk_verify_achievements", data);
        return response.data;
    },

    bulkVerifyCertificates: async (data: { ids: string[]; action: string; rejection_reason?: string }) => {
        const response = await api.patch("/college/bulk_verify_certificates", data);
        return response.data;
    },

    approveStudentProfile: async (studentId: string, data: { action: string; rejection_reason?: string }) => {
        const response = await api.patch(`/college/approve_student_profile/${studentId}`, data);
        return response.data;
    },

    getStudentFullProfile: async (studentId: string, review = false) => {
        const url = review
            ? `/college/get_student_full_profile/${studentId}?review=true`
            : `/college/get_student_full_profile/${studentId}`;
        const response = await api.get(url);
        return response.data;
    },

    // ======================== Training Programs ========================

    createTrainingProgram: async (data: {
        program_name: string;
        program_type: string;
        program_description?: string;
        trainer_name?: string;
        trainer_organization?: string;
        start_date?: string;
        end_date?: string;
        total_sessions?: number;
        session_duration_hours?: number;
        target_dept_ids?: string[];
        target_passout_year?: number;
        max_enrollment?: number;
        enrollment_deadline?: string;
        program_fee?: number;
        fee_currency?: string;
        min_attendance_pct?: number;
    }) => {
        const response = await api.post("/college/create_training_program", data);
        return response.data;
    },

    getAllTrainingPrograms: async (params: {
        program_status?: string;
        program_type?: string;
        target_passout_year?: number;
        search?: string;
        sort_by?: string;
        sort_order?: string;
        page?: number;
        limit?: number;
    } = {}) => {
        const query = new URLSearchParams();
        if (params.program_status) query.append("program_status", params.program_status);
        if (params.program_type) query.append("program_type", params.program_type);
        if (params.target_passout_year) query.append("target_passout_year", String(params.target_passout_year));
        if (params.search) query.append("search", params.search);
        if (params.sort_by) query.append("sort_by", params.sort_by);
        if (params.sort_order) query.append("sort_order", params.sort_order);
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));

        const queryStr = query.toString();
        const url = queryStr ? `/college/get_all_training_programs?${queryStr}` : "/college/get_all_training_programs";
        const response = await api.get(url);
        return response.data;
    },

    getTrainingProgram: async (programId: string) => {
        const response = await api.get(`/college/get_training_program/${programId}`);
        return response.data;
    },

    updateTrainingProgram: async (programId: string, data: {
        program_name?: string;
        program_description?: string;
        program_type?: string;
        trainer_name?: string;
        trainer_organization?: string;
        start_date?: string;
        end_date?: string;
        total_sessions?: number;
        session_duration_hours?: number;
        target_dept_ids?: string[];
        target_passout_year?: number;
        max_enrollment?: number;
        enrollment_deadline?: string;
        program_fee?: number;
        fee_currency?: string;
        min_attendance_pct?: number;
    }) => {
        const response = await api.put(`/college/update_training_program/${programId}`, data);
        return response.data;
    },

    toggleTrainingStatus: async (programId: string, programStatus: string) => {
        const response = await api.patch(`/college/toggle_training_status/${programId}`, {
            program_status: programStatus,
        });
        return response.data;
    },

    toggleEnrollmentAccess: async (programId: string, allowEnrollments: boolean) => {
        const response = await api.patch(`/college/toggle_enrollment_access/${programId}`, {
            allow_enrollments: allowEnrollments,
        });
        return response.data;
    },

    getTrainingEnrollments: async (programId: string, params: {
        completion_status?: string;
        search?: string;
        sort_by?: string;
        sort_order?: string;
        page?: number;
        limit?: number;
    } = {}) => {
        const query = new URLSearchParams();
        if (params.completion_status) query.append("completion_status", params.completion_status);
        if (params.search) query.append("search", params.search);
        if (params.sort_by) query.append("sort_by", params.sort_by);
        if (params.sort_order) query.append("sort_order", params.sort_order);
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));

        const queryStr = query.toString();
        const url = queryStr
            ? `/college/get_training_enrollments/${programId}?${queryStr}`
            : `/college/get_training_enrollments/${programId}`;
        const response = await api.get(url);
        return response.data;
    },

    updateEnrollment: async (enrollmentId: string, data: {
        completion_status?: string;
        certificate_issued?: boolean;
        certificate_url?: string;
        payment_status?: string;
        amount_paid?: number;
    }) => {
        const response = await api.patch(`/college/update_enrollment/${enrollmentId}`, data);
        return response.data;
    },

    bulkUpdateEnrollments: async (programId: string, updates: {
        enrollment_id: string;
        completion_status?: string;
        payment_status?: string;
        amount_paid?: number;
        certificate_issued?: boolean;
        certificate_url?: string;
    }[]) => {
        const response = await api.patch(
            `/college/bulk_update_enrollments/${encodeURIComponent(programId)}`,
            { updates },
        );
        return response.data;
    },

    getStudentTrainingReport: async (studentId: string) => {
        const response = await api.get(
            `/college/student_training_report/${encodeURIComponent(studentId)}`,
        );
        return response.data;
    },

    // ─── Training Sessions ─────────────────────────────────────────────────────

    createTrainingSession: async (programId: string, data: {
        session_number: number;
        session_date?: string;
        session_topic?: string;
        venue?: string;
    }) => {
        const response = await api.post(
            `/college/training/${encodeURIComponent(programId)}/sessions`,
            data,
        );
        return response.data;
    },

    getTrainingSessions: async (programId: string) => {
        const response = await api.get(
            `/college/training/${encodeURIComponent(programId)}/sessions`,
        );
        return response.data;
    },

    updateTrainingSession: async (sessionId: string, data: {
        session_number?: number;
        session_date?: string;
        session_topic?: string;
        venue?: string;
    }) => {
        const response = await api.put(
            `/college/training/sessions/${encodeURIComponent(sessionId)}`,
            data,
        );
        return response.data;
    },

    deleteTrainingSession: async (sessionId: string) => {
        const response = await api.delete(
            `/college/training/sessions/${encodeURIComponent(sessionId)}`,
        );
        return response.data;
    },

    markSessionAttendance: async (sessionId: string, attendance: {
        enrollment_id: string;
        present: boolean;
    }[]) => {
        const response = await api.post(
            `/college/training/sessions/${encodeURIComponent(sessionId)}/attendance`,
            { attendance },
        );
        return response.data;
    },

    getSessionAttendance: async (sessionId: string) => {
        const response = await api.get(
            `/college/training/sessions/${encodeURIComponent(sessionId)}/attendance`,
        );
        return response.data;
    },

    // ─── Feedback ──────────────────────────────────────────────────────────────

    getAllFeedback: async (params: {
        is_approved?: boolean;
        company_id?: string;
        job_id?: string;
        rating?: number;
        search?: string;
        sort_by?: string;
        sort_order?: string;
        page?: number;
        limit?: number;
    } = {}) => {
        const query = new URLSearchParams();
        if (params.is_approved !== undefined) query.append("is_approved", String(params.is_approved));
        if (params.company_id) query.append("company_id", params.company_id);
        if (params.job_id) query.append("job_id", params.job_id);
        if (params.rating) query.append("rating", String(params.rating));
        if (params.search) query.append("search", params.search);
        if (params.sort_by) query.append("sort_by", params.sort_by);
        if (params.sort_order) query.append("sort_order", params.sort_order);
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));

        const queryStr = query.toString();
        const url = queryStr ? `/college/get_all_feedback?${queryStr}` : "/college/get_all_feedback";
        const response = await api.get(url);
        return response.data;
    },

    approveFeedback: async (feedbackId: string, is_approved: boolean) => {
        const response = await api.patch(`/college/approve_feedback/${feedbackId}`, { is_approved });
        return response.data;
    },

    // ─── Interview Questions ──────────────────────────────────────────────────

    getAllInterviewQuestions: async (params: {
        is_approved?: boolean;
        company_id?: string;
        job_id?: string;
        topic?: string;
        search?: string;
        sort_by?: string;
        sort_order?: string;
        page?: number;
        limit?: number;
    } = {}) => {
        const query = new URLSearchParams();
        if (params.is_approved !== undefined) query.append("is_approved", String(params.is_approved));
        if (params.company_id) query.append("company_id", params.company_id);
        if (params.job_id) query.append("job_id", params.job_id);
        if (params.topic) query.append("topic", params.topic);
        if (params.search) query.append("search", params.search);
        if (params.sort_by) query.append("sort_by", params.sort_by);
        if (params.sort_order) query.append("sort_order", params.sort_order);
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));

        const queryStr = query.toString();
        const url = queryStr ? `/college/get_all_interview_questions?${queryStr}` : "/college/get_all_interview_questions";
        const response = await api.get(url);
        return response.data;
    },

    approveInterviewQuestion: async (questionId: string, is_approved: boolean) => {
        const response = await api.patch(`/college/approve_interview_question/${questionId}`, { is_approved });
        return response.data;
    },

    // ─── Notifications ────────────────────────────────────────────────────────

    sendNotification: async (payload: {
        recipient_type: string;
        recipient_ids: string[];
        title: string;
        body?: string;
        notification_type: string;
        related_entity_type?: string;
        related_entity_id?: string;
    }) => {
        const response = await api.post("/college/send_notification", payload);
        return response.data;
    },

    sendBulkNotification: async (payload: {
        title: string;
        body?: string;
        notification_type: string;
        related_entity_type?: string;
        related_entity_id?: string;
        filters: {
            recipient_type: string;
            dept_ids?: string[];
            passout_years?: number[];
            student_status?: string;
            profile_status?: string;
            is_profile_complete?: boolean;
            user_roles?: string[];
            exclude_ids?: string[];
        };
    }) => {
        const response = await api.post("/college/send_bulk_notification", payload);
        return response.data;
    },

    getSentNotifications: async (params: {
        notification_type?: string;
        recipient_type?: string;
        search?: string;
        date_from?: string;
        date_to?: string;
        sort_by?: string;
        sort_order?: string;
        page?: number;
        limit?: number;
    } = {}) => {
        const query = new URLSearchParams();
        if (params.notification_type) query.append("notification_type", params.notification_type);
        if (params.recipient_type) query.append("recipient_type", params.recipient_type);
        if (params.search) query.append("search", params.search);
        if (params.date_from) query.append("date_from", params.date_from);
        if (params.date_to) query.append("date_to", params.date_to);
        if (params.sort_by) query.append("sort_by", params.sort_by);
        if (params.sort_order) query.append("sort_order", params.sort_order);
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));

        const queryStr = query.toString();
        const url = queryStr ? `/college/get_sent_notifications?${queryStr}` : "/college/get_sent_notifications";
        const response = await api.get(url);
        return response.data;
    },

    // ─── Student Restrictions ─────────────────────────────────────────────────

    addStudentRestriction: async (
        studentId: string,
        data: {
            restriction_type: string;
            reason: string;
            details?: string;
            valid_until?: string;
            company_id?: string | null;
        },
    ) => {
        const response = await api.post(`/college/add_student_restriction/${studentId}`, data);
        return response.data;
    },

    getAllRestrictions: async (params: {
        passout_year: number;
        restriction_type?: string;
        is_active?: string;
        search?: string;
        sort_by?: string;
        sort_order?: string;
        page?: number;
        limit?: number;
    }) => {
        const query = new URLSearchParams();
        query.append("passout_year", String(params.passout_year));
        if (params.restriction_type) query.append("restriction_type", params.restriction_type);
        if (params.is_active) query.append("is_active", params.is_active);
        if (params.search) query.append("search", params.search);
        if (params.sort_by) query.append("sort_by", params.sort_by);
        if (params.sort_order) query.append("sort_order", params.sort_order);
        if (params.page) query.append("page", String(params.page));
        if (params.limit) query.append("limit", String(params.limit));

        const url = `/college/get_all_restrictions?${query}`;
        const response = await api.get(url);
        return response.data;
    },

    getStudentRestrictions: async (
        studentId: string,
        params: { is_active?: string } = {},
    ) => {
        const query = new URLSearchParams();
        if (params.is_active) query.append("is_active", params.is_active);

        const queryStr = query.toString();
        const url = queryStr
            ? `/college/get_student_restrictions/${studentId}?${queryStr}`
            : `/college/get_student_restrictions/${studentId}`;
        const response = await api.get(url);
        return response.data;
    },

    updateRestriction: async (
        restrictionId: string,
        data: {
            is_active?: boolean;
            reason?: string;
            details?: string;
            valid_until?: string;
        },
    ) => {
        const response = await api.patch(`/college/update_restriction/${restrictionId}`, data);
        return response.data;
    },

    // ── Audit Logs ──────────────────────────────────────────────────────────
    getAuditLogs: async (
        filters: {
            page?: number;
            limit?: number;
            action?: string;
            resource_type?: string;
            user_id?: string;
            resource_id?: string;
            date_from?: string;
            date_to?: string;
            search?: string;
        } = {},
    ) => {
        const query = new URLSearchParams();
        if (filters.page) query.append("page", String(filters.page));
        if (filters.limit) query.append("limit", String(filters.limit));
        if (filters.action) query.append("action", filters.action);
        if (filters.resource_type) query.append("resource_type", filters.resource_type);
        if (filters.user_id) query.append("user_id", filters.user_id);
        if (filters.resource_id) query.append("resource_id", filters.resource_id);
        if (filters.date_from) query.append("date_from", filters.date_from);
        if (filters.date_to) query.append("date_to", filters.date_to);
        if (filters.search) query.append("search", filters.search);

        const queryStr = query.toString();
        const url = queryStr ? `/college/audit_logs?${queryStr}` : "/college/audit_logs";
        const response = await api.get(url);
        return response.data;
    },

    getAuditLogDetail: async (auditId: string) => {
        const response = await api.get(`/college/audit_logs/${auditId}`);
        return response.data;
    },

    // ======================== Company Tiers ========================

    createCompanyTier: async (data: {
        passout_year: number;
        tier_name: string;
        tier_level: number;
        min_package: number;
        max_package?: number | null;
        description?: string;
        is_active?: boolean;
    }) => {
        const response = await api.post("/college/create_tier", data);
        return response.data;
    },

    getAllCompanyTiers: async (
        params: { passout_year?: number; is_active?: string } = {},
    ) => {
        const query = new URLSearchParams();
        if (params.passout_year) query.append("passout_year", String(params.passout_year));
        if (params.is_active) query.append("is_active", params.is_active);
        const queryStr = query.toString();
        const url = queryStr ? `/college/get_all_tiers?${queryStr}` : "/college/get_all_tiers";
        return (await api.get(url)).data;
    },

    getCompanyTier: async (tierId: string) => {
        return (await api.get(`/college/get_tier/${encodeURIComponent(tierId)}`)).data;
    },

    updateCompanyTier: async (
        tierId: string,
        data: Record<string, unknown>,
    ) => {
        const response = await api.put(
            `/college/update_tier/${encodeURIComponent(tierId)}`,
            data,
        );
        return response.data;
    },

    deleteCompanyTier: async (tierId: string) => {
        const response = await api.delete(
            `/college/delete_tier/${encodeURIComponent(tierId)}`,
        );
        return response.data;
    },

    // ======================== Placement Settings ========================

    getPlacementSettings: async (passoutYear: number) => {
        return (await api.get(`/college/get_placement_settings?passout_year=${passoutYear}`)).data;
    },

    upsertPlacementSettings: async (data: {
        passout_year: number;
        max_active_offers?: number;
        allow_dream_upgrade?: boolean;
        auto_withdrawal_rule?: string;
        default_offer_days?: number;
        exclude_placed_by_default?: boolean;
        auto_reject_on_round_fail?: boolean;
        allow_reapply_after_withdrawal?: boolean;
        max_active_applications?: number | null;
    }) => {
        const response = await api.put("/college/upsert_placement_settings", data);
        return response.data;
    },

    // ── Self-Report Review ──────────────────────────────────────────────────

    getSelfReports: async (
        filters: {
            page?: number;
            limit?: number;
            verification_status?: string;
            search?: string;
            passout_year?: number;
        } = {},
    ) => {
        const query = new URLSearchParams();
        if (filters.page != null) query.append("page", String(filters.page));
        if (filters.limit != null) query.append("limit", String(filters.limit));
        if (filters.verification_status) query.append("verification_status", filters.verification_status);
        if (filters.search) query.append("search", filters.search);
        if (filters.passout_year != null) query.append("passout_year", String(filters.passout_year));

        const queryStr = query.toString();
        const url = queryStr ? `/college/self-reports?${queryStr}` : "/college/self-reports";
        const response = await api.get(url);
        return response.data;
    },

    getSelfReportById: async (reportId: string) => {
        const response = await api.get(`/college/self-reports/${reportId}`);
        return response.data;
    },

    reviewSelfReport: async (reportId: string, data: { action: "approve" | "reject"; company_id?: string; job_id?: string; rejection_reason?: string }) => {
        const response = await api.patch(`/college/self-reports/${reportId}/review`, data);
        return response.data;
    },

    getSelfReportStats: async (passoutYear: number) => {
        const response = await api.get(`/college/self-reports/stats?passout_year=${passoutYear}`);
        return response.data;
    },

    // ======================== Profile (Self-Service) ========================

    getMyProfile: async () => {
        const response = await api.get("/college/my-profile");
        return response.data;
    },

    updateMyProfile: async (data: {
        user_name?: string;
        phone_number?: string;
        profile_picture_url?: string;
    }) => {
        const response = await api.put("/college/my-profile", data);
        return response.data;
    },
};
