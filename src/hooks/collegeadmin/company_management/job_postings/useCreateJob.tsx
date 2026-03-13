import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AxiosError } from "axios";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { showToast } from "@/utils/ToastUtils";
import {
    jobCreateSchema,
    type PositionInput,
    type RoundInput,
    type QuestionInput,
    type EligibilityCriteriaInput,
} from "@/validators/JobPostingSchema";

// ========================
// TYPES
// ========================

export interface CreateJobFormData {
    // Step 1: Basic Info
    company_id: string;
    job_title: string;
    job_location: string;
    job_type: string;
    passout_years: number[];
    application_deadline: string;
    job_description: string;

    // Step 2: Salary & Bond
    salary_package: string;
    salary_min: number | "";
    salary_max: number | "";
    bond_duration: string;
    bond_details: string;
    internship_duration: string;
    internship_stipend: string;

    // Step 3: Positions
    positions: PositionInput[];

    // Step 4: Eligibility
    eligibility_criteria: EligibilityCriteriaInput;

    // Step 5: Rounds
    rounds: RoundInput[];

    // Step 6: Questions
    questions: QuestionInput[];
}

const INITIAL_FORM_DATA: CreateJobFormData = {
    company_id: "",
    job_title: "",
    job_location: "",
    job_type: "full-time",
    passout_years: [],
    application_deadline: "",
    job_description: "",

    salary_package: "",
    salary_min: "",
    salary_max: "",
    bond_duration: "",
    bond_details: "",
    internship_duration: "",
    internship_stipend: "",

    positions: [{ position_name: "", position_description: "", vacancies: 1 }],

    eligibility_criteria: {
        min_overall_cgpa: undefined,
        max_live_kts: 0,
        min_tenth_percentage: undefined,
        min_twelfth_percentage: undefined,
        min_diploma_percentage: undefined,
        allowed_genders: [],
        allowed_departments: [],
        exclude_already_placed: false,
    },

    rounds: [],
    questions: [],
};

export const STEP_LABELS = [
    "Basic Info",
    "Salary & Bond",
    "Positions",
    "Eligibility",
    "Rounds",
    "Questions",
    "Review",
];

// ========================
// HOOK
// ========================

export const useCreateJob = (companyId?: string) => {
    const navigate = useNavigate();
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState<CreateJobFormData>(() => ({
        ...INITIAL_FORM_DATA,
        company_id: companyId || "",
    }));
    const [errors, setErrors] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(false);

    // ========================
    // FIELD HANDLERS
    // ========================

    const handleChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
            const { name, value, type } = e.target;
            setFormData((prev) => ({
                ...prev,
                [name]: type === "number" ? (value === "" ? "" : Number(value)) : value,
            }));
            if (errors[name]) {
                setErrors((prev) => ({ ...prev, [name]: "" }));
            }
        },
        [errors]
    );

    const updateField = useCallback(
        (name: string, value: unknown) => {
            setFormData((prev) => ({ ...prev, [name]: value }));
            if (errors[name]) {
                setErrors((prev) => ({ ...prev, [name]: "" }));
            }
        },
        [errors]
    );

    // ========================
    // POSITIONS
    // ========================

    const addPosition = useCallback(() => {
        setFormData((prev) => ({
            ...prev,
            positions: [...prev.positions, { position_name: "", position_description: "", vacancies: 1 }],
        }));
    }, []);

    const updatePosition = useCallback((index: number, field: string, value: unknown) => {
        setFormData((prev) => {
            const updated = [...prev.positions];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, positions: updated };
        });
    }, []);

    const removePosition = useCallback((index: number) => {
        setFormData((prev) => ({
            ...prev,
            positions: prev.positions.filter((_, i) => i !== index),
        }));
    }, []);

    // ========================
    // ROUNDS
    // ========================

    const addRound = useCallback(() => {
        setFormData((prev) => ({
            ...prev,
            rounds: [
                ...prev.rounds,
                {
                    round_number: prev.rounds.length + 1,
                    round_name: "",
                    round_type: "",
                    round_date: "",
                    round_venue: "",
                },
            ],
        }));
    }, []);

    const updateRound = useCallback((index: number, field: string, value: unknown) => {
        setFormData((prev) => {
            const updated = [...prev.rounds];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, rounds: updated };
        });
    }, []);

    const removeRound = useCallback((index: number) => {
        setFormData((prev) => ({
            ...prev,
            rounds: prev.rounds
                .filter((_, i) => i !== index)
                .map((r, i) => ({ ...r, round_number: i + 1 })),
        }));
    }, []);

    // ========================
    // QUESTIONS
    // ========================

    const addQuestion = useCallback(() => {
        setFormData((prev) => ({
            ...prev,
            questions: [
                ...prev.questions,
                {
                    question_text: "",
                    question_type: "text",
                    question_options: [],
                    is_required: true,
                    question_order: prev.questions.length + 1,
                },
            ],
        }));
    }, []);

    const updateQuestion = useCallback((index: number, field: string, value: unknown) => {
        setFormData((prev) => {
            const updated = [...prev.questions];
            updated[index] = { ...updated[index], [field]: value };
            return { ...prev, questions: updated };
        });
    }, []);

    const removeQuestion = useCallback((index: number) => {
        setFormData((prev) => ({
            ...prev,
            questions: prev.questions
                .filter((_, i) => i !== index)
                .map((q, i) => ({ ...q, question_order: i + 1 })),
        }));
    }, []);

    // ========================
    // ELIGIBILITY
    // ========================

    const updateEligibility = useCallback((field: string, value: unknown) => {
        setFormData((prev) => ({
            ...prev,
            eligibility_criteria: {
                ...prev.eligibility_criteria,
                [field]: value,
            },
        }));
    }, []);

    // ========================
    // NAVIGATION
    // ========================

    const nextStep = useCallback(() => {
        setCurrentStep((prev) => Math.min(prev + 1, STEP_LABELS.length - 1));
    }, []);

    const prevStep = useCallback(() => {
        setCurrentStep((prev) => Math.max(prev - 1, 0));
    }, []);

    const goToStep = useCallback((step: number) => {
        setCurrentStep(step);
    }, []);

    // ========================
    // SUBMIT
    // ========================

    const handleSubmit = useCallback(async () => {
        // Build payload
        const payload = {
            company_id: formData.company_id,
            job_title: formData.job_title,
            job_description: formData.job_description || undefined,
            job_location: formData.job_location,
            salary_package: formData.salary_package || undefined,
            salary_min: formData.salary_min === "" ? undefined : formData.salary_min,
            salary_max: formData.salary_max === "" ? undefined : formData.salary_max,
            bond_duration: formData.bond_duration || undefined,
            bond_details: formData.bond_details || undefined,
            job_type: formData.job_type,
            internship_duration: (formData.job_type === "internship" || formData.job_type === "both")
                ? (formData.internship_duration || undefined)
                : undefined,
            internship_stipend: (formData.job_type === "internship" || formData.job_type === "both")
                ? (formData.internship_stipend || undefined)
                : undefined,
            passout_years: formData.passout_years,
            application_deadline: formData.application_deadline,
            positions: formData.positions.map((p) => ({
                position_name: p.position_name,
                position_description: p.position_description || undefined,
                vacancies: p.vacancies || undefined,
            })),
            eligibility_criteria: Object.values(formData.eligibility_criteria).some(
                (v) => v !== undefined && v !== null && v !== false && !(Array.isArray(v) && v.length === 0) && v !== 0
            )
                ? formData.eligibility_criteria
                : undefined,
            rounds: formData.rounds.length > 0
                ? formData.rounds.map((r) => ({
                    round_number: r.round_number,
                    round_name: r.round_name,
                    round_type: r.round_type || undefined,
                    round_date: r.round_date || undefined,
                    round_venue: r.round_venue || undefined,
                }))
                : undefined,
            questions: formData.questions.length > 0
                ? formData.questions.map((q) => ({
                    question_text: q.question_text,
                    question_type: q.question_type,
                    question_options: (q.question_type === "mcq_single" || q.question_type === "mcq_multiple")
                        ? q.question_options
                        : undefined,
                    is_required: q.is_required,
                    question_order: q.question_order,
                }))
                : undefined,
        };

        // Zod validation
        const result = jobCreateSchema.safeParse(payload);
        if (!result.success) {
            const fieldErrors: Record<string, string> = {};
            for (const issue of result.error.issues) {
                const key = issue.path.join(".");
                if (!fieldErrors[key]) {
                    fieldErrors[key] = issue.message;
                }
            }
            setErrors(fieldErrors);
            showToast({
                type: "warning",
                title: "Validation Failed",
                description: result.error.issues[0].message,
            });
            return;
        }

        setErrors({});
        setLoading(true);

        try {
            const response = await CollegeAdminService.createJob(payload);
            showToast({
                type: "success",
                title: "Success",
                description: response?.message || "Job posting created successfully",
            });
            navigate("/college/jobs");
        } catch (error: unknown) {
            const axiosErr = error as AxiosError<{ error?: string; message?: string }>;
            const errorMsg =
                axiosErr?.response?.data?.error ||
                axiosErr?.response?.data?.message ||
                (error instanceof Error ? error.message : "Something went wrong");

            showToast({
                type: "error",
                title: "Error Creating Job",
                description: errorMsg,
            });
        } finally {
            setLoading(false);
        }
    }, [formData, navigate]);

    const handleCancel = useCallback(() => {
        navigate(-1);
    }, [navigate]);

    return {
        currentStep,
        formData,
        errors,
        loading,
        handleChange,
        updateField,
        addPosition,
        updatePosition,
        removePosition,
        addRound,
        updateRound,
        removeRound,
        addQuestion,
        updateQuestion,
        removeQuestion,
        updateEligibility,
        nextStep,
        prevStep,
        goToStep,
        handleSubmit,
        handleCancel,
    };
};
