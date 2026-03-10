import { useCreateCompany } from "@/hooks/collegeadmin/company_management/Company/useCreateCompany";
import { INDUSTRY_OPTIONS } from "@/validators/CompanySchema";

// ========================
// CONSTANTS
// ========================

const INDUSTRY_DROPDOWN_OPTIONS = [
    { value: "", label: "Select Industry (optional)" },
    ...INDUSTRY_OPTIONS.map((t) => ({
        value: t,
        label: t,
    })),
];

// ========================
// COMPONENT
// ========================

const CreateCompanyForm = () => {
    const { formData, errors, loading, handleChange, handleSubmit, handleCancel } =
        useCreateCompany();

    const descriptionLength = formData.companyDescription?.length || 0;

    return (
        <div className="p-8 bg-white rounded-xl border">
            <h1 className="text-xl font-semibold text-gray-800 mb-6">
                Create Company Form
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Row 1 — Name & Industry */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Company Name <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <input
                            name="companyName"
                            value={formData.companyName}
                            onChange={handleChange}
                            placeholder="e.g. Tata Consultancy Services"
                            maxLength={200}
                            autoFocus
                            className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.companyName ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                        />
                        {errors.companyName && (
                            <p className="text-xs text-red-500 mt-1">{errors.companyName}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Industry
                            <span className="text-gray-400 text-xs ml-1">(optional)</span>
                        </label>
                        <select
                            name="industry"
                            value={formData.industry}
                            onChange={handleChange}
                            className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white ${errors.industry ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                        >
                            {INDUSTRY_DROPDOWN_OPTIONS.map((opt) => (
                                <option key={opt.value || "placeholder"} value={opt.value}>
                                    {opt.label}
                                </option>
                            ))}
                        </select>
                        {errors.industry && (
                            <p className="text-xs text-red-500 mt-1">{errors.industry}</p>
                        )}
                    </div>
                </div>

                {/* Row 2 — Website & Logo URL */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Website
                            <span className="text-gray-400 text-xs ml-1">(optional)</span>
                        </label>
                        <input
                            name="companyWebsite"
                            value={formData.companyWebsite}
                            onChange={handleChange}
                            placeholder="https://www.example.com"
                            className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.companyWebsite ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                        />
                        {errors.companyWebsite && (
                            <p className="text-xs text-red-500 mt-1">{errors.companyWebsite}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Logo URL
                            <span className="text-gray-400 text-xs ml-1">(optional)</span>
                        </label>
                        <input
                            name="companyLogo"
                            value={formData.companyLogo}
                            onChange={handleChange}
                            placeholder="https://example.com/logo.png"
                            className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.companyLogo ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                        />
                        {errors.companyLogo && (
                            <p className="text-xs text-red-500 mt-1">{errors.companyLogo}</p>
                        )}
                    </div>
                </div>

                {/* Row 3 — Description */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Description
                        <span className="text-gray-400 text-xs ml-1">(optional)</span>
                    </label>
                    <textarea
                        name="companyDescription"
                        value={formData.companyDescription}
                        onChange={handleChange}
                        placeholder="Brief description about the company..."
                        rows={5}
                        maxLength={3000}
                        className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.companyDescription ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                    />
                    <div className="flex justify-between mt-1">
                        {errors.companyDescription ? (
                            <p className="text-xs text-red-500">{errors.companyDescription}</p>
                        ) : (
                            <span />
                        )}
                        <p className={`text-xs ${descriptionLength > 2800 ? "text-orange-500" : "text-gray-400"}`}>
                            {descriptionLength} / 3000
                        </p>
                    </div>
                </div>

                {/* Logo Preview */}
                {formData.companyLogo && (
                    <div className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg border border-gray-100">
                        <p className="text-sm font-medium text-gray-600">Logo Preview:</p>
                        <img
                            src={formData.companyLogo}
                            alt="Company logo preview"
                            className="h-12 w-12 object-contain rounded-lg border bg-white"
                            onError={(e) => {
                                (e.target as HTMLImageElement).style.display = "none";
                            }}
                        />
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center gap-3 pt-2">
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg font-medium transition disabled:opacity-60"
                    >
                        {loading ? (
                            <div className="flex items-center gap-2">
                                <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                Creating...
                            </div>
                        ) : (
                            "Create Company"
                        )}
                    </button>

                    <button
                        type="button"
                        onClick={handleCancel}
                        disabled={loading}
                        className="px-6 py-2.5 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-40"
                    >
                        Cancel
                    </button>
                </div>
            </form>
        </div>
    );
};

export default CreateCompanyForm;
