import api from "@/lib/api";

export interface CertificateData {
    certificate_id?: string;
    certificate_name: string;
    issuing_organization: string;
    certificate_description?: string | null;
    certificate_type?: string | null;
    issuing_platform?: string | null;
    credential_id?: string | null;
    credential_url?: string | null;
    issue_date?: string | null;
    expiry_date?: string | null;
    does_not_expire?: boolean;
    skills_covered?: string[];
    certificate_url?: string | null;
    is_verified?: boolean;
}

export const StudentCertificateService = {
    getAllCertificates: async () => {
        const response = await api.get("/student/get_all_certificates");
        return response.data;
    },

    addCertificate: async (data: Omit<CertificateData, "certificate_id">) => {
        const response = await api.post("/student/add_certificate", data);
        return response.data;
    },

    updateCertificate: async (certificateId: string, data: Partial<CertificateData>) => {
        const response = await api.put(`/student/update_certificate/${certificateId}`, data);
        return response.data;
    },

    deleteCertificate: async (certificateId: string) => {
        const response = await api.delete(`/student/delete_certificate/${certificateId}`);
        return response.data;
    },
};
