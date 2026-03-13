import { useCreateJob, STEP_LABELS } from "@/hooks/collegeadmin/company_management/job_postings/useCreateJob";
import { useViewCompanies } from "@/hooks/collegeadmin/company_management/useViewCompanies";
import {
    JOB_TYPE_OPTIONS,
    ROUND_TYPE_OPTIONS,
    QUESTION_TYPE_OPTIONS,
    GENDER_OPTIONS,
} from "@/validators/JobPostingSchema";
import { Plus, Trash2, ChevronRight, ChevronLeft, Check } from "lucide-react";

// ========================
// STEP INDICATOR
// ========================

const StepIndicator = ({ currentStep, goToStep }: { currentStep: number; goToStep: (s: number) => void }) => (
    <div className="flex items-center gap-1 overflow-x-auto pb-2 mb-6">
        {STEP_LABELS.map((label, i) => (
            <button
                key={label}
                type="button"
                onClick={() => goToStep(i)}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                    i === currentStep
                        ? "bg-blue-600 text-white shadow-sm"
                        : i < currentStep
                        ? "bg-green-100 text-green-700"
                        : "bg-gray-100 text-gray-500"
                }`}
            >
                <span className={`h-5 w-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                    i === currentStep
                        ? "bg-white/20 text-white"
                        : i < currentStep
                        ? "bg-green-500 text-white"
                        : "bg-gray-300 text-white"
                }`}>
                    {i < currentStep ? <Check size={10} /> : i + 1}
                </span>
                <span className="hidden sm:inline">{label}</span>
            </button>
        ))}
    </div>
);

// ========================
// PASSOUT YEAR SELECTOR
// ========================

const currentYear = new Date().getFullYear();
const PASSOUT_YEARS = Array.from({ length: 21 }, (_, i) => currentYear - 5 + i);

// ========================
// MAIN COMPONENT
// ========================

const CreateJobForm = ({ companyId }: { companyId?: string }) => {
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
    } = useCreateJob(companyId);

    const { companies } = useViewCompanies();

    const showInternshipFields = formData.job_type === "internship" || formData.job_type === "both";

    // ========================
    // STEP 1 — Basic Info
    // ========================
    const renderBasicInfo = () => (
        <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-800">Basic Information</h2>

            {/* Company Dropdown */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Company <span className="text-red-500">*</span>
                </label>
                <select
                    name="company_id"
                    value={formData.company_id}
                    onChange={handleChange}
                    className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.company_id ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                >
                    <option value="">Select Company</option>
                    {companies.map((c) => (
                        <option key={c.company_id} value={c.company_id}>
                            {c.company_name}
                        </option>
                    ))}
                </select>
                {errors.company_id && <p className="text-xs text-red-500 mt-1">{errors.company_id}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Job Title */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Title <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="job_title"
                        value={formData.job_title}
                        onChange={handleChange}
                        placeholder="e.g. Software Developer — Campus 2026"
                        maxLength={300}
                        className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.job_title ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                    />
                    {errors.job_title && <p className="text-xs text-red-500 mt-1">{errors.job_title}</p>}
                </div>

                {/* Job Location */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Location <span className="text-red-500">*</span>
                    </label>
                    <input
                        name="job_location"
                        value={formData.job_location}
                        onChange={handleChange}
                        placeholder="e.g. Mumbai, Pune, Bangalore"
                        maxLength={300}
                        className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.job_location ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                    />
                    {errors.job_location && <p className="text-xs text-red-500 mt-1">{errors.job_location}</p>}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {/* Job Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Job Type <span className="text-red-500">*</span>
                    </label>
                    <select
                        name="job_type"
                        value={formData.job_type}
                        onChange={handleChange}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                    >
                        {JOB_TYPE_OPTIONS.map((t) => (
                            <option key={t} value={t}>{t}</option>
                        ))}
                    </select>
                </div>

                {/* Passout Years */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Passout Year(s) <span className="text-red-500">*</span>
                    </label>
                    <select
                        value=""
                        onChange={(e) => {
                            const year = Number(e.target.value);
                            if (year && !formData.passout_years.includes(year)) {
                                updateField("passout_years", [...formData.passout_years, year]);
                            }
                        }}
                        className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.passout_years ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                    >
                        <option value="">Add Year</option>
                        {PASSOUT_YEARS.map((y) => (
                            <option key={y} value={y} disabled={formData.passout_years.includes(y)}>
                                {y}
                            </option>
                        ))}
                    </select>
                    {formData.passout_years.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {formData.passout_years.map((y) => (
                                <span
                                    key={y}
                                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-700"
                                >
                                    {y}
                                    <button
                                        type="button"
                                        onClick={() => updateField("passout_years", formData.passout_years.filter((v) => v !== y))}
                                        className="hover:text-red-600"
                                    >
                                        ×
                                    </button>
                                </span>
                            ))}
                        </div>
                    )}
                    {errors.passout_years && <p className="text-xs text-red-500 mt-1">{errors.passout_years}</p>}
                </div>

                {/* Application Deadline */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Application Deadline <span className="text-red-500">*</span>
                    </label>
                    <input
                        type="datetime-local"
                        name="application_deadline"
                        value={formData.application_deadline}
                        onChange={handleChange}
                        className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.application_deadline ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                    />
                    {errors.application_deadline && <p className="text-xs text-red-500 mt-1">{errors.application_deadline}</p>}
                </div>
            </div>

            {/* Internship fields */}
            {showInternshipFields && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 p-4 bg-amber-50 rounded-lg border border-amber-100">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Internship Duration</label>
                        <input
                            name="internship_duration"
                            value={formData.internship_duration}
                            onChange={handleChange}
                            placeholder="e.g. 6 months"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Internship Stipend</label>
                        <input
                            name="internship_stipend"
                            value={formData.internship_stipend}
                            onChange={handleChange}
                            placeholder="e.g. 15000/month"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>
            )}

            {/* Description */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                    Job Description <span className="text-gray-400 text-xs ml-1">(optional)</span>
                </label>
                <textarea
                    name="job_description"
                    value={formData.job_description}
                    onChange={handleChange}
                    placeholder="Describe the role, responsibilities, and requirements..."
                    rows={6}
                    maxLength={5000}
                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
                <p className={`text-xs text-right mt-1 ${formData.job_description.length > 4500 ? "text-orange-500" : "text-gray-400"}`}>
                    {formData.job_description.length} / 5000
                </p>
            </div>
        </div>
    );

    // ========================
    // STEP 2 — Salary & Bond
    // ========================
    const renderSalaryBond = () => (
        <div className="space-y-5">
            <h2 className="text-lg font-semibold text-gray-800">Salary & Bond Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary Package</label>
                    <input
                        name="salary_package"
                        value={formData.salary_package}
                        onChange={handleChange}
                        placeholder="e.g. 7 LPA"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary Min (₹)</label>
                    <input
                        type="number"
                        name="salary_min"
                        value={formData.salary_min}
                        onChange={handleChange}
                        placeholder="e.g. 700000"
                        min={0}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Salary Max (₹)</label>
                    <input
                        type="number"
                        name="salary_max"
                        value={formData.salary_max}
                        onChange={handleChange}
                        placeholder="e.g. 700000"
                        min={0}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bond Duration</label>
                    <input
                        name="bond_duration"
                        value={formData.bond_duration}
                        onChange={handleChange}
                        placeholder="e.g. 2 years"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Bond Details</label>
                    <textarea
                        name="bond_details"
                        value={formData.bond_details}
                        onChange={handleChange}
                        placeholder="Bond conditions and penalty details..."
                        rows={2}
                        maxLength={1000}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                    />
                </div>
            </div>
        </div>
    );

    // ========================
    // STEP 3 — Positions
    // ========================
    const renderPositions = () => (
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Positions</h2>
                <button
                    type="button"
                    onClick={addPosition}
                    className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                >
                    <Plus size={14} /> Add Position
                </button>
            </div>

            {formData.positions.map((pos, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-600">Position #{i + 1}</span>
                        {formData.positions.length > 1 && (
                            <button
                                type="button"
                                onClick={() => removePosition(i)}
                                className="text-red-500 hover:text-red-700 transition"
                            >
                                <Trash2 size={16} />
                            </button>
                        )}
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Position Name *</label>
                            <input
                                value={pos.position_name}
                                onChange={(e) => updatePosition(i, "position_name", e.target.value)}
                                placeholder="e.g. Software Developer"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
                            <input
                                value={pos.position_description || ""}
                                onChange={(e) => updatePosition(i, "position_description", e.target.value)}
                                placeholder="Brief description..."
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Vacancies</label>
                            <input
                                type="number"
                                value={pos.vacancies || ""}
                                onChange={(e) => updatePosition(i, "vacancies", e.target.value ? Number(e.target.value) : undefined)}
                                min={1}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    </div>
                </div>
            ))}
            {errors["positions"] && <p className="text-xs text-red-500">{errors["positions"]}</p>}
        </div>
    );

    // ========================
    // STEP 4 — Eligibility
    // ========================
    const renderEligibility = () => {
        const ec = formData.eligibility_criteria;
        return (
            <div className="space-y-5">
                <h2 className="text-lg font-semibold text-gray-800">Eligibility Criteria <span className="text-gray-400 text-sm font-normal">(optional)</span></h2>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min CGPA (0-10)</label>
                        <input
                            type="number"
                            value={ec.min_overall_cgpa ?? ""}
                            onChange={(e) => updateEligibility("min_overall_cgpa", e.target.value ? Number(e.target.value) : undefined)}
                            step={0.1} min={0} max={10}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Live KTs (0-20)</label>
                        <input
                            type="number"
                            value={ec.max_live_kts ?? ""}
                            onChange={(e) => updateEligibility("max_live_kts", e.target.value ? Number(e.target.value) : undefined)}
                            min={0} max={20}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min 10th %</label>
                        <input
                            type="number"
                            value={ec.min_tenth_percentage ?? ""}
                            onChange={(e) => updateEligibility("min_tenth_percentage", e.target.value ? Number(e.target.value) : undefined)}
                            min={0} max={100}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min 12th %</label>
                        <input
                            type="number"
                            value={ec.min_twelfth_percentage ?? ""}
                            onChange={(e) => updateEligibility("min_twelfth_percentage", e.target.value ? Number(e.target.value) : undefined)}
                            min={0} max={100}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Diploma %</label>
                        <input
                            type="number"
                            value={ec.min_diploma_percentage ?? ""}
                            onChange={(e) => updateEligibility("min_diploma_percentage", e.target.value ? Number(e.target.value) : undefined)}
                            min={0} max={100}
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                    <div className="flex items-end">
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={ec.exclude_already_placed || false}
                                onChange={(e) => updateEligibility("exclude_already_placed", e.target.checked)}
                                className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-sm font-medium text-gray-700">Exclude Already Placed</span>
                        </label>
                    </div>
                </div>

                {/* Genders */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Genders</label>
                    <div className="flex flex-wrap gap-3">
                        {GENDER_OPTIONS.map((g) => (
                            <label key={g} className="flex items-center gap-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={ec.allowed_genders?.includes(g) || false}
                                    onChange={(e) => {
                                        const current = ec.allowed_genders || [];
                                        updateEligibility(
                                            "allowed_genders",
                                            e.target.checked
                                                ? [...current, g]
                                                : current.filter((v) => v !== g)
                                        );
                                    }}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-sm text-gray-700">{g}</span>
                            </label>
                        ))}
                    </div>
                </div>

                {/* Departments */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Allowed Departments</label>
                    <input
                        placeholder="Type department name and press Enter"
                        onKeyDown={(e) => {
                            if (e.key === "Enter") {
                                e.preventDefault();
                                const val = (e.target as HTMLInputElement).value.trim();
                                if (val && !ec.allowed_departments?.includes(val)) {
                                    updateEligibility("allowed_departments", [...(ec.allowed_departments || []), val]);
                                    (e.target as HTMLInputElement).value = "";
                                }
                            }
                        }}
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {(ec.allowed_departments?.length ?? 0) > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                            {ec.allowed_departments!.map((d) => (
                                <span key={d} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-purple-100 text-purple-700">
                                    {d}
                                    <button
                                        type="button"
                                        onClick={() =>
                                            updateEligibility("allowed_departments", ec.allowed_departments!.filter((v) => v !== d))
                                        }
                                        className="hover:text-red-600"
                                    >
                                        ×
                                    </button>
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
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Selection Rounds <span className="text-gray-400 text-sm font-normal">(optional)</span></h2>
                <button type="button" onClick={addRound} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <Plus size={14} /> Add Round
                </button>
            </div>

            {formData.rounds.length === 0 && (
                <p className="text-sm text-gray-500 py-4 text-center">No rounds added yet. Click "Add Round" to add selection rounds.</p>
            )}

            {formData.rounds.map((round, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-600">Round #{round.round_number}</span>
                        <button type="button" onClick={() => removeRound(i)} className="text-red-500 hover:text-red-700 transition">
                            <Trash2 size={16} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Round Name *</label>
                            <input
                                value={round.round_name}
                                onChange={(e) => updateRound(i, "round_name", e.target.value)}
                                placeholder="e.g. Aptitude Test"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Round Type</label>
                            <select
                                value={round.round_type || ""}
                                onChange={(e) => updateRound(i, "round_type", e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                <option value="">Select Type</option>
                                {ROUND_TYPE_OPTIONS.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Date</label>
                            <input
                                type="datetime-local"
                                value={round.round_date || ""}
                                onChange={(e) => updateRound(i, "round_date", e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Venue</label>
                            <input
                                value={round.round_venue || ""}
                                onChange={(e) => updateRound(i, "round_venue", e.target.value)}
                                placeholder="e.g. College Exam Hall"
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
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
        <div className="space-y-5">
            <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">Application Questions <span className="text-gray-400 text-sm font-normal">(optional)</span></h2>
                <button type="button" onClick={addQuestion} className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition">
                    <Plus size={14} /> Add Question
                </button>
            </div>

            {formData.questions.length === 0 && (
                <p className="text-sm text-gray-500 py-4 text-center">No questions added yet. Click "Add Question" to add application questions.</p>
            )}

            {formData.questions.map((q, i) => (
                <div key={i} className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <div className="flex items-center justify-between mb-3">
                        <span className="text-sm font-semibold text-gray-600">Question #{q.question_order}</span>
                        <button type="button" onClick={() => removeQuestion(i)} className="text-red-500 hover:text-red-700 transition">
                            <Trash2 size={16} />
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-3">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-medium text-gray-600 mb-1">Question Text *</label>
                            <textarea
                                value={q.question_text}
                                onChange={(e) => updateQuestion(i, "question_text", e.target.value)}
                                placeholder="Enter question..."
                                rows={2}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-medium text-gray-600 mb-1">Question Type *</label>
                            <select
                                value={q.question_type}
                                onChange={(e) => updateQuestion(i, "question_type", e.target.value)}
                                className="w-full rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
                            >
                                {QUESTION_TYPE_OPTIONS.map((t) => (
                                    <option key={t} value={t}>{t.replace("_", " ")}</option>
                                ))}
                            </select>
                            <label className="flex items-center gap-2 mt-2 cursor-pointer">
                                <input
                                    type="checkbox"
                                    checked={q.is_required}
                                    onChange={(e) => updateQuestion(i, "is_required", e.target.checked)}
                                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                />
                                <span className="text-xs font-medium text-gray-600">Required</span>
                            </label>
                        </div>
                    </div>

                    {/* MCQ Options */}
                    {(q.question_type === "mcq_single" || q.question_type === "mcq_multiple") && (
                        <div className="mt-3 p-3 bg-white rounded-lg border border-gray-200">
                            <label className="block text-xs font-medium text-gray-600 mb-2">Options (min 2)</label>
                            {(q.question_options || []).map((opt, oi) => (
                                <div key={oi} className="flex items-center gap-2 mb-1.5">
                                    <input
                                        value={opt}
                                        onChange={(e) => {
                                            const updated = [...(q.question_options || [])];
                                            updated[oi] = e.target.value;
                                            updateQuestion(i, "question_options", updated);
                                        }}
                                        className="flex-1 rounded border border-gray-300 px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        placeholder={`Option ${oi + 1}`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => {
                                            const updated = (q.question_options || []).filter((_, idx) => idx !== oi);
                                            updateQuestion(i, "question_options", updated);
                                        }}
                                        className="text-red-500 hover:text-red-700"
                                    >
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            ))}
                            <button
                                type="button"
                                onClick={() => updateQuestion(i, "question_options", [...(q.question_options || []), ""])}
                                className="flex items-center gap-1 text-xs font-semibold text-blue-600 hover:text-blue-700 mt-1"
                            >
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
        const companyName = companies.find((c) => c.company_id === formData.company_id)?.company_name || "—";
        return (
            <div className="space-y-6">
                <h2 className="text-lg font-semibold text-gray-800">Review & Submit</h2>

                {/* Basic Info */}
                <ReviewSection title="Basic Information">
                    <ReviewRow label="Company" value={companyName} />
                    <ReviewRow label="Job Title" value={formData.job_title} />
                    <ReviewRow label="Location" value={formData.job_location} />
                    <ReviewRow label="Job Type" value={formData.job_type} />
                    <ReviewRow label="Passout Year(s)" value={formData.passout_years.join(", ")} />
                    <ReviewRow label="Deadline" value={formData.application_deadline ? new Date(formData.application_deadline).toLocaleString() : "—"} />
                    {formData.job_description && <ReviewRow label="Description" value={formData.job_description} />}
                </ReviewSection>

                {/* Salary & Bond */}
                {(formData.salary_package || formData.salary_min !== "" || formData.bond_duration) && (
                    <ReviewSection title="Salary & Bond">
                        {formData.salary_package && <ReviewRow label="Package" value={formData.salary_package} />}
                        {formData.salary_min !== "" && <ReviewRow label="Salary Min" value={`₹${formData.salary_min}`} />}
                        {formData.salary_max !== "" && <ReviewRow label="Salary Max" value={`₹${formData.salary_max}`} />}
                        {formData.bond_duration && <ReviewRow label="Bond Duration" value={formData.bond_duration} />}
                        {formData.bond_details && <ReviewRow label="Bond Details" value={formData.bond_details} />}
                    </ReviewSection>
                )}

                {/* Positions */}
                <ReviewSection title={`Positions (${formData.positions.length})`}>
                    {formData.positions.map((p, i) => (
                        <div key={i} className="text-sm text-gray-700">
                            <span className="font-medium">{p.position_name || "Untitled"}</span>
                            {p.vacancies && <span className="text-gray-400 ml-2">({p.vacancies} vacancies)</span>}
                            {p.position_description && <span className="text-gray-400 ml-2">— {p.position_description}</span>}
                        </div>
                    ))}
                </ReviewSection>

                {/* Rounds */}
                {formData.rounds.length > 0 && (
                    <ReviewSection title={`Rounds (${formData.rounds.length})`}>
                        {formData.rounds.map((r, i) => (
                            <div key={i} className="text-sm text-gray-700">
                                Round {r.round_number}: <span className="font-medium">{r.round_name}</span>
                                {r.round_type && <span className="text-gray-400 ml-1">({r.round_type})</span>}
                                {r.round_venue && <span className="text-gray-400 ml-1">— {r.round_venue}</span>}
                            </div>
                        ))}
                    </ReviewSection>
                )}

                {/* Questions */}
                {formData.questions.length > 0 && (
                    <ReviewSection title={`Questions (${formData.questions.length})`}>
                        {formData.questions.map((q, i) => (
                            <div key={i} className="text-sm text-gray-700">
                                Q{q.question_order}: <span className="font-medium">{q.question_text}</span>
                                <span className="text-gray-400 ml-1">({q.question_type})</span>
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
    const stepContent = [
        renderBasicInfo,
        renderSalaryBond,
        renderPositions,
        renderEligibility,
        renderRounds,
        renderQuestions,
        renderReview,
    ];

    return (
        <div className="p-8 bg-white rounded-xl border">
            <StepIndicator currentStep={currentStep} goToStep={goToStep} />

            {stepContent[currentStep]()}

            {/* Navigation */}
            <div className="flex items-center justify-between pt-6 mt-6 border-t">
                <button
                    type="button"
                    onClick={currentStep === 0 ? handleCancel : prevStep}
                    className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition"
                >
                    <ChevronLeft size={16} />
                    {currentStep === 0 ? "Cancel" : "Previous"}
                </button>

                {currentStep < STEP_LABELS.length - 1 ? (
                    <button
                        type="button"
                        onClick={nextStep}
                        className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
                    >
                        Next
                        <ChevronRight size={16} />
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="flex items-center gap-2 px-6 py-2.5 text-sm font-bold bg-green-600 text-white rounded-lg hover:bg-green-700 transition disabled:opacity-60"
                    >
                        {loading ? (
                            <>
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Creating...
                            </>
                        ) : (
                            <>
                                <Check size={16} />
                                Create Job
                            </>
                        )}
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
    <div className="p-4 rounded-lg bg-gray-50 border border-gray-100">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">{title}</h3>
        <div className="space-y-1">{children}</div>
    </div>
);

const ReviewRow = ({ label, value }: { label: string; value: string }) => (
    <div className="flex gap-3 text-sm">
        <span className="text-gray-500 min-w-[120px]">{label}:</span>
        <span className="text-gray-800 font-medium">{value || "—"}</span>
    </div>
);

export default CreateJobForm;
