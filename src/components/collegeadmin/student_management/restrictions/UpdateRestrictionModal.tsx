import { useEffect, useMemo, useCallback } from "react";
import { Loader2, Pencil } from "lucide-react";
import ModalWrapper from "@/components/ui/ModalWrapper";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingTextarea from "@/components/ui/FloatingTextarea";
import { useUpdateRestriction } from "@/hooks/collegeadmin/student_management/restrictions/useUpdateRestriction";
import {
    RESTRICTION_TYPE_LABELS,
    type CollegeRestrictionListItem,
    type StudentRestriction,
} from "@/validators/RestrictionSchema";

interface UpdateRestrictionModalProps {
    isOpen: boolean;
    restriction: CollegeRestrictionListItem | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function UpdateRestrictionModal({
    isOpen,
    restriction,
    onClose,
    onSuccess,
}: Readonly<UpdateRestrictionModalProps>) {
    const { formData, errors, loading, loadRestriction, handleChange, handleSubmit, resetForm } =
        useUpdateRestriction(onSuccess);

    const originalData = useMemo(() => ({
        reason: restriction?.reason ?? "",
        details: restriction?.details ?? "",
        valid_until: restriction?.valid_until ?? "",
    }), [restriction]);

    const isDirty = formData.reason !== originalData.reason
        || formData.details !== originalData.details
        || formData.valid_until !== originalData.valid_until;

    const handleClose = useCallback(() => {
        if (isDirty && !globalThis.confirm("You have unsaved changes. Discard and close?")) return;
        onClose();
    }, [isDirty, onClose]);

    // Load restriction data when modal opens
    useEffect(() => {
        if (isOpen && restriction) {
            loadRestriction(restriction as unknown as StudentRestriction);
        }
        if (!isOpen) {
            resetForm();
        }
    }, [isOpen, restriction, loadRestriction, resetForm]);

    if (!restriction) return null;

    const handleFormSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSubmit(restriction.restriction_id, restriction.student_id);
    };

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={handleClose}
            disabled={loading}
            title={`Edit Restriction — ${restriction.student_name}`}
            titleIcon={<Pencil className="h-5 w-5 text-blue-500" />}
            size="lg"
        >
            <form onSubmit={handleFormSubmit}>
                <div className="p-6 space-y-5">
                    {/* Type info (read-only) */}
                    <div className="p-3 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                        <p className="text-xs text-gray-500 dark:text-gray-400 mb-0.5">Restriction Type</p>
                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                            {RESTRICTION_TYPE_LABELS[restriction.restriction_type]}
                        </p>
                    </div>

                    <FloatingTextarea
                        label="Reason"
                        name="reason"
                        value={formData.reason}
                        onChange={handleChange}
                        error={errors.reason}
                        placeholder="Update the reason for this restriction..."
                        maxLength={1000}
                        rows={3}
                    />

                    <FloatingTextarea
                        label="Additional Details"
                        name="details"
                        value={formData.details}
                        onChange={handleChange}
                        error={errors.details}
                        placeholder="Update additional context (optional)"
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
                        Leave empty to remove the expiry date
                    </p>
                </div>

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
                        disabled={loading}
                        className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading ? "Saving..." : "Save Changes"}
                    </button>
                </div>
            </form>
        </ModalWrapper>
    );
}
