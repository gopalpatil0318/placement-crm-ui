import { useState } from "react";
import Header from "./StudentHeader";
import Sidebar from "./StudentSidebar";

export default function StudentDashboardLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);

    return (
        <div className="h-screen w-full flex bg-[#f2f2f230] overflow-hidden">
            {/* Sidebar */}
            <Sidebar isOpen={isSidebarOpen} />
            {/* Right Section */}
            <main className="flex-1 bg-[#f2f2f230] overflow-y-auto blob-backdrop flex flex-col">
                <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />
                <div className="blob-content flex-1 text-black p-6">{children}</div>
            </main>
        </div>
    );
}
