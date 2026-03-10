import React from "react";
import { X } from "lucide-react";
import { useUpdateCompanyContact } from "@/hooks/collegeadmin/company_management/Company_Contact/useUpdateCompanyContact";

interface EditCompanyContactModalProps {
    contact: any;
    onClose: () => void;
    onSuccess: () => void;
}

const EditCompanyContactModal: React.FC<EditCompanyContactModalProps> = ({ contact, onClose, onSuccess }) => {
    const { formData, errors, loading: updatingContact, handleChange, handleSubmit } = useUpdateCompanyContact(
        contact.contact_id,
        {
            contactName: contact.contact_name,
            contactDesignation: contact.contact_designation,
            contactEmail: contact.contact_email,
            contactPhone: contact.contact_phone,
            isPrimary: contact.is_primary,
            notes: contact.notes,
        },
        onSuccess
    );

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
            onClick={() => !updatingContact && onClose()}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between px-6 py-4 border-b bg-gray-50">
                    <h2 className="text-lg font-bold text-gray-800">
                        Edit Contact
                    </h2>
                    <button
                        type="button"
                        onClick={onClose}
                        disabled={updatingContact}
                        className="p-1.5 rounded-lg hover:bg-gray-200 text-gray-400 hover:text-gray-600 transition-colors disabled:opacity-40"
                    >
                        <X size={20} />
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="px-6 py-5 max-h-[70vh] overflow-y-auto space-y-4">
                        {/* Name */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Contact Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                name="contactName"
                                placeholder="e.g. John Doe"
                                value={formData.contactName || ""}
                                onChange={handleChange}
                                disabled={updatingContact}
                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.contactName ? "border-red-500 bg-red-50" : "bg-gray-50 text-gray-800"
                                    }`}
                            />
                            {errors.contactName && (
                                <p className="mt-1 text-xs text-red-500 font-medium">{errors.contactName}</p>
                            )}
                        </div>

                        {/* Designation & Phone */}
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Designation
                                </label>
                                <input
                                    type="text"
                                    name="contactDesignation"
                                    placeholder="e.g. HR Manager"
                                    value={formData.contactDesignation || ""}
                                    onChange={handleChange}
                                    disabled={updatingContact}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.contactDesignation ? "border-red-500 bg-red-50" : "bg-gray-50 text-gray-800"
                                        }`}
                                />
                                {errors.contactDesignation && (
                                    <p className="mt-1 text-xs text-red-500 font-medium">{errors.contactDesignation}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number
                                </label>
                                <input
                                    type="tel"
                                    name="contactPhone"
                                    placeholder="e.g. 9876543210"
                                    value={formData.contactPhone || ""}
                                    onChange={handleChange}
                                    disabled={updatingContact}
                                    className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.contactPhone ? "border-red-500 bg-red-50" : "bg-gray-50 text-gray-800"
                                        }`}
                                />
                                {errors.contactPhone && (
                                    <p className="mt-1 text-xs text-red-500 font-medium">{errors.contactPhone}</p>
                                )}
                            </div>
                        </div>

                        {/* Email */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                type="email"
                                name="contactEmail"
                                placeholder="e.g. john@tcs.com"
                                value={formData.contactEmail || ""}
                                onChange={handleChange}
                                disabled={updatingContact}
                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 ${errors.contactEmail ? "border-red-500 bg-red-50" : "bg-gray-50 text-gray-800"
                                    }`}
                            />
                            {errors.contactEmail && (
                                <p className="mt-1 text-xs text-red-500 font-medium">{errors.contactEmail}</p>
                            )}
                        </div>

                        {/* Is Primary Toggle */}
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                id="isPrimaryModal"
                                name="isPrimary"
                                checked={formData.isPrimary || false}
                                onChange={handleChange}
                                disabled={updatingContact}
                                className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
                            />
                            <div>
                                <label htmlFor="isPrimaryModal" className="text-sm font-bold text-gray-800 cursor-pointer">
                                    Mark as Primary Contact
                                </label>
                                <p className="text-xs text-gray-500">
                                    This will demote any currently active primary contact.
                                </p>
                            </div>
                        </div>

                        {/* Notes */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Notes
                            </label>
                            <textarea
                                name="notes"
                                placeholder="Additional info..."
                                rows={3}
                                value={formData.notes || ""}
                                onChange={handleChange}
                                disabled={updatingContact}
                                className={`w-full border rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none ${errors.notes ? "border-red-500 bg-red-50" : "bg-gray-50 text-gray-800"
                                    }`}
                            />
                            {errors.notes && (
                                <p className="mt-1 text-xs text-red-500 font-medium">{errors.notes}</p>
                            )}
                        </div>
                    </div>

                    <div className="px-6 py-3 border-t bg-gray-50 flex items-center gap-3">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={updatingContact}
                            className="flex-1 px-4 py-2.5 text-sm font-semibold text-gray-600 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors disabled:opacity-40"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={updatingContact}
                            className="flex-1 px-5 py-2.5 text-sm font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                        >
                            {updatingContact && (
                                <div className="h-4 w-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            )}
                            {updatingContact ? "Saving..." : "Save Changes"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default EditCompanyContactModal;
