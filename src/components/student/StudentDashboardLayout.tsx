"use client";

import { useLocation } from "react-router-dom";
import Header from "./StudentHeader";
import Sidebar from "./StudentSidebar";
import ProfileSidebar from "./ProfileSidebar";
import { useSidebarContext } from "@/context/SidebarContext";

export default function StudentDashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const { isSidebarOpen, setIsSidebarOpen, isProfileSidebarExpanded, setIsProfileSidebarExpanded } = useSidebarContext();
    const location = useLocation();

    // Only show profile sidebar on profile routes
    const isProfilePage = location.pathname.startsWith("/student/profile");

    const handleUpdateProfileClick = () => {
        setIsProfileSidebarExpanded(true);
    };

    const handleCollapseProfileSidebar = () => {
        setIsProfileSidebarExpanded(false);
    };

    const handleExpandProfileSidebar = () => {
        setIsProfileSidebarExpanded(true);
    };

    return (
        <div className="min-h-screen w-full flex bg-[#f2f2f230]">
            {/* Main Sidebar */}
            <Sidebar
                isOpen={isSidebarOpen}
                onUpdateProfileClick={handleUpdateProfileClick}
                isUpdateProfileOpen={isProfileSidebarExpanded && isProfilePage}
            />
            {/* Right Section: Header on top spanning full width, then ProfileSidebar + Content below */}
            <div className="flex-1 flex flex-col overflow-hidden">
                {/* Header — spans full width after main sidebar */}
                <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
                {/* Below header: ProfileSidebar (only on profile pages) + Main Content */}
                <div className="flex-1 flex overflow-hidden">
                    {/* Profile Sidebar — only visible on /student/profile/* routes */}
                    {isProfilePage && (
                        <ProfileSidebar
                            isExpanded={isProfileSidebarExpanded}
                            onCollapse={handleCollapseProfileSidebar}
                            onExpand={handleExpandProfileSidebar}
                        />
                    )}
                    {/* Main Content */}
                    <main className="flex-1 bg-[#f2f2f230] overflow-y-auto blob-backdrop">
                        <div className="blob-content flex-1 text-black p-6">{children}</div>
                    </main>
                </div>
            </div>
        </div>
    );
}