import { useState, useEffect } from "react";
import ModalWrapper from "@/components/ui/ModalWrapper";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingSelect from "@/components/ui/FloatingSelect";
import FloatingTextarea from "@/components/ui/FloatingTextarea";
import { useRecordExternalPlacement } from "@/hooks/collegeadmin/placements/useRecordExternalPlacement";
import { useViewCompanies } from "@/hooks/collegeadmin/company_management/useViewCompanies";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import {
    PLACEMENT_TYPE_OPTIONS,
    PLACEMENT_TYPE_LABELS,
} from "@/validators/PlacementSchema";
import { DRIVE_TYPE_OPTIONS, DRIVE_TYPE_LABELS } from "@/validators/JobPostingSchema";
import {
    ExternalLink,
    Briefcase,
    GraduationCap,
    Search,
    Loader2,
} from "lucide-react";

// ========================
// STUDENT PICKER
// ========================

interface StudentOption {
    student_id: string;
    first_name: string;
    last_name: string;
    student_email: string;
    enrollment_number: string | null;
    dept_name: string | null;
}

const StudentPicker = ({
    selectedId,
    onSelect,
}: {
    selectedId: string;
    onSelect: (student: StudentOption | null) => void;
}) => {
    const [search, setSearch] = useState("");
    const [students, setStudents] = useState<StudentOption[]>([]);
    const [loading, setLoading] = useState(false);
    const [selected, setSelected] = useState<StudentOption | null>(null);
    const [searchError, setSearchError] = useState(false);

    useEffect(() => {
        if (!search.trim() || search.trim().length < 2) {
            setStudents([]);
            setSearchError(false);
            return;
        }

        const timer = setTimeout(async () => {
            setLoading(true);
            setSearchError(false);
            try {
                const res = await CollegeAdminService.getAllStudents({
                    search: search.trim(),
                    limit: 10,
                });
                setStudents(Array.isArray(res.data) ? res.data : []);
            } catch {
                setStudents([]);
                setSearchError(true);
            } finally {
                setLoading(false);
            }
        }, 300);

        return () => clearTimeout(timer);
    }, [search]);

    if (selected || selectedId) {
        return (
            <div className="flex items-center gap-3 px-3.5 py-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800">
                <div className="h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                        {selected ? selected.first_name.charAt(0).toUpperCase() : "?"}
                    </span>
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate">
                        {selected ? `${selected.first_name} ${selected.last_name}` : "Selected"}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                        {selected?.student_email}
                        {selected?.enrollment_number && ` · ${selected.enrollment_number}`}
                        {selected?.dept_name && ` · ${selected.dept_name}`}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => {
                        setSelected(null);
                        onSelect(null);
                        setSearch("");
                    }}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition px-2 py-1 rounded-lg hover:bg-blue-100"
                >
                    Change
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-2">
            <label htmlFor="ext-student-search" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Select Student <span className="text-red-500">*</span>
            </label>
            <div className="relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                    id="ext-student-search"
                    type="text"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search by name, email, enrollment..."
                    className="w-full border border-gray-300 dark:border-gray-700 rounded-xl pl-9 pr-4 py-2.5 text-sm bg-white dark:bg-gray-800 dark:text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                />
            </div>
            {(search.trim().length >= 2) && (
                <div className="max-h-48 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700">
                    {loading && (
                        <div className="flex items-center justify-center py-6">
                            <Loader2 className="h-5 w-5 animate-spin text-blue-500" />
                        </div>
                    )}
                    {!loading && !searchError && students.length === 0 && (
                        <div className="text-center py-6 text-sm text-gray-400 dark:text-gray-500">
                            No matching students
                        </div>
                    )}
                    {!loading && searchError && (
                        <div className="text-center py-6 text-sm text-red-500 dark:text-red-400">
                            Failed to search students. Please try again.
                        </div>
                    )}
                    {!loading && students.map((s) => (
                        <button
                            key={s.student_id}
                            type="button"
                            onClick={() => {
                                setSelected(s);
                                onSelect(s);
                            }}
                            className="w-full flex items-center gap-3 px-3.5 py-2.5 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition text-left border-b border-gray-50 dark:border-gray-800 last:border-0"
                        >
                            <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-700 flex items-center justify-center flex-shrink-0">
                                <span className="text-xs font-bold text-gray-600 dark:text-gray-400">
                                    {s.first_name.charAt(0).toUpperCase()}
                                </span>
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-800 dark:text-gray-200 truncate">{s.first_name} {s.last_name}</p>
                                <p className="text-xs text-gray-400 dark:text-gray-500 truncate">
                                    {s.enrollment_number}
                                    {s.dept_name && ` · ${s.dept_name}`}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
};

// ========================
// MODAL
// ========================

interface RecordExternalPlacementModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
}

const RecordExternalPlacementModal = ({ isOpen, onClose, onSuccess }: RecordExternalPlacementModalProps) => {
    const { formData, errors, loading, handleChange, handleSubmit, reset, setFormData } = useRecordExternalPlacement(() => {
        reset();
        onSuccess();
    });

    const { companies: activeCompanies, loading: companiesLoading } = useViewCompanies({ limit: 200, status: "active" });

    const showFulltime = formData.placement_type === "full-time" || formData.placement_type === "both";
    const showInternship = formData.placement_type === "internship" || formData.placement_type === "both";

    const handleClose = () => {
        reset();
        onClose();
    };

    if (!isOpen) return null;

    return (
        <ModalWrapper
            isOpen
            onClose={handleClose}
            disabled={loading}
            title="Record External Placement"
            titleIcon={<ExternalLink className="h-5 w-5 text-amber-600" />}
            size="xl"
        >
            <div className="p-6 space-y-4">
                {/* Info banner */}
                <div className="rounded-xl border border-amber-100 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-900/10 p-3">
                    <p className="text-xs text-amber-700 dark:text-amber-400">
                        Record an off-campus, pool campus, or PPO placement. This will create a job record, application, and placement in one step.
                        Active applications will be auto-withdrawn per your policy.
                    </p>
                </div>

                {/* Student picker */}
                <StudentPicker
                    key={formData.student_id || "empty"}
                    selectedId={formData.student_id}
                    onSelect={(s) => setFormData((prev) => ({ ...prev, student_id: s?.student_id || "" }))}
                />
                {errors.student_id && <p className="text-xs text-red-500 -mt-2">{errors.student_id}</p>}

                {/* Company */}
                <FloatingSelect
                    label="Company"
                    name="company_id"
                    value={formData.company_id}
                    onChange={handleChange}
                    error={errors.company_id}
                    disabled={companiesLoading || loading}
                    options={(activeCompanies || []).map((c) => ({ value: c.company_id, label: c.company_name }))}
                    required
                />

                {/* Job Title + Location */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <FloatingInput
                        label="Job Title"
                        name="job_title"
                        value={formData.job_title}
                        onChange={handleChange}
                        error={errors.job_title}
                        placeholder="e.g. Software Engineer"
                        maxLength={300}
                        required
                        disabled={loading}
                    />
                    <FloatingInput
                        label="Location"
                        name="job_location"
                        value={formData.job_location}
                        onChange={handleChange}
                        placeholder="e.g. Bangalore"
                        maxLength={300}
                        disabled={loading}
                    />
                </div>

                {/* Drive Type + Placement Type */}
                <div className="grid grid-cols-2 gap-3">
                    <FloatingSelect
                        label="Drive Type"
                        name="drive_type"
                        value={formData.drive_type}
                        onChange={handleChange}
                        options={DRIVE_TYPE_OPTIONS.map((t) => ({ value: t, label: DRIVE_TYPE_LABELS[t] }))}
                        disabled={loading}
                    />
                    <FloatingSelect
                        label="Placement Type"
                        name="placement_type"
                        value={formData.placement_type}
                        onChange={handleChange}
                        options={PLACEMENT_TYPE_OPTIONS.map((t) => ({ value: t, label: PLACEMENT_TYPE_LABELS[t] }))}
                        required
                        disabled={loading}
                    />
                </div>

                {/* Full-time fields */}
                {showFulltime && (
                    <div className="space-y-3 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800">
                        <p className="text-xs font-semibold text-blue-700 dark:text-blue-400 uppercase tracking-wider flex items-center gap-1.5">
                            <Briefcase className="h-3.5 w-3.5" />
                            Full-Time Details
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <FloatingInput
                                label="Package (₹)"
                                name="fulltime_package"
                                type="number"
                                value={formData.fulltime_package}
                                onChange={handleChange}
                                error={errors.fulltime_package}
                                placeholder="e.g. 650000"
                                required
                                disabled={loading}
                            />
                            <FloatingInput
                                label="Designation"
                                name="fulltime_designation"
                                value={formData.fulltime_designation}
                                onChange={handleChange}
                                placeholder="e.g. Software Engineer"
                                disabled={loading}
                            />
                        </div>
                        <FloatingInput
                            label="Joining Date"
                            name="fulltime_joining_date"
                            type="date"
                            value={formData.fulltime_joining_date}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                )}

                {/* Internship fields */}
                {showInternship && (
                    <div className="space-y-3 p-4 rounded-xl bg-purple-50/50 dark:bg-purple-900/10 border border-purple-100 dark:border-purple-800">
                        <p className="text-xs font-semibold text-purple-700 dark:text-purple-400 uppercase tracking-wider flex items-center gap-1.5">
                            <GraduationCap className="h-3.5 w-3.5" />
                            Internship Details
                        </p>
                        <div className="grid grid-cols-2 gap-3">
                            <FloatingInput
                                label="Stipend (₹/month)"
                                name="internship_stipend"
                                type="number"
                                value={formData.internship_stipend}
                                onChange={handleChange}
                                error={errors.internship_stipend}
                                placeholder="e.g. 25000"
                                required
                                disabled={loading}
                            />
                            <FloatingInput
                                label="Duration"
                                name="internship_duration"
                                value={formData.internship_duration}
                                onChange={handleChange}
                                placeholder="e.g. 6 months"
                                disabled={loading}
                            />
                        </div>
                        <FloatingInput
                            label="Start Date"
                            name="internship_start_date"
                            type="date"
                            value={formData.internship_start_date}
                            onChange={handleChange}
                            disabled={loading}
                        />
                    </div>
                )}

                {/* Offer letter URL */}
                <FloatingInput
                    label="Offer Letter URL"
                    name="offer_letter_url"
                    type="url"
                    value={formData.offer_letter_url}
                    onChange={handleChange}
                    placeholder="https://..."
                    disabled={loading}
                />

                {/* Remarks */}
                <FloatingTextarea
                    label="Remarks"
                    name="remarks"
                    value={formData.remarks}
                    onChange={handleChange}
                    placeholder="Add any notes about this placement..."
                    rows={2}
                    maxLength={2000}
                    disabled={loading}
                />

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                    <button type="button" onClick={handleClose} disabled={loading} className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-xl hover:bg-gray-200 dark:hover:bg-gray-600 transition disabled:opacity-50">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading || !formData.student_id || !formData.company_id}
                        className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-amber-600 rounded-xl hover:bg-amber-700 transition disabled:opacity-50 inline-flex items-center justify-center gap-2"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Recording..." : "Record Placement"}
                    </button>
                </div>
            </div>
        </ModalWrapper>
    );
};

export default RecordExternalPlacementModal;
