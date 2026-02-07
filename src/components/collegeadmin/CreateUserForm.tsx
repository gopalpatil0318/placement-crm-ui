import  { useState } from "react";
import { useCreateUser } from "@/hooks/collegeadmin/useCreateUser";
import { Eye, EyeOff } from "lucide-react";

interface UserFormProps {
    isEdit?: boolean;
    initialData?: {
        user_name: string;
        user_email: string;
        user_password: string;
        user_role: string;
    };
}

const UserForm = ({ isEdit = false, }: UserFormProps) => {
    const {
        formData,
        errors,
        loading,
        handleChange,
        handleSubmit,
    } = useCreateUser();

    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="p-8 bg-white rounded-xl border">
            <h1 className="text-xl font-semibold text-gray-800 mb-6">
                {isEdit ? "Edit User Details" : "Create User Form"}
            </h1>



            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Row 1 */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>

                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            User Name <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <input
                            name="userName"           // map to hook
                            value={formData.userName}
                            onChange={handleChange}
                            placeholder="User Name"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.userName && (
                            <p className="text-xs text-gray-500 mt-1">{errors.userName}</p>
                        )}
                    </div>
                </div>

                {/* Row 3 */}
                <div className={`grid grid-cols-1 ${isEdit ? "md:grid-cols-1" : "md:grid-cols-2"} gap-6`}>
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            User Email <span className="text-red-500 ml-0.5">*</span>
                        </label>
                        <input
                            type="email"
                            name="userEmail"
                            value={formData.userEmail}
                            onChange={handleChange}
                            placeholder="admin@email.com"
                            className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        {errors.userEmail && (
                            <p className="text-xs text-gray-500 mt-1">{errors.userEmail}</p>
                        )}
                    </div>

                    {!isEdit && (
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                User Password <span className="text-red-500 ml-0.5">*</span>
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="userPassword"
                                    value={formData.userPassword}
                                    onChange={handleChange}
                                    placeholder="Password"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 pr-10 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword((prev) => !prev)}
                                    className="absolute right-3 top-2.5 text-gray-500"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            {errors.userPassword && (
                                <p className="text-xs text-gray-500 mt-1">{errors.userPassword}</p>
                            )}
                        </div>
                    )}
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
                            Create User
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default UserForm;