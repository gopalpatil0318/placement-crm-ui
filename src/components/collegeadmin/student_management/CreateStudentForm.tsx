import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { useCreateStudent } from "@/hooks/collegeadmin/student_management/useCreateStudent";

const CreateStudentForm = () => {
    const {
        formData,
        errors,
        loading,
        handleChange,
        handleSubmit,
    } = useCreateStudent();

    const [showPassword, setShowPassword] = useState(false);

    return (
        <div className="p-8 bg-white rounded-xl border">
            <h1 className="text-xl font-semibold text-gray-800 mb-6">
                Create Student Form
            </h1>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Row 1 – Name */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            First Name *
                        </label>
                        <input
                            name="first_name"
                            value={formData.first_name}
                            onChange={handleChange}
                            placeholder="First Name"
                            className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Middle Name
                        </label>
                        <input
                            name="middle_name"
                            value={formData.middle_name}
                            onChange={handleChange}
                            placeholder="Middle Name"
                            className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Last Name *
                        </label>
                        <input
                            name="last_name"
                            value={formData.last_name}
                            onChange={handleChange}
                            placeholder="Last Name"
                            className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Row 2 – Email + Password */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Student Email *
                        </label>
                        <input
                            type="email"
                            name="student_email"
                            value={formData.student_email}
                            onChange={handleChange}
                            placeholder="student@email.com"
                            className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Password *
                        </label>
                        <div className="relative">
                            <input
                                type={showPassword ? "text" : "password"}
                                name="student_password"
                                value={formData.student_password}
                                onChange={handleChange}
                                placeholder="Password"
                                className="w-full rounded-lg border px-4 py-2.5 pr-10 focus:ring-2 focus:ring-blue-500"
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword((p) => !p)}
                                className="absolute right-3 top-2.5 text-gray-500"
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Row 3 – Department + Year */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Department *
                        </label>
                        <input
                            type="text"
                            name="dept_name"
                            value={formData.dept_name}
                            onChange={handleChange}
                            placeholder="Enter Department Name"
                            className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Current Year *
                        </label>
                        <select
                            name="current_year"
                            value={formData.current_year}
                            onChange={handleChange}
                            className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                        >
                            <option value={1}>1st Year</option>
                            <option value={2}>2nd Year</option>
                            <option value={3}>3rd Year</option>
                            <option value={4}>4th Year</option>
                        </select>
                    </div>
                </div>

                {/* Row 4 – Passout Year */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                            Passout Year *
                        </label>
                        <input
                            type="number"
                            name="student_passout_year"
                            value={formData.student_passout_year}
                            onChange={handleChange}
                            className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
                        />
                    </div>
                </div>

                {/* Submit */}
                <button
                    type="submit"
                    disabled={loading}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-full font-medium transition"
                >
                    {loading ? (
                        <div className="flex items-center gap-2">
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                            Creating...
                        </div>
                    ) : (
                        "Create Student"
                    )}
                </button>
            </form>
        </div>
    );
};

export default CreateStudentForm;