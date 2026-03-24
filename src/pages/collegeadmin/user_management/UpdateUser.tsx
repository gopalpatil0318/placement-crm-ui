import { useState, useMemo, useCallback } from 'react';
import UpdateUserForm from '@/components/collegeadmin/user_management/UpdateUserForm';
import PageHeader from '@/components/collegeadmin/PageHeader';
import AnimatedPage from '@/components/ui/AnimatedPage';

const UpdateUser = () => {
    const [userName, setUserName] = useState<string | undefined>();

    const breadcrumbs = useMemo(() => [
        { label: "Dashboard", path: "/college/dashboard" },
        { label: "Users", path: "/college/view-users" },
        { label: userName || "Update User", active: true },
    ], [userName]);

    const handleUserLoaded = useCallback((name: string) => {
        setUserName(name);
    }, []);

    return (
        <AnimatedPage>
            <div className="space-y-8">
                <PageHeader title="Update User Details" breadcrumbs={breadcrumbs} />
                <UpdateUserForm onUserLoaded={handleUserLoaded} />
            </div>
        </AnimatedPage>
    );
};

export default UpdateUser;
