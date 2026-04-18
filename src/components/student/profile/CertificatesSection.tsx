import { useState } from "react";
import { Award, ChevronDown, ChevronUp, ExternalLink, Calendar, CheckCircle, XCircle, AlertCircle, Check, X } from "lucide-react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import type { CertificatesResponse, Certificate } from "@/types/student";

interface CertificatesSectionProps {
    certificates: CertificatesResponse | null;
    viewMode?: "student" | "college" | "interviewer";
    onApproveItem?: (id: string) => void;
    onRejectItem?: (id: string) => void;
    processingId?: string | null;
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", year: "numeric" });
}

function getExpiryStatus(cert: Certificate) {
    if (cert.does_not_expire) return { label: "No Expiry", color: "text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-800" };
    if (!cert.expiry_date) return null;
    const diff = new Date(cert.expiry_date).getTime() - Date.now();
    const daysLeft = Math.ceil(diff / (1000 * 60 * 60 * 24));
    if (daysLeft < 0) return { label: "Expired", color: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20" };
    if (daysLeft < 90) return { label: `Expires in ${daysLeft}d`, color: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20" };
    return { label: "Valid", color: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20" };
}

const INITIAL_VISIBLE = 3;

export default function CertificatesSection({ certificates, viewMode, onApproveItem, onRejectItem, processingId }: Readonly<CertificatesSectionProps>) {
    const list = certificates?.certificates || [];
    const [showAll, setShowAll] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);
    const shouldReduce = useReducedMotion();

    const visibleItems = showAll ? list : list.slice(0, INITIAL_VISIBLE);
    const hasMore = list.length > INITIAL_VISIBLE;

    return (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-6 transition-shadow hover:shadow-md">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide flex items-center gap-2 mb-5">
                <div className="h-7 w-7 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
                    <Award className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
                </div>
                Certificates
                {certificates && (
                    <span className="text-xs font-normal text-gray-400 dark:text-gray-500 ml-auto">
                        {certificates.total_certificates}/{certificates.max_certificates}
                    </span>
                )}
            </h2>

            {list.length === 0 ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">No certificates added yet.</p>
            ) : (
                <div className="space-y-3">
                    {visibleItems.map((cert) => {
                        const isExpanded = expandedId === cert.certificate_id;
                        const expiry = getExpiryStatus(cert);
                        const orgInitial = cert.issuing_organization?.charAt(0).toUpperCase() || "C";

                        return (
                            <div
                                key={cert.certificate_id}
                                className="rounded-xl border border-gray-100 dark:border-gray-800 overflow-hidden transition-all duration-200 hover:shadow-md"
                            >
                                <button
                                    type="button"
                                    onClick={() => setExpandedId(isExpanded ? null : cert.certificate_id)}
                                    className="w-full text-left px-4 py-3.5 flex items-start gap-3 cursor-pointer"
                                >
                                    {/* Org initial avatar */}
                                    <div className="flex-shrink-0 h-9 w-9 rounded-lg bg-violet-50 dark:bg-violet-900/30 border border-violet-100 dark:border-violet-800 flex items-center justify-center text-xs font-bold text-violet-600 dark:text-violet-400">
                                        {orgInitial}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
                                            {cert.certificate_name}
                                        </h3>
                                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                            {cert.issuing_organization}
                                            {cert.issuing_platform && ` · ${cert.issuing_platform}`}
                                        </p>
                                        <div className="flex items-center gap-2 mt-1 flex-wrap">
                                            <span className="text-xs text-gray-400 dark:text-gray-500 flex items-center gap-1">
                                                <Calendar className="h-2.5 w-2.5" />
                                                {formatDate(cert.issue_date)}
                                            </span>
                                            {expiry && (
                                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${expiry.color}`}>
                                                    {expiry.label}
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <ChevronDown className={`h-4 w-4 text-gray-400 flex-shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""}`} />
                                </button>

                                {/* Verification status bar (college view) */}
                                {viewMode === "college" && cert.verification_status && (
                                    <div className="px-4 py-2 border-t border-gray-50 dark:border-gray-800 flex items-center justify-between gap-2">
                                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${(() => {
                                            if (cert.verification_status === "approved") return "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300";
                                            if (cert.verification_status === "rejected") return "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300";
                                            return "bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300";
                                        })()}`}>
                                            {cert.verification_status === "approved" && <CheckCircle className="h-3 w-3" />}
                                            {cert.verification_status === "rejected" && <XCircle className="h-3 w-3" />}
                                            {cert.verification_status === "pending" && <AlertCircle className="h-3 w-3" />}
                                            {cert.verification_status.charAt(0).toUpperCase() + cert.verification_status.slice(1)}
                                        </span>
                                        {cert.verification_status === "rejected" && cert.rejection_reason && (
                                            <span className="text-[11px] text-red-500 dark:text-red-400 truncate flex-1 text-right">
                                                {cert.rejection_reason}
                                            </span>
                                        )}
                                        {cert.verification_status === "pending" && onApproveItem && onRejectItem && (
                                            <div className="flex items-center gap-1">
                                                <button type="button" onClick={(e) => { e.stopPropagation(); onApproveItem(cert.certificate_id); }} disabled={processingId === cert.certificate_id} className="h-7 w-7 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center hover:bg-emerald-100 dark:hover:bg-emerald-900/40 transition-colors disabled:opacity-50 cursor-pointer" aria-label="Approve">
                                                    <Check className="h-3.5 w-3.5 text-emerald-600" />
                                                </button>
                                                <button type="button" onClick={(e) => { e.stopPropagation(); onRejectItem(cert.certificate_id); }} disabled={processingId === cert.certificate_id} className="h-7 w-7 rounded-lg bg-red-50 dark:bg-red-900/20 flex items-center justify-center hover:bg-red-100 dark:hover:bg-red-900/40 transition-colors disabled:opacity-50 cursor-pointer" aria-label="Reject">
                                                    <X className="h-3.5 w-3.5 text-red-600" />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                )}

                                <AnimatePresence>
                                    {isExpanded && (
                                        shouldReduce ? (
                                            <div className="px-4 pb-4 border-t border-gray-50 dark:border-gray-800 pt-3 space-y-3">
                                                <CertDetail cert={cert} />
                                            </div>
                                        ) : (
                                            <motion.div
                                                initial={{ height: 0, opacity: 0 }}
                                                animate={{ height: "auto", opacity: 1 }}
                                                exit={{ height: 0, opacity: 0 }}
                                                transition={{ duration: 0.2 }}
                                                className="overflow-hidden"
                                            >
                                                <div className="px-4 pb-4 border-t border-gray-50 dark:border-gray-800 pt-3 space-y-3">
                                                    <CertDetail cert={cert} />
                                                </div>
                                            </motion.div>
                                        )
                                    )}
                                </AnimatePresence>
                            </div>
                        );
                    })}

                    {hasMore && (
                        <button
                            type="button"
                            onClick={() => setShowAll(!showAll)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 mt-1 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors cursor-pointer"
                        >
                            {showAll ? (
                                <>Show Less <ChevronUp className="h-3.5 w-3.5" /></>
                            ) : (
                                <>Show More ({list.length - INITIAL_VISIBLE} more) <ChevronDown className="h-3.5 w-3.5" /></>
                            )}
                        </button>
                    )}
                </div>
            )}
        </div>
    );
}

function CertDetail({ cert }: Readonly<{ cert: Certificate }>) {
    return (
        <>
            {cert.certificate_description && (
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">{cert.certificate_description}</p>
            )}
            {cert.credential_id && (
                <p className="text-xs text-gray-400 dark:text-gray-500">
                    Credential ID: <span className="font-mono text-gray-500 dark:text-gray-400">{cert.credential_id}</span>
                </p>
            )}
            {cert.skills_covered && cert.skills_covered.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                    {cert.skills_covered.map((skill) => (
                        <span key={skill} className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 dark:bg-gray-800 text-gray-700 dark:text-gray-300 border border-gray-100 dark:border-gray-700">
                            {skill}
                        </span>
                    ))}
                </div>
            )}
            {cert.credential_url && (
                <a
                    href={cert.credential_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-medium text-violet-600 dark:text-violet-400 hover:text-violet-700 dark:hover:text-violet-300 transition-colors"
                >
                    <ExternalLink className="h-3 w-3" />
                    View Credential
                </a>
            )}
        </>
    );
}
