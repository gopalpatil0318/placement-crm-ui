import PageHeader from "@/components/collegeadmin/PageHeader";
import PlacementManager from "@/components/collegeadmin/placements/PlacementManager";
import AnimatedPage from "@/components/ui/AnimatedPage";

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Placements", active: true },
];

const ViewPlacements = () => (
    <AnimatedPage>
        <div className="space-y-6">
            <PageHeader title="Placement Results" breadcrumbs={BREADCRUMBS} />
            <PlacementManager />
        </div>
    </AnimatedPage>
);

export default ViewPlacements;
