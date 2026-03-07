import { useState, useEffect, useMemo, useCallback } from "react";
import { Eye, EyeOff, ArrowLeft, Wand2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useCreateStudent } from "@/hooks/collegeadmin/student_management/useCreateStudent";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import PageHeader from "@/components/collegeadmin/PageHeader";

const CreateStudentForm = () => {
  const navigate = useNavigate();
  const { formData, loading, handleChange, handleSubmit } = useCreateStudent();

  const [showPassword, setShowPassword] = useState(false);
  const [departments, setDepartments] = useState<any[]>([]);

  // Fetch active departments for dropdown
  useEffect(() => {
    const fetchDepts = async () => {
      try {
        const res = await CollegeAdminService.getDepartments({ is_active: true, limit: 100 });
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res) ? res : [];
        setDepartments(list);
      } catch {
        // Silently fail
      }
    };
    fetchDepts();
  }, []);

  const breadcrumbs = useMemo(() => [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Students", path: "/college/students" },
    { label: "Register Student", active: true },
  ], []);

  // Auto-generated password preview
  const defaultPassword = formData.first_name && formData.student_passout_year
    ? `${formData.first_name.toLowerCase()}@${formData.student_passout_year}`
    : "";

  // Generate password button handler
  const handleGeneratePassword = useCallback(() => {
    if (defaultPassword) {
      // Simulate a change event on the password field
      const event = {
        target: { name: "student_password", value: defaultPassword },
      } as React.ChangeEvent<HTMLInputElement>;
      handleChange(event);
    }
  }, [defaultPassword, handleChange]);

  // Passout year options (2020–2040)
  const passoutYearOptions = useMemo(
    () => Array.from({ length: 21 }, (_, i) => 2020 + i),
    []
  );

  return (
    <div className="space-y-6">
      <PageHeader title="Register Student" breadcrumbs={breadcrumbs} />

      <button
        type="button"
        onClick={() => navigate("/college/students")}
        className="flex items-center gap-2 text-sm text-gray-600 hover:text-blue-600 font-medium transition"
      >
        <ArrowLeft size={16} />
        Back to Students
      </button>

      <div className="p-8 bg-white rounded-xl border">
        <h2 className="text-xl font-semibold text-gray-800 mb-6">
          Student Registration Form
        </h2>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Row 1 — Names */}
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
                required
                minLength={2}
                maxLength={100}
                className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                placeholder="Middle Name (optional)"
                maxLength={100}
                className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                required
                minLength={1}
                maxLength={100}
                className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>
          </div>

          {/* Row 2 — Email + Password */}
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
                placeholder="student@college.ac.in"
                required
                maxLength={255}
                className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
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
                  placeholder="Min 8 characters"
                  required
                  minLength={8}
                  maxLength={128}
                  className="w-full rounded-lg border px-4 py-2.5 pr-20 focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
                  {defaultPassword && (
                    <button
                      type="button"
                      onClick={handleGeneratePassword}
                      title={`Generate: ${defaultPassword}`}
                      className="p-1 text-blue-500 hover:text-blue-700 transition"
                    >
                      <Wand2 size={16} />
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => setShowPassword((p) => !p)}
                    className="p-1 text-gray-500 hover:text-gray-700 transition"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              {defaultPassword && (
                <p className="text-xs text-gray-500 mt-1">
                  Default password: <code className="bg-gray-100 px-1 rounded">{defaultPassword}</code>
                </p>
              )}
            </div>
          </div>

          {/* Row 3 — Department + Current Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Department *
              </label>
              <select
                name="dept_name"
                value={formData.dept_name}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value="">Select Department</option>
                {departments.map((d: any) => (
                  <option key={d.dept_id} value={d.dept_name}>
                    {d.dept_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Current Year *
              </label>
              <select
                name="current_year"
                value={formData.current_year}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                <option value={1}>1st Year</option>
                <option value={2}>2nd Year</option>
                <option value={3}>3rd Year</option>
                <option value={4}>4th Year</option>
                <option value={5}>5th Year</option>
                <option value={6}>6th Year</option>
              </select>
            </div>
          </div>

          {/* Row 4 — Passout Year */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Passout Year *
              </label>
              <select
                name="student_passout_year"
                value={formData.student_passout_year}
                onChange={handleChange}
                required
                className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500 focus:outline-none"
              >
                {passoutYearOptions.map((y) => (
                  <option key={y} value={y}>{y}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Buttons */}
          <div className="flex items-center gap-4 pt-2">
            <button
              type="submit"
              disabled={loading}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2.5 rounded-lg font-medium transition disabled:opacity-50 inline-flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Registering...
                </>
              ) : (
                "Register Student"
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate("/college/students")}
              className="px-6 py-2.5 text-gray-600 bg-gray-100 rounded-lg font-medium hover:bg-gray-200 transition"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateStudentForm;
