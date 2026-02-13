import { useCreateCollege } from "@/hooks/sysadmin/useCreateCollege";
import { Eye, EyeOff } from "lucide-react";



const CreateCollegeForm = () => {
    const {
        formData,
        errors,
        loading,
        handleChange,
        handleSubmit,
        showPassword,
        togglePassword,
    } = useCreateCollege();

    return (
        <div className="p-8 bg-white rounded-xl border">
            <h1 className="text-xl font-semibold text-gray-800 mb-6">
                Create College Form
            </h1>



            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            College Name <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <input
                            name="collegeName"           // map to hook
                            value={formData.collegeName}
                            onChange={handleChange}
                            placeholder="College Name"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.collegeName && (
                            <p className="text-xs text-gray-500 mt-1">{errors.collegeName}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Subdomain <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <input
                            name="collegeSubdomain"     // map to hook
                            value={formData.collegeSubdomain}
                            onChange={handleChange}
                            placeholder="yourcollege"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.collegeSubdomain && (
                            <p className="text-xs text-gray-500 mt-1">{errors.collegeSubdomain}</p>
                        )}
                    </div>
                </div>

                {/* Row 2 */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                        Admin Name <span className="text-red-500 ml-0.5">*</span>
                    </label>
                    <input
                        name="adminName"
                        value={formData.adminName}
                        onChange={handleChange}
                        placeholder="Admin Full Name"
                        className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    {errors.adminName && (
                        <p className="text-xs text-gray-500 mt-1">{errors.adminName}</p>
                    )}
                </div>

                {/* Row 3 */}
                <div className={`grid grid-cols-1 md:grid-cols-2 gap-6`}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Admin Email <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <input
                            type="email"
                            name="adminEmail"
                            value={formData.adminEmail}
                            onChange={handleChange}
                            placeholder="admin@email.com"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.adminEmail && (
                            <p className="text-xs text-gray-500 mt-1">{errors.adminEmail}</p>
                        )}
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Admin Password <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="adminPassword"
                                value={formData.adminPassword}
                                onChange={handleChange}
                                placeholder="Password"
                                className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={togglePassword}
                                className="absolute right-3 top-2.5 text-gray-500"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {errors.adminPassword && (
                            <p className="text-xs text-gray-500 mt-1">{errors.adminPassword}</p>
                        )}
                    </div>

                </div>

                {/* Checkbox */}


                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-full font-medium transition"
                >
                    {/* {loading ? "Creating..." : isEdit ? "Save Changes" : "Create College"} */}
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></div>
                            Creating...
                        </div>
                    ) : (
                        <>
                            Create College
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default CreateCollegeForm;
