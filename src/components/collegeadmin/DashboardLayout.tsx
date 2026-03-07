import { useState } from "react";
// Importing local collegeadmin components
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Sidebar toggle state passed to Header and Sidebar components
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  return (
    <div className="h-screen w-full flex bg-[#f2f2f230] overflow-hidden">
      {/* Sidebar - Controlled by local state */}
      <Sidebar isOpen={isSidebarOpen} />

      {/* Main Content Area */}
      <main className="flex-1 bg-[#f2f2f230] overflow-y-auto blob-backdrop flex flex-col">
        <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} />

        <div className="blob-content flex-1 text-black p-6">{children}</div>
      </main>
    </div>
  );
}
