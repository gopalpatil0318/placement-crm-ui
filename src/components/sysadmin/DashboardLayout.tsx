"use client";

import Sidebar from "./Sidebar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    

      <div className="min-h-screen w-full flex bg-background">
      {/* Sidebar */}
      <Sidebar />
      {/* Right Section */}
      <main className="flex-1 bg-card overflow-y-auto blob-backdrop">
        <div className="blob-content">{children}</div>
      </main>
    </div>
   
  );
}
