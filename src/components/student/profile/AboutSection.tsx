import { FileText } from "lucide-react";
import { useState } from "react";
import type { ProfileLinks } from "@/types/student";

interface AboutSectionProps {
    profileLinks: ProfileLinks | null;
}

const BIO_TRUNCATE_LENGTH = 200;

export default function AboutSection({ profileLinks }: AboutSectionProps) {
    const bio = profileLinks?.bio;
    const interests = profileLinks?.area_of_interest;
    const [expanded, setExpanded] = useState(false);

    const isLongBio = bio && bio.length > BIO_TRUNCATE_LENGTH;
    const displayBio =
        bio && isLongBio && !expanded
            ? bio.slice(0, BIO_TRUNCATE_LENGTH).trimEnd() + "..."
            : bio;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-5">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2 mb-3">
                <FileText className="h-4 w-4 text-violet-500" />
                About
            </h2>

            {displayBio ? (
                <>
                    <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                        {displayBio}
                    </p>
                    {isLongBio && (
                        <button
                            onClick={() => setExpanded(!expanded)}
                            className="text-xs text-violet-600 font-medium mt-1 hover:text-violet-700 cursor-pointer"
                        >
                            {expanded ? "Show less" : "Read more"}
                        </button>
                    )}
                </>
            ) : (
                <p className="text-sm text-gray-400 italic">
                    No bio added yet.
                </p>
            )}

            {/* Area of interest tags */}
            {interests && interests.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-50">
                    <div className="flex flex-wrap gap-1.5">
                        {interests.map((interest) => (
                            <span
                                key={interest}
                                className="px-2 py-0.5 rounded-md text-[11px] font-medium bg-violet-50 text-violet-600 border border-violet-100"
                            >
                                {interest}
                            </span>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
