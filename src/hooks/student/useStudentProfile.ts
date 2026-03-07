import { useState, useEffect, useCallback } from "react";
import { StudentProfileService } from "@/services/student/student.services";
import type {
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

interface StudentProfileState {
    student: StudentInfo | null;
    profileCompletion: ProfileCompletion | null;
    personalInfo: PersonalInfo | null;
    academicInfo: AcademicInfo | null;
    semesterGrades: SemesterGrade[];
    skills: any[];
    projects: Project[];
    experiences: Experience[];
    achievements: Achievement[];
    certificates: Certificate[];
    activities: Activity[];
    profileLinks: ProfileLinks | null;
    isLoading: boolean;
    error: string | null;
}

export const useStudentProfile = () => {
    const [state, setState] = useState<StudentProfileState>({
        student: null,
        profileCompletion: null,
        personalInfo: null,
        academicInfo: null,
        semesterGrades: [],
        skills: [],
        projects: [],
        experiences: [],
        achievements: [],
        certificates: [],
        activities: [],
        profileLinks: null,
        isLoading: true,
        error: null,
    });

    const fetchAllData = useCallback(async () => {
        setState((prev) => ({ ...prev, isLoading: true, error: null }));

        try {
            // get_full_profile returns ALL data in one call
            const fullProfile = await StudentProfileService.getFullProfile();

            setState({
                student: fullProfile.student || null,
                profileCompletion: fullProfile.profile_completion || null,
                personalInfo: fullProfile.personal_information || null,
                academicInfo: fullProfile.academic_information || null,
                semesterGrades: fullProfile.semester_grades || [],
                skills: fullProfile.skills || [],
                projects: fullProfile.projects || [],
                experiences: fullProfile.experience || [],
                achievements: fullProfile.achievements || [],
                certificates: fullProfile.certificates || [],
                activities: fullProfile.activities || [],
                profileLinks: fullProfile.profile_links || null,
                isLoading: false,
                error: null,
            });
        } catch (err: any) {
            console.error("Failed to load student profile:", err);
            setState((prev) => ({
                ...prev,
                isLoading: false,
                error: err.message || "Failed to load profile data",
            }));
        }
    }, []);

    useEffect(() => {
        fetchAllData();
    }, [fetchAllData]);

    return { ...state, refetch: fetchAllData };
};
