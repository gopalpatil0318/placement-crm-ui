import { type ChangeEvent, type FormEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { AlertTriangle, Loader2 } from "lucide-react";
import FloatingInput from "@/components/ui/FloatingInput";
import FloatingTextarea from "@/components/ui/FloatingTextarea";

// ========================
// TYPES
// ========================

interface ContactFormData {
    contactName: string;
    contactDesignation: string;
    contactEmail: string;
    contactPhone: string;
    isPrimary: boolean;
    notes: string;
}

type FormErrors = Partial<Record<keyof ContactFormData, string>>;

interface ContactFormProps {
    mode: "add" | "edit";
    formData: ContactFormData;
    errors: FormErrors;
    loading: boolean;
    handleChange: (e: ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void;
    handleCheckboxChange: (field: keyof ContactFormData, value: boolean) => void;
    handleSubmit: () => void | Promise<void>;
    handleCancel: () => void;
}

// ========================
// COMPONENT
// ========================

const ContactForm = ({
    mode,
    formData,
    errors,
    loading,
    handleChange,
    handleCheckboxChange,
    handleSubmit,
    handleCancel,
}: ContactFormProps) => {
    const shouldReduce = useReducedMotion();

    const onFormSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        handleSubmit();
    };

    return (
        <form onSubmit={onFormSubmit} className="space-y-5">
            <FloatingInput
                label="Contact Name"
                name="contactName"
                value={formData.contactName}
                onChange={handleChange}
                error={errors.contactName}
                required
                maxLength={200}
            />

            <FloatingInput
                label="Designation"
                name="contactDesignation"
                value={formData.contactDesignation}
                onChange={handleChange}
                error={errors.contactDesignation}
                maxLength={150}
            />

            <FloatingInput
                label="Email"
                name="contactEmail"
                value={formData.contactEmail}
                onChange={handleChange}
                error={errors.contactEmail}
                type="email"
            />

            <FloatingInput
                label="Phone"
                name="contactPhone"
                value={formData.contactPhone}
                onChange={handleChange}
                error={errors.contactPhone}
                type="tel"
                maxLength={15}
            />

            <FloatingTextarea
                label="Notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                error={errors.notes}
                rows={3}
                maxLength={1000}
            />

            {/* Primary toggle */}
            <div>
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Primary Contact</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
                            Mark as the main point of contact for this company
                        </p>
                    </div>
                    <button
                        type="button"
                        role="switch"
                        aria-checked={formData.isPrimary}
                        onClick={() => handleCheckboxChange("isPrimary", !formData.isPrimary)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 dark:focus:ring-offset-gray-800 ${
                            formData.isPrimary ? "bg-blue-600" : "bg-gray-200 dark:bg-gray-700"
                        }`}
                    >
                        <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform ${
                                formData.isPrimary ? "translate-x-6" : "translate-x-1"
                            }`}
                        />
                    </button>
                </div>

                {formData.isPrimary && (
                    <div className="mt-3 flex items-start gap-2.5 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <p className="text-xs text-amber-700 dark:text-amber-300">
                            Setting this as primary will replace the current primary contact for this company.
                        </p>
                    </div>
                )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-3 pt-3 border-t border-gray-100 dark:border-gray-700">
                {shouldReduce ? (
                    <button
                        type="submit"
                        disabled={loading}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading
                            ? mode === "add" ? "Adding..." : "Saving..."
                            : mode === "add" ? "Add Contact" : "Save Changes"}
                    </button>
                ) : (
                    <motion.button
                        type="submit"
                        disabled={loading}
                        whileTap={{ scale: 0.97 }}
                        className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg text-sm font-medium transition disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {loading
                            ? mode === "add" ? "Adding..." : "Saving..."
                            : mode === "add" ? "Add Contact" : "Save Changes"}
                    </motion.button>
                )}
                <button
                    type="button"
                    onClick={handleCancel}
                    disabled={loading}
                    className="px-5 py-2.5 rounded-lg text-sm font-medium text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
};

export default ContactForm;
