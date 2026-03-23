import { useState, useCallback } from "react";
import {
    Users,
    Plus,
    Search,
    Pencil,
    Power,
    AlertTriangle,
    UserCheck,
    Loader2,
    Mail,
    Phone,
    Star,
} from "lucide-react";
import { useViewContacts, type Contact } from "@/hooks/collegeadmin/company_management/contacts/useViewContacts";
import { useAddContact } from "@/hooks/collegeadmin/company_management/contacts/useAddContact";
import { useUpdateContact } from "@/hooks/collegeadmin/company_management/contacts/useUpdateContact";
import { useToggleContactStatus } from "@/hooks/collegeadmin/company_management/contacts/useToggleContactStatus";
import ModalWrapper from "@/components/ui/ModalWrapper";
import ContactForm from "./ContactForm";

// ========================
// HELPERS
// ========================

const getInitials = (name: string) => {
    const words = name.trim().split(/\s+/);
    if (words.length >= 2) return (words[0][0] + words[1][0]).toUpperCase();
    return name.slice(0, 2).toUpperCase();
};

const AVATAR_COLORS = [
    "from-blue-500 to-blue-600",
    "from-emerald-500 to-emerald-600",
    "from-purple-500 to-purple-600",
    "from-orange-500 to-orange-600",
    "from-cyan-500 to-cyan-600",
    "from-pink-500 to-pink-600",
] as const;

const getAvatarGradient = (name: string) =>
    AVATAR_COLORS[name.charCodeAt(0) % AVATAR_COLORS.length];

// ========================
// SUB-COMPONENTS
// ========================

/** Contact avatar — gradient initials */
const ContactAvatar = ({ name }: { name: string }) => (
    <div
        className={`h-8 w-8 rounded-full bg-gradient-to-br ${getAvatarGradient(name)} flex items-center justify-center flex-shrink-0 text-white text-xs font-bold`}
    >
        {getInitials(name)}
    </div>
);

/** Skeleton for loading state */
const ContactsSkeleton = () => (
    <div className="animate-pulse">
        {/* Header skeleton */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <div className="h-6 w-48 bg-gray-100 dark:bg-gray-800 rounded" />
            <div className="h-9 w-32 bg-gray-100 dark:bg-gray-800 rounded-lg" />
        </div>
        <div className="flex gap-3 mb-5">
            <div className="h-9 flex-1 max-w-sm bg-gray-100 dark:bg-gray-800 rounded-lg" />
            <div className="h-9 w-32 bg-gray-100 dark:bg-gray-800 rounded-lg" />
        </div>
        {/* Table skeleton */}
        <div className="space-y-0">
            {[0, 1, 2, 3].map((i) => (
                <div key={i} className="flex items-center gap-4 px-4 py-3.5 border-b border-gray-50 dark:border-gray-800">
                    <div className="h-4 w-6 bg-gray-100 dark:bg-gray-800 rounded" />
                    <div className="flex items-center gap-2.5 flex-1">
                        <div className="h-8 w-8 rounded-full bg-gray-100 dark:bg-gray-800" />
                        <div className="h-4 w-28 bg-gray-100 dark:bg-gray-800 rounded" />
                    </div>
                    <div className="h-4 w-20 bg-gray-100 dark:bg-gray-800 rounded" />
                    <div className="h-4 w-32 bg-gray-100 dark:bg-gray-800 rounded" />
                    <div className="h-4 w-24 bg-gray-100 dark:bg-gray-800 rounded" />
                    <div className="h-5 w-16 bg-gray-100 dark:bg-gray-800 rounded-full" />
                    <div className="h-5 w-14 bg-gray-100 dark:bg-gray-800 rounded-full" />
                    <div className="h-8 w-16 bg-gray-100 dark:bg-gray-800 rounded" />
                </div>
            ))}
        </div>
    </div>
);

// ========================
// MAIN COMPONENT
// ========================

interface ContactsTabProps {
    companyId: string;
    onContactsChanged: () => void;
}

const ContactsTab = ({ companyId, onContactsChanged }: ContactsTabProps) => {
    const {
        contacts,
        totalContacts,
        activeContacts,
        loading,
        search,
        isActiveFilter,
        handleSearchChange,
        handleIsActiveFilterChange,
        refresh,
    } = useViewContacts(companyId);

    // Modal states
    const [showAddModal, setShowAddModal] = useState(false);
    const [editingContact, setEditingContact] = useState<Contact | null>(null);
    const [togglingContact, setTogglingContact] = useState<Contact | null>(null);

    const handleToggleSuccess = useCallback(() => {
        refresh();
        onContactsChanged();
        setTogglingContact(null);
    }, [refresh, onContactsChanged]);

    const { toggleStatus, isToggling } = useToggleContactStatus(companyId, handleToggleSuccess);

    const hasFilters = search !== "" || isActiveFilter !== "";

    // ── Mutation callbacks ──

    const handleAddSuccess = useCallback(() => {
        setShowAddModal(false);
        refresh();
        onContactsChanged();
    }, [refresh, onContactsChanged]);

    const handleEditSuccess = useCallback(() => {
        setEditingContact(null);
        refresh();
        onContactsChanged();
    }, [refresh, onContactsChanged]);

    // ── Loading ──
    if (loading && contacts.length === 0) {
        return <ContactsSkeleton />;
    }

    return (
        <>
            {/* ── Header ── */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
                <div className="flex items-center gap-2.5">
                    <div className="h-8 w-8 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 flex items-center justify-center flex-shrink-0">
                        <Users className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                    </div>
                    <div>
                        <h3 className="text-sm font-semibold text-gray-800 dark:text-gray-100">Contacts</h3>
                        <p className="text-xs text-gray-400 dark:text-gray-500">
                            {totalContacts} total · {activeContacts} active
                        </p>
                    </div>
                </div>

                <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition shadow-sm"
                >
                    <Plus className="h-4 w-4" />
                    Add Contact
                </button>
            </div>

            {/* ── Filters ── */}
            <div className="flex flex-col sm:flex-row gap-3 mb-5">
                <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 dark:text-gray-500" />
                    <input
                        type="text"
                        placeholder="Search name, email, designation..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full border border-gray-300 dark:border-gray-700 rounded-lg pl-9 pr-3 py-2 text-sm bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition"
                    />
                </div>
                <select
                    value={isActiveFilter}
                    onChange={(e) => handleIsActiveFilterChange(e.target.value as "" | "true" | "false")}
                    className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 text-sm text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 cursor-pointer"
                >
                    <option value="">All Status</option>
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                </select>
            </div>

            {/* ── Table / Empty ── */}
            {contacts.length === 0 ? (
                <EmptyState hasFilters={hasFilters} onAdd={() => setShowAddModal(true)} />
            ) : (
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-gray-800">
                                <th className="px-4 py-3 w-10">#</th>
                                <th className="px-4 py-3">Contact</th>
                                <th className="px-4 py-3">Designation</th>
                                <th className="px-4 py-3">Email</th>
                                <th className="px-4 py-3">Phone</th>
                                <th className="px-4 py-3 text-center">Type</th>
                                <th className="px-4 py-3 text-center">Status</th>
                                <th className="px-4 py-3 text-center">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">
                            {contacts.map((contact, idx) => (
                                <tr key={contact.contact_id} className="hover:bg-gray-50/40 dark:hover:bg-gray-800/40 transition-colors text-sm">
                                    <td className="px-4 py-3 text-gray-400 dark:text-gray-500 text-xs">{idx + 1}</td>

                                    {/* Contact name + avatar */}
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-2.5">
                                            <ContactAvatar name={contact.contact_name} />
                                            <span className="font-medium text-gray-800 dark:text-gray-100">
                                                {contact.contact_name}
                                            </span>
                                        </div>
                                    </td>

                                    {/* Designation */}
                                    <td className="px-4 py-3 text-gray-600 dark:text-gray-400">
                                        {contact.contact_designation || <span className="text-gray-300 dark:text-gray-600">—</span>}
                                    </td>

                                    {/* Email */}
                                    <td className="px-4 py-3">
                                        {contact.contact_email ? (
                                            <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                <Mail className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                                {contact.contact_email}
                                            </span>
                                        ) : (
                                            <span className="text-gray-300 dark:text-gray-600">—</span>
                                        )}
                                    </td>

                                    {/* Phone */}
                                    <td className="px-4 py-3">
                                        {contact.contact_phone ? (
                                            <span className="inline-flex items-center gap-1 text-gray-600 dark:text-gray-400">
                                                <Phone className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
                                                {contact.contact_phone}
                                            </span>
                                        ) : (
                                            <span className="text-gray-300 dark:text-gray-600">—</span>
                                        )}
                                    </td>

                                    {/* Type */}
                                    <td className="px-4 py-3 text-center">
                                        {contact.is_primary ? (
                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400">
                                                <Star className="h-3 w-3" />
                                                Primary
                                            </span>
                                        ) : (
                                            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400">
                                                Secondary
                                            </span>
                                        )}
                                    </td>

                                    {/* Status */}
                                    <td className="px-4 py-3 text-center">
                                        <span
                                            className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-xs font-medium ${
                                                contact.is_active
                                                    ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                                                    : "bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400"
                                            }`}
                                        >
                                            <span
                                                className={`h-1.5 w-1.5 rounded-full ${
                                                    contact.is_active ? "bg-emerald-500" : "bg-red-400"
                                                }`}
                                            />
                                            {contact.is_active ? "Active" : "Inactive"}
                                        </span>
                                    </td>

                                    {/* Actions */}
                                    <td className="px-4 py-3 text-center">
                                        <div className="inline-flex items-center gap-1">
                                            <button
                                                type="button"
                                                onClick={() => setEditingContact(contact)}
                                                className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-gray-800 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition"
                                                aria-label="Edit contact"
                                            >
                                                <Pencil className="h-4 w-4" />
                                            </button>
                                            <button
                                                type="button"
                                                onClick={() => setTogglingContact(contact)}
                                                className={`p-1.5 rounded-md transition ${
                                                    contact.is_active
                                                        ? "hover:bg-red-50 dark:hover:bg-red-900/20 text-gray-400 hover:text-red-600 dark:hover:text-red-400"
                                                        : "hover:bg-emerald-50 dark:hover:bg-emerald-900/20 text-gray-400 hover:text-emerald-600 dark:hover:text-emerald-400"
                                                }`}
                                                aria-label={contact.is_active ? "Deactivate contact" : "Activate contact"}
                                            >
                                                <Power className="h-4 w-4" />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* ━━━━━ Add Contact Modal ━━━━━ */}
            <AddContactModal
                companyId={companyId}
                isOpen={showAddModal}
                onSuccess={handleAddSuccess}
                onClose={() => setShowAddModal(false)}
            />

            {/* ━━━━━ Edit Contact Modal ━━━━━ */}
            <EditContactModal
                companyId={companyId}
                contact={editingContact}
                isOpen={!!editingContact}
                onSuccess={handleEditSuccess}
                onClose={() => setEditingContact(null)}
            />

            {/* ━━━━━ Toggle Contact Modal ━━━━━ */}
            <ToggleContactModal
                contact={togglingContact}
                isOpen={!!togglingContact}
                isToggling={isToggling}
                onConfirm={(contact) => toggleStatus(contact.contact_id, contact.contact_name, !contact.is_active)}
                onClose={() => !isToggling && setTogglingContact(null)}
            />
        </>
    );
};

// ========================
// MODAL COMPONENTS
// ========================

/** Add Contact Modal */
const AddContactModal = ({
    companyId,
    isOpen,
    onSuccess,
    onClose,
}: {
    companyId: string;
    isOpen: boolean;
    onSuccess: () => void;
    onClose: () => void;
}) => {
    const { formData, errors, loading, handleChange, handleCheckboxChange, handleSubmit, reset } =
        useAddContact(companyId, () => {
            reset();
            onSuccess();
        });

    const handleCancel = useCallback(() => {
        reset();
        onClose();
    }, [reset, onClose]);

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={handleCancel}
            disabled={loading}
            title="Add Contact"
            titleIcon={
                <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                    <Users className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
            }
            size="lg"
        >
            <div className="px-6 py-5">
                <ContactForm
                    mode="add"
                    formData={formData}
                    errors={errors}
                    loading={loading}
                    handleChange={handleChange}
                    handleCheckboxChange={handleCheckboxChange}
                    handleSubmit={handleSubmit}
                    handleCancel={handleCancel}
                />
            </div>
        </ModalWrapper>
    );
};

/** Edit Contact Modal */
const EditContactModal = ({
    companyId,
    contact,
    isOpen,
    onSuccess,
    onClose,
}: {
    companyId: string;
    contact: Contact | null;
    isOpen: boolean;
    onSuccess: () => void;
    onClose: () => void;
}) => {
    const { formData, errors, loading, handleChange, handleCheckboxChange, handleSubmit } =
        useUpdateContact(companyId, contact, onSuccess);

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={onClose}
            disabled={loading}
            title="Edit Contact"
            titleIcon={
                <div className="h-9 w-9 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                    <Pencil className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                </div>
            }
            size="lg"
        >
            <div className="px-6 py-5">
                <ContactForm
                    mode="edit"
                    formData={formData}
                    errors={errors}
                    loading={loading}
                    handleChange={handleChange}
                    handleCheckboxChange={handleCheckboxChange}
                    handleSubmit={handleSubmit}
                    handleCancel={onClose}
                />
            </div>
        </ModalWrapper>
    );
};

/** Toggle Contact Status Confirmation Modal */
const ToggleContactModal = ({
    contact,
    isOpen,
    isToggling,
    onConfirm,
    onClose,
}: {
    contact: Contact | null;
    isOpen: boolean;
    isToggling: boolean;
    onConfirm: (contact: Contact) => void;
    onClose: () => void;
}) => {
    if (!contact) return null;
    const isActive = contact.is_active;

    return (
        <ModalWrapper
            isOpen={isOpen}
            onClose={onClose}
            disabled={isToggling}
            title={isActive ? "Deactivate Contact" : "Activate Contact"}
            titleIcon={
                <div
                    className={`h-9 w-9 rounded-lg flex items-center justify-center flex-shrink-0 ${
                        isActive
                            ? "bg-red-50 dark:bg-red-900/20"
                            : "bg-emerald-50 dark:bg-emerald-900/20"
                    }`}
                >
                    <Power
                        className={`h-4 w-4 ${
                            isActive
                                ? "text-red-600 dark:text-red-400"
                                : "text-emerald-600 dark:text-emerald-400"
                        }`}
                    />
                </div>
            }
            size="md"
        >
            {/* Body */}
            <div className="px-6 py-5">
                <p className="text-sm text-gray-600 dark:text-gray-400">
                    Are you sure you want to{" "}
                    <span className="font-semibold">{isActive ? "deactivate" : "activate"}</span>{" "}
                    <span className="font-semibold text-gray-800 dark:text-gray-100">
                        {contact.contact_name}
                    </span>
                    ?
                </p>

                {isActive ? (
                    <div className="mt-4 flex items-start gap-3 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-100 dark:border-amber-800">
                        <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-amber-700 dark:text-amber-300 space-y-1">
                            <p className="font-medium">This action will:</p>
                            <ul className="list-disc pl-4 space-y-0.5">
                                <li>Remove this contact from active lists</li>
                                <li>Contact information will be preserved</li>
                                <li>You can re-activate at any time</li>
                            </ul>
                        </div>
                    </div>
                ) : (
                    <div className="mt-4 flex items-start gap-3 p-3 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-100 dark:border-emerald-800">
                        <UserCheck className="h-4 w-4 text-emerald-600 dark:text-emerald-400 mt-0.5 flex-shrink-0" />
                        <div className="text-xs text-emerald-700 dark:text-emerald-300 space-y-1">
                            <p className="font-medium">This action will:</p>
                            <ul className="list-disc pl-4 space-y-0.5">
                                <li>Restore this contact to active status</li>
                                <li>Contact will appear in active lists</li>
                                <li>You can deactivate again at any time</li>
                            </ul>
                        </div>
                    </div>
                )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 flex items-center justify-end gap-3">
                <button
                    type="button"
                    onClick={onClose}
                    disabled={isToggling}
                    className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition disabled:opacity-50"
                >
                    Cancel
                </button>
                <button
                    type="button"
                    onClick={() => onConfirm(contact)}
                    disabled={isToggling}
                    className={`inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white rounded-lg transition disabled:opacity-50 ${
                        isActive
                            ? "bg-red-600 hover:bg-red-700"
                            : "bg-emerald-600 hover:bg-emerald-700"
                    }`}
                >
                    {isToggling ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                        <Power className="h-4 w-4" />
                    )}
                    {isActive ? "Deactivate" : "Activate"}
                </button>
            </div>
        </ModalWrapper>
    );
};

// ========================
// EMPTY STATE
// ========================

const EmptyState = ({
    hasFilters,
    onAdd,
}: {
    hasFilters: boolean;
    onAdd: () => void;
}) => (
    <div className="flex flex-col items-center justify-center py-14 text-center">
        <div className="h-14 w-14 rounded-full bg-gray-100 dark:bg-gray-800 flex items-center justify-center mb-4">
            <Users className="h-7 w-7 text-gray-400 dark:text-gray-500" />
        </div>
        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            {hasFilters ? "No contacts match your filters" : "No contacts yet"}
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mb-5 max-w-xs">
            {hasFilters
                ? "Try adjusting your search or status filter."
                : "Get started by adding the first contact for this company."}
        </p>
        {!hasFilters && (
            <button
                type="button"
                onClick={onAdd}
                className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition"
            >
                <Plus className="h-4 w-4" />
                Add First Contact
            </button>
        )}
    </div>
);

export default ContactsTab;
