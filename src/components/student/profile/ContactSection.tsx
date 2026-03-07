import { Mail, Phone, MapPin } from "lucide-react";
import type { PersonalInfo, StudentInfo } from "@/types/student";

interface ContactSectionProps {
    personalInfo: PersonalInfo | null;
    student: StudentInfo | null;
}

export default function ContactSection({
    personalInfo,
    student,
}: ContactSectionProps) {
    const email = student?.student_email;
    const phone = personalInfo?.mobile_number;
    const altPhone = personalInfo?.alternate_mobile;
    const city = personalInfo?.current_city;
    const state = personalInfo?.current_state;

    const hasLocation = city || state;

    if (!email && !phone) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2 mb-3">
                    <Mail className="h-4 w-4 text-violet-500" />
                    Contact
                </h2>
                <p className="text-sm text-gray-400 italic">
                    No contact info available.
                </p>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2 mb-5">
                <Mail className="h-4 w-4 text-violet-500" />
                Contact
            </h2>
            <div className="space-y-3.5">
                {email && (
                    <a
                        href={`mailto:${email}`}
                        className="flex items-center gap-3 group"
                    >
                        <div className="h-9 w-9 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-100 transition-colors">
                            <Mail className="h-4 w-4 text-violet-500" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                Email
                            </p>
                            <p className="text-sm text-gray-700 truncate group-hover:text-violet-600 transition-colors">
                                {email}
                            </p>
                        </div>
                    </a>
                )}
                {phone && (
                    <a
                        href={`tel:+91${phone}`}
                        className="flex items-center gap-3 group"
                    >
                        <div className="h-9 w-9 rounded-lg bg-violet-50 flex items-center justify-center flex-shrink-0 group-hover:bg-violet-100 transition-colors">
                            <Phone className="h-4 w-4 text-violet-500" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                Phone
                            </p>
                            <p className="text-sm text-gray-700 group-hover:text-violet-600 transition-colors">
                                +91 {phone}
                            </p>
                        </div>
                    </a>
                )}
                {altPhone && (
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                            <Phone className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                Alternate
                            </p>
                            <p className="text-sm text-gray-500">
                                +91 {altPhone}
                            </p>
                        </div>
                    </div>
                )}
                {hasLocation && (
                    <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-lg bg-gray-50 flex items-center justify-center flex-shrink-0">
                            <MapPin className="h-4 w-4 text-gray-400" />
                        </div>
                        <div className="min-w-0">
                            <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">
                                Location
                            </p>
                            <p className="text-sm text-gray-500">
                                {[city, state].filter(Boolean).join(", ")}
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
