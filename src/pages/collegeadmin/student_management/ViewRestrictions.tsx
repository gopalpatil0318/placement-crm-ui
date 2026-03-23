import AnimatedPage from "@/components/ui/AnimatedPage";
import PageHeader from "@/components/collegeadmin/PageHeader";
import RestrictionListView from "@/components/collegeadmin/student_management/restrictions/RestrictionListView";

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Student Restrictions", active: true },
];

export default function ViewRestrictions() {
    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader title="Student Restrictions" breadcrumbs={BREADCRUMBS} />
                <RestrictionListView />
            </div>
        </AnimatedPage>
    );
}
