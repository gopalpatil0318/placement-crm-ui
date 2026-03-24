import PageHeader from "@/components/student/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";

export default function StudentDashboard() {
    return (
        <AnimatedPage>
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
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center">
                                <span className="text-blue-600 dark:text-blue-400 text-lg">📋</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Placement Status</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Your current status</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">View and track your placement progress.</p>
                    </div>

                    {/* Upcoming Drives Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-lg bg-green-50 dark:bg-green-900/20 flex items-center justify-center">
                                <span className="text-green-600 dark:text-green-400 text-lg">🏢</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Upcoming Drives</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Scheduled events</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Check upcoming placement drives and deadlines.</p>
                     </div>

                    {/* Profile Completion Card */}
                    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-6 hover:shadow-md transition-shadow">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="h-10 w-10 rounded-lg bg-purple-50 dark:bg-purple-900/20 flex items-center justify-center">
                                <span className="text-purple-600 dark:text-purple-400 text-lg">👤</span>
                            </div>
                            <div>
                                <h3 className="font-semibold text-gray-900 dark:text-gray-100">Profile</h3>
                                <p className="text-xs text-gray-500 dark:text-gray-400">Complete your profile</p>
                            </div>
                        </div>
                        <p className="text-sm text-gray-600 dark:text-gray-400">Keep your profile updated for better opportunities.</p>
                    </div>
                </div>
            </div>
        </AnimatedPage>
    );
}