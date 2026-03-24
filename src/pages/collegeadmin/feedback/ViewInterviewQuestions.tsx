import { lazy, Suspense } from "react";
import AnimatedPage from "@/components/ui/AnimatedPage";
import PageHeader from "@/components/collegeadmin/PageHeader";

const InterviewQuestionManager = lazy(
    () => import("@/components/collegeadmin/interview_questions/InterviewQuestionManager"),
);

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Interview Questions", active: true },
];

function InterviewQuestionsSkeleton() {
    return (
        <div className="space-y-5 animate-pulse">
            {/* Header skeleton */}
            <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
                <div className="space-y-1.5">
                    <div className="h-5 w-44 rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-3 w-64 rounded bg-gray-100 dark:bg-gray-800" />
                </div>
            </div>
            {/* Stats skeleton */}
            <div className="grid grid-cols-3 gap-3">
                {Array.from({ length: 3 }).map((_, i) => (
                    <div
                        key={i}
                        className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-4"
                    >
                        <div className="h-3 w-16 rounded bg-gray-200 dark:bg-gray-700 mb-2" />
                        <div className="h-7 w-10 rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                ))}
            </div>
            {/* Topic chips skeleton */}
            <div className="flex gap-2">
                <div className="h-3 w-16 rounded bg-gray-100 dark:bg-gray-800" />
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-6 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                ))}
            </div>
            {/* Filter bar skeleton */}
            <div className="flex flex-wrap gap-3">
                <div className="h-9 w-52 rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="h-9 w-32 rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="h-9 w-32 rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="h-9 w-36 rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
            {/* Card skeletons */}
            {Array.from({ length: 3 }).map((_, i) => (
                <div
                    key={i}
                    className="rounded-xl border border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 p-5 space-y-3"
                >
                    <div className="flex items-center gap-3">
                        <div className="h-4 w-4 rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-5 w-20 rounded-full bg-purple-100 dark:bg-purple-900/30" />
                        <div className="ml-auto h-5 w-16 rounded-full bg-gray-200 dark:bg-gray-700" />
                    </div>
                    <div className="h-4 w-full rounded bg-gray-200 dark:bg-gray-700" />
                    <div className="h-4 w-4/5 rounded bg-gray-100 dark:bg-gray-800" />
                    <div className="flex items-center gap-4 pt-1">
                        <div className="h-3 w-28 rounded bg-gray-100 dark:bg-gray-800" />
                        <div className="h-3 w-24 rounded bg-gray-100 dark:bg-gray-800" />
                        <div className="h-3 w-20 rounded bg-gray-100 dark:bg-gray-800" />
                    </div>
                </div>
            ))}
        </div>
    );
}

export default function ViewInterviewQuestions() {
    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader
                    title="Interview Questions"
                    breadcrumbs={BREADCRUMBS}
                />
                <Suspense fallback={<InterviewQuestionsSkeleton />}>
                    <InterviewQuestionManager />
                </Suspense>
            </div>
        </AnimatedPage>
    );
}
