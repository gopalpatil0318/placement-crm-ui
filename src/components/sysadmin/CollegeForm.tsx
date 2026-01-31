import React, { useState } from "react";

interface CollegeFormProps {
    isEdit?: boolean;
    initialData?: {
        college_name: string;
        subdomain: string;
        admin_name: string;
        admin_email: string;
    };
}

const CollegeSetupForm = ({ isEdit = false, initialData }: CollegeFormProps) => {
    const [form, setForm] = useState({
        college_name: initialData?.college_name || "",
        subdomain: initialData?.subdomain || "",
        admin_name: initialData?.admin_name || "",
        admin_email: initialData?.admin_email || "",
        admin_password: "",
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        console.log("Submitting form:", form);
    };

    return (
        <div className="p-8 bg-white rounded-xl border">
            <h1 className="text-xl font-semibold text-gray-800 mb-6">
                {isEdit ? "Edit College Details" : "Create College Form"}
            </h1>

            {/* Info Alert */}
            <div className="flex items-center gap-3 bg-blue-50 border border-blue-200 text-blue-700 rounded-lg px-4 py-3 mb-8">
                <div className="w-6 h-6 flex items-center justify-center rounded-full bg-blue-100 font-bold">
                    i
                </div>
                <p className="text-sm">
                    {isEdit
                        ? "You are currently editing an existing college. Password changes are managed separately."
                        : "When working with the Bootstrap grid system, be sure to place form elements within column classes."
                    }
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            College Name
                        </label>
                        <input
                            name="college_name"
                            value={form.college_name}
                            onChange={handleChange}
                            placeholder="College Name"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subdomain
                        </label>
                        <input
                            name="subdomain"
                            value={form.subdomain}
                            onChange={handleChange}
                            placeholder="yourcollege"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Row 2 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admin Name
                    </label>
                    <input
                        name="admin_name"
                        value={form.admin_name}
                        onChange={handleChange}
                        placeholder="Admin Full Name"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                {/* Row 3 */}
                <div className={`grid grid-cols-1 ${isEdit ? "md:grid-cols-1" : "md:grid-cols-2"} gap-6`}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Admin Email
                        </label>
                        <input
                            type="email"
                            name="admin_email"
                            value={form.admin_email}
                            onChange={handleChange}
                            placeholder="admin@email.com"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    {!isEdit && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Admin Password
                            </label>
                            <input
                                type="password"
                                name="admin_password"
                                value={form.admin_password}
                                onChange={handleChange}
                                placeholder="Password"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                    )}
                </div>

                {/* Checkbox */}
                <div className="flex items-center gap-2">
                    <input
                        type="checkbox"
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span className="text-sm text-gray-700 text-black">Check me out</span>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-full font-medium transition"
                >
                    {isEdit ? "Save Changes" : "Create College"}
                </button>
            </form>
        </div>
    );
};

export default CollegeSetupForm;
