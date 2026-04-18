import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import type {
    Skill,
    StudentInfo,
    PersonalInfo,
    AcademicInfo,
    SemesterGrade,
    Project,
    Experience,
    Achievement,
    Certificate,
    Activity,
    ProfileLinks,
    ProfileCompletion,
} from "@/types/student";

// The backend responds with a flat response (student fields spread at top level)
// plus nested objects for profile sections.
interface RawFullProfile {
    profile_summary?: {
        profile_completion_percentage?: number;
        profile_complete?: boolean;
        profile_is_approved?: boolean;
        profile_approval_status?: string;
        profile_rejection_reason?: string | null;
        rejected_at?: string | null;
        section_status?: Record<string, unknown>;
    };
    personal_info?: Record<string, unknown> | null;
    academic_info?: Record<string, unknown> | null;
    semester_grades?: unknown[];
    skills?: unknown[];
    projects?: unknown[];
    experience?: unknown[];
    achievements?: unknown[];
    certificates?: unknown[];
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
 * Hook for fetching a student's full profile from the college-admin API.
 * Returns the same shape as `useStudentProfile` so StudentProfile.tsx
 * can consume it seamlessly via viewMode="college".
 */
export const useStudentProfileById = (studentId: string, enabled = true) => {
    const { data, isLoading, error, refetch } = useQuery({
        queryKey: queryKeys.verifications.studentReview(studentId),
        queryFn: () => CollegeAdminService.getStudentFullProfile(studentId, true),
        enabled: !!studentId && enabled,
        staleTime: 5 * 60 * 1000,
    });

    const raw = data?.data as RawFullProfile | undefined;

    let errorMessage: string | null = null;
    if (error) {
        errorMessage = error instanceof ApiError ? error.message : "Failed to load student profile";
    }

    useEffect(() => {
        if (errorMessage) {
            showToast({ type: "error", title: "Profile Error", description: errorMessage });
        }
    }, [errorMessage]);

    if (!raw) {
        return {
            student: null as StudentInfo | null,
            profileCompletion: null as ProfileCompletion | null,
            personalInfo: null as PersonalInfo | null,
            academicInfo: null as AcademicInfo | null,
            semesterGrades: [] as SemesterGrade[],
            skills: [] as Skill[],
            projects: [] as Project[],
            experiences: [] as Experience[],
            achievements: [] as Achievement[],
            certificates: [] as Certificate[],
            activities: [] as Activity[],
            profileLinks: null as ProfileLinks | null,
            verificationSummary: null as RawFullProfile["verification_summary"] | null,
            isLoading,
            error: errorMessage,
            refetch,
        };
    }

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
        student: studentFields as unknown as StudentInfo,
        profileCompletion: {
            total_percentage: profile_summary?.profile_completion_percentage ?? 0,
            is_complete: profile_summary?.profile_complete ?? false,
            profile_complete: profile_summary?.profile_complete ?? false,
            profile_is_approved: profile_summary?.profile_is_approved ?? false,
            profile_approval_status: profile_summary?.profile_approval_status ?? null,
            profile_rejection_reason: profile_summary?.profile_rejection_reason ?? null,
            rejected_at: profile_summary?.rejected_at ?? null,
            sections: (profile_summary?.section_status ?? {}) as ProfileCompletion["sections"],
        } as ProfileCompletion,
        personalInfo: (personal_info ?? null) as PersonalInfo | null,
        academicInfo: (academic_info ?? null) as AcademicInfo | null,
        semesterGrades: (semester_grades ?? []) as SemesterGrade[],
        skills: (skills ?? []) as Skill[],
        projects: (projects ?? []) as Project[],
        experiences: (experience ?? []) as Experience[],
        achievements: (achievements ?? []) as Achievement[],
        certificates: (certificates ?? []) as Certificate[],
        activities: (activities ?? []) as Activity[],
        profileLinks: (profile_links ?? null) as ProfileLinks | null,
        verificationSummary: verification_summary ?? null,
        isLoading,
        error: errorMessage,
        refetch,
    };
};
