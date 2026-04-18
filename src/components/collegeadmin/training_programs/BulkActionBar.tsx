import { useState } from "react";
import { CheckSquare, Loader2, X } from "lucide-react";
import {
    ENROLLMENT_STATUS_OPTIONS,
    ENROLLMENT_STATUS_LABELS,
    PAYMENT_STATUS_OPTIONS,
    PAYMENT_STATUS_LABELS,
} from "@/validators/TrainingProgramSchema";
import type { BulkAction } from "@/hooks/collegeadmin/training_programs/useBulkUpdateEnrollments";

interface BulkActionBarProps {
    selectedCount: number;
    isUpdating: boolean;
    onApply: (action: BulkAction) => void;
    onClear: () => void;
}

const BulkActionBar = ({ selectedCount, isUpdating, onApply, onClear }: Readonly<BulkActionBarProps>) => {
    const [actionType, setActionType] = useState<"status" | "payment" | "certificate">("status");
    const [selectedValue, setSelectedValue] = useState("");
    const [amountPaid, setAmountPaid] = useState("");

    if (selectedCount === 0) return null;

    const handleApply = () => {
        if (!selectedValue && actionType !== "certificate") return;

        if (actionType === "status") {
            onApply({ completion_status: selectedValue as BulkAction["completion_status"] });
        } else if (actionType === "payment") {
            const action: BulkAction = { payment_status: selectedValue as BulkAction["payment_status"] };
            if (amountPaid !== "" && Number(amountPaid) >= 0) {
                action.amount_paid = Number(amountPaid);
            }
            onApply(action);
        } else {
            onApply({ certificate_issued: true });
        }
        setSelectedValue("");
        setAmountPaid("");
    };

    return (
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-40 bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-700 shadow-xl px-5 py-3 flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2">
                <CheckSquare className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span className="text-sm font-semibold text-gray-800 dark:text-gray-100">
                    {selectedCount} selected
                </span>
            </div>

            <div className="h-5 w-px bg-gray-200 dark:bg-gray-700" />

            {/* Action type selector */}
            <select
                value={actionType}
                onChange={(e) => { setActionType(e.target.value as "status" | "payment" | "certificate"); setSelectedValue(""); setAmountPaid(""); }}
                aria-label="Bulk action type"
                className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
            >
                <option value="status">Change Status</option>
                <option value="payment">Change Payment</option>
                <option value="certificate">Issue Certificates</option>
            </select>

            {/* Value selector */}
            {actionType === "status" && (
                <select
                    value={selectedValue}
                    onChange={(e) => setSelectedValue(e.target.value)}
                    aria-label="New status"
                    className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                >
                    <option value="">Select status…</option>
                    {ENROLLMENT_STATUS_OPTIONS.filter((s) => s !== "enrolled").map((s) => (
                        <option key={s} value={s}>{ENROLLMENT_STATUS_LABELS[s]}</option>
                    ))}
                </select>
            )}
            {actionType === "payment" && (
                <>
                    <select
                        value={selectedValue}
                        onChange={(e) => setSelectedValue(e.target.value)}
                        aria-label="New payment status"
                        className="rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                    >
                        <option value="">Select payment…</option>
                        {PAYMENT_STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>{PAYMENT_STATUS_LABELS[s]}</option>
                        ))}
                    </select>
                    {(selectedValue === "paid" || selectedValue === "refunded") && (
                        <input
                            type="number"
                            min="0"
                            value={amountPaid}
                            onChange={(e) => setAmountPaid(e.target.value)}
                            placeholder="Amount (₹)"
                            aria-label="Amount paid"
                            className="w-28 rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 px-2 py-1.5 text-xs text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
                        />
                    )}
                </>
            )}

            {/* Apply */}
            <button
                type="button"
                onClick={handleApply}
                disabled={isUpdating || (actionType !== "certificate" && !selectedValue)}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {isUpdating && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                Apply
            </button>

            {/* Clear */}
            <button
                type="button"
                onClick={onClear}
                disabled={isUpdating}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 dark:hover:bg-gray-800 transition"
                aria-label="Clear selection"
            >
                <X className="h-4 w-4" />
            </button>
        </div>
    );
};

export default BulkActionBar;
