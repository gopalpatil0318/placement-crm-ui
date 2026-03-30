import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { StudentProfileService } from "@/services/student/student.services";
import type { FullProfileResponse, Skill } from "@/types/student";

export const useStudentProfile = () => {

    const { data, isLoading, error, refetch } = useQuery<FullProfileResponse>({
        queryKey: queryKeys.studentPortal.fullProfile(),
        queryFn: () => StudentProfileService.getFullProfile(),
        staleTime: 5 * 60 * 1000,
    });

    const errorMessage = error
        ? error instanceof ApiError
            ? error.message
            : "Failed to load profile data"
        : null;

    useEffect(() => {
        if (errorMessage) {
            showToast({ type: "error", title: "Profile Error", description: errorMessage });
        }
    }, [errorMessage]);

    return {
        student: data?.student ?? null,
        profileCompletion: data?.profile_completion ?? null,
        personalInfo: data?.personal_information ?? null,
        academicInfo: data?.academic_information ?? null,
        semesterGrades: data?.semester_grades ?? [],
        skills: (data?.skills ?? []) as Skill[],
        projects: data?.projects ?? [],
        experiences: data?.experience ?? [],
        achievements: data?.achievements ?? [],
        certificates: data?.certificates ?? [],
        activities: data?.activities ?? [],
        profileLinks: data?.profile_links ?? null,
        isLoading,
        error: errorMessage,
        refetch,
    };
};
