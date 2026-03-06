import { useState } from "react";
import { Award, ExternalLink, Calendar, ChevronDown, ChevronUp } from "lucide-react";
import type { CertificatesResponse } from "@/types/student";

interface CertificatesSectionProps {
    certificates: CertificatesResponse | null;
}

function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        year: "numeric",
    });
}

const INITIAL_VISIBLE = 2;

export default function CertificatesSection({
    certificates,
}: CertificatesSectionProps) {
    const list = certificates?.certificates || [];
    const [showAll, setShowAll] = useState(false);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const visibleItems = showAll ? list : list.slice(0, INITIAL_VISIBLE);
    const hasMore = list.length > INITIAL_VISIBLE;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2 mb-4">
                <Award className="h-4 w-4 text-violet-500" />
                Certificates
                {certificates && (
                    <span className="text-xs font-normal text-gray-400 ml-auto">
                        {certificates.total_certificates}/{certificates.max_certificates}
                    </span>
                )}
            </h2>

            {list.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No certificates added yet.</p>
            ) : (
                <div className="space-y-4">
                    {visibleItems.map((cert) => {
                        const isExpanded = expandedId === cert.certificate_id;

                        return (
                            <div
                                key={cert.certificate_id}
                                className="rounded-xl border border-gray-100 overflow-hidden transition-shadow hover:shadow-sm"
                            >
                                <button
                                    onClick={() =>
                                        setExpandedId(isExpanded ? null : cert.certificate_id)
                                    }
                                    className="w-full text-left px-4 py-3.5 flex items-start justify-between gap-3 cursor-pointer"
                                >
                                    <div className="min-w-0 flex-1">
                                        <h3 className="text-sm font-semibold text-gray-900">
                                            {cert.certificate_name}
                                        </h3>
                                        <p className="text-xs text-gray-500 mt-0.5">
                                            {cert.issuing_organization}
                                            {cert.issuing_platform && ` · ${cert.issuing_platform}`}
                                        </p>
                                        <div className="flex items-center gap-2 text-xs text-gray-400 mt-1">
                                            <Calendar className="h-3 w-3" />
                                            {formatDate(cert.issue_date)}
                                            {cert.does_not_expire && (
                                                <span className="px-1.5 py-0.5 rounded bg-green-50 text-green-600 text-[10px] font-medium">
                                                    No Expiry
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <ChevronDown
                                        className={`h-4 w-4 text-gray-400 flex-shrink-0 mt-1 transition-transform duration-200 ${isExpanded ? "rotate-180" : ""
                                            }`}
                                    />
                                </button>

                                {isExpanded && (
                                    <div className="px-4 pb-4 border-t border-gray-50 pt-3 space-y-3">
                                        {cert.certificate_description && (
                                            <p className="text-sm text-gray-600 leading-relaxed">
                                                {cert.certificate_description}
                                            </p>
                                        )}
                                        {cert.credential_id && (
                                            <p className="text-xs text-gray-400">
                                                Credential ID: <span className="text-gray-600 font-medium">{cert.credential_id}</span>
                                            </p>
                                        )}
                                        {cert.skills_covered && cert.skills_covered.length > 0 && (
                                            <div className="flex flex-wrap gap-1.5">
                                                {cert.skills_covered.map((s) => (
                                                    <span
                                                        key={s}
                                                        className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-50 text-gray-700 border border-gray-100"
                                                    >
                                                        {s}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                        {cert.credential_url && (
                                            <a
                                                href={cert.credential_url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-medium text-white transition-colors"
                                                style={{
                                                    background: "linear-gradient(135deg, #694ed6 0%, #c137a2 100%)",
                                                }}
                                            >
                                                <ExternalLink className="h-3.5 w-3.5" />
                                                Verify Credential
                                            </a>
                                        )}
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {hasMore && (
                        <button
                            onClick={() => setShowAll(!showAll)}
                            className="w-full flex items-center justify-center gap-1.5 py-2 text-xs font-medium text-violet-600 hover:text-violet-700 transition-colors cursor-pointer"
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
