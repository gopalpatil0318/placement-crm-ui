import { useNavigate } from "react-router-dom";
import { ArrowRight, Plus, Users, GraduationCap, Filter } from "lucide-react";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";
import { AnimatedGrid, AnimatedGridItem } from "@/components/ui/AnimatedList";
import { useDepartmentCards } from "@/hooks/collegeadmin/student_management/useDepartmentCards";

// ========================
// CONSTANTS
// ========================

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Students", active: true },
];

const CARD_COLORS = [
    "bg-blue-50 dark:bg-blue-900/20 border-blue-200 dark:border-blue-800 hover:border-blue-400 dark:hover:border-blue-600",
    "bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800 hover:border-emerald-400 dark:hover:border-emerald-600",
    "bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800 hover:border-purple-400 dark:hover:border-purple-600",
    "bg-orange-50 dark:bg-orange-900/20 border-orange-200 dark:border-orange-800 hover:border-orange-400 dark:hover:border-orange-600",
    "bg-cyan-50 dark:bg-cyan-900/20 border-cyan-200 dark:border-cyan-800 hover:border-cyan-400 dark:hover:border-cyan-600",
    "bg-pink-50 dark:bg-pink-900/20 border-pink-200 dark:border-pink-800 hover:border-pink-400 dark:hover:border-pink-600",
    "bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800 hover:border-amber-400 dark:hover:border-amber-600",
    "bg-teal-50 dark:bg-teal-900/20 border-teal-200 dark:border-teal-800 hover:border-teal-400 dark:hover:border-teal-600",
] as const;

const ICON_COLORS = [
    "bg-blue-100 dark:bg-blue-800/40 text-blue-600 dark:text-blue-400",
    "bg-emerald-100 dark:bg-emerald-800/40 text-emerald-600 dark:text-emerald-400",
    "bg-purple-100 dark:bg-purple-800/40 text-purple-600 dark:text-purple-400",
    "bg-orange-100 dark:bg-orange-800/40 text-orange-600 dark:text-orange-400",
    "bg-cyan-100 dark:bg-cyan-800/40 text-cyan-600 dark:text-cyan-400",
    "bg-pink-100 dark:bg-pink-800/40 text-pink-600 dark:text-pink-400",
    "bg-amber-100 dark:bg-amber-800/40 text-amber-600 dark:text-amber-400",
    "bg-teal-100 dark:bg-teal-800/40 text-teal-600 dark:text-teal-400",
] as const;

// ========================
// SUB-COMPONENTS
// ========================

const SkeletonCards = () => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-5 rounded-xl border-2 border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800 animate-pulse">
                <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700 mb-4" />
                <div className="h-5 w-3/4 bg-gray-200 dark:bg-gray-700 rounded mb-2" />
                <div className="h-3 w-1/2 bg-gray-100 dark:bg-gray-800 rounded" />
            </div>
        ))}
    </div>
);

const EmptyState = ({ onAdd }: { onAdd: () => void }) => (
    <div className="py-16 text-center">
        <div className="mx-auto h-14 w-14 rounded-2xl bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Filter className="h-6 w-6 text-gray-400 dark:text-gray-500" />
        </div>
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-1">No departments found</h3>
        <p className="text-xs text-gray-500 dark:text-gray-400 mb-6 max-w-xs mx-auto">
            Create departments first to manage students by department.
        </p>
        <button
            type="button"
            onClick={onAdd}
            className="inline-flex items-center gap-2 px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-semibold transition shadow-sm"
        >
            <Plus className="h-4 w-4" />
            Register Student
        </button>
    </div>
);

// ========================
// MAIN COMPONENT
// ========================

const DepartmentStudentCards = () => {
    const navigate = useNavigate();
    const { departments, loading, totalStudents } = useDepartmentCards();

    return (
        <AnimatedPage>
            <div className="space-y-8">
                <PageHeader title="Student Registration" breadcrumbs={BREADCRUMBS} />

                <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 overflow-hidden">
                    {/* Header */}
                    <div className="p-6 border-b border-gray-100 dark:border-gray-800">
                        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                            <div>
                                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                                    Manage Students
                                    {totalStudents > 0 && (
                                        <span className="ml-2 text-sm font-normal text-gray-500 dark:text-gray-400">
                                            ({totalStudents} total)
                                        </span>
                                    )}
                                </h2>
                                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                    Select a department to view and manage student entries
                                </p>
                            </div>
                            <div className="flex items-center gap-3">
                                <button
                                    type="button"
                                    onClick={() => navigate("/college/create-student")}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-sm font-semibold transition shadow-sm"
                                >
                                    <Plus className="h-4 w-4" />
                                    Register Student
                                </button>
                                <button
                                    type="button"
                                    onClick={() => navigate("/college/bulk-register")}
                                    className="inline-flex items-center gap-2 px-5 py-2.5 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded-xl text-sm font-semibold hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                                >
                                    <Users className="h-4 w-4" />
                                    Bulk Register
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Cards */}
                    <div className="p-6">
                        {loading ? (
                            <SkeletonCards />
                        ) : departments.length > 0 ? (
                            <AnimatedGrid className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                                {departments.map((dept: any) => {
                                    const colorIdx = dept.dept_name.charCodeAt(0) % CARD_COLORS.length;
                                    return (
                                        <AnimatedGridItem key={dept.dept_id}>
                                            <div
                                                onClick={() => navigate(`/college/students/${dept.dept_id}`)}
                                                className={`group relative p-5 rounded-xl border-2 cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 ${CARD_COLORS[colorIdx]}`}
                                            >
                                                {/* Icon */}
                                                <div className={`h-12 w-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300 ${ICON_COLORS[colorIdx]}`}>
                                                    <GraduationCap className="h-6 w-6" />
                                                </div>

                                                {/* Dept Name */}
                                                <h3 className="text-base font-bold text-gray-800 dark:text-gray-100 group-hover:text-gray-900 dark:group-hover:text-white transition-colors">
                                                    {dept.dept_name}
                                                </h3>

                                                {/* Code tag */}
                                                {dept.dept_code && (
                                                    <span className="inline-block mt-2 text-xs font-mono px-2 py-0.5 rounded bg-white/60 dark:bg-gray-800/60 text-gray-500 dark:text-gray-400">
                                                        {dept.dept_code}
                                                    </span>
                                                )}

                                                {/* Arrow */}
                                                <div className="absolute top-5 right-5 text-gray-300 dark:text-gray-600 group-hover:text-gray-500 dark:group-hover:text-gray-400 transition-all duration-300 group-hover:translate-x-1">
                                                    <ArrowRight className="h-5 w-5" />
                                                </div>
                                            </div>
                                        </AnimatedGridItem>
                                    );
                                })}
                            </AnimatedGrid>
                        ) : (
                            <EmptyState onAdd={() => navigate("/college/create-student")} />
                        )}
                    </div>

                    {/* Footer */}
                    {departments.length > 0 && (
                        <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-800">
                            <p className="text-sm text-gray-500 dark:text-gray-400 font-medium">
                                Showing <span className="font-semibold text-gray-700 dark:text-gray-300">{departments.length}</span> department{departments.length !== 1 ? "s" : ""}
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </AnimatedPage>
    );
};

export default DepartmentStudentCards;
