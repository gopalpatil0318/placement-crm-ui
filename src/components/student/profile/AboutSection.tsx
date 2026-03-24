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
        <div className="bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm rounded-2xl border border-gray-100 dark:border-gray-800 p-5 transition-shadow hover:shadow-md">
            <h2 className="text-sm font-semibold text-gray-900 dark:text-gray-100 uppercase tracking-wide flex items-center gap-2 mb-3">
                <div className="h-7 w-7 rounded-lg bg-violet-50 dark:bg-violet-900/30 flex items-center justify-center">
                    <FileText className="h-3.5 w-3.5 text-violet-500 dark:text-violet-400" />
                </div>
                About
            </h2>

            {displayBio ? (
                <>
                    <p className="text-[15px] text-gray-600 dark:text-gray-300 leading-relaxed whitespace-pre-line">
                        {displayBio}
                    </p>
                    {isLongBio && (
                        <button
                            type="button"
                            onClick={() => setExpanded(!expanded)}
                            className="text-xs text-violet-600 dark:text-violet-400 font-medium mt-1.5 hover:text-violet-700 dark:hover:text-violet-300 cursor-pointer transition-colors"
                        >
                            {expanded ? "Show less" : "Read more"}
                        </button>
                    )}
                </>
            ) : (
                <p className="text-sm text-gray-400 dark:text-gray-500 italic">
                    No bio added yet.
                </p>
            )}

            {/* Area of interest tags */}
            {interests && interests.length > 0 && (
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-gray-800">
                    <div className="flex flex-wrap gap-1.5">
                        {interests.map((interest) => (
                            <span
                                key={interest}
                                className="px-2.5 py-1 rounded-lg text-[11px] font-medium bg-violet-50 dark:bg-violet-900/30 text-violet-600 dark:text-violet-400 border border-violet-100 dark:border-violet-800/50 hover:bg-violet-100 dark:hover:bg-violet-900/50 hover:scale-105 transition-all duration-200 cursor-default"
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
