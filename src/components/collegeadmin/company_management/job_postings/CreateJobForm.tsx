import { useState, useEffect } from "react";
import { useCreateJob, STEP_LABELS } from "@/hooks/collegeadmin/company_management/job_postings/useCreateJob";
import { useViewCompanies } from "@/hooks/collegeadmin/company_management/useViewCompanies";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingSelect from "@/components/ui/FloatingSelect";
import FloatingTextarea from "@/components/ui/FloatingTextarea";
import {
    JOB_TYPE_OPTIONS,
    ROUND_TYPE_OPTIONS,
    QUESTION_TYPE_OPTIONS,
    GENDER_OPTIONS,
} from "@/validators/JobPostingSchema";
import {
    Plus,
    Trash2,
    ChevronRight,
    ChevronLeft,
    Check,
    Briefcase,
    DollarSign,
    Target,
    ShieldCheck,
    ListOrdered,
    HelpCircle,
    ClipboardList,
    Loader2,
} from "lucide-react";

// ========================
// STEP ICONS (component refs)
// ========================

const STEP_ICONS: Record<number, React.ComponentType<{ className?: string }>> = {
    0: Briefcase,
    1: DollarSign,
    2: Target,
    3: ShieldCheck,
    4: ListOrdered,
    5: HelpCircle,
    6: ClipboardList,
};

// ========================
// STEP INDICATOR
// ========================

const StepIndicator = ({ currentStep, goToStep }: { currentStep: number; goToStep: (s: number) => void }) => (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-8">
        {STEP_LABELS.map((label, i) => {
            const Icon = STEP_ICONS[i];
            return (
                <button
                    key={label}
                    type="button"
                    onClick={() => goToStep(i)}
                    className={`flex items-center gap-2 px-3.5 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                        i === currentStep
                            ? "bg-blue-600 text-white shadow-md shadow-blue-200 dark:shadow-blue-900/40"
                            : i < currentStep
                            ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30"
                            : "bg-gray-50 dark:bg-gray-800 text-gray-400 dark:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700"
                    }`}
                >
                    <span
                        className={`h-6 w-6 rounded-full flex items-center justify-center text-[10px] font-bold transition-all ${
                            i === currentStep
                                ? "bg-white/20 text-white"
                                : i < currentStep
                                ? "bg-emerald-500 text-white"
                                : "bg-gray-200 dark:bg-gray-700 text-gray-400 dark:text-gray-500"
                        }`}
                    >
                        {i < currentStep ? <Check size={11} /> : <Icon className="h-3 w-3" />}
                    </span>
                    <span className="hidden sm:inline">{label}</span>
                </button>
            );
        })}
    </div>
);

// ========================
// PASSOUT YEAR SELECTOR
// ========================

const currentYear = new Date().getFullYear();
const PASSOUT_YEARS = Array.from({ length: 21 }, (_, i) => currentYear - 5 + i);

// ========================
// FIELD WRAPPER HELPERS
// ========================

const inputClass = (hasError: boolean) =>
    `w-full rounded-xl border px-4 py-2.5 text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
        hasError ? "border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10" : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
    }`;

const selectClass = (hasError: boolean) =>
    `${inputClass(hasError)} appearance-none [&>option]:text-gray-900 [&>option]:bg-white dark:[&>option]:text-gray-100 dark:[&>option]:bg-gray-800`;

const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1.5";

const FieldError = ({ message }: { message?: string }) =>
    message ? <p className="text-xs text-red-500 dark:text-red-400 mt-1">{message}</p> : null;

const SectionHeader = ({
    icon: Icon,
    title,
    subtitle,
}: {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    subtitle?: string;
}) => (
    <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
            <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h2>
            {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
    </div>
);

// ========================
// MAIN COMPONENT
// ========================

const CreateJobForm = () => {
    const {
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
    } = useCreateJob();

    const { companies: activeCompanies, loading: companiesLoading } = useViewCompanies({ limit: 100, status: "active" });

    // Fetch all active departments for eligibility dropdown
    const [departments, setDepartments] = useState<{ dept_id: string; dept_name: string }[]>([]);
    const [deptsLoading, setDeptsLoading] = useState(true);

    useEffect(() => {
        const fetchDepts = async () => {
            try {
                const res = await CollegeAdminService.getDepartments({ limit: 100, is_active: true });
                setDepartments(Array.isArray(res.data) ? res.data : []);
            } catch {
                // Department fetch is optional — silent fail
            } finally {
                setDeptsLoading(false);
            }
        };
        fetchDepts();
    }, []);

    const showInternshipFields =
        formData.job_type === "internship" || formData.job_type === "both";

    // ========================
    // STEP 1 — Basic Info
    // ========================
    const renderBasicInfo = () => (
        <div className="space-y-6">
            <SectionHeader icon={Briefcase} title="Basic Information" subtitle="Enter the core job details" />

            <FloatingSelect
                label="Company"
                name="company_id"
                value={formData.company_id}
                onChange={handleChange}
                error={errors.company_id}
                disabled={companiesLoading}
                options={activeCompanies.map((c) => ({ value: c.company_id, label: c.company_name }))}
                required
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FloatingInput
                    label="Job Title"
                    name="job_title"
                    value={formData.job_title}
                    onChange={handleChange}
                    error={errors.job_title}
                    placeholder="e.g. Software Developer — Campus 2026"
                    maxLength={300}
                    required
                />
                <FloatingInput
                    label="Location"
                    name="job_location"
                    value={formData.job_location}
                    onChange={handleChange}
                    error={errors.job_location}
                    placeholder="e.g. Mumbai, Pune, Bangalore"
                    maxLength={300}
                    required
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <FloatingSelect
                    label="Job Type"
                    name="job_type"
                    value={formData.job_type}
                    onChange={handleChange}
                    options={JOB_TYPE_OPTIONS.map((t) => ({ value: t, label: t.charAt(0).toUpperCase() + t.slice(1).replace("-", " ") }))}
                    required
                />
                <div>
                    <label className={labelClass}>Passout Year(s) <span className="text-red-500">*</span></label>
                    <select
                        value=""
                        onChange={(e) => {
                            const year = Number(e.target.value);
                            if (year && !formData.passout_years.includes(year)) {
                                updateField("passout_years", [...formData.passout_years, year]);
                            }
                        }}
                        className={selectClass(!!errors.passout_years)}
                    >
                        <option value="">Add Year</option>
                        {PASSOUT_YEARS.map((y) => (
                            <option key={y} value={y} disabled={formData.passout_years.includes(y)}>{y}</option>
                        ))}
                    </select>
                    {formData.passout_years.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {formData.passout_years.map((y) => (
                                <span key={y} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-800">
                                    {y}
                                    <button type="button" onClick={() => updateField("passout_years", formData.passout_years.filter((v) => v !== y))} className="hover:text-red-600 dark:hover:text-red-400 transition-colors"></button>
                                </span>
                            ))}
                        </div>
                    )}
                    <FieldError message={errors.passout_years} />
                </div>
                <div>
                    <FloatingInput
                        label="Application Deadline"
                        name="application_deadline"
                        type="datetime-local"
                        value={formData.application_deadline}
                        onChange={handleChange}
                        required
                        error={errors.application_deadline}
                    />
                </div>
            </div>

            {showInternshipFields && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-5 bg-amber-50/60 dark:bg-amber-900/10 rounded-xl border border-amber-100 dark:border-amber-800">
                    <FloatingInput
                        label="Internship Duration"
                        name="internship_duration"
                        value={formData.internship_duration}
                        onChange={handleChange}
                        placeholder="e.g. 6 months"
                    />
                    <FloatingInput
                        label="Internship Stipend"
                        name="internship_stipend"
                        value={formData.internship_stipend}
                        onChange={handleChange}
                        placeholder="e.g. 15000/month"
                    />
                </div>
            )}

            <FloatingTextarea
                label="Job Description"
                name="job_description"
                value={formData.job_description}
                onChange={handleChange}
                placeholder="Describe the role, responsibilities, and requirements..."
                rows={6}
                maxLength={5000}
            />
        </div>
    );

    // ========================
    // STEP 2 — Salary & Bond
    // ========================
    const renderSalaryBond = () => (
        <div className="space-y-6">
            <SectionHeader icon={DollarSign} title="Salary & Bond Details" subtitle="Compensation, bond, and stipend information" />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <FloatingInput
                    label="Salary Package"
                    name="salary_package"
                    value={formData.salary_package}
                    onChange={handleChange}
                    placeholder="e.g. 7 LPA"
                />
                <FloatingInput
                    label="Salary Min (₹)"
                    name="salary_min"
                    type="number"
                    value={String(formData.salary_min)}
                    onChange={handleChange}
                    placeholder="e.g. 700000"
                />
                <FloatingInput
                    label="Salary Max (₹)"
                    name="salary_max"
                    type="number"
                    value={String(formData.salary_max)}
                    onChange={handleChange}
                    placeholder="e.g. 700000"
                />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <FloatingInput
                    label="Bond Duration"
                    name="bond_duration"
                    value={formData.bond_duration}
                    onChange={handleChange}
                    placeholder="e.g. 2 years"
                />
                <FloatingTextarea
                    label="Bond Details"
                    name="bond_details"
                    value={formData.bond_details}
                    onChange={handleChange}
                    placeholder="Bond conditions and penalty details..."
                    rows={2}
                    maxLength={1000}
                />
            </div>
        </div>
    );

    // ========================
    // STEP 3 — Positions
    // ========================
    const renderPositions = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <SectionHeader icon={Target} title="Positions" subtitle="Define available roles for this job" />
                <button type="button" onClick={addPosition} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                    <Plus size={14} /> Add Position
                </button>
            </div>

            {formData.positions.map((pos, i) => (
                <div key={i} className="p-5 bg-gray-50/70 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Position #{i + 1}</span>
                        {formData.positions.length > 1 && (
                            <button type="button" onClick={() => removePosition(i)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Position Name *</label>
                            <input value={pos.position_name} onChange={(e) => updatePosition(i, "position_name", e.target.value)} placeholder="e.g. Software Developer" className={inputClass(false)} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Description</label>
                            <input value={pos.position_description || ""} onChange={(e) => updatePosition(i, "position_description", e.target.value)} placeholder="Brief description..." className={inputClass(false)} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Vacancies</label>
                            <input type="number" value={pos.vacancies || ""} onChange={(e) => updatePosition(i, "vacancies", e.target.value ? Number(e.target.value) : undefined)} min={1} className={inputClass(false)} />
                        </div>
                    </div>
                </div>
            ))}
            <FieldError message={errors["positions"]} />
        </div>
    );

    // ========================
    // STEP 4 — Eligibility
    // ========================
    const renderEligibility = () => {
        const ec = formData.eligibility_criteria;
        return (
            <div className="space-y-6">
                <SectionHeader icon={ShieldCheck} title="Eligibility Criteria" subtitle="Set academic and demographic requirements (optional)" />

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                        <label className={labelClass}>Min CGPA (0-10)</label>
                        <input type="number" value={ec.min_overall_cgpa ?? ""} onChange={(e) => updateEligibility("min_overall_cgpa", e.target.value ? Number(e.target.value) : undefined)} step={0.1} min={0} max={10} className={inputClass(false)} />
                    </div>
                    <div>
                        <label className={labelClass}>Max Live KTs (0-20)</label>
                        <input type="number" value={ec.max_live_kts ?? ""} onChange={(e) => updateEligibility("max_live_kts", e.target.value ? Number(e.target.value) : undefined)} min={0} max={20} className={inputClass(false)} />
                    </div>
                    <div>
                        <label className={labelClass}>Min 10th %</label>
                        <input type="number" value={ec.min_tenth_percentage ?? ""} onChange={(e) => updateEligibility("min_tenth_percentage", e.target.value ? Number(e.target.value) : undefined)} min={0} max={100} className={inputClass(false)} />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                        <label className={labelClass}>Min 12th %</label>
                        <input type="number" value={ec.min_twelfth_percentage ?? ""} onChange={(e) => updateEligibility("min_twelfth_percentage", e.target.value ? Number(e.target.value) : undefined)} min={0} max={100} className={inputClass(false)} />
                    </div>
                    <div>
                        <label className={labelClass}>Min Diploma %</label>
                        <input type="number" value={ec.min_diploma_percentage ?? ""} onChange={(e) => updateEligibility("min_diploma_percentage", e.target.value ? Number(e.target.value) : undefined)} min={0} max={100} className={inputClass(false)} />
                    </div>
                    <div className="flex items-end">
                        <label className="flex items-center gap-2.5 cursor-pointer select-none">
                            <input type="checkbox" checked={ec.exclude_already_placed || false} onChange={(e) => updateEligibility("exclude_already_placed", e.target.checked)} className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500" />
                            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Exclude Already Placed</span>
                        </label>
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Allowed Genders</label>
                    <div className="flex flex-wrap gap-3">
                        {GENDER_OPTIONS.map((g) => (
                            <label key={g} className="flex items-center gap-2 cursor-pointer select-none">
                                <input
                                    type="checkbox"
                                    checked={ec.allowed_genders?.includes(g) || false}
                                    onChange={(e) => {
                                        const current = ec.allowed_genders || [];
                                        updateEligibility("allowed_genders", e.target.checked ? [...current, g] : current.filter((v) => v !== g));
                                    }}
                                    className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700 dark:text-gray-300">{g.charAt(0).toUpperCase() + g.slice(1)}</span>
                            </label>
                        ))}
                    </div>
                </div>

                <div>
                    <label className={labelClass}>Allowed Departments</label>
                    {deptsLoading ? (
                        <div className="flex items-center gap-2 text-sm text-gray-400 dark:text-gray-500 py-2.5">
                            <Loader2 className="h-4 w-4 animate-spin" /> Loading departments...
                        </div>
                    ) : departments.length === 0 ? (
                        <p className="text-sm text-gray-500 dark:text-gray-400 py-2.5">No departments available. Add departments in Department Management first.</p>
                    ) : (
                        <select
                            value=""
                            onChange={(e) => {
                                const val = e.target.value;
                                if (val && !ec.allowed_departments?.includes(val)) {
                                    updateEligibility("allowed_departments", [...(ec.allowed_departments || []), val]);
                                }
                            }}
                            className={selectClass(false)}
                        >
                            <option value="">Select Department</option>
                            {departments
                                .filter((d) => !ec.allowed_departments?.includes(d.dept_name))
                                .map((d) => (
                                    <option key={d.dept_id} value={d.dept_name}>{d.dept_name}</option>
                                ))}
                        </select>
                    )}
                    {(ec.allowed_departments?.length ?? 0) > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {ec.allowed_departments!.map((d) => (
                                <span key={d} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-400 border border-purple-100 dark:border-purple-800">
                                    {d}
                                    <button type="button" onClick={() => updateEligibility("allowed_departments", ec.allowed_departments!.filter((v) => v !== d))} className="hover:text-red-600 dark:hover:text-red-400 transition-colors">×</button>
                                </span>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // ========================
    // STEP 5 — Rounds
    // ========================
    const renderRounds = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <SectionHeader icon={ListOrdered} title="Selection Rounds" subtitle="Define the hiring process steps (optional)" />
                <button type="button" onClick={addRound} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                    <Plus size={14} /> Add Round
                </button>
            </div>

            {formData.rounds.length === 0 && (
                <div className="text-center py-10 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                    <ListOrdered className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No rounds added yet. Click "Add Round" to define selection rounds.</p>
                </div>
            )}

            {formData.rounds.map((round, i) => (
                <div key={i} className="p-5 bg-gray-50/70 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Round #{round.round_number}</span>
                        <button type="button" onClick={() => removeRound(i)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                            <Trash2 size={16} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Round Name *</label>
                            <input value={round.round_name} onChange={(e) => updateRound(i, "round_name", e.target.value)} placeholder="e.g. Aptitude Test" className={inputClass(false)} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Round Type</label>
                            <select value={round.round_type || ""} onChange={(e) => updateRound(i, "round_type", e.target.value)} className={selectClass(false)}>
                                <option value="">Select Type</option>
                                {ROUND_TYPE_OPTIONS.map((t) => (<option key={t} value={t}>{t}</option>))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Date</label>
                            <input type="datetime-local" value={round.round_date || ""} onChange={(e) => updateRound(i, "round_date", e.target.value)} className={inputClass(false)} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Venue</label>
                            <input value={round.round_venue || ""} onChange={(e) => updateRound(i, "round_venue", e.target.value)} placeholder="e.g. College Exam Hall" className={inputClass(false)} />
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );

    // ========================
    // STEP 6 — Questions
    // ========================
    const renderQuestions = () => (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <SectionHeader icon={HelpCircle} title="Application Questions" subtitle="Questions students must answer when applying (optional)" />
                <button type="button" onClick={addQuestion} className="flex items-center gap-1.5 px-4 py-2 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                    <Plus size={14} /> Add Question
                </button>
            </div>

            {formData.questions.length === 0 && (
                <div className="text-center py-10 bg-gray-50/50 dark:bg-gray-800/30 rounded-xl border border-dashed border-gray-200 dark:border-gray-700">
                    <HelpCircle className="h-8 w-8 text-gray-300 dark:text-gray-600 mx-auto mb-3" />
                    <p className="text-sm text-gray-500 dark:text-gray-400">No questions added yet. Click "Add Question" to add application questions.</p>
                </div>
            )}

            {formData.questions.map((q, i) => (
                <div key={i} className="p-5 bg-gray-50/70 dark:bg-gray-800/50 rounded-xl border border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                        <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">Question #{q.question_order}</span>
                        <button type="button" onClick={() => removeQuestion(i)} className="text-red-400 hover:text-red-600 transition-colors p-1">
                            <Trash2 size={16} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Question Text *</label>
                            <textarea value={q.question_text} onChange={(e) => updateQuestion(i, "question_text", e.target.value)} placeholder="Enter question..." rows={2} className={`${inputClass(false)} resize-none`} />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1">Question Type *</label>
                            <select value={q.question_type} onChange={(e) => updateQuestion(i, "question_type", e.target.value)} className={selectClass(false)}>
                                {QUESTION_TYPE_OPTIONS.map((t) => (<option key={t} value={t}>{t.replace("_", " ")}</option>))}
                            </select>
                            <label className="flex items-center gap-2 mt-2.5 cursor-pointer select-none">
                                <input type="checkbox" checked={q.is_required} onChange={(e) => updateQuestion(i, "is_required", e.target.checked)} className="w-4 h-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500" />
                                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">Required</span>
                            </label>
                        </div>
                    </div>

                    {(q.question_type === "mcq_single" || q.question_type === "mcq_multiple") && (
                        <div className="mt-3 p-4 bg-white dark:bg-gray-800 rounded-xl border border-gray-100 dark:border-gray-700">
                            <label className="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2">Options (min 2)</label>
                            {(q.question_options || []).map((opt, oi) => (
                                <div key={oi} className="flex items-center gap-2 mb-2">
                                    <input value={opt} onChange={(e) => { const updated = [...(q.question_options || [])]; updated[oi] = e.target.value; updateQuestion(i, "question_options", updated); }} className={`flex-1 ${inputClass(false)}`} placeholder={`Option ${oi + 1}`} />
                                    <button type="button" onClick={() => { const updated = (q.question_options || []).filter((_, idx) => idx !== oi); updateQuestion(i, "question_options", updated); }} className="text-red-400 hover:text-red-600 transition-colors p-1">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            <button type="button" onClick={() => updateQuestion(i, "question_options", [...(q.question_options || []), ""])} className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 mt-1 transition-colors">
                                <Plus size={12} /> Add Option
                            </button>
                        </div>
                    )}
                </div>
            ))}
        </div>
    );

    // ========================
    // STEP 7 — Review
    // ========================
    const renderReview = () => {
        const companyName = activeCompanies.find((c) => c.company_id === formData.company_id)?.company_name || "—";
        return (
            <div className="space-y-6">
                <SectionHeader icon={ClipboardList} title="Review & Submit" subtitle="Verify all details before creating the job posting" />

                <ReviewSection title="Basic Information">
                    <ReviewRow label="Company" value={companyName} />
                    <ReviewRow label="Job Title" value={formData.job_title} />
                    <ReviewRow label="Location" value={formData.job_location} />
                    <ReviewRow label="Job Type" value={formData.job_type} />
                    <ReviewRow label="Passout Year(s)" value={formData.passout_years.join(", ")} />
                    <ReviewRow label="Deadline" value={formData.application_deadline ? new Date(formData.application_deadline).toLocaleString() : "—"} />
                    {formData.job_description && <ReviewRow label="Description" value={formData.job_description} />}
                </ReviewSection>

                {(formData.salary_package || formData.salary_min !== "" || formData.bond_duration) && (
                    <ReviewSection title="Salary & Bond">
                        {formData.salary_package && <ReviewRow label="Package" value={formData.salary_package} />}
                        {formData.salary_min !== "" && <ReviewRow label="Salary Min" value={`₹${formData.salary_min}`} />}
                        {formData.salary_max !== "" && <ReviewRow label="Salary Max" value={`₹${formData.salary_max}`} />}
                        {formData.bond_duration && <ReviewRow label="Bond Duration" value={formData.bond_duration} />}
                        {formData.bond_details && <ReviewRow label="Bond Details" value={formData.bond_details} />}
                    </ReviewSection>
                )}

                <ReviewSection title={`Positions (${formData.positions.length})`}>
                    {formData.positions.map((p, i) => (
                        <div key={i} className="text-sm text-gray-700 dark:text-gray-300">
                            <span className="font-medium">{p.position_name || "Untitled"}</span>
                            {p.vacancies && <span className="text-gray-400 dark:text-gray-500 ml-2">({p.vacancies} vacancies)</span>}
                            {p.position_description && <span className="text-gray-400 dark:text-gray-500 ml-2">— {p.position_description}</span>}
                        </div>
                    ))}
                </ReviewSection>

                {Object.values(formData.eligibility_criteria).some(
                    (v) => v !== undefined && v !== null && v !== false && !(Array.isArray(v) && v.length === 0) && v !== 0
                ) && (
                    <ReviewSection title="Eligibility Criteria">
                        {formData.eligibility_criteria.min_overall_cgpa != null && <ReviewRow label="Min CGPA" value={String(formData.eligibility_criteria.min_overall_cgpa)} />}
                        {formData.eligibility_criteria.max_live_kts != null && formData.eligibility_criteria.max_live_kts > 0 && <ReviewRow label="Max Live KTs" value={String(formData.eligibility_criteria.max_live_kts)} />}
                        {(formData.eligibility_criteria.allowed_departments?.length ?? 0) > 0 && <ReviewRow label="Departments" value={formData.eligibility_criteria.allowed_departments!.join(", ")} />}
                        {formData.eligibility_criteria.exclude_already_placed && <ReviewRow label="Exclude Placed" value="Yes" />}
                    </ReviewSection>
                )}

                {formData.rounds.length > 0 && (
                    <ReviewSection title={`Rounds (${formData.rounds.length})`}>
                        {formData.rounds.map((r, i) => (
                            <div key={i} className="text-sm text-gray-700 dark:text-gray-300">
                                Round {r.round_number}: <span className="font-medium">{r.round_name}</span>
                                {r.round_type && <span className="text-gray-400 dark:text-gray-500 ml-1">({r.round_type})</span>}
                                {r.round_venue && <span className="text-gray-400 dark:text-gray-500 ml-1">— {r.round_venue}</span>}
                            </div>
                        ))}
                    </ReviewSection>
                )}

                {formData.questions.length > 0 && (
                    <ReviewSection title={`Questions (${formData.questions.length})`}>
                        {formData.questions.map((q, i) => (
                            <div key={i} className="text-sm text-gray-700 dark:text-gray-300">
                                Q{q.question_order}: <span className="font-medium">{q.question_text}</span>
                                <span className="text-gray-400 dark:text-gray-500 ml-1">({q.question_type})</span>
                                {q.is_required && <span className="text-red-500 ml-1">*</span>}
                            </div>
                        ))}
                    </ReviewSection>
                )}
            </div>
        );
    };

    // ========================
    // RENDER
    // ========================
    const stepContent = [renderBasicInfo, renderSalaryBond, renderPositions, renderEligibility, renderRounds, renderQuestions, renderReview];

    return (
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800 shadow-sm overflow-hidden">
            <div className="px-8 pt-8">
                <StepIndicator currentStep={currentStep} goToStep={goToStep} />
            </div>

            <div className="px-8 pb-4">{stepContent[currentStep]()}</div>

            <div className="flex items-center justify-between px-8 py-5 border-t border-gray-100 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-800/30">
                <button type="button" onClick={currentStep === 0 ? handleCancel : prevStep} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                    <ChevronLeft size={16} />
                    {currentStep === 0 ? "Cancel" : "Previous"}
                </button>

                {currentStep < STEP_LABELS.length - 1 ? (
                    <button type="button" onClick={nextStep} className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors shadow-sm">
                        Next <ChevronRight size={16} />
                    </button>
                ) : (
                    <button type="button" onClick={handleSubmit} disabled={loading} className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors shadow-sm disabled:opacity-60">
                        {loading ? (<><Loader2 className="h-4 w-4 animate-spin" />Creating...</>) : (<><Check size={16} />Create Job</>)}
                    </button>
                )}
            </div>
        </div>
    );
};

// ========================
// HELPERS
// ========================

const ReviewSection = ({ title, children }: { title: string; children: React.ReactNode }) => (
    <div className="p-5 rounded-xl bg-gray-50/70 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">{title}</h3>
        <div className="space-y-1.5">{children}</div>
    </div>
);

const ReviewRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex gap-3 text-sm">
        <span className="text-gray-500 dark:text-gray-400 min-w-[140px]">{label}:</span>
        <span className="text-gray-800 dark:text-gray-200 font-medium">{value || "—"}</span>
    </div>
);

export default CreateJobForm;
