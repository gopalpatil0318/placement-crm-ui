import { useState, useMemo } from "react";
import { usePermissions } from "@/hooks/usePermissions";
import { useQuery } from "@tanstack/react-query";
import { motion, useReducedMotion } from "framer-motion";
import {
    Search, Check, X, Loader2, Send,
    ChevronRight, ChevronLeft, Users, Filter,
    Sparkles, Eye,
    CheckCircle2, AlertTriangle,
} from "lucide-react";
import { fadeInUp } from "@/lib/animations";
import { queryKeys } from "@/lib/queryKeys";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { useSendNotification, type SendMode } from "@/hooks/collegeadmin/notifications/useSendNotification";
import {
    NOTIFICATION_TYPES,
    NOTIFICATION_TYPE_LABELS,
    NOTIFICATION_TYPE_COLORS,
    RECIPIENT_TYPE_LABELS,
    RELATED_ENTITY_TYPES,
    NOTIFICATION_TEMPLATES,
    STUDENT_STATUS_OPTIONS,
    PROFILE_STATUS_OPTIONS,
    USER_ROLE_OPTIONS,
    type NotificationType,
    type RelatedEntityType,
    type SendNotificationResponse,
    type BulkNotificationResponse,
} from "@/validators/NotificationSchema";

/**
 * Auto-fill related_entity_type based on notification type.
 * Follows the mapping from the API doc section 4.
 */
const NOTIFICATION_TYPE_TO_ENTITY: Partial<Record<NotificationType, RelatedEntityType>> = {
    new_job_posted: "job",
    deadline_reminder: "job",
    round_scheduled: "round",
    round_result: "round",
    application_received: "application",
    application_status_changed: "application",
    offer_received: "placement",
    restriction_applied: "restriction",
    restriction_removed: "restriction",
    training_enrollment: "training",
    training_completed: "training",
    profile_incomplete: "student",
};
import { useNavigate } from "react-router-dom";

const BULK_WARNING_THRESHOLD = 50;

// ========================
// SUB-COMPONENTS
// ========================

function StepIndicator({ currentStep }: Readonly<{ currentStep: number }>) {
    const steps = [
        { num: 1, label: "Content" },
        { num: 2, label: "Recipients" },
        { num: 3, label: "Preview" },
    ];

    return (
        <div className="flex items-center justify-center gap-2 mb-8">
            {steps.map((s, i) => {
                const isActive = currentStep === s.num;
                const isComplete = currentStep > s.num;
                let indicatorClass = "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-500";
                if (isComplete) {
                    indicatorClass = "bg-blue-500 text-white";
                } else if (isActive) {
                    indicatorClass = "bg-blue-100 text-blue-700 ring-2 ring-blue-500 dark:bg-blue-900/30 dark:text-blue-400";
                }
                return (
                    <div key={s.num} className="flex items-center gap-2">
                        {i > 0 && (
                            <div className={`w-12 h-0.5 ${isComplete ? "bg-blue-500" : "bg-gray-200 dark:bg-gray-700"}`} />
                        )}
                        <div className="flex items-center gap-2">
                            <div
                                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-colors min-h-[44px] min-w-[44px] ${indicatorClass}`}
                            >
                                {isComplete ? <Check size={14} /> : s.num}
                            </div>
                            <span
                                className={`text-sm font-medium hidden sm:block ${
                                    isActive ? "text-blue-700 dark:text-blue-400" : "text-gray-500 dark:text-gray-500"
                                }`}
                            >
                                {s.label}
                            </span>
                        </div>
                    </div>
                );
            })}
        </div>
    );
}

// ─── Step 1: Type & Content ──────────────────────────────────────────────────

function StepTypeAndContent({
    formData,
    errors,
    onFormChange,
    onApplyTemplate,
    onNext,
}: Readonly<{
    formData: ReturnType<typeof useSendNotification>["formData"];
    errors: Record<string, string>;
    onFormChange: (field: keyof ReturnType<typeof useSendNotification>["formData"], value: string) => void;
    onApplyTemplate: ReturnType<typeof useSendNotification>["applyTemplate"];
    onNext: () => void;
}>) {
    const shouldReduce = useReducedMotion();
    const motionProps = shouldReduce ? {} : fadeInUp;

    return (
        <motion.div {...motionProps} className="space-y-6">
            {/* Templates */}
            <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    <Sparkles size={14} className="inline mr-1.5 text-amber-500" />
                    Quick Templates
                </label>
                <div className="flex flex-wrap gap-2">
                    {NOTIFICATION_TEMPLATES.map((t) => {
                        const colors = NOTIFICATION_TYPE_COLORS[t.notification_type];
                        return (
                            <button
                                key={t.name}
                                type="button"
                                onClick={() => onApplyTemplate(t)}
                                className={`px-3 py-2.5 min-h-[44px] rounded-full text-xs font-medium transition-colors border ${colors.bg} ${colors.text} border-transparent hover:ring-1 hover:ring-current`}
                            >
                                {t.name}
                            </button>
                        );
                    })}
                </div>
            </div>

            {/* Notification Type */}
            <div>
                <label htmlFor="notification_type" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Notification Type <span className="text-red-500">*</span>
                </label>
                <select
                    id="notification_type"
                    value={formData.notification_type}
                    onChange={(e) => {
                        const type = e.target.value;
                        onFormChange("notification_type", type);
                        const suggestedEntity = NOTIFICATION_TYPE_TO_ENTITY[type as NotificationType];
                        if (suggestedEntity) {
                            onFormChange("related_entity_type", suggestedEntity);
                        } else {
                            onFormChange("related_entity_type", "");
                            onFormChange("related_entity_id", "");
                        }
                    }}
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-gray-900 transition-colors ${
                        errors.notification_type
                            ? "border-red-300 dark:border-red-700"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                >
                    <option value="">Select a type...</option>
                    {NOTIFICATION_TYPES.map((type) => (
                        <option key={type} value={type}>
                            {NOTIFICATION_TYPE_LABELS[type]}
                        </option>
                    ))}
                </select>
                {errors.notification_type && (
                    <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.notification_type}</p>
                )}
            </div>

            {/* Title */}
            <div>
                <label htmlFor="title" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title <span className="text-red-500">*</span>
                </label>
                <input
                    id="title"
                    type="text"
                    value={formData.title}
                    onChange={(e) => onFormChange("title", e.target.value)}
                    maxLength={200}
                    placeholder="Enter notification title..."
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-gray-900 transition-colors ${
                        errors.title
                            ? "border-red-300 dark:border-red-700"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                />
                <div className="flex justify-between mt-1">
                    {errors.title ? (
                        <p className="text-xs text-red-600 dark:text-red-400">{errors.title}</p>
                    ) : (
                        <span />
                    )}
                    <span className={`text-xs ${formData.title.length > 190 ? "text-amber-600" : "text-gray-400"}`}>
                        {formData.title.length}/200
                    </span>
                </div>
            </div>

            {/* Body */}
            <div>
                <label htmlFor="body" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Body
                </label>
                <textarea
                    id="body"
                    value={formData.body}
                    onChange={(e) => onFormChange("body", e.target.value)}
                    maxLength={3000}
                    rows={4}
                    placeholder="Enter notification body (optional)..."
                    className={`w-full rounded-lg border px-3 py-2.5 text-sm bg-white dark:bg-gray-900 resize-none transition-colors ${
                        errors.body
                            ? "border-red-300 dark:border-red-700"
                            : "border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600"
                    }`}
                />
                <div className="flex justify-between mt-1">
                    {errors.body ? (
                        <p className="text-xs text-red-600 dark:text-red-400">{errors.body}</p>
                    ) : (
                        <span />
                    )}
                    <span className={`text-xs ${formData.body.length > 2800 ? "text-amber-600" : "text-gray-400"}`}>
                        {formData.body.length}/3000
                    </span>
                </div>
            </div>

            {/* Related Entity (optional) */}
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 space-y-4">
                <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                    Related Entity <span className="text-gray-400 font-normal">(optional — enables deep-linking)</span>
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="related_entity_type" className="block text-xs text-gray-500 mb-1">Entity Type</label>
                        <select
                            id="related_entity_type"
                            value={formData.related_entity_type}
                            onChange={(e) => onFormChange("related_entity_type", e.target.value)}
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-900"
                        >
                            <option value="">None</option>
                            {RELATED_ENTITY_TYPES.map((t) => (
                                <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="related_entity_id" className="block text-xs text-gray-500 mb-1">Entity ID</label>
                        <input
                            id="related_entity_id"
                            type="text"
                            value={formData.related_entity_id}
                            onChange={(e) => onFormChange("related_entity_id", e.target.value)}
                            placeholder="UUID of the entity"
                            disabled={!formData.related_entity_type}
                            className={`w-full rounded-lg border px-3 py-2 text-sm bg-white dark:bg-gray-900 disabled:opacity-50 ${
                                errors.related_entity_id
                                    ? "border-red-300 dark:border-red-700"
                                    : "border-gray-200 dark:border-gray-700"
                            }`}
                        />
                        {errors.related_entity_id && (
                            <p className="mt-1 text-xs text-red-600 dark:text-red-400">{errors.related_entity_id}</p>
                        )}
                    </div>
                </div>
            </div>

            {/* Next */}
            <div className="flex justify-end pt-4">
                <button
                    type="button"
                    onClick={onNext}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    Next: Recipients
                    <ChevronRight size={16} />
                </button>
            </div>
        </motion.div>
    );
}

// ─── Step 2: Recipients ──────────────────────────────────────────────────────

function StepRecipients({
    sendMode,
    onSendModeChange,
    targetedData,
    bulkData,
    recipientSearch,
    errors,
    onTargetedChange,
    onBulkChange,
    onAddRecipient,
    onRemoveRecipient,
    onRecipientSearchChange,
    onNext,
    onBack,
}: Readonly<{
    sendMode: SendMode;
    onSendModeChange: (mode: SendMode) => void;
    targetedData: ReturnType<typeof useSendNotification>["targetedData"];
    bulkData: ReturnType<typeof useSendNotification>["bulkData"];
    recipientSearch: string;
    errors: Record<string, string>;
    onTargetedChange: ReturnType<typeof useSendNotification>["handleTargetedChange"];
    onBulkChange: ReturnType<typeof useSendNotification>["handleBulkChange"];
    onAddRecipient: (id: string) => void;
    onRemoveRecipient: (id: string) => void;
    onRecipientSearchChange: (value: string) => void;
    onNext: () => void;
    onBack: () => void;
}>) {
    const shouldReduce = useReducedMotion();
    const motionProps = shouldReduce ? {} : fadeInUp;
    const [searchOpen, setSearchOpen] = useState(false);

    // Student autocomplete query (for targeted mode)
    const { data: studentSearchData, isFetching: searchingStudents } = useQuery({
        queryKey: queryKeys.students.all({ search: recipientSearch, limit: 10 }),
        queryFn: () => CollegeAdminService.getAllStudents({ search: recipientSearch, limit: 10 }),
        enabled: sendMode === "targeted" && targetedData.recipient_type === "student" && recipientSearch.length >= 2,
    });

    const searchResults: Array<{ id: string; name: string; email: string; department: string }> = useMemo(() => {
        const students = Array.isArray(studentSearchData?.data) ? studentSearchData.data : [];
        return students.map((s: Record<string, unknown>) => ({
            id: (s.student_id ?? s.id) as string,
            name: (s.student_name ?? s.name ?? "Unknown") as string,
            email: (s.email ?? "") as string,
            department: (s.department_name ?? s.department ?? "") as string,
        }));
    }, [studentSearchData]);

    // Departments for bulk filter
    const { data: deptData } = useQuery({
        queryKey: queryKeys.departments.all({ limit: 100 }),
        queryFn: () => CollegeAdminService.getDepartments({ limit: 100 }),
        enabled: sendMode === "bulk" && bulkData.recipient_type === "student",
    });

    const departments: Array<{ id: string; name: string }> = useMemo(() => {
        const list = Array.isArray(deptData?.data) ? deptData.data : [];
        return list.map((d: Record<string, unknown>) => ({
            id: (d.dept_id ?? d.id) as string,
            name: (d.dept_name ?? d.name ?? "Unknown") as string,
        }));
    }, [deptData]);

    return (
        <motion.div {...motionProps} className="space-y-6">
            {/* Mode Toggle */}
            <div className="flex gap-2 p-1 bg-gray-100 dark:bg-gray-800 rounded-lg">
                <button
                    type="button"
                    onClick={() => onSendModeChange("targeted")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                        sendMode === "targeted"
                            ? "bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-400 shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                    }`}
                >
                    <Users size={16} />
                    Specific Recipients
                </button>
                <button
                    type="button"
                    onClick={() => onSendModeChange("bulk")}
                    className={`flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-md text-sm font-medium transition-colors ${
                        sendMode === "bulk"
                            ? "bg-white dark:bg-gray-700 text-blue-700 dark:text-blue-400 shadow-sm"
                            : "text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-300"
                    }`}
                >
                    <Filter size={16} />
                    Bulk (Filter-based)
                </button>
            </div>

            {/* Recipient Type Selector */}
            <div>
                <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Recipient Type</span>
                <div className="flex gap-3">
                    {(["student", "user"] as const).map((t) => {
                        const currentRecipientType = sendMode === "targeted" ? targetedData.recipient_type : bulkData.recipient_type;
                        const isActive = currentRecipientType === t;
                        return (
                        <button
                            key={t}
                            type="button"
                            onClick={() => {
                                if (sendMode === "targeted") {
                                    onTargetedChange("recipient_type", t);
                                } else {
                                    onBulkChange("recipient_type", t);
                                }
                            }}
                            className={`px-4 py-2 rounded-lg border text-sm font-medium transition-colors ${
                                isActive
                                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-600"
                                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400 hover:border-gray-300"
                            }`}
                        >
                            {RECIPIENT_TYPE_LABELS[t]}
                        </button>
                        );
                    })}
                </div>
            </div>

            {/* Targeted Mode: Search & Select Recipients */}
            {sendMode === "targeted" && (
                <div className="space-y-4">
                    {/* Search */}
                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input
                            type="text"
                            value={recipientSearch}
                            onChange={(e) => {
                                onRecipientSearchChange(e.target.value);
                                setSearchOpen(true);
                            }}
                            onFocus={() => setSearchOpen(true)}
                            placeholder={`Search ${targetedData.recipient_type === "student" ? "students" : "users"} by name...`}
                            className="w-full rounded-lg border border-gray-200 dark:border-gray-700 pl-10 pr-4 py-2.5 text-sm bg-white dark:bg-gray-900"
                        />
                        {/* Autocomplete Dropdown */}
                        {searchOpen && recipientSearch.length >= 2 && (
                            <div className="absolute z-20 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
                                {searchingStudents && (
                                    <div className="flex items-center justify-center py-4 text-gray-400">
                                        <Loader2 size={16} className="animate-spin mr-2" />
                                        Searching...
                                    </div>
                                )}
                                {!searchingStudents && searchResults.length === 0 && (
                                    <div className="py-4 text-center text-sm text-gray-400">No results found</div>
                                )}
                                {!searchingStudents && searchResults.length > 0 && (
                                    searchResults.map((r) => {
                                        const isSelected = targetedData.recipient_ids.includes(r.id);
                                        return (
                                            <button
                                                key={r.id}
                                                type="button"
                                                onClick={() => {
                                                    if (!isSelected) onAddRecipient(r.id);
                                                    setSearchOpen(false);
                                                }}
                                                disabled={isSelected}
                                                className={`w-full text-left px-4 py-2.5 flex items-center gap-3 text-sm transition-colors ${
                                                    isSelected
                                                        ? "bg-blue-50/50 dark:bg-blue-900/10 text-gray-400 cursor-not-allowed"
                                                        : "hover:bg-gray-50 dark:hover:bg-gray-800"
                                                }`}
                                            >
                                                <div className="flex-1 min-w-0">
                                                    <p className="font-medium text-gray-900 dark:text-gray-100 truncate">{r.name}</p>
                                                    <p className="text-xs text-gray-500 truncate">{r.email} {r.department ? `· ${r.department}` : ""}</p>
                                                </div>
                                                {isSelected && <Check size={14} className="text-blue-500 shrink-0" />}
                                            </button>
                                        );
                                    })
                                )}
                            </div>
                        )}
                    </div>

                    {/* Selected Recipients Chips */}
                    {targetedData.recipient_ids.length > 0 && (
                        <div>
                            <p className="text-xs text-gray-500 mb-2">
                                {targetedData.recipient_ids.length} recipient{targetedData.recipient_ids.length === 1 ? "" : "s"} selected
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {targetedData.recipient_ids.map((id) => (
                                    <span
                                        key={id}
                                        className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 text-xs font-medium"
                                    >
                                        {id.slice(0, 8)}...
                                        <button
                                            type="button"
                                            onClick={() => onRemoveRecipient(id)}
                                            className="hover:text-red-500 transition-colors"
                                            aria-label="Remove recipient"
                                        >
                                            <X size={12} />
                                        </button>
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    {errors.recipient_ids && (
                        <p className="text-xs text-red-600 dark:text-red-400">{errors.recipient_ids}</p>
                    )}
                </div>
            )}

            {/* Bulk Mode: Filter Builder */}
            {sendMode === "bulk" && (
                <div className="space-y-4 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
                    <p className="text-sm font-medium text-gray-700 dark:text-gray-300 flex items-center gap-2">
                        <Filter size={14} />
                        Filter Criteria
                    </p>

                    {bulkData.recipient_type === "student" ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            {/* Departments */}
                            <div>
                                <span className="block text-xs text-gray-500 mb-1">Departments</span>
                                <div className="space-y-1 max-h-40 overflow-y-auto border border-gray-200 dark:border-gray-700 rounded-lg p-2">
                                    {departments.length === 0 ? (
                                        <p className="text-xs text-gray-400 py-1">Loading...</p>
                                    ) : (
                                        departments.map((d) => (
                                            <label key={d.id} className="flex items-center gap-2 text-sm py-0.5 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800 px-1 rounded">
                                                <input
                                                    type="checkbox"
                                                    checked={bulkData.dept_ids.includes(d.id)}
                                                    onChange={() => {
                                                        const next = bulkData.dept_ids.includes(d.id)
                                                            ? bulkData.dept_ids.filter((x) => x !== d.id)
                                                            : [...bulkData.dept_ids, d.id];
                                                        onBulkChange("dept_ids", next);
                                                    }}
                                                    className="rounded text-blue-600"
                                                />
                                                <span className="text-gray-700 dark:text-gray-300">{d.name}</span>
                                            </label>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* Passout Years */}
                            <div>
                                <span className="block text-xs text-gray-500 mb-1">Passout Years</span>
                                <div className="flex flex-wrap gap-2">
                                    {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 2 + i).map((year) => (
                                        <button
                                            key={year}
                                            type="button"
                                            onClick={() => {
                                                const next = bulkData.passout_years.includes(year)
                                                    ? bulkData.passout_years.filter((y) => y !== year)
                                                    : [...bulkData.passout_years, year];
                                                onBulkChange("passout_years", next);
                                            }}
                                            className={`px-3 py-2.5 min-h-[44px] rounded-lg text-xs font-medium border transition-colors ${
                                                bulkData.passout_years.includes(year)
                                                    ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                    : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                                            }`}
                                        >
                                            {year}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Student Status */}
                            <div>
                                <label htmlFor="student_status" className="block text-xs text-gray-500 mb-1">Student Status</label>
                                <select
                                    id="student_status"
                                    value={bulkData.student_status}
                                    onChange={(e) => onBulkChange("student_status", e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-900"
                                >
                                    <option value="">All</option>
                                    {STUDENT_STATUS_OPTIONS.map((s) => (
                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Profile Status */}
                            <div>
                                <label htmlFor="profile_status" className="block text-xs text-gray-500 mb-1">Profile Status</label>
                                <select
                                    id="profile_status"
                                    value={bulkData.profile_status}
                                    onChange={(e) => onBulkChange("profile_status", e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-900"
                                >
                                    <option value="">All</option>
                                    {PROFILE_STATUS_OPTIONS.map((s) => (
                                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                                    ))}
                                </select>
                            </div>

                            {/* Profile Complete */}
                            <div>
                                <label htmlFor="is_profile_complete" className="block text-xs text-gray-500 mb-1">Profile Complete</label>
                                <select
                                    id="is_profile_complete"
                                    value={bulkData.is_profile_complete}
                                    onChange={(e) => onBulkChange("is_profile_complete", e.target.value)}
                                    className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-900"
                                >
                                    <option value="">Any</option>
                                    <option value="true">Complete</option>
                                    <option value="false">Incomplete</option>
                                </select>
                            </div>

                            {/* Exclude Specific Students */}
                            <div className="sm:col-span-2">
                                <label htmlFor="exclude_ids_input" className="block text-xs text-gray-500 mb-1">Exclude Students (optional)</label>
                                <div className="space-y-2">
                                    <input
                                        id="exclude_ids_input"
                                        type="text"
                                        placeholder="Paste student ID to exclude and press Enter"
                                        onKeyDown={(e) => {
                                            if (e.key === "Enter") {
                                                e.preventDefault();
                                                const input = e.currentTarget;
                                                const val = input.value.trim();
                                                if (val && !bulkData.exclude_ids.includes(val)) {
                                                    onBulkChange("exclude_ids", [...bulkData.exclude_ids, val]);
                                                }
                                                input.value = "";
                                            }
                                        }}
                                        className="w-full rounded-lg border border-gray-200 dark:border-gray-700 px-3 py-2 text-sm bg-white dark:bg-gray-900"
                                    />
                                    {bulkData.exclude_ids.length > 0 && (
                                        <div className="flex flex-wrap gap-1.5">
                                            {bulkData.exclude_ids.map((id) => (
                                                <span key={id} className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-xs">
                                                    {id.slice(0, 8)}...
                                                    <button
                                                        type="button"
                                                        onClick={() => onBulkChange("exclude_ids", bulkData.exclude_ids.filter((x) => x !== id))}
                                                        className="hover:text-red-900 dark:hover:text-red-300"
                                                        aria-label="Remove exclusion"
                                                    >
                                                        <X size={10} />
                                                    </button>
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                    <p className="text-xs text-gray-400">{bulkData.exclude_ids.length}/500 exclusions</p>
                                </div>
                            </div>
                        </div>
                    ) : (
                        /* User filters */
                        <div>
                            <span className="block text-xs text-gray-500 mb-1">User Roles</span>
                            <div className="flex flex-wrap gap-2">
                                {USER_ROLE_OPTIONS.map((role) => (
                                    <button
                                        key={role}
                                        type="button"
                                        onClick={() => {
                                            const next = bulkData.user_roles.includes(role)
                                                ? bulkData.user_roles.filter((r) => r !== role)
                                                : [...bulkData.user_roles, role];
                                            onBulkChange("user_roles", next);
                                        }}
                                        className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
                                            bulkData.user_roles.includes(role)
                                                ? "border-blue-500 bg-blue-50 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400"
                                                : "border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-400"
                                        }`}
                                    >
                                        {role.toUpperCase()}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
                <button
                    type="button"
                    onClick={onBack}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    <ChevronLeft size={16} />
                    Back
                </button>
                <button
                    type="button"
                    onClick={onNext}
                    className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    Next: Preview
                    <ChevronRight size={16} />
                </button>
            </div>
        </motion.div>
    );
}

// ─── Step 3: Preview & Send ──────────────────────────────────────────────────

function StepPreview({
    formData,
    sendMode,
    targetedData,
    bulkData,
    isSending,
    onSubmit,
    onBack,
}: Readonly<{
    formData: ReturnType<typeof useSendNotification>["formData"];
    sendMode: SendMode;
    targetedData: ReturnType<typeof useSendNotification>["targetedData"];
    bulkData: ReturnType<typeof useSendNotification>["bulkData"];
    isSending: boolean;
    onSubmit: () => void;
    onBack: () => void;
}>) {
    const { hasPermission } = usePermissions();
    const canSend = hasPermission("notifications.send");
    const shouldReduce = useReducedMotion();
    const motionProps = shouldReduce ? {} : fadeInUp;
    const typeColors = formData.notification_type ? NOTIFICATION_TYPE_COLORS[formData.notification_type] : null;
    const typeLabel = formData.notification_type ? NOTIFICATION_TYPE_LABELS[formData.notification_type] : "—";

    const recipientSummary = useMemo(() => {
        if (sendMode === "targeted") {
            return `${targetedData.recipient_ids.length} specific ${targetedData.recipient_type}${targetedData.recipient_ids.length === 1 ? "" : "s"}`;
        }
        const parts: string[] = [];
        if (bulkData.student_status) parts.push(`${bulkData.student_status} status`);
        if (bulkData.passout_years.length > 0) parts.push(`${bulkData.passout_years.join(", ")} batch`);
        if (bulkData.dept_ids.length > 0) parts.push(`${bulkData.dept_ids.length} department${bulkData.dept_ids.length === 1 ? "" : "s"}`);
        if (bulkData.profile_status) parts.push(`${bulkData.profile_status} profile`);
        if (bulkData.user_roles.length > 0) parts.push(`roles: ${bulkData.user_roles.join(", ")}`);
        const filterDesc = parts.length > 0 ? parts.join(", ") : "all";
        return `${bulkData.recipient_type === "student" ? "Students" : "Users"} matching: ${filterDesc}`;
    }, [sendMode, targetedData, bulkData]);

    const showBulkWarning = sendMode === "targeted" && targetedData.recipient_ids.length > BULK_WARNING_THRESHOLD;

    return (
        <motion.div {...motionProps} className="space-y-6">
            <div className="rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
                {/* Preview Header */}
                <div className="px-5 py-4 bg-gray-50 dark:bg-gray-800/50 border-b border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 mb-1">
                        <Eye size={16} className="text-gray-400" />
                        <span className="text-sm font-medium text-gray-700 dark:text-gray-300">Preview</span>
                    </div>
                </div>

                <div className="p-5 space-y-4">
                    {/* Type Badge */}
                    {typeColors && (
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${typeColors.bg} ${typeColors.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${typeColors.dot}`} />
                            {typeLabel}
                        </span>
                    )}

                    {/* Title */}
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                        {formData.title || "(No title)"}
                    </h3>

                    {/* Body */}
                    {formData.body && (
                        <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-line">
                            {formData.body}
                        </p>
                    )}

                    {/* Recipient Summary */}
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-100 dark:border-gray-800">
                        <Users size={14} className="text-gray-400" />
                        <span className="text-sm text-gray-600 dark:text-gray-400">{recipientSummary}</span>
                    </div>

                    {/* Related Entity */}
                    {formData.related_entity_type && (
                        <div className="text-xs text-gray-400">
                            Linked to: {formData.related_entity_type} — {formData.related_entity_id || "(no ID)"}
                        </div>
                    )}
                </div>
            </div>

            {/* Warning for large sends */}
            {showBulkWarning && (
                <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 text-sm">
                    <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                    <span>This will send to {targetedData.recipient_ids.length} recipients. Please confirm before sending.</span>
                </div>
            )}

            {/* Navigation */}
            <div className="flex justify-between pt-4">
                <button
                    type="button"
                    onClick={onBack}
                    disabled={isSending}
                    className="inline-flex items-center gap-2 px-5 py-2.5 min-h-[44px] rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors disabled:opacity-50"
                >
                    <ChevronLeft size={16} />
                    Back
                </button>
                <button
                    type="button"
                    onClick={onSubmit}
                    disabled={isSending || !canSend}
                    className="inline-flex items-center gap-2 px-6 py-2.5 min-h-[44px] rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-70"
                >
                    {isSending ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Send size={16} />
                            Send Notification
                        </>
                    )}
                </button>
            </div>
        </motion.div>
    );
}

// ─── Step 4: Success ─────────────────────────────────────────────────────────

function SuccessState({
    sendResult,
    onReset,
}: Readonly<{
    sendResult: SendNotificationResponse | BulkNotificationResponse | null;
    onReset: () => void;
}>) {
    const navigate = useNavigate();
    const shouldReduce = useReducedMotion();
    const motionProps = shouldReduce ? {} : fadeInUp;

    if (!sendResult) return null;

    return (
        <motion.div {...motionProps} className="flex flex-col items-center text-center py-12 space-y-6">
            <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center">
                <CheckCircle2 size={32} className="text-emerald-600 dark:text-emerald-400" />
            </div>

            <div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">
                    Notification Sent Successfully!
                </h3>
                <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                    <p>Sent to <strong>{sendResult.sent_count}</strong> recipient{sendResult.sent_count === 1 ? "" : "s"}</p>
                    {"invalid_count" in sendResult && sendResult.invalid_count > 0 && (
                        <p className="text-amber-600 dark:text-amber-400">
                            {sendResult.invalid_count} invalid ID{sendResult.invalid_count === 1 ? "" : "s"} skipped
                        </p>
                    )}
                    {"skipped_count" in sendResult && sendResult.skipped_count > 0 && (
                        <p className="text-amber-600 dark:text-amber-400">
                            {sendResult.skipped_count} skipped (duplicates)
                        </p>
                    )}
                    {"total_eligible" in sendResult && (
                        <p>Total eligible: {sendResult.total_eligible}</p>
                    )}
                </div>
            </div>

            <div className="flex gap-3">
                <button
                    type="button"
                    onClick={onReset}
                    className="px-5 py-2.5 min-h-[44px] rounded-lg border border-gray-200 dark:border-gray-700 text-gray-700 dark:text-gray-300 text-sm font-medium hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                    Send Another
                </button>
                <button
                    type="button"
                    onClick={() => navigate("/college/notification-history")}
                    className="px-5 py-2.5 min-h-[44px] rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                    View Sent History
                </button>
            </div>
        </motion.div>
    );
}

// ========================
// MAIN COMPONENT
// ========================

export default function ComposeNotification() {
    const hook = useSendNotification();

    if (hook.step === 4) {
        return (
            <SuccessState
                sendResult={hook.sendResult}
                onReset={hook.reset}
            />
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <StepIndicator currentStep={hook.step} />

            {hook.step === 1 && (
                <StepTypeAndContent
                    formData={hook.formData}
                    errors={hook.errors}
                    onFormChange={hook.handleFormChange}
                    onApplyTemplate={hook.applyTemplate}
                    onNext={hook.goNext}
                />
            )}

            {hook.step === 2 && (
                <StepRecipients
                    sendMode={hook.sendMode}
                    onSendModeChange={hook.setSendMode}
                    targetedData={hook.targetedData}
                    bulkData={hook.bulkData}
                    recipientSearch={hook.recipientSearch}
                    errors={hook.errors}
                    onTargetedChange={hook.handleTargetedChange}
                    onBulkChange={hook.handleBulkChange}
                    onAddRecipient={hook.addRecipient}
                    onRemoveRecipient={hook.removeRecipient}
                    onRecipientSearchChange={hook.handleRecipientSearchChange}
                    onNext={hook.goNext}
                    onBack={hook.goBack}
                />
            )}

            {hook.step === 3 && (
                <StepPreview
                    formData={hook.formData}
                    sendMode={hook.sendMode}
                    targetedData={hook.targetedData}
                    bulkData={hook.bulkData}
                    isSending={hook.isSending}
                    onSubmit={hook.handleSubmit}
                    onBack={hook.goBack}
                />
            )}
        </div>
    );
}
