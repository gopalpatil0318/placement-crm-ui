import { lazy, Suspense } from "react";
import AnimatedPage from "@/components/ui/AnimatedPage";
import PageHeader from "@/components/collegeadmin/PageHeader";

const VerificationCenter = lazy(
    () => import("@/components/collegeadmin/verification/VerificationCenter"),
);

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Verification Center", active: true },
];

function VerificationSkeleton() {
    return (
        <div className="space-y-6 animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-1.5">
                    <div className="h-5 w-40 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-3 w-56 rounded bg-gray-100 dark:bg-gray-800" />
                </div>
            </div>
            {/* Cards skeleton */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex items-center gap-4 p-5 rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900"
                    >
                        <div className="h-12 w-12 rounded-xl bg-gray-200 dark:bg-gray-700" />
                        <div className="space-y-2">
                            <div className="h-7 w-12 rounded bg-gray-200 dark:bg-gray-700" />
                            <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800" />
                        </div>
                    </div>
                ))}
            </div>
            {/* Table skeleton */}
            <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4">
                <div className="h-10 rounded bg-gray-100 dark:bg-gray-800 mb-3" />
                {Array.from({ length: 5 }).map((_, i) => (
                    <div
                        key={i}
                        className="flex gap-4 py-3 border-b border-gray-50 dark:border-gray-800"
                    >
                        <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-4 w-8 rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-4 flex-1 rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-4 w-24 rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-4 w-16 rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                ))}
            </div>
        </div>
    );
}

export default function ViewVerifications() {
    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Verification Center"
                    breadcrumbs={BREADCRUMBS}
                />
                <Suspense fallback={<VerificationSkeleton />}>
                    <VerificationCenter />
                </Suspense>
            </div>
        </AnimatedPage>
    );
}
