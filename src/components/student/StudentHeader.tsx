import { useState } from "react";
import {
    Menu,
    Search,
    Sun,
    Moon,
    Building2,
} from "lucide-react";
import { useTheme } from "next-themes";
import { useCollegeTenant } from "@/context/CollegeTenantContext";
import { sanitizeImageUrl } from "@/utils/sanitize";

export default function Header({ onMenuClick }: Readonly<{ onMenuClick: () => void }>) {
    const { theme, setTheme } = useTheme();
    const { college } = useCollegeTenant();
    const [logoError, setLogoError] = useState(false);

    const toggleTheme = () => setTheme(theme === "dark" ? "light" : "dark");

    return (
        <header className="sticky top-0 z-30 w-full h-16 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 flex items-center justify-between px-6">
            {/* LEFT */}
            <div className="flex items-center gap-4">
                {/* Hamburger */}
                <button
                    type="button"
                    onClick={onMenuClick}
                    className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors cursor-pointer"
                >
                    <Menu size={20} className="text-gray-600 dark:text-gray-300" />
                </button>

                {/* College branding */}
                {college && (
                    <div className="hidden sm:flex items-center gap-2.5">
                        {sanitizeImageUrl(college.college_logo_url) && !logoError ? (
                            <img
                                src={sanitizeImageUrl(college.college_logo_url)!}
                                alt={college.college_name}
                                width={32}
                                height={32}
                                decoding="async"
                                onError={() => setLogoError(true)}
                                className="h-8 w-8 rounded-md object-contain"
                            />
                        ) : (
                            <div className="h-8 w-8 rounded-md bg-blue-100 dark:bg-blue-900/40 flex items-center justify-center">
                                <Building2 size={16} className="text-blue-600" />
                            </div>
                        )}
                        <span className="text-sm font-semibold text-gray-800 dark:text-gray-200 truncate max-w-[200px]">
                            {college.college_name}
                        </span>
                    </div>
                )}

                {/* Search */}
                <div className="relative hidden md:block">
                    <Search
                        size={16}
                        className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-gray-500"
                    />
                    <input
                        type="text"
                        placeholder="Search… (Ctrl+K)"
                        className="pl-9 pr-4 py-2 w-64 text-sm rounded-lg border border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 text-gray-700 dark:text-gray-200 placeholder:text-gray-400 dark:placeholder:text-gray-500 transition-shadow"
                    />
                </div>
            </div>

            {/* RIGHT */}
            <div className="flex items-center gap-3">
                <IconButton onClick={toggleTheme} label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}>
                    {theme === "dark" ? <Moon size={18} /> : <Sun size={18} />}
                </IconButton>
            </div>
        </header>
    );
}

function IconButton({ children, onClick, label }: Readonly<{ children: React.ReactNode; onClick?: () => void; label?: string }>) {
    return (
        <button
            type="button"
            onClick={onClick}
            aria-label={label}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
        >
            {children}
        </button>
    );
}
