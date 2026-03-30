// ─── Student Core Info (from get_full_profile → data.student) ───
export interface StudentInfo {
    student_id: string;
    first_name: string;
    middle_name: string;
    last_name: string;
    student_email: string;
    dept_id: string;
    college_id: string;
    student_passout_year: number;
    current_year: number;
    student_status: string;
    profile_complete: boolean;
    profile_is_approved: boolean;
    created_at: string;
    updated_at: string;
    dept_name: string;
    college_name: string;
}

// ─── Personal Info ───
export interface PersonalInfo {
    mobile_number: string;
    alternate_mobile: string;
    birth_date: string;
    gender: string;
    blood_group: string;
    aadhaar_number: string;
    caste: string;
    category: string;
    nationality: string;
    father_name: string;
    father_mobile: string;
    father_occupation: string;
    father_annual_income: string;
    mother_name: string;
    mother_mobile: string;
    mother_occupation: string;
    mother_annual_income: string;
    guardian_name: string;
    guardian_mobile: string;
    permanent_address: string;
    permanent_city: string;
    permanent_district: string;
    permanent_state: string;
    permanent_pincode: string;
    current_address: string;
    current_city: string;
    current_district: string;
    current_state: string;
    current_pincode: string;
    same_as_permanent: boolean;
    created_at?: string;
    updated_at?: string;
}

// ─── Academic Info ───
export interface AcademicInfo {
    roll_number: string;
    enrollment_number: string;
    admission_year: number;
    admission_based_on: string;
    tenth_percentage: string;
    tenth_board: string;
    tenth_passing_year: number;
    twelfth_or_diploma: string;
    twelfth_percentage: string | null;
    twelfth_board: string | null;
    diploma_percentage: string | null;
    diploma_branch: string | null;
    higher_education_passing_year: number;
    overall_cgpa: string;
    total_live_kts: number;
    total_dead_kts: number;
    any_gap_during_education: boolean;
    gap_years: number | null;
    gap_reason: string | null;
    created_at?: string;
    updated_at?: string;
}

// ─── Semester Grade ───
export interface SemesterGrade {
    grade_id?: string;
    semester_number: number;
    academic_year: string;
    sgpa: string;
    cgpa: string;
    backlogs_in_semester: number;
    backlog_subjects: string[];
    semester_status: string;
    created_at?: string;
    updated_at?: string;
}

// ─── Project ───
export interface Project {
    project_id: string;
    project_title: string;
    project_description: string | null;
    project_type: string | null;
    project_url: string | null;
    github_link: string | null;
    demo_link: string | null;
    technologies_used: string[];
    start_date: string;
    end_date: string | null;
    is_ongoing: boolean;
    team_size: number;
    role_in_project: string | null;
    display_order: number;
    is_featured: boolean;
    created_at: string;
    updated_at: string;
}

// ─── Experience ───
export interface Experience {
    experience_id: string;
    company_name: string;
    company_website: string | null;
    position_title: string;
    employment_type: string;
    job_description: string;
    responsibilities: string[];
    technologies_used: string[];
    work_location: string;
    work_mode: string;
    start_date: string;
    end_date: string | null;
    is_current: boolean;
    duration_months: number | null;
    stipend_amount: number | null;
    offer_letter_url: string | null;
    completion_certificate_url: string | null;
    is_verified: boolean;
    verification_status: string;
    verified_by: string | null;
    verified_at: string | null;
    rejection_reason: string | null;
    rejected_at: string | null;
    created_at: string;
    updated_at: string;
}

// ─── Achievement ───
export interface Achievement {
    achievement_id: string;
    achievement_title: string;
    achievement_description: string | null;
    achievement_type: string | null;
    issuing_organization: string | null;
    event_name: string | null;
    achievement_level: string | null;
    position_rank: string | null;
    participants_count: number | null;
    achievement_date: string | null;
    certificate_url: string | null;
    proof_url: string | null;
    is_verified: boolean;
    verification_status: string;
    verified_by: string | null;
    verified_at: string | null;
    rejection_reason: string | null;
    rejected_at: string | null;
    is_featured: boolean;
    display_order: number | null;
    created_at: string;
    updated_at: string;
}

// ─── Certificate ───
export interface Certificate {
    certificate_id: string;
    certificate_name: string;
    certificate_description: string | null;
    certificate_type: string | null;
    issuing_organization: string;
    issuing_platform: string | null;
    credential_id: string | null;
    credential_url: string | null;
    issue_date: string;
    expiry_date: string | null;
    does_not_expire: boolean;
    skills_covered: string[];
    certificate_url: string | null;
    is_verified: boolean;
    verification_status: string | null;
    verified_by: string | null;
    verified_at: string | null;
    rejection_reason: string | null;
    rejected_at: string | null;
    created_at: string;
    updated_at: string;
}

// ─── Activity ───
export interface Activity {
    activity_id: string;
    activity_name: string;
    activity_description: string | null;
    activity_type: string | null;
    organizing_body: string | null;
    role_position: string | null;
    start_date: string;
    end_date: string | null;
    is_ongoing: boolean;
    hours_contributed: number | null;
    certificate_url: string | null;
    proof_urls: string[];
    created_at: string;
    updated_at: string;
}

// ─── Profile Links ───
export interface ProfileLinks {
    personal_portfolio_url: string | null;
    resume_url: string | null;
    profile_image_url: string | null;
    github_url: string | null;
    linkedin_url: string | null;
    leetcode_url: string | null;
    codechef_url: string | null;
    codeforces_url: string | null;
    hackerrank_url: string | null;
    geeksforgeeks_url: string | null;
    medium_url: string | null;
    bio: string | null;
    area_of_interest: string[];
    created_at: string;
    updated_at: string;
}

// ─── Profile Completion Section ───
export interface CompletionSection {
    weight: number;
    completed: boolean;
    earned: number;
    count?: number;
}

export interface ProfileCompletion {
    total_percentage: number;
    is_complete: boolean;
    sections: {
        personal_information: CompletionSection;
        academic_information: CompletionSection;
        semester_grades: CompletionSection;
        skills: CompletionSection;
        profile_links: CompletionSection;
        projects: CompletionSection;
        experience: CompletionSection;
        certificates: CompletionSection;
    };
}

// ─── Verification Summary ───
export interface VerificationCount {
    pending: number;
    rejected: number;
}

export interface VerificationSummary {
    experience: VerificationCount;
    achievements: VerificationCount;
    certificates: VerificationCount;
}

// ─── Full Profile Response (from get_full_profile → data) ───
export interface FullProfileResponse {
    student: StudentInfo;
    personal_information: PersonalInfo | null;
    academic_information: AcademicInfo | null;
    semester_grades: SemesterGrade[];
    skills: Skill[];
    projects: Project[];
    experience: Experience[];
    achievements: Achievement[];
    certificates: Certificate[];
    activities: Activity[];
    profile_links: ProfileLinks | null;
    profile_completion: ProfileCompletion;
    verification_summary: VerificationSummary;
}

// ─── Aggregated Wrapper Types (used by individual-fetch APIs) ───
export interface SemesterGradesResponse {
    total_semesters_in_dept: number;
    completed_semesters: number;
    grades: SemesterGrade[];
}

export interface ProjectsResponse {
    total_projects: number;
    max_projects: number;
    projects: Project[];
}

export interface ExperienceResponse {
    total_experience: number;
    max_experience: number;
    experience: Experience[];
}

export interface AchievementsResponse {
    total_achievements: number;
    max_achievements: number;
    achievements: Achievement[];
}

export interface CertificatesResponse {
    total_certificates: number;
    max_certificates: number;
    certificates: Certificate[];
}

export interface ActivitiesResponse {
    total_activities: number;
    max_activities: number;
    activities: Activity[];
}

// ─── Skill (from get_all_skills / get_my_skills / sync_my_skills) ───
export interface Skill {
    skill_id: string;
    skill_name: string;
    skill_category?: string;
    proficiency_level?: "beginner" | "intermediate" | "advanced" | "expert";
    name?: string;
    student_count?: number;
    created_at?: string;
    updated_at?: string;
}
