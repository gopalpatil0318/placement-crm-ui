import { Mail, Phone, MapPin, Copy, Check } from "lucide-react";
import { useState, useCallback } from "react";
import type { PersonalInfo, StudentInfo } from "@/types/student";
import { showToast } from "@/utils/ToastUtils";

interface ContactSectionProps {
    personalInfo: PersonalInfo | null;
    student: StudentInfo | null;
}

export default function ContactSection({ personalInfo, student }: ContactSectionProps) {
    const email = student?.student_email;
    const phone = personalInfo?.mobile_number;
    const altPhone = personalInfo?.alternate_mobile;
    const city = personalInfo?.current_city;
    const state = personalInfo?.current_state;
    const location = [city, state].filter(Boolean).join(", ");

    const hasAnyContact = email || phone || altPhone || location;

    return (
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-6 transition-shadow hover:shadow-md">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide flex items-center gap-2 mb-5">
                <div className="h-7 w-7 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
                    <Mail className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
                </div>
                Contact
            </h2>

            {!hasAnyContact ? (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">No contact information available.</p>
            ) : (
                <div className="space-y-3">
                    {email && (
                        <ContactRow
                            icon={<Mail className="h-4 w-4" />}
                            label="Email"
                            value={email}
                            href={`mailto:${email}`}
                            copyable
                        />
                    )}
                    {phone && (
                        <ContactRow
                            icon={<Phone className="h-4 w-4" />}
                            label="Phone"
                            value={phone}
                            href={`tel:${phone}`}
                            copyable
                        />
                    )}
                    {altPhone && (
                        <ContactRow
                            icon={<Phone className="h-4 w-4" />}
                            label="Alternate"
                            value={altPhone}
                            href={`tel:${altPhone}`}
                            copyable
                        />
                    )}
                    {location && (
                        <ContactRow
                            icon={<MapPin className="h-4 w-4" />}
                            label="Location"
                            value={location}
                        />
                    )}
                </div>
            )}
        </div>
    );
}

function ContactRow({
    icon,
    label,
    value,
    href,
    copyable,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
    href?: string;
    copyable?: boolean;
}) {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
        navigator.clipboard.writeText(value).then(() => {
            setCopied(true);
            showToast({ type: "success", title: `${label} copied to clipboard` });
            setTimeout(() => setCopied(false), 2000);
        });
    }, [value, label]);

    return (
        <div className="flex items-center gap-3 group">
            <div className="h-9 w-9 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center flex-shrink-0 text-violet-500 dark:text-violet-400">
                {icon}
            </div>
            <div className="min-w-0 flex-1">
                <p className="text-[10px] font-medium text-gray-400 dark:text-gray-500 uppercase tracking-wider">{label}</p>
                {href ? (
                    <a
                        href={href}
                        className="text-sm text-gray-700 dark:text-gray-200 hover:text-violet-600 dark:hover:text-violet-400 transition-colors truncate block"
                    >
                        {value}
                    </a>
                ) : (
                    <p className="text-sm text-gray-700 dark:text-gray-200 truncate">{value}</p>
                )}
            </div>
            {copyable && (
                <button
                    type="button"
                    onClick={handleCopy}
                    className="opacity-0 group-hover:opacity-100 transition-opacity p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 cursor-pointer"
                    title={`Copy ${label}`}
                >
                    {copied ? <Check className="h-3.5 w-3.5 text-emerald-500" /> : <Copy className="h-3.5 w-3.5" />}
                </button>
            )}
        </div>
    );
}
