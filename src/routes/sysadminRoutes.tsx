import { lazy } from "react";
import { Route } from "react-router-dom";
import { ProtectedRoute } from "@/components/routes/ProtectedRoute";
import { PublicRoute } from "@/components/routes/PublicRoute";

const SysAdminLayout = lazy(() => import("@/components/sysadmin/SysAdminLayout"));
const AdminLogin = lazy(() => import("@/pages/login/AdminLogin"));
const Dashboard = lazy(() => import("@/pages/SuperAdmin/Dashboard"));
const CreateCollege = lazy(() => import("@/pages/SuperAdmin/CreateCollege"));
const ViewColleges = lazy(() => import("@/pages/SuperAdmin/ViewColleges"));
const College = lazy(() => import("@/pages/SuperAdmin/College"));
const EditCollege = lazy(() => import("@/pages/SuperAdmin/EditCollege"));
const BillingOverview = lazy(() => import("@/pages/SuperAdmin/BillingOverview"));
const DemoRequests = lazy(() => import("@/pages/SuperAdmin/DemoRequests"));
const DemoRequestDetail = lazy(() => import("@/pages/SuperAdmin/DemoRequestDetail"));
const ContactInquiries = lazy(() => import("@/pages/SuperAdmin/ContactInquiries"));
const ContactInquiryDetail = lazy(() => import("@/pages/SuperAdmin/ContactInquiryDetail"));

export const sysadminRoutes = (
    <>
        <Route path="/sysadmin/login" element={<PublicRoute><AdminLogin /></PublicRoute>} />
        <Route element={<ProtectedRoute allowedRoles={["sysadmin"]}><SysAdminLayout /></ProtectedRoute>}>
            <Route path="/sysadmin/dashboard" element={<Dashboard />} />
            <Route path="/sysadmin/colleges/create" element={<CreateCollege />} />
            <Route path="/sysadmin/colleges/:collegeId/edit" element={<EditCollege />} />
            <Route path="/sysadmin/colleges" element={<ViewColleges />} />
            <Route path="/sysadmin/colleges/:collegeId" element={<College />} />
            <Route path="/sysadmin/billing" element={<BillingOverview />} />
            <Route path="/sysadmin/demo-requests" element={<DemoRequests />} />
            <Route path="/sysadmin/demo-requests/:id" element={<DemoRequestDetail />} />
            <Route path="/sysadmin/contact-inquiries" element={<ContactInquiries />} />
            <Route path="/sysadmin/contact-inquiries/:id" element={<ContactInquiryDetail />} />
        </Route>
    </>
);
