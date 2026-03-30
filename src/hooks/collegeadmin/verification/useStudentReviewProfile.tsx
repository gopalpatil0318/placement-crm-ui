import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";

// ========================
// TYPES
// ========================

export interface VerificationMeta {
    verification_status: "pending" | "approved" | "rejected";
    is_verified: boolean;
    verified_by: string | null;
    verified_at: string | null;
    rejection_reason: string | null;
    rejected_at: string | null;
}

export interface ReviewProfileData {
    student: {
        student_id: string;
        first_name: string;
        last_name: string;
        student_email: string;
        dept_id: string;
        dept_name: string;
        college_name: string;
        student_passout_year: number;
        current_year: number;
        student_status: string;
        profile_complete: boolean;
        profile_is_approved: boolean;
        profile_approval_status: string;
        profile_rejection_reason: string | null;
        approved_by: string | null;
        approved_at: string | null;
        rejected_at: string | null;
        created_at: string;
        updated_at: string;
    };
    personal_information: Record<string, unknown> | null;
    academic_information: Record<string, unknown> | null;
    semester_grades: unknown[];
    skills: unknown[];
    projects: unknown[];
    experience: (Record<string, unknown> & VerificationMeta)[];
    achievements: (Record<string, unknown> & VerificationMeta)[];
    certificates: (Record<string, unknown> & VerificationMeta)[];
    activities: unknown[];
    profile_links: Record<string, unknown> | null;
    profile_completion: {
        total_percentage: number;
        is_complete: boolean;
        sections: Record<string, unknown>;
    };
    verification_summary: {
        experience: { pending: number; rejected: number };
        achievements: { pending: number; rejected: number };
        certificates: { pending: number; rejected: number };
    };
}

// ========================
// HOOK
// ========================

interface FullProfileResponse {
    profile_summary?: {
        profile_completion_percentage?: number;
        profile_complete?: boolean;
        section_status?: Record<string, unknown>;
    };
    personal_info?: Record<string, unknown> | null;
    academic_info?: Record<string, unknown> | null;
    semester_grades?: unknown[];
    skills?: unknown[];
    projects?: unknown[];
    experience?: (Record<string, unknown> & VerificationMeta)[];
    achievements?: (Record<string, unknown> & VerificationMeta)[];
    certificates?: (Record<string, unknown> & VerificationMeta)[];
    activities?: unknown[];
    profile_links?: Record<string, unknown> | null;
    verification_summary?: {
        experience: { pending: number; rejected: number };
        achievements: { pending: number; rejected: number };
        certificates: { pending: number; rejected: number };
    };
    [key: string]: unknown;
}

/**
 * The backend returns a flat response (`...student` spread at top level)
 * with keys like `personal_info`, `academic_info`, `profile_summary`.
 * Components expect a nested `student` object and different key names,
 * so we transform the response here.
 */
export function useStudentReviewProfile(studentId: string, enabled = true) {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: queryKeys.verifications.studentReview(studentId),
        queryFn: () => CollegeAdminService.getStudentFullProfile(studentId, true),
        enabled: !!studentId && enabled,
    });

    const raw = data?.data as FullProfileResponse | undefined;

    const profileData: ReviewProfileData | null = raw
        ? (() => {
              const {
                  profile_summary,
                  personal_info,
                  academic_info,
                  semester_grades,
                  skills,
                  projects,
                  experience,
                  achievements,
                  certificates,
                  activities,
                  profile_links,
                  verification_summary,
                  ...studentFields
              } = raw;

              return {
                  student: studentFields as ReviewProfileData["student"],
                  personal_information: personal_info ?? null,
                  academic_information: academic_info ?? null,
                  semester_grades: semester_grades ?? [],
                  skills: skills ?? [],
                  projects: projects ?? [],
                  experience: experience ?? [],
                  achievements: achievements ?? [],
                  certificates: certificates ?? [],
                  activities: activities ?? [],
                  profile_links: profile_links ?? null,
                  profile_completion: {
                      total_percentage: profile_summary?.profile_completion_percentage ?? 0,
                      is_complete: profile_summary?.profile_complete ?? false,
                      sections: profile_summary?.section_status ?? {},
                  },
                  verification_summary: verification_summary ?? {
                      experience: { pending: 0, rejected: 0 },
                      achievements: { pending: 0, rejected: 0 },
                      certificates: { pending: 0, rejected: 0 },
                  },
              };
          })()
        : null;

    return {
        profileData,
        isLoading,
        error: error
            ? error instanceof Error
                ? error.message
                : "Failed to load profile"
            : null,
        refetch,
    };
}
