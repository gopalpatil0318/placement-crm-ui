import api from "../../lib/api";

// ─── Types ──────────────────────────────────────────────────────────────────────

export interface DemoRequest {
    id: string;
    college_name: string;
    contact_person: string;
    designation: string;
    college_type: string;
    email: string;
    phone: string;
    number_of_students: number | null;
    city: string | null;
    state: string | null;
    preferred_demo_date: string | null;
    preferred_demo_time: string | null;
    referral_source: string | null;
    status: string;
    assigned_to: string | null;
    converted_college_id: string | null;
    created_at: string;
    updated_at: string;
    notes?: SubmissionNote[];
}

export interface ContactInquiry {
    id: string;
    name: string;
    email: string;
    phone: string;
    subject: string | null;
    message: string;
    status: string;
    created_at: string;
    updated_at: string;
    notes?: SubmissionNote[];
}

export interface SubmissionNote {
    id: string;
    note: string;
    created_by: string;
    created_at: string;
}

export interface SubmissionListParams {
    page?: number;
    limit?: number;
    status?: string;
    college_type?: string;
    search?: string;
    date_from?: string;
    date_to?: string;
}

export interface SubmissionStats {
    demo_requests: {
        total: number;
        new: number;
        contacted: number;
        scheduled: number;
        completed: number;
        converted: number;
        lost: number;
        rejected: number;
        last_30_days: number;
        conversion_rate: number;
    };
    contact_inquiries: {
        total: number;
        new: number;
        in_progress: number;
        resolved: number;
        closed: number;
        last_30_days: number;
    };
}

// ─── Service ────────────────────────────────────────────────────────────────────

export const SubmissionsService = {
    // Demo Requests
    getDemoRequests: async (params?: SubmissionListParams) => {
        const response = await api.get("/sysadmin/demo-requests", { params });
        return response.data;
    },

    getDemoRequestDetail: async (id: string) => {
        const response = await api.get(`/sysadmin/demo-requests/${id}`);
        return response.data;
    },

    updateDemoRequestStatus: async (id: string, payload: { status: string; converted_college_id?: string | null; assigned_to?: string }) => {
        const response = await api.patch(`/sysadmin/demo-requests/${id}/status`, payload);
        return response.data;
    },

    addDemoRequestNote: async (id: string, note: string) => {
        const response = await api.post(`/sysadmin/demo-requests/${id}/notes`, { note });
        return response.data;
    },

    // Contact Inquiries
    getContactInquiries: async (params?: SubmissionListParams) => {
        const response = await api.get("/sysadmin/contact-inquiries", { params });
        return response.data;
    },

    getContactInquiryDetail: async (id: string) => {
        const response = await api.get(`/sysadmin/contact-inquiries/${id}`);
        return response.data;
    },

    updateContactInquiryStatus: async (id: string, payload: { status: string }) => {
        const response = await api.patch(`/sysadmin/contact-inquiries/${id}/status`, payload);
        return response.data;
    },

    addContactInquiryNote: async (id: string, note: string) => {
        const response = await api.post(`/sysadmin/contact-inquiries/${id}/notes`, { note });
        return response.data;
    },

    // Stats
    getSubmissionStats: async () => {
        const response = await api.get("/sysadmin/submissions/stats");
        return response.data;
    },
};
