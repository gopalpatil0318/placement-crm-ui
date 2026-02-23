"use client"


import { useNavigate } from "react-router-dom";
import { School, Globe, ShieldCheck, UserCog } from "lucide-react";
import { useCollegeProfile } from "@/hooks/sysadmin/useCollegeProfile";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

const CollegeProfile = () => {
  const navigate = useNavigate();
  const {
    college,
    loading,
    toggling,
    showConfirmDialog,
    requestStatusToggle,
    confirmStatusToggle,
    cancelStatusToggle,
  } = useCollegeProfile();

  if (loading) return (
    <div className="p-8 text-slate-500 font-medium animate-pulse text-center">
      Loading Profile Details...
    </div>
  );

  if (!college) return (
    <div className="p-8 text-center text-red-500 font-bold">
      College Not Found
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8f9fa] font-['Public_Sans',_sans-serif]">

      {/* 1. Top Section */}
      <div className="bg-white rounded-2xl p-8 md:p-10 border border-slate-100 shadow-sm mb-8 relative group transition-all hover:shadow-md">
        <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 bg-blue-50 text-blue-600 rounded-xl flex items-center justify-center border border-blue-100 shadow-sm">
              <School className="h-10 w-10" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800">
                {college.college_name}
              </h1>
              <div className="flex flex-wrap items-center gap-4 mt-2">
                <p className="flex items-center gap-2 text-slate-500 font-medium">
                  <Globe className="h-4 w-4 text-blue-400" /> {college.college_subdomain}
                </p>
                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${college.college_status === 'active'
                  ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                  : 'bg-red-50 text-red-600 border border-red-100'
                  }`}>
                  {college.college_status}
                </span>
              </div>
            </div>
          </div>

          <button
            onClick={() => navigate(`/sysadmin/edit-college/${college.college_id}`)}
            className="flex items-center gap-2 px-6 py-3 bg-slate-900 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-blue-600 transition-all active:scale-95"
          >
            <UserCog size={18} />
            Edit Profile
          </button>
        </div>
      </div>

      {/* 2. Key Statistics Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <StatCard
          value={college.college_status.toUpperCase()}
          label="Instance Status"
          description="Overall operational state of the college."
          themeColor="text-blue-600"
          waveColor="#4680ff"
        />
        <StatCard
          value={new Date(college.created_at).toLocaleDateString('en-GB')}
          label="Registration Date"
          description="Date when college was added to the system."
          themeColor="text-emerald-600"
          waveColor="#2ca87f"
        />
        <StatCard
          value={college.college_subdomain}
          label="Access Subdomain"
          description="Direct link for the college login."
          themeColor="text-purple-600"
          waveColor="#673ab7"
        />
      </div>

      {/* 3. Configuration & Technical Data */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center gap-2 mb-8">
          <ShieldCheck className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-bold text-slate-800">System Configuration</h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div>
            <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest mb-4">Enabled Features</p>
            <div className="flex flex-wrap gap-3">
              {college.enabled_features?.map((feature: string) => (
                <span key={feature} className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm font-semibold hover:border-blue-300 transition-colors capitalize cursor-default">
                  {feature.replace('_', ' ')}
                </span>
              ))}
            </div>
          </div>

          <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Technical Reference</p>
            <div className="space-y-4">
              <div>
                <p className="text-xs text-slate-500 font-semibold">UID / College ID:</p>
                <p className="text-slate-800 font-mono text-[13px] font-bold break-all leading-relaxed">
                  {college.college_id}
                </p>
              </div>

              {/* Status Toggle */}
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-2">College Status:</p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={requestStatusToggle}
                    disabled={toggling}
                    className={`relative inline-flex h-[18px] w-[30px] items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 ${college.college_status === "active"
                      ? "bg-blue-500"
                      : "bg-slate-300"
                      }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${college.college_status === "active"
                        ? "translate-x-4"
                        : "translate-x-[3px]"
                        }`}
                    />
                  </button>
                  <span className={`text-sm font-semibold capitalize ${college.college_status === "active" ? "text-emerald-600" : "text-red-500"
                    }`}>
                    {toggling ? "Updating..." : college.college_status}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={cancelStatusToggle}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              Are you sure you want to change the college status from{" "}
              <span className="font-semibold capitalize">
                {college?.college_status}
              </span>{" "}
              to{" "}
              <span className="font-semibold capitalize">
                {college?.college_status === "active" ? "inactive" : "active"}
              </span>
              ?
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button
              variant="outline"
              onClick={cancelStatusToggle}
              className="cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              onClick={confirmStatusToggle}
              className="bg-blue-600 hover:bg-blue-700 text-white cursor-pointer"
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const StatCard = ({ value, label, description, themeColor, waveColor }: any) => (
  <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden relative group hover:shadow-md transition-shadow">
    <div className="p-6 pb-20 relative z-10">
      <h3 className={`text-2xl font-black mb-1 ${themeColor}`}>{value}</h3>
      <p className={`text-[14px] font-bold mb-4 ${themeColor} opacity-80 uppercase tracking-wide`}>{label}</p>
      <p className="text-slate-400 text-[13px] leading-relaxed font-medium">
        {description}
      </p>
    </div>
    <div className="absolute bottom-0 left-0 w-full leading-[0]">
      <svg viewBox="0 0 500 150" preserveAspectRatio="none" className="w-full h-14 opacity-30 group-hover:h-16 transition-all duration-300">
        <path d="M0,80 C150,150 350,0 500,80 L500,150 L0,150 Z" fill={waveColor}></path>
      </svg>
    </div>
  </div>
);

export default CollegeProfile;