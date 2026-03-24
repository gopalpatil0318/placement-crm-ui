import { Suspense, lazy } from "react";
import AnimatedPage from "@/components/ui/AnimatedPage";

const SkillsManager = lazy(
    () => import("@/components/collegeadmin/skills/SkillsManager"),
);

function SkillsSkeleton() {
    return (
        <div className="animate-pulse space-y-5 p-4 lg:p-6">
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
                    <div className="space-y-2">
                        <div className="h-5 w-32 rounded bg-gray-200 dark:bg-gray-700" />
                        <div className="h-3 w-48 rounded bg-gray-200 dark:bg-gray-700" />
                    </div>
                </div>
                <div className="h-10 w-28 rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="flex gap-3">
                <div className="h-10 flex-1 rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="h-10 w-40 rounded-lg bg-gray-200 dark:bg-gray-700" />
                <div className="h-10 w-32 rounded-lg bg-gray-200 dark:bg-gray-700" />
            </div>
            <div className="space-y-3">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="h-12 rounded-lg bg-gray-200 dark:bg-gray-700" />
                ))}
            </div>
        </div>
    );
}

export default function ViewSkills() {
    return (
        <AnimatedPage>
            <Suspense fallback={<SkillsSkeleton />}>
                <SkillsManager />
            </Suspense>
        </AnimatedPage>
    );
}
