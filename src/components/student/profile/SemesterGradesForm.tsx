import { BookOpen, CheckCircle2, AlertTriangle } from "lucide-react";
import type { SemesterGradesResponse } from "@/types/student";

interface SemesterGradesFormProps {
    semesterGrades: SemesterGradesResponse | null;
}

export default function SemesterGradesForm({
    semesterGrades,
}: SemesterGradesFormProps) {
    if (!semesterGrades) {
        return (
            <div className="bg-white rounded-2xl border border-gray-100 p-6">
                <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2 mb-3">
                    <BookOpen className="h-4 w-4 text-violet-500" />
                    Semester Grades
                </h2>
                <p className="text-sm text-gray-400 italic">
                    No semester grades available.
                </p>
            </div>
        );
    }

    const { total_semesters_in_dept, completed_semesters, grades } =
        semesterGrades;

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-6">
            <h2 className="text-sm font-semibold text-gray-900 uppercase tracking-wide flex items-center gap-2 mb-5">
                <BookOpen className="h-4 w-4 text-violet-500" />
                Semester Grades
                <span className="text-xs font-normal text-gray-400 ml-auto">
                    {completed_semesters}/{total_semesters_in_dept} completed
                </span>
            </h2>

            {/* Progress bar */}
            <div className="mb-5">
                <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                    <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{
                            width: `${(completed_semesters / total_semesters_in_dept) * 100}%`,
                            background: "linear-gradient(135deg, #694ed6 0%, #c137a2 100%)",
                        }}
                    />
                </div>
            </div>

            {grades.length === 0 ? (
                <p className="text-sm text-gray-400 italic">No grades recorded yet.</p>
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="text-left text-xs text-gray-400 uppercase tracking-wider border-b border-gray-100">
                                <th className="pb-2 pr-4">Semester</th>
                                <th className="pb-2 pr-4">SGPA</th>
                                <th className="pb-2 pr-4">CGPA</th>
                                <th className="pb-2 pr-4">Status</th>
                                <th className="pb-2 pr-4">Backlogs</th>
                                <th className="pb-2">Backlog Subjects</th>
                            </tr>
                        </thead>
                        <tbody>
                            {grades
                                .sort((a, b) => a.semester_number - b.semester_number)
                                .map((grade) => {
                                    const hasBacklogs = grade.backlogs_in_semester > 0;
                                    const hasSubjects =
                                        grade.backlog_subjects && grade.backlog_subjects.length > 0;

                                    return (
                                        <tr
                                            key={grade.grade_id || grade.semester_number}
                                            className="border-b border-gray-50 last:border-0"
                                        >
                                            <td className="py-3 pr-4 font-medium text-gray-900">
                                                Sem {grade.semester_number}
                                            </td>
                                            <td className="py-3 pr-4 font-semibold text-gray-900">
                                                {grade.sgpa || "–"}
                                            </td>
                                            <td className="py-3 pr-4 font-semibold text-violet-600">
                                                {grade.cgpa || "–"}
                                            </td>
                                            <td className="py-3 pr-4">
                                                {grade.semester_status === "completed" ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-green-50 text-green-700">
                                                        <CheckCircle2 className="h-3 w-3" />
                                                        completed
                                                    </span>
                                                ) : (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-blue-50 text-blue-700">
                                                        in_progress
                                                    </span>
                                                )}
                                            </td>
                                            <td className="py-3 pr-4">
                                                {hasBacklogs ? (
                                                    <span className="inline-flex items-center gap-1 text-orange-600 font-semibold">
                                                        <AlertTriangle className="h-3 w-3" />
                                                        {grade.backlogs_in_semester}
                                                    </span>
                                                ) : (
                                                    <span className="text-green-600 font-medium">0</span>
                                                )}
                                            </td>
                                            <td className="py-3">
                                                {hasSubjects ? (
                                                    <div className="flex flex-wrap gap-1">
                                                        {grade.backlog_subjects.map((subject, idx) => (
                                                            <span
                                                                key={idx}
                                                                className="px-2 py-0.5 rounded text-[11px] font-medium bg-red-50 text-red-600 border border-red-100"
                                                            >
                                                                {subject}
                                                            </span>
                                                        ))}
                                                    </div>
                                                ) : (
                                                    <span className="text-xs text-gray-400">None</span>
                                                )}
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}
