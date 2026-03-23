import { Loader2, ShieldCheck } from "lucide-react";
import ModalWrapper from "@/components/ui/ModalWrapper";
import { useUpdateRestriction } from "@/hooks/collegeadmin/student_management/restrictions/useUpdateRestriction";
import {
    RESTRICTION_TYPE_LABELS,
    type CollegeRestrictionListItem,
} from "@/validators/RestrictionSchema";

interface ResolveRestrictionModalProps {
    isOpen: boolean;
    restriction: CollegeRestrictionListItem | null;
    onClose: () => void;
    onSuccess: () => void;
}

export default function ResolveRestrictionModal({
    isOpen,
    restriction,
    onClose,
    onSuccess,
}: ResolveRestrictionModalProps) {
    const { loading, handleResolve } = useUpdateRestriction(onSuccess);

    if (!restriction) return null;

    const isBlockingType =
        restriction.restriction_type === "bar_from_placements" ||
        restriction.restriction_type === "temporary_suspension";

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={onClose}
            disabled={loading}
            title="Resolve Restriction"
            titleIcon={<ShieldCheck className="h-5 w-5 text-emerald-500" />}
            size="md"
        >
            <div className="p-6">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure you want to resolve this{" "}
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {RESTRICTION_TYPE_LABELS[restriction.restriction_type]}
                    </span>{" "}
                    restriction for{" "}
                    <span className="font-semibold text-gray-900 dark:text-gray-100">
                        {restriction.student_name}
                    </span>?
                </p>

                <div className="mt-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4">
                    <div className="flex items-start gap-2">
                        <ShieldCheck className="h-4 w-4 text-emerald-500 mt-0.5 flex-shrink-0" />
                        <div>
                            <p className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 mb-1.5">This action will:</p>
                            <ul className="space-y-1 text-xs text-emerald-600 dark:text-emerald-400">
                                <li>• Remove the active restriction from this student</li>
                                {isBlockingType && (
                                    <li>• Allow the student to apply for placements again</li>
                                )}
                                <li>• Record you as the resolver</li>
                                <li>• You can add a new restriction at any time if needed</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>

            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={loading}
                    className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition disabled:opacity-40 cursor-pointer"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={() => handleResolve(restriction.restriction_id, restriction.student_id)}
                    disabled={loading}
                    className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer"
                >
                    {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                    {loading ? "Resolving..." : "Resolve Restriction"}
                </button>
            </div>
        </ModalWrapper>
    );
}
