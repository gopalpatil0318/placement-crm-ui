import { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import { PublicRoute } from "@/components/routes/PublicRoute";

const SysAdminLayout = lazy(() => import("@/components/sysadmin/SysAdminLayout"));
const SuperAdminLogin = lazy(() => import("@/pages/SuperAdmin/SuperAdminLogin"));
const Dashboard = lazy(() => import("@/pages/SuperAdmin/Dashboard"));
const CreateCollege = lazy(() => import("@/pages/SuperAdmin/CreateCollege"));
const ViewColleges = lazy(() => import("@/pages/SuperAdmin/ViewColleges"));
const College = lazy(() => import("@/pages/SuperAdmin/College"));
const EditCollege = lazy(() => import("@/pages/SuperAdmin/EditCollege"));

export const sysadminRoutes = (
    <>
        <Route path="/sysadmin/login" element={<PublicRoute><SuperAdminLogin /></PublicRoute>} />
        <Route path="/login" element={<Navigate to="/sysadmin/login" replace />} />
        <Route element={<ProtectedRoute allowedRoles={["sysadmin"]}><SysAdminLayout /></ProtectedRoute>}>
            <Route path="/sysadmin/dashboard" element={<Dashboard />} />
            <Route path="/sysadmin/colleges/create" element={<CreateCollege />} />
            <Route path="/sysadmin/colleges/:collegeId/edit" element={<EditCollege />} />
            <Route path="/sysadmin/colleges" element={<ViewColleges />} />
            <Route path="/sysadmin/colleges/:collegeId" element={<College />} />
        </Route>
    </>
);
