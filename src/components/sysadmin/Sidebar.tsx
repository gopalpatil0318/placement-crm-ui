"use client";

import { Building2, LogOut, PanelLeftClose, PanelLeftOpen } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../stores/authStore";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { useState } from "react";

export default function Sidebar() {
  const logout = useAuthStore((state) => state.logout);
  const navigate = useNavigate();
  const [isCollapsed, setIsCollapsed] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/sysadmin/login");
  };

  return (
    <div
      className={`h-screen flex flex-col text-white transition-all duration-300 ${
        isCollapsed ? "w-20" : "w-72"
      }`}
      style={{
        background: "linear-gradient(135deg, #694ed6 0%, #c137a2 100%)",
      }}
    >
      {/* Logo / Toggle */}
      <div className="flex items-center justify-between px-4 py-4">
        {!isCollapsed && (
          <h2 className="text-xl font-bold tracking-wide">College CRM</h2>
        )}

        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="p-1 hover:bg-white/20 rounded-lg transition"
        >
          {isCollapsed ? (
            <PanelLeftOpen className="text-white" />
          ) : (
            <PanelLeftClose className="text-white" />
          )}
        </button>
      </div>

      <Separator className="bg-white/20" />

      {/* Navigation */}
      <nav className="flex-1 mt-6 px-3 space-y-2">
        <Link
          to="/sysadmin/create-college"
          className="flex items-center gap-3 px-3 py-3 rounded-lg hover:bg-white/15 transition"
        >
          <Building2 size={20} />
          {!isCollapsed && (
            <span className="text-sm font-medium">Create College</span>
          )}
        </Link>
      </nav>

      {/* Footer / Logout */}
      <div className="px-3 pb-6 mt-auto">
        <Button
          variant="ghost"
          onClick={handleLogout}
          className="w-full justify-start gap-3 hover:bg-white/15 text-white hover:text-white"
        >
          <LogOut size={18} />
          {!isCollapsed && "Logout"}
        </Button>

        {!isCollapsed && (
          <p className="text-white/60 text-xs mt-4 text-center">
            © 2025 College CRM System
          </p>
        )}
      </div>
    </div>
  );
}
