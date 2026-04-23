import { type ChangeEvent, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { Building2, Globe, FileText, Loader2 } from "lucide-react";
import { INDUSTRY_OPTIONS } from "@/validators/CompanySchema";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingTextarea from "@/components/ui/FloatingTextarea";
import FloatingSelect from "@/components/ui/FloatingSelect";
import { ImageUpload } from "@/components/ui/ImageUpload";
import { useFileUpload } from "@/hooks/useFileUpload";

// ========================
// TYPES
// ========================

interface CompanyFormData {
    companyName: string;
    companyDescription: string;
    companyWebsite: string;
    industry: string;
    companyLogo: string;
}

type FormErrors = Partial<Record<keyof CompanyFormData, string>>;

interface CompanyFormProps {
    mode: "create" | "edit";
    formData: CompanyFormData;
    errors: FormErrors;
    loading: boolean;
    fetchedCompanyName?: string;
    handleChange: (
        e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => void;
    handleSubmit: (e: FormEvent<HTMLFormElement>) => void | Promise<void>;
    handleCancel: () => void;
}

// ========================
// CONSTANTS
// ========================

const INDUSTRY_SELECT_OPTIONS = [
    { value: "", label: "" },
    ...INDUSTRY_OPTIONS.map((t) => ({ value: t, label: t })),
];

// ========================
// SUB-COMPONENTS
// ========================

interface SectionHeaderProps {
    icon: React.ComponentType<{ className?: string }>;
    title: string;
    subtitle: string;
}

const SectionHeader = ({ icon: Icon, title, subtitle }: SectionHeaderProps) => (
    <div className="flex items-center gap-3 mb-6">
        <div className="h-10 w-10 rounded-xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
            <Icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
        </div>
        <div>
            <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
            <p className="text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>
        </div>
    </div>
);

function getButtonLabel(isLoading: boolean, formMode: "create" | "edit") {
    if (isLoading) return formMode === "create" ? "Creating..." : "Saving..."
    return formMode === "create" ? "Create Company" : "Save Changes"
}

// ========================
// COMPONENT
// ========================

const CompanyForm = ({
    mode,
    formData,
    errors,
    loading,
    fetchedCompanyName,
    handleChange,
    handleSubmit,
    handleCancel,
}: CompanyFormProps) => {
    const shouldReduce = useReducedMotion();
    const logoUpload = useFileUpload();

    const handleLogoSelect = async (file: File | null) => {
        if (!file) return;
        try {
            const entityId = `comp_${formData.companyName?.replaceAll(/\s+/g, "_").slice(0, 30) || "company"}`;
            const { storagePath } = await logoUpload.upload(file, {
                bucket: "placenex-public",
                category: "company-logos",
                entityId,
                maxSizeBytes: 2 * 1024 * 1024,
                allowedTypes: ["image/jpeg", "image/png", "image/webp"],
            });
            handleChange({ target: { name: "companyLogo", value: storagePath } } as ChangeEvent<HTMLInputElement>);
        } catch { /* error in logoUpload.error */ }
    };

    return (
        <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
            {/* ── Edit-mode context bar (hidden in create — PageHeader already has the title) ── */}
            {mode === "edit" && (
                <div className="px-6 py-4 border-b border-gray-100 dark:border-gray-800 flex items-center gap-3">
                    <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                        <Building2 className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                        <p className="text-[11px] text-gray-400 dark:text-gray-500 font-semibold uppercase tracking-wider">
                            Editing Company
                        </p>
                        <p className="text-sm font-semibold text-gray-800 dark:text-gray-100 leading-tight">
                            {fetchedCompanyName || "Loading…"}
                        </p>
                    </div>
                </div>
            )}

            {/* ── Form body ── */}
            <form onSubmit={handleSubmit} className="p-6 space-y-8">

                {/* Section 1 — Company Identity */}
                <div>
                    <SectionHeader
                        icon={Building2}
                        title="Company Identity"
                        subtitle="Core details that identify this company in the system"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FloatingInput
                            label="Company Name"
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            error={errors.companyName}
                            required
                            maxLength={200}
                        />
                        <FloatingSelect
                            label="Industry"
                            name="industry"
                            value={formData.industry}
                            onChange={handleChange}
                            options={INDUSTRY_SELECT_OPTIONS}
                            error={errors.industry}
                        />
                    </div>
                </div>

                {/* Section 2 — Online Presence */}
                <div>
                    <SectionHeader
                        icon={Globe}
                        title="Online Presence"
                        subtitle="Website and visual identity for this company"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <FloatingInput
                            label="Website URL"
                            name="companyWebsite"
                            value={formData.companyWebsite}
                            onChange={handleChange}
                            error={errors.companyWebsite}
                            type="url"
                        />
                        <div className="flex flex-col items-center gap-2">
                            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Company Logo</p>
                            <ImageUpload
                                value={formData.companyLogo || null}
                                onFileSelect={handleLogoSelect}
                                progress={logoUpload.progress}
                                isUploading={logoUpload.isUploading}
                                error={logoUpload.error || errors.companyLogo}
                                variant="logo"
                                size={80}
                                initials={formData.companyName?.slice(0, 2)?.toUpperCase()}
                                label="Upload company logo"
                            />
                        </div>
                    </div>
                </div>

                {/* Section 3 — About */}
                <div>
                    <SectionHeader
                        icon={FileText}
                        title="About the Company"
                        subtitle="A brief overview to help students understand this company"
                    />
                    <FloatingTextarea
                        label="Description"
                        name="companyDescription"
                        value={formData.companyDescription}
                        onChange={handleChange}
                        error={errors.companyDescription}
                        rows={5}
                        maxLength={3000}
                    />
                </div>

                {/* ── Actions ── */}
                <div className="flex items-center gap-3 pt-2 border-t border-gray-100 dark:border-gray-800">
                    {shouldReduce ? (
                        <button
                            type="submit"
                            disabled={loading}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl text-sm font-medium transition shadow-sm shadow-blue-200 dark:shadow-none disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {getButtonLabel(loading, mode)}
                        </button>
                    ) : (
                        <motion.button
                            type="submit"
                            disabled={loading}
                            whileTap={{ scale: 0.97 }}
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-xl text-sm font-medium transition shadow-sm shadow-blue-200 dark:shadow-none disabled:opacity-60 disabled:cursor-not-allowed"
                        >
                            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                            {getButtonLabel(loading, mode)}
                        </motion.button>
                    )}
                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-6 py-2.5 rounded-xl text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CompanyForm;
