import { Suspense, lazy } from "react";
import AnimatedPage from "@/components/ui/AnimatedPage";

const DashboardManager = lazy(
  () => import("@/components/collegeadmin/dashboard/DashboardManager"),
);

function DashboardSkeleton() {
  return (
    <div className="animate-pulse space-y-5 p-4 lg:p-6">
      <div className="h-8 w-48 rounded-lg bg-gray-200 dark:bg-gray-700" />
      <div className="grid grid-cols-2 gap-3 md:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 10 }).map((_, i) => (
          <div
            key={i}
            className="h-24 rounded-xl bg-gray-200 dark:bg-gray-700"
          />
        ))}
      </div>
      <div className="h-10 rounded-xl bg-gray-200 dark:bg-gray-700" />
      <div className="h-72 rounded-xl bg-gray-200 dark:bg-gray-700" />
    </div>
  );
}

export default function Dashboard() {
  return (
    <AnimatedPage>
      <Suspense fallback={<DashboardSkeleton />}>
        <DashboardManager />
      </Suspense>
    </AnimatedPage>
  );
}
