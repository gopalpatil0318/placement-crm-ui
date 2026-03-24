import CreateUserForm from '@/components/collegeadmin/user_management/CreateUserForm';
import PageHeader from '@/components/collegeadmin/PageHeader';
import AnimatedPage from '@/components/ui/AnimatedPage';

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Users", path: "/college/view-users" },
    { label: "Create New", active: true },
];

const CreateUser = () => (
    <AnimatedPage>
        <div className="space-y-8">
            <PageHeader title="Register New User" breadcrumbs={BREADCRUMBS} />
            <CreateUserForm />
        </div>
    </AnimatedPage>
);

export default CreateUser;
