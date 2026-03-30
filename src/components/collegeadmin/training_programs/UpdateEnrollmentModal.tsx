import {
    Loader2,
    User,
} from "lucide-react";
import { useReducedMotion, motion } from "framer-motion";
import ModalWrapper from "@/components/ui/ModalWrapper";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingSelect from "@/components/ui/FloatingSelect";
import {
    ENROLLMENT_STATUS_OPTIONS,
    ENROLLMENT_STATUS_LABELS,
    type UpdateEnrollmentInput,
} from "@/validators/TrainingProgramSchema";

// ========================
// TYPES
// ========================

type FormErrors = Partial<Record<string, string>>;

interface UpdateEnrollmentModalProps {
    isOpen: boolean;
    formData: UpdateEnrollmentInput;
    errors: FormErrors;
    loading: boolean;
    studentName?: string;
    studentEmail?: string;
    totalSessions?: number;
    handleChange: (name: string, value: unknown) => void;
    handleSubmit: () => void;
    handleClose: () => void;
}

// ========================
// CONSTANTS
// ========================

const STATUS_OPTIONS = [
    { value: "", label: "" },
    ...ENROLLMENT_STATUS_OPTIONS.map((s) => ({
        value: s,
        label: ENROLLMENT_STATUS_LABELS[s],
    })),
];

// ========================
// COMPONENT
// ========================

const UpdateEnrollmentModal = ({
    isOpen,
    formData,
    errors,
    loading,
    studentName,
    studentEmail,
    totalSessions,
    handleChange,
    handleSubmit,
    handleClose,
}: Readonly<UpdateEnrollmentModalProps>) => {
    const shouldReduce = useReducedMotion();

    const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        handleChange(e.target.name, e.target.value);
    };

    const footer = (
        <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
            <button
                type="button"
                onClick={handleClose}
                disabled={loading}
                className="px-5 py-2 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition disabled:opacity-40"
            >
                Cancel
            </button>
            {shouldReduce ? (
                <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition shadow-sm shadow-blue-200 dark:shadow-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? "Saving..." : "Save Changes"}
                </button>
            ) : (
                <motion.button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    whileTap={{ scale: 0.97 }}
                    className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-xl text-sm font-medium transition shadow-sm shadow-blue-200 dark:shadow-none disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? "Saving..." : "Save Changes"}
                </motion.button>
            )}
        </div>
    );

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={handleClose}
            disabled={loading}
            size="md"
            title="Update Enrollment"
            titleIcon={<User className="h-5 w-5 text-blue-600 dark:text-blue-400" />}
            footer={footer}
        >
            {/* Student Info */}
            {studentName && (
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-800/50 flex items-center gap-3">
                    <div className="h-8 w-8 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                        <User className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-sm font-medium text-gray-800 dark:text-gray-100">{studentName}</p>
                        {studentEmail && <p className="text-xs text-gray-500 dark:text-gray-400">{studentEmail}</p>}
                    </div>
                </div>
            )}

            {/* Form */}
            <div className="px-6 py-5 space-y-4">
                <div className="grid grid-cols-2 gap-4">
                    <FloatingInput
                        label={totalSessions ? `Sessions Attended (out of ${totalSessions})` : "Sessions Attended"}
                        name="sessions_attended"
                        type="number"
                        value={formData.sessions_attended ?? ""}
                        onChange={onChange}
                        error={errors.sessions_attended}
                    />
                    <FloatingInput
                        label="Completion %"
                        name="completion_percentage"
                        type="number"
                        value={formData.completion_percentage ?? ""}
                        onChange={onChange}
                        error={errors.completion_percentage}
                    />
                </div>

                <FloatingSelect
                    label="Status"
                    name="completion_status"
                    value={formData.completion_status ?? ""}
                    onChange={onChange}
                    options={STATUS_OPTIONS}
                    error={errors.completion_status}
                />

                {/* Certificate */}
                <div className="space-y-3">
                    <label className="flex items-center gap-2 cursor-pointer">
                        <input
                            type="checkbox"
                            checked={formData.certificate_issued ?? false}
                            onChange={(e) => handleChange("certificate_issued", e.target.checked)}
                            aria-label="Certificate issued"
                            className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500/30"
                        />
                        <span className="text-sm text-gray-700 dark:text-gray-300">Certificate Issued</span>
                    </label>

                    {formData.certificate_issued && (
                        <FloatingInput
                            label="Certificate URL"
                            name="certificate_url"
                            value={formData.certificate_url ?? ""}
                            onChange={onChange}
                            error={errors.certificate_url}
                        />
                    )}
                </div>
            </div>
        </ModalWrapper>
    );
};

export default UpdateEnrollmentModal;
