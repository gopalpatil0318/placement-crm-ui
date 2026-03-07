import { useState, useCallback } from "react";
import Header from "./Header";
import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const toggleSidebar = useCallback(() => setIsSidebarOpen((prev) => !prev), []);

  return (
    <div className="h-screen w-full flex overflow-hidden bg-[#f2f2f230]">
      <Sidebar isOpen={isSidebarOpen} />
      <main className="flex-1 flex flex-col overflow-hidden">
        <Header onMenuClick={toggleSidebar} />
        <div className="flex-1 overflow-y-auto text-black p-6">{children}</div>
      </main>
    </div>
  );
}
