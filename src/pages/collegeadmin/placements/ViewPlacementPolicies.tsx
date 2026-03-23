import PageHeader from "@/components/collegeadmin/PageHeader";
import PlacementPolicyManager from "@/components/collegeadmin/placements/PlacementPolicyManager";
import AnimatedPage from "@/components/ui/AnimatedPage";

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Placement Policies", active: true },
];

const ViewPlacementPolicies = () => (
    <AnimatedPage>
        <div className="space-y-6">
            <PageHeader title="Placement Policies" breadcrumbs={BREADCRUMBS} />
            <PlacementPolicyManager />
        </div>
    </AnimatedPage>
);

export default ViewPlacementPolicies;
