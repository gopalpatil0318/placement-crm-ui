import React from "react";
import { useNavigate } from "react-router-dom";
import { Users, BookOpen, ArrowRight, Plus } from "lucide-react";
import PageHeader from "@/components/collegeadmin/PageHeader";
import { useDepartmentCards } from "@/hooks/collegeadmin/student_management/useDepartmentCards";

// Uniform color for all department cards
const CARD_COLOR = { bg: "bg-blue-50", border: "border-blue-200", icon: "bg-blue-100 text-blue-600", hoverBorder: "hover:border-blue-400", shadow: "hover:shadow-blue-100" };

const DepartmentStudentCards: React.FC = () => {
    const navigate = useNavigate();
    const { departments, loading } = useDepartmentCards();

    const breadcrumbs = [
        { label: "Dashboard", path: "/college/dashboard" },
        { label: "Students", active: true },
    ];

    const handleCardClick = (deptId: string) => {
        navigate(`/college/students/${deptId}`);
    };

    return (
        <div className="space-y-8">
            <PageHeader title="Student Registration" breadcrumbs={breadcrumbs} />

            <div className="w-full">
                <div className="p-8 bg-white rounded-xl border">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6">
                        <div>
                            <h1 className="text-xl font-semibold text-gray-800">
                                Manage Students
                            </h1>
                            <p className="text-sm text-gray-500 mt-1">
                                Select a department to view and manage student entries
                            </p>
                        </div>

                        <div className="flex items-center gap-3 mt-3 sm:mt-0">
                            <button
                                onClick={() => navigate("/college/create-student")}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 font-bold transition"
                            >
                                <Plus size={16} />
                                Register Student
                            </button>
                            <button
                                onClick={() => navigate("/college/bulk-register")}
                                className="flex items-center gap-2 px-4 py-2 text-sm bg-white text-blue-600 border border-blue-600 rounded-md hover:bg-blue-50 font-bold transition"
                            >
                                <Users size={16} />
                                Bulk Register
                            </button>
                        </div>
                    </div>



                    {/* Department Cards Grid */}
                    {loading ? (
                        <div className="flex items-center justify-center py-16">
                            <div className="flex flex-col items-center gap-3">
                                <div className="h-10 w-10 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
                                <p className="text-sm text-gray-500 italic">Loading departments...</p>
                            </div>
                        </div>
                    ) : departments.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                            {departments.map((dept: any) => {
                                return (
                                    <div
                                        key={dept.dept_id}
                                        onClick={() => handleCardClick(dept.dept_id)}
                                        className={`group relative p-5 rounded-xl border-2 ${CARD_COLOR.border} ${CARD_COLOR.bg} ${CARD_COLOR.hoverBorder} ${CARD_COLOR.shadow} cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1`}
                                    >
                                        {/* Icon */}
                                        <div className={`h-12 w-12 rounded-xl ${CARD_COLOR.icon} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}>
                                            <BookOpen size={24} />
                                        </div>

                                        {/* Department Name */}
                                        <h3 className="text-base font-bold text-gray-800 group-hover:text-gray-900 transition-colors">
                                            {dept.dept_name}
                                        </h3>

                                        {/* Arrow indicator */}
                                        <div className="absolute top-5 right-5 text-gray-300 group-hover:text-gray-500 transition-all duration-300 group-hover:translate-x-1">
                                            <ArrowRight size={18} />
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center py-16 text-gray-500">
                            <BookOpen size={48} className="text-gray-300 mb-3" />
                            <p className="text-lg font-medium">No departments found</p>
                            <p className="text-sm">Create departments first to manage students</p>
                        </div>
                    )}

                    {/* Footer */}
                    <div className="mt-6 text-sm text-gray-600 font-semibold italic">
                        {departments.length > 0
                            ? `Showing ${departments.length} department${departments.length !== 1 ? "s" : ""}`
                            : "No departments to display"}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DepartmentStudentCards;
