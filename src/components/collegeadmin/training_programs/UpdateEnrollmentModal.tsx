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
    ENROLLMENT_VALID_TRANSITIONS,
    PAYMENT_STATUS_OPTIONS,
    PAYMENT_STATUS_LABELS,
    type EnrollmentStatus,
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
    currentStatus?: string;
    handleChange: (name: string, value: unknown) => void;
    handleSubmit: () => void;
    handleClose: () => void;
}

// ========================
// HELPERS
// ========================

function getStatusOptions(currentStatus?: string): { value: string; label: string }[] {
    const base = [{ value: "", label: "" }];
    if (!currentStatus) {
        return [
            ...base,
            ...ENROLLMENT_STATUS_OPTIONS.map((s) => ({
                value: s,
                label: ENROLLMENT_STATUS_LABELS[s],
            })),
        ];
    }
    const valid = ENROLLMENT_VALID_TRANSITIONS[currentStatus as EnrollmentStatus] ?? [];
    // Include current status + valid transitions
    const allowed = [currentStatus as EnrollmentStatus, ...valid];
    return [
        ...base,
        ...allowed.map((s) => ({
            value: s,
            label: ENROLLMENT_STATUS_LABELS[s],
        })),
    ];
}

const PAYMENT_STATUS_SELECT_OPTIONS = [
    { value: "", label: "" },
    ...PAYMENT_STATUS_OPTIONS.map((s) => ({
        value: s,
        label: PAYMENT_STATUS_LABELS[s],
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
    currentStatus,
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
                <FloatingSelect
                    label="Status"
                    name="completion_status"
                    value={formData.completion_status ?? ""}
                    onChange={onChange}
                    options={getStatusOptions(currentStatus)}
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

                {/* Payment */}
                <div className="grid grid-cols-2 gap-4">
                    <FloatingSelect
                        label="Payment Status"
                        name="payment_status"
                        value={formData.payment_status ?? ""}
                        onChange={onChange}
                        options={PAYMENT_STATUS_SELECT_OPTIONS}
                        error={errors.payment_status}
                    />
                    <FloatingInput
                        label="Amount Paid (₹)"
                        name="amount_paid"
                        type="number"
                        value={formData.amount_paid ?? ""}
                        onChange={onChange}
                        error={errors.amount_paid}
                    />
                </div>
            </div>
        </ModalWrapper>
    );
};

export default UpdateEnrollmentModal;
