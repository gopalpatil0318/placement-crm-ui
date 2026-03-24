import { lazy, Suspense } from "react";
import AnimatedPage from "@/components/ui/AnimatedPage";
import PageHeader from "@/components/collegeadmin/PageHeader";
import { SentNotificationsSkeleton } from "@/components/collegeadmin/notifications/SentNotificationsManager";

const SentNotificationsManager = lazy(
    () => import("@/components/collegeadmin/notifications/SentNotificationsManager"),
);

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Notification History", active: true },
];

export default function NotificationHistory() {
    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Notification History"
                    breadcrumbs={BREADCRUMBS}
                />
                <Suspense fallback={<SentNotificationsSkeleton />}>
                    <SentNotificationsManager />
                </Suspense>
            </div>
        </AnimatedPage>
    );
}
