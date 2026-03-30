import { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
    Shield, AlertTriangle, Calendar, User, CheckCircle, Clock,
    ExternalLink, Pencil, ShieldCheck, MessageSquare,
} from "lucide-react";
import ModalWrapper from "@/components/ui/ModalWrapper";
import {
    RESTRICTION_TYPE_LABELS,
    RESTRICTION_TYPE_COLORS,
    RESTRICTION_SEVERITY,
    type CollegeRestrictionListItem,
} from "@/validators/RestrictionSchema";
import ResolveRestrictionModal from "./ResolveRestrictionModal";
import UpdateRestrictionModal from "./UpdateRestrictionModal";

interface RestrictionDetailModalProps {
    restriction: CollegeRestrictionListItem | null;
    onClose: () => void;
}

function formatDate(d: string | null): string {
    if (!d) return "—";
    return new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });
}

function getDaysLeft(validUntil: string | null): string | null {
    if (!validUntil) return null;
    const diff = new Date(validUntil).getTime() - Date.now();
    if (diff <= 0) return "Expired";
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days === 1 ? "1 day left" : `${days} days left`;
}

function getSeverityIcon(type: CollegeRestrictionListItem["restriction_type"]) {
    const severity = RESTRICTION_SEVERITY[type];
    if (severity === "high") return { Icon: Shield, color: "text-red-500 dark:text-red-400" };
    if (severity === "medium") return { Icon: AlertTriangle, color: "text-amber-500 dark:text-amber-400" };
    return { Icon: AlertTriangle, color: "text-yellow-500 dark:text-yellow-400" };
}

export default function RestrictionDetailModal({ restriction, onClose }: Readonly<RestrictionDetailModalProps>) {
    const navigate = useNavigate();
    const [showResolve, setShowResolve] = useState(false);
    const [showEdit, setShowEdit] = useState(false);

    if (!restriction) return null;

    const typeColor = RESTRICTION_TYPE_COLORS[restriction.restriction_type];
    const severity = getSeverityIcon(restriction.restriction_type);
    const SeverityIcon = severity.Icon;
    const daysLeft = getDaysLeft(restriction.valid_until);

    return (
        <>
            <ModalWrapper
                isOpen={!!restriction && !showResolve && !showEdit}
                onClose={onClose}
                title="Restriction Details"
                titleIcon={<SeverityIcon className={`h-5 w-5 ${severity.color}`} />}
                size="lg"
            >
                <div className="p-6 space-y-5">
                    {/* Type + Status Header */}
                    <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2">
                            <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${typeColor.bg}`}>
                                <SeverityIcon size={18} className={severity.color} />
                            </div>
                            <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${typeColor.bg} ${typeColor.text}`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${typeColor.dot}`} />
                                {RESTRICTION_TYPE_LABELS[restriction.restriction_type]}
                            </span>
                        </div>
                        {restriction.is_active ? (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-red-500"></span>
                                <span>Active</span>
                            </span>
                        ) : (
                            <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span>Resolved</span>
                            </span>
                        )}
                    </div>

                    {/* Student Info */}
                    <div className="p-4 rounded-xl bg-gray-50 dark:bg-gray-800/50 border border-gray-100 dark:border-gray-700">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <User className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">{restriction.student_name}</p>
                                <p className="text-xs text-gray-500 dark:text-gray-400">
                                    {restriction.student_email} · {restriction.dept_name} · Passout {restriction.student_passout_year}
                                </p>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    onClose();
                                    navigate(`/college/student/${restriction.student_id}`);
                                }}
                                className="inline-flex items-center gap-1 text-xs font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition cursor-pointer"
                            >
                                View Profile
                                <ExternalLink className="h-3 w-3" />
                            </button>
                        </div>
                    </div>

                    {/* Reason */}
                    <div>
                        <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Reason</h4>
                        <p className="text-sm text-gray-900 dark:text-gray-100">{restriction.reason}</p>
                    </div>

                    {/* Details */}
                    {restriction.details && (
                        <div>
                            <h4 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1.5">Additional Details</h4>
                            <p className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap">{restriction.details}</p>
                        </div>
                    )}

                    {/* Meta Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Applied On</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{formatDate(restriction.applied_on)}</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Valid Until</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                    {restriction.valid_until ? formatDate(restriction.valid_until) : "No expiry"}
                                    {restriction.is_active && daysLeft && (
                                        <span className={`ml-1.5 text-xs font-medium ${
                                            daysLeft === "Expired"
                                                ? "text-red-600 dark:text-red-400"
                                                : "text-amber-600 dark:text-amber-400"
                                        }`}>
                                            ({daysLeft})
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <User className="h-4 w-4 text-gray-400 dark:text-gray-500" />
                            <div>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Restricted By</p>
                                <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{restriction.restricted_by_name}</p>
                            </div>
                        </div>
                        {restriction.resolved_by_name && (
                            <div className="flex items-center gap-2">
                                <CheckCircle className="h-4 w-4 text-emerald-500" />
                                <div>
                                    <p className="text-xs text-gray-500 dark:text-gray-400">Resolved By</p>
                                    <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{restriction.resolved_by_name}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Appeal info */}
                    {restriction.appeal_submitted && (
                        <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-900/15 border border-amber-100 dark:border-amber-800">
                            <div className="flex items-center gap-2 mb-1">
                                <MessageSquare className="h-4 w-4 text-amber-500" />
                                <p className="text-xs font-semibold text-amber-700 dark:text-amber-400">Appeal Submitted</p>
                            </div>
                            <p className="text-xs text-amber-600 dark:text-amber-400">
                                Student has submitted an appeal for this restriction.
                            </p>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800 bg-gray-50 dark:bg-gray-800/50 flex items-center justify-end gap-3">
                    <button
                        type="button"
                        onClick={onClose}
                        className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-400 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl hover:bg-gray-50 dark:hover:bg-gray-700 transition cursor-pointer"
                    >
                        Close
                    </button>
                    {restriction.is_active && (
                        <>
                            <button
                                type="button"
                                onClick={() => setShowEdit(true)}
                                className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-xl hover:bg-blue-100 dark:hover:bg-blue-900/30 transition cursor-pointer"
                            >
                                <Pencil className="h-3.5 w-3.5" />
                                Edit
                            </button>
                            <button
                                type="button"
                                onClick={() => setShowResolve(true)}
                                className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-xl hover:bg-emerald-700 transition cursor-pointer"
                            >
                                <ShieldCheck className="h-4 w-4" />
                                Resolve
                            </button>
                        </>
                    )}
                </div>
            </ModalWrapper>

            {/* Resolve Modal */}
            <ResolveRestrictionModal
                isOpen={showResolve}
                restriction={restriction}
                onClose={() => setShowResolve(false)}
                onSuccess={() => {
                    setShowResolve(false);
                    onClose();
                }}
            />

            {/* Edit Modal */}
            <UpdateRestrictionModal
                isOpen={showEdit}
                restriction={restriction}
                onClose={() => setShowEdit(false)}
                onSuccess={() => {
                    setShowEdit(false);
                    onClose();
                }}
            />
        </>
    );
}
