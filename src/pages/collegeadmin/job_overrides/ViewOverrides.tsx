import PageHeader from "@/components/collegeadmin/PageHeader";
import OverrideDashboard from "@/components/collegeadmin/company_management/overrides/OverrideDashboard";

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Override Requests", active: true },
];

const ViewOverrides = () => {
    return (
            <div className="space-y-6">
                <PageHeader title="Override Requests" breadcrumbs={BREADCRUMBS} />
                <OverrideDashboard />
            </div>
    );
};

export default ViewOverrides;
