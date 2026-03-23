import { lazy, Suspense } from "react";
import AnimatedPage from "@/components/ui/AnimatedPage";
import PageHeader from "@/components/collegeadmin/PageHeader";

const ComposeNotification = lazy(
    () => import("@/components/collegeadmin/notifications/ComposeNotification"),
);

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Send Notification", active: true },
];

function ComposeSkeleton() {
    return (
        <div className="max-w-3xl mx-auto space-y-6 animate-pulse">
            {/* Step indicator */}
            <div className="flex items-center justify-center gap-2 mb-8">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div key={i} className="flex items-center gap-2">
                        {i > 0 && <div className="w-12 h-0.5 bg-gray-200 dark:bg-gray-700" />}
                        <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700" />
                    </div>
                ))}
            </div>
            {/* Form skeleton */}
            <div className="space-y-4">
                <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="h-24 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="h-10 w-full rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
        </div>
    );
}

export default function SendNotification() {
    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Send Notification"
                    breadcrumbs={BREADCRUMBS}
                />
                <Suspense fallback={<ComposeSkeleton />}>
                    <ComposeNotification />
                </Suspense>
            </div>
        </AnimatedPage>
    );
}
