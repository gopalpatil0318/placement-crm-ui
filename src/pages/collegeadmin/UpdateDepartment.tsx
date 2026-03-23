import { useState, useMemo, useCallback } from "react";
import { useParams } from "react-router-dom";
import UpdateDepartmentForm from "@/components/collegeadmin/departmentManagement/UpdateDepartmentForm";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";

const UpdateDepartment = () => {
    const { deptId } = useParams<{ deptId: string }>();
    const [deptName, setDeptName] = useState("");

    const breadcrumbs = useMemo(
        () => [
            { label: "Dashboard", path: "/college/dashboard" },
            { label: "Departments", path: "/college/departments" },
            { label: deptName || "Edit Department", active: true },
        ],
        [deptName]
    );

    const handleDeptLoaded = useCallback((name: string) => setDeptName(name), []);

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader title="Edit Department" breadcrumbs={breadcrumbs} />
                <UpdateDepartmentForm deptId={deptId} onDeptLoaded={handleDeptLoaded} />
            </div>
        </AnimatedPage>
    );
};

export default UpdateDepartment;
