import React from "react";
import { useCreateCompanyContact } from "@/hooks/collegeadmin/company_management/Company_Contact/useCreateCompanyContact";

// ========================
// PROPS
// ========================

interface CreateCompanyContactFormProps {
    companyId: string;
    onSuccess?: () => void;
    onCancel?: () => void;
}

// ========================
// COMPONENT
// ========================

const CreateCompanyContactForm: React.FC<CreateCompanyContactFormProps> = ({ companyId, onSuccess, onCancel }) => {
    const { formData, errors, loading, handleChange, handleSubmit } = useCreateCompanyContact(companyId, onSuccess);

    return (
        <div className="p-8 bg-white rounded-xl border">
            <h2 className="text-xl font-semibold text-gray-800 mb-6">
                Add Company Contact
            </h2>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Row 1 — Name & Designation */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Contact Name <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <input
                            name="contactName"
                            value={formData.contactName}
                            onChange={handleChange}
                            placeholder="e.g. John Doe"
                            maxLength={100}
                            autoFocus
                            className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.contactName ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                        />
                        {errors.contactName && (
                            <p className="text-xs text-red-500 mt-1">{errors.contactName}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Designation
                            <span className="text-gray-400 text-xs ml-1">(optional)</span>
                        </label>
                        <input
                            name="contactDesignation"
                            value={formData.contactDesignation}
                            onChange={handleChange}
                            placeholder="e.g. HR Manager"
                            maxLength={100}
                            className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.contactDesignation ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                        />
                        {errors.contactDesignation && (
                            <p className="text-xs text-red-500 mt-1">{errors.contactDesignation}</p>
                        )}
                    </div>
                </div>

                {/* Row 2 — Email & Phone */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Email
                            <span className="text-gray-400 text-xs ml-1">(optional)</span>
                        </label>
                        <input
                            type="email"
                            name="contactEmail"
                            value={formData.contactEmail}
                            onChange={handleChange}
                            placeholder="e.g. john@example.com"
                            className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.contactEmail ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                        />
                        {errors.contactEmail && (
                            <p className="text-xs text-red-500 mt-1">{errors.contactEmail}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Phone
                            <span className="text-gray-400 text-xs ml-1">(optional)</span>
                        </label>
                        <input
                            name="contactPhone"
                            value={formData.contactPhone}
                            onChange={handleChange}
                            placeholder="e.g. +1 234 567 890"
                            maxLength={20}
                            className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.contactPhone ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                        />
                        {errors.contactPhone && (
                            <p className="text-xs text-red-500 mt-1">{errors.contactPhone}</p>
                        )}
                    </div>
                </div>

                {/* Row 3 — Notes */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Notes
                        <span className="text-gray-400 text-xs ml-1">(optional)</span>
                    </label>
                    <textarea
                        name="notes"
                        value={formData.notes}
                        onChange={handleChange}
                        placeholder="Additional details about this contact..."
                        rows={3}
                        maxLength={1000}
                        className={`w-full rounded-lg border px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.notes ? "border-red-400 bg-red-50" : "border-gray-300"}`}
                    />
                    {errors.notes && (
                        <p className="text-xs text-red-500 mt-1">{errors.notes}</p>
                    )}
                </div>

                {/* Row 4 — Primary Checkbox */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="isPrimary"
                        name="isPrimary"
                        checked={formData.isPrimary}
                        onChange={handleChange}
                        className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                    />
                    <label htmlFor="isPrimary" className="ml-2 block text-sm text-gray-900 font-medium">
                        Set as Primary Contact
                    </label>
                </div>

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
                                Adding...
                            </div>
                        ) : (
                            "Add Contact"
                        )}
                    </button>

                    {onCancel && (
                        <button
                            type="button"
                            onClick={onCancel}
                            disabled={loading}
                            className="px-6 py-2.5 rounded-lg font-medium text-gray-600 bg-gray-100 hover:bg-gray-200 transition disabled:opacity-40"
                        >
                            Cancel
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default CreateCompanyContactForm;