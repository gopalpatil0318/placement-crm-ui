import CreateDepartmentForm from "@/components/collegeadmin/departmentManagement/CreateDepartmentForm";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Departments", path: "/college/departments" },
    { label: "Create New", active: true },
];

const CreateDepartment = () => (
    <AnimatedPage>
        <div className="space-y-6">
            <PageHeader title="Register New Department" breadcrumbs={BREADCRUMBS} />
            <CreateDepartmentForm />
        </div>
    </AnimatedPage>
);

export default CreateDepartment;
