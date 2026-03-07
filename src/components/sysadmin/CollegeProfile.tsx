import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { School, Globe, ShieldCheck, UserCog, MapPin, Calendar, ArrowLeft } from "lucide-react";
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

const ALL_FEATURES = [
  { key: "core", label: "Core Modules", description: "Essential placement management features", locked: true },
  { key: "training", label: "Training Programs", description: "Manage training sessions and enrollments" },
  { key: "feedback", label: "Placement Feedback", description: "Collect post-placement feedback from students" },
  { key: "interview_questions", label: "Interview Questions", description: "Share interview questions across batches" },
];

const formatDateTime = (dateStr: string) => {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
};

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
    updateFeatures,
    updateAcademicYear,
  } = useCollegeProfile();

  // Features modal state
  const [showFeaturesModal, setShowFeaturesModal] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [savingFeatures, setSavingFeatures] = useState(false);

  // Academic year modal state
  const [showYearModal, setShowYearModal] = useState(false);
  const [selectedYear, setSelectedYear] = useState<number>(2025);
  const [savingYear, setSavingYear] = useState(false);

  const academicYears = Array.from({ length: 21 }, (_, i) => 2020 + i);

  const openFeaturesModal = () => {
    setSelectedFeatures(college?.enabled_features || ["core"]);
    setShowFeaturesModal(true);
  };

  const toggleFeature = (key: string) => {
    if (key === "core") return; // Can't toggle core
    setSelectedFeatures((prev) =>
      prev.includes(key) ? prev.filter((f) => f !== key) : [...prev, key]
    );
  };

  const handleSaveFeatures = async () => {
    setSavingFeatures(true);
    try {
      await updateFeatures(selectedFeatures);
      setShowFeaturesModal(false);
    } finally {
      setSavingFeatures(false);
    }
  };

  const openYearModal = () => {
    setSelectedYear(college?.default_academic_year || 2025);
    setShowYearModal(true);
  };

  const handleSaveYear = async () => {
    setSavingYear(true);
    try {
      await updateAcademicYear(selectedYear);
      setShowYearModal(false);
    } finally {
      setSavingYear(false);
    }
  };

  if (loading) return (
    <div className="font-['Public_Sans',_sans-serif] animate-pulse">
      {/* Back button skeleton */}
      <div className="h-4 w-32 bg-gray-200 rounded mb-4" />

      {/* Top section skeleton */}
      <div className="bg-white rounded-2xl p-8 md:p-10 border border-slate-100 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-6">
            <div className="h-20 w-20 bg-gray-200 rounded-xl" />
            <div className="space-y-3">
              <div className="h-8 w-64 bg-gray-200 rounded" />
              <div className="flex gap-3">
                <div className="h-5 w-28 bg-gray-200 rounded" />
                <div className="h-5 w-16 bg-gray-200 rounded-full" />
                <div className="h-5 w-20 bg-gray-200 rounded-full" />
              </div>
            </div>
          </div>
          <div className="h-12 w-36 bg-gray-200 rounded-xl" />
        </div>
      </div>

      {/* Info grid skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {[0, 1].map((i) => (
          <div key={i} className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
            <div className="h-5 w-40 bg-gray-200 rounded mb-6" />
            <div className="space-y-4">
              {Array.from({ length: 5 }).map((_, j) => (
                <div key={j} className="flex gap-4">
                  <div className="h-4 w-24 bg-gray-200 rounded" />
                  <div className="h-4 w-40 bg-gray-200 rounded" />
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Config skeleton */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <div className="h-5 w-48 bg-gray-200 rounded mb-8" />
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          <div className="flex flex-wrap gap-3">
            {[0, 1, 2].map((i) => (
              <div key={i} className="h-10 w-28 bg-gray-200 rounded-lg" />
            ))}
          </div>
          <div className="h-40 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  );

  if (!college)
    return (
      <div className="p-8 text-center text-red-500 font-bold">
        College Not Found
      </div>
    );

  return (
    <div className="font-['Public_Sans',_sans-serif]">
      {/* Back button */}
      <button
        type="button"
        onClick={() => navigate("/sysadmin/colleges")}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 mb-4 transition-colors"
      >
        <ArrowLeft size={16} /> Back to Colleges
      </button>

      {/* 1. Top Section */}
      <div className="bg-white rounded-2xl p-8 md:p-10 border border-slate-100 shadow-sm mb-8">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
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
                  <Globe className="h-4 w-4 text-blue-400" />{" "}
                  {college.college_subdomain}
                </p>
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${college.college_status === "active"
                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    : "bg-red-50 text-red-600 border border-red-100"
                    }`}
                >
                  {college.college_status}
                </span>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-600 border border-blue-100">
                  {college.college_type}
                </span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={() => navigate(`/sysadmin/colleges/${college.college_id}/edit`)}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg hover:bg-blue-700 transition-all active:scale-95"
          >
            <UserCog size={18} />
            Edit College
          </button>
        </div>
      </div>

      {/* 2. Info Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
        {/* Address Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center gap-2 mb-6">
            <MapPin className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-bold text-slate-800">Address Information</h2>
          </div>
          <div className="space-y-4">
            <InfoRow label="Address" value={college.college_address} />
            <InfoRow label="City" value={college.college_city} />
            <InfoRow label="Taluka" value={college.college_taluka} />
            <InfoRow label="District" value={college.college_district} />
            <InfoRow label="State" value={college.college_state} />
            <InfoRow label="Pincode" value={college.college_pincode} />
          </div>
        </div>

        {/* Admin & Meta Section */}
        <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
          <div className="flex items-center gap-2 mb-6">
            <UserCog className="h-5 w-5 text-blue-500" />
            <h2 className="text-lg font-bold text-slate-800">Admin & Details</h2>
          </div>
          <div className="space-y-4">
            <InfoRow label="Admin Name" value={college.admin_name} />
            <InfoRow label="Admin Email" value={college.admin_email} />
            <InfoRow label="Academic Year" value={college.default_academic_year} />
            <InfoRow label="Created At" value={formatDateTime(college.created_at)} />
            <InfoRow label="Last Updated" value={formatDateTime(college.updated_at)} />
          </div>
        </div>
      </div>

      {/* 3. Configuration & Actions */}
      <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8">
        <div className="flex items-center gap-2 mb-8">
          <ShieldCheck className="h-5 w-5 text-blue-500" />
          <h2 className="text-lg font-bold text-slate-800">
            System Configuration
          </h2>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
          {/* Features */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <p className="text-[12px] font-bold text-slate-400 uppercase tracking-widest">Enabled Features</p>
              <button
                type="button"
                onClick={openFeaturesModal}
                className="text-xs text-blue-600 font-semibold hover:underline"
              >
                Update Features
              </button>
            </div>
            <div className="flex flex-wrap gap-3">
              {college.enabled_features?.map((feature: string) => (
                <span key={feature} className="px-5 py-2.5 bg-slate-50 border border-slate-200 rounded-lg text-slate-700 text-sm font-semibold capitalize cursor-default">
                  {feature.replace(/_/g, " ")}
                </span>
              ))}
            </div>
          </div>

          {/* Status Toggle + Academic Year */}
          <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-slate-300">
            <div className="space-y-6">
              {/* Status Toggle */}
              <div>
                <p className="text-xs text-slate-500 font-semibold mb-2">
                  College Status:
                </p>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={requestStatusToggle}
                    disabled={toggling}
                    className={`relative inline-flex h-[18px] w-[30px] items-center rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-50 ${college.college_status === "active" ? "bg-blue-500" : "bg-slate-300"
                      }`}
                  >
                    <span
                      className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${college.college_status === "active" ? "translate-x-4" : "translate-x-[3px]"
                        }`}
                    />
                  </button>
                  <span
                    className={`text-sm font-semibold capitalize ${college.college_status === "active"
                      ? "text-emerald-600"
                      : "text-red-500"
                      }`}
                  >
                    {toggling ? "Updating..." : college.college_status}
                  </span>
                </div>
              </div>

              {/* Academic Year */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <p className="text-xs text-slate-500 font-semibold">Academic Year:</p>
                  <button
                    type="button"
                    onClick={openYearModal}
                    className="text-xs text-blue-600 font-semibold hover:underline"
                  >
                    Update
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-bold text-slate-800">{college.default_academic_year}</span>
                </div>
              </div>

              {/* College ID */}
              <div>
                <p className="text-xs text-slate-500 font-semibold">College ID:</p>
                <p className="text-slate-800 font-mono text-[13px] font-bold break-all leading-relaxed">
                  {college.college_id}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Status Toggle Confirmation Dialog */}
      <Dialog open={showConfirmDialog} onOpenChange={cancelStatusToggle}>
        <DialogContent showCloseButton={false} className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Confirm Status Change</DialogTitle>
            <DialogDescription>
              {college.college_status === "active" ? (
                <>
                  Are you sure you want to deactivate <span className="font-semibold">{college.college_name}</span>?
                  All users of this college will be unable to log in.
                </>
              ) : (
                <>
                  Are you sure you want to activate <span className="font-semibold">{college.college_name}</span>?
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="mt-4">
            <Button variant="outline" onClick={cancelStatusToggle} className="cursor-pointer">
              Cancel
            </Button>
            <Button
              onClick={confirmStatusToggle}
              className={`text-white cursor-pointer ${college.college_status === "active"
                ? "bg-red-600 hover:bg-red-700"
                : "bg-emerald-600 hover:bg-emerald-700"
                }`}
            >
              Confirm
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Features Modal */}
      <Dialog open={showFeaturesModal} onOpenChange={setShowFeaturesModal}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Update Features</DialogTitle>
            <DialogDescription>
              Toggle features for this college. Core Modules cannot be disabled.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {ALL_FEATURES.map((feature) => (
              <div key={feature.key} className="flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:border-blue-200 transition-colors">
                <div>
                  <p className="text-sm font-semibold text-slate-800">{feature.label}</p>
                  <p className="text-xs text-slate-500">{feature.description}</p>
                </div>
                <button
                  type="button"
                  onClick={() => toggleFeature(feature.key)}
                  disabled={feature.locked}
                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors duration-200 ${selectedFeatures.includes(feature.key) ? "bg-blue-500" : "bg-slate-300"
                    } ${feature.locked ? "opacity-60 cursor-not-allowed" : ""}`}
                >
                  <span className={`inline-block h-3.5 w-3.5 transform rounded-full bg-white transition-transform duration-200 ${selectedFeatures.includes(feature.key) ? "translate-x-[18px]" : "translate-x-[3px]"
                    }`} />
                </button>
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowFeaturesModal(false)}>Cancel</Button>
            <Button
              onClick={handleSaveFeatures}
              disabled={savingFeatures}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {savingFeatures ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Academic Year Modal */}
      <Dialog open={showYearModal} onOpenChange={setShowYearModal}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Update Academic Year</DialogTitle>
            <DialogDescription>
              Current Academic Year: <span className="font-semibold">{college.default_academic_year}</span>
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <select
              value={selectedYear}
              onChange={(e) => setSelectedYear(Number(e.target.value))}
              className="w-full h-11 rounded-md border border-slate-300 bg-white px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {academicYears.map((year) => (
                <option key={year} value={year}>{year}</option>
              ))}
            </select>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowYearModal(false)}>Cancel</Button>
            <Button
              onClick={handleSaveYear}
              disabled={savingYear || selectedYear === college.default_academic_year}
              className="bg-blue-600 hover:bg-blue-700 text-white"
            >
              {savingYear ? "Updating..." : "Update"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

const InfoRow = ({
  label,
  value,
}: {
  label: string;
  value: string | number | undefined;
}) => (
  <div className="flex flex-col sm:flex-row sm:items-center gap-1">
    <span className="text-xs font-semibold text-slate-500 sm:w-32 shrink-0">
      {label}:
    </span>
    <span className="text-sm text-slate-800 font-medium">
      {value ?? "—"}
    </span>
  </div>
);

export default CollegeProfile;
