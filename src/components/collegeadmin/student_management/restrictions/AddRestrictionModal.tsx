import { useState, useCallback, useRef, useEffect } from "react";
import { Loader2, Search, User, ShieldAlert } from "lucide-react";
import ModalWrapper from "@/components/ui/ModalWrapper";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingSelect from "@/components/ui/FloatingSelect";
import FloatingTextarea from "@/components/ui/FloatingTextarea";
import { useAddRestriction } from "@/hooks/collegeadmin/student_management/restrictions/useAddRestriction";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import {
    RESTRICTION_TYPE_OPTIONS,
    RESTRICTION_TYPE_LABELS,
} from "@/validators/RestrictionSchema";

interface AddRestrictionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    preSelectedStudentId?: string;
    preSelectedStudentName?: string;
}

interface StudentSearchResult {
    student_id: string;
    first_name: string;
    last_name: string;
    student_email: string;
    dept_name: string;
    student_passout_year: number;
}

const RESTRICTION_OPTIONS = RESTRICTION_TYPE_OPTIONS.map((type) => ({
    value: type,
    label: RESTRICTION_TYPE_LABELS[type],
}));

export default function AddRestrictionModal({
    isOpen,
    onClose,
    onSuccess,
    preSelectedStudentId,
    preSelectedStudentName,
}: Readonly<AddRestrictionModalProps>) {
    const hasPreSelected = !!preSelectedStudentId;

    // Student search state (only used when no pre-selected student)
    const [studentSearch, setStudentSearch] = useState("");
    const [searchResults, setSearchResults] = useState<StudentSearchResult[]>([]);
    const [searching, setSearching] = useState(false);
    const [selectedStudent, setSelectedStudent] = useState<StudentSearchResult | null>(null);
    const searchTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const { formData, errors, loading, handleChange, handleSubmit, resetForm } = useAddRestriction(onSuccess);

    const isDirty = !!(formData.restriction_type || formData.reason || formData.details || formData.valid_until);

    const handleClose = useCallback(() => {
        if (isDirty && !globalThis.confirm("You have unsaved changes. Discard and close?")) return;
        onClose();
    }, [isDirty, onClose]);

    // Reset state when modal opens/closes
    useEffect(() => {
        if (!isOpen) {
            setStudentSearch("");
            setSearchResults([]);
            setSelectedStudent(null);
            resetForm();
        }
    }, [isOpen, resetForm]);

    // Debounced student search
    const handleStudentSearch = useCallback((value: string) => {
        setStudentSearch(value);
        if (searchTimerRef.current) clearTimeout(searchTimerRef.current);
        if (!value.trim()) {
            setSearchResults([]);
            return;
        }
        searchTimerRef.current = setTimeout(async () => {
            setSearching(true);
            try {
                const res = await CollegeAdminService.getAllStudents({ search: value, limit: 10 });
                const students = Array.isArray(res?.data) ? res.data : [];
                setSearchResults(students);
            } catch {
                setSearchResults([]);
            } finally {
                setSearching(false);
            }
        }, 300);
    }, []);

    const handleSelectStudent = useCallback((student: StudentSearchResult) => {
        setSelectedStudent(student);
        setStudentSearch("");
        setSearchResults([]);
    }, []);

    const handleFormSubmit = useCallback(
        (e: React.FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const targetId = preSelectedStudentId || selectedStudent?.student_id;
            if (!targetId) return;
            handleSubmit(targetId);
        },
        [preSelectedStudentId, selectedStudent, handleSubmit],
    );

    const resolvedStudentId = preSelectedStudentId || selectedStudent?.student_id;
    const resolvedStudentName =
        preSelectedStudentName ||
        (selectedStudent ? `${selectedStudent.first_name} ${selectedStudent.last_name}` : "");

    const showForm = hasPreSelected || !!selectedStudent;

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={handleClose}
            disabled={loading}
            title="Add Student Restriction"
            titleIcon={<ShieldAlert className="h-5 w-5 text-red-500" />}
            size="lg"
        >
            <form onSubmit={handleFormSubmit}>
                <div className="p-6 space-y-5">
                    {/* Student Selection */}
                    {!hasPreSelected && !selectedStudent && (
                        <div>
                            <label htmlFor="student-search-input" className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                                Select Student <span className="text-red-500">*</span>
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                                <input
                                    id="student-search-input"
                                    type="text"
                                    value={studentSearch}
                                    onChange={(e) => handleStudentSearch(e.target.value)}
                                    placeholder="Search by student name or email..."
                                    className="w-full pl-9 pr-4 py-2.5 rounded-xl text-sm border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition"
                                    autoFocus
                                />
                            </div>
                            {searching && (
                                <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                                    Searching...
                                </div>
                            )}
                            {searchResults.length > 0 && (
                                <div className="mt-2 max-h-48 overflow-y-auto rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 shadow-lg">
                                    {searchResults.map((s) => (
                                        <button
                                            key={s.student_id}
                                            type="button"
                                            onClick={() => handleSelectStudent(s)}
                                            className="w-full flex items-center gap-3 px-4 py-3 text-left hover:bg-blue-50/50 dark:hover:bg-blue-900/10 transition-colors cursor-pointer border-b border-gray-50 dark:border-gray-800 last:border-0"
                                        >
                                            <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                                            </div>
                                            <div className="min-w-0 flex-1">
                                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
                                                    {s.first_name} {s.last_name}
                                                </p>
                                                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                                                    {s.student_email} · {s.dept_name} · {s.student_passout_year}
                                                </p>
                                            </div>
                                        </button>
                                    ))}
                                </div>
                            )}
                            {studentSearch && !searching && searchResults.length === 0 && (
                                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                                    No students found matching "{studentSearch}"
                                </p>
                            )}
                        </div>
                    )}

                    {/* Selected Student Banner */}
                    {showForm && (
                        <div className="flex items-center gap-3 p-3 rounded-xl bg-blue-50 dark:bg-blue-900/15 border border-blue-100 dark:border-blue-800">
                            <div className="h-9 w-9 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
                                <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{resolvedStudentName}</p>
                                {selectedStudent && (
                                    <p className="text-xs text-gray-500 dark:text-gray-400">
                                        {selectedStudent.student_email} · {selectedStudent.dept_name}
                                    </p>
                                )}
                            </div>
                            {!hasPreSelected && (
                                <button
                                    type="button"
                                    onClick={() => setSelectedStudent(null)}
                                    className="text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition cursor-pointer"
                                >
                                    Change
                                </button>
                            )}
                        </div>
                    )}

                    {/* Restriction Form */}
                    {showForm && (
                        <>
                            <FloatingSelect
                                label="Restriction Type"
                                name="restriction_type"
                                value={formData.restriction_type}
                                onChange={handleChange}
                                error={errors.restriction_type}
                                options={RESTRICTION_OPTIONS}
                                required
                            />

                            <FloatingTextarea
                                label="Reason"
                                name="reason"
                                value={formData.reason}
                                onChange={handleChange}
                                error={errors.reason}
                                placeholder="Explain why this restriction is being applied..."
                                maxLength={1000}
                                rows={3}
                                required
                            />

                            <FloatingTextarea
                                label="Additional Details"
                                name="details"
                                value={formData.details}
                                onChange={handleChange}
                                error={errors.details}
                                placeholder="Additional context, timeline, evidence (optional)"
                                maxLength={2000}
                                rows={4}
                            />

                            <FloatingInput
                                label="Valid Until"
                                name="valid_until"
                                type="date"
                                value={formData.valid_until}
                                onChange={handleChange}
                                error={errors.valid_until}
                                min={new Date().toISOString().split("T")[0]}
                                placeholder=""
                            />
                            <p className="text-xs text-gray-500 dark:text-gray-400 -mt-3">
                                Leave empty for "until manually resolved"
                            </p>
                        </>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={handleClose}
                        disabled={loading}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-40 cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="submit"
                        disabled={loading || !resolvedStudentId}
                        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-red-600 rounded-xl hover:bg-red-700 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Applying..." : "Apply Restriction"}
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
}
