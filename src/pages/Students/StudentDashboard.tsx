import StudentDashboardLayout from "@/components/student/StudentDashboardLayout";
import PageHeader from "@/components/student/PageHeader";

export default function StudentDashboard() {
    return (
        <StudentDashboardLayout>
            <PageHeader
                title="Student Dashboard"
                breadcrumbs={[
                    { label: "Home" },
                    { label: "Student" },
                    { label: "Dashboard", active: true },
                ]}
            />

            <div className="mt-8">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Placement Status Card */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-lg bg-blue-50 flex items-center justify-center">
                                <span className="text-blue-600 text-lg">📋</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Placement Status</h3>
                                <p className="text-xs text-gray-500">Your current status</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">View and track your placement progress.</p>
                    </div>

                    {/* Upcoming Drives Card */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-lg bg-green-50 flex items-center justify-center">
                                <span className="text-green-600 text-lg">🏢</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Upcoming Drives</h3>
                                <p className="text-xs text-gray-500">Scheduled events</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">Check upcoming placement drives and deadlines.</p>
                    </div>

                    {/* Profile Completion Card */}
                    <div className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-lg bg-purple-50 flex items-center justify-center">
                                <span className="text-purple-600 text-lg">👤</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900">Profile</h3>
                                <p className="text-xs text-gray-500">Complete your profile</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600">Keep your profile updated for better opportunities.</p>
                    </div>
                </div>
            </div>
        </StudentDashboardLayout>
    );
}
