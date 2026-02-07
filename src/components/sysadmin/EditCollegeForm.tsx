// import React, { useEffect, useState } from "react";
// import { useEditCollege } from "@/hooks/sysadmin/useEditCollege";
// import { showToast } from "@/utils/ToastUtils";

// interface EditCollegeFormData {
//   collegeName: string;
//   collegeSubdomain: string;
//   adminName: string;
//   adminEmail: string;
// }

// const EditCollegeForm = () => {
//   const {
//     college,
//     loading,
//     updating,
//     updateCollege,
//   } = useEditCollege();

//   const [formData, setFormData] = useState<EditCollegeFormData>({
//     collegeName: "",
//     collegeSubdomain: "",
//     adminName: "",
//     adminEmail: "",
//   });

//   // Prefill form when college data loads
//   useEffect(() => {
//     if (college) {
//       setFormData({
//         collegeName: college.college_name,
//         collegeSubdomain: college.subdomain,
//         adminName: college.admin_name,
//         adminEmail: college.admin_email,
//       });
//     }
//   }, [college]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev, [name]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
//     e.preventDefault();

//     try {
//       await updateCollege({
//         college_name: formData.collegeName,
//         college_subdomain: formData.collegeSubdomain,
//         admin_name: formData.adminName,
//         admin_email: formData.adminEmail,
//       });

//       showToast({
//         type: "success",
//         title: "College Updated",
//         description: "College details updated successfully",
//       });
//     } catch (err: any) {
//       showToast({
//         type: "error",
//         title: "Update Failed",
//         description: err.message || "Something went wrong",
//       });
//     }
//   };

//   if (loading) {
//     return <p className="text-gray-500">Loading college details...</p>;
//   }

//   return (
//     <div className="p-8 bg-white rounded-xl border">
//       <h1 className="text-xl font-semibold text-gray-800 mb-6">
//         Edit College Details
//       </h1>

//       <form onSubmit={handleSubmit} className="space-y-6">
//         {/* Row 1 */}
//         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               College Name <span className="text-red-500">*</span>
//             </label>
//             <input
//               name="collegeName"
//               value={formData.collegeName}
//               onChange={handleChange}
//               className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
//             />
//           </div>

//           <div>
//             <label className="block text-sm font-medium text-gray-700 mb-1">
//               Subdomain <span className="text-red-500">*</span>
//             </label>
//             <input
//               name="collegeSubdomain"
//               value={formData.collegeSubdomain}
//               onChange={handleChange}
//               className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
//             />
//           </div>
//         </div>

//         {/* Row 2 */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Admin Name <span className="text-red-500">*</span>
//           </label>
//           <input
//             name="adminName"
//             value={formData.adminName}
//             onChange={handleChange}
//             className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Row 3 */}
//         <div>
//           <label className="block text-sm font-medium text-gray-700 mb-1">
//             Admin Email <span className="text-red-500">*</span>
//           </label>
//           <input
//             type="email"
//             name="adminEmail"
//             value={formData.adminEmail}
//             onChange={handleChange}
//             className="w-full rounded-lg border px-4 py-2.5 focus:ring-2 focus:ring-blue-500"
//           />
//         </div>

//         {/* Submit */}
//         <button
//           type="submit"
//           disabled={updating}
//           className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-full font-medium transition"
//         >
//           {updating ? (
//             <div className="flex items-center gap-2">
//               <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
//               Saving...
//             </div>
//           ) : (
//             "Save Changes"
//           )}
//         </button>
//       </form>
//     </div>
//   );
// };

// export default EditCollegeForm;





// import { useMemo, useState } from "react";
// import { useEditCollege } from "@/hooks/sysadmin/useEditCollege";
// import { showToast } from "@/utils/ToastUtils";

// const EditCollegeForm = () => {
//   const { college, loading, updating, updateCollege } = useEditCollege();

//   const initialFormData = useMemo(() => {
//     if (!college) return null;

//     return {
//       collegeName: college.college_name,
//       collegeSubdomain: college.subdomain,
//       adminName: college.admin_name,
//       adminEmail: college.admin_email,
//     };
//   }, [college?.id]); // 👈 important

//   const [formData, setFormData] = useState(initialFormData);

//   // Sync once when college loads
//   if (!formData && initialFormData) {
//     setFormData(initialFormData);
//   }

//   if (loading || !formData) {
//     return <p className="text-gray-500">Loading college details...</p>;
//   }

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setFormData((prev) => ({ ...prev!, [name]: value }));
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     try {
//       await updateCollege({
//         college_name: formData.collegeName,
//         college_subdomain: formData.collegeSubdomain,
//         admin_name: formData.adminName,
//         admin_email: formData.adminEmail,
//       });

//       showToast({
//         type: "success",
//         title: "College Updated",
//         description: "College details updated successfully",
//       });
//     } catch (err: any) {
//       showToast({
//         type: "error",
//         title: "Update Failed",
//         description: err.message || "Something went wrong",
//       });
//     }
//   };

//   return (
//     // form JSX (unchanged)
//   );
// };







import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useEditCollege } from "@/hooks/sysadmin/useEditCollege";



const EditCollegePage = () => {
  const { college, loading, updating, error, updateCollege } =
    useEditCollege();

  const [formData, setFormData] = useState({
    college_id: "",
    college_name: "",
    college_subdomain: "",
    college_status: "",
  });

  // Prefill form when college loads
  useEffect(() => {
    if (college) {
      setFormData({
        college_id: college.college_id,
        college_name: college.college_name,
        college_subdomain: college.college_subdomain,
        college_status: college.college_status ,
      });
    }
  }, [college]);

  const handleUpdate = async () => {
    try {
      await updateCollege({
        college_id: formData.college_id,
        college_name: formData.college_name,
        college_subdomain: formData.college_subdomain,
        college_status: formData.college_status,
      });
    } catch (err : any) {
      // error handled in hook
    }
  };

  return (
    
      <div className="bg-slate-100 px-6 py-8">
        <div className="mx-auto max-w-5xl">
          {/* Page Title */}
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-slate-900">
              Edit College
            </h1>
          </div>

          {/* Card */}
          <div className="rounded-lg border border-slate-200 bg-white shadow-sm">
            {/* Card Header */}
            <div className="border-b border-slate-200 px-6 py-4">
              <h2 className="text-base font-semibold text-slate-800">
                College Details
              </h2>
            </div>

            {/* Card Body */}
            <div className="px-6 py-6">
              {error && (
                <div className="mb-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                {/* College ID */}
                <div>
                  <Label className="mb-1 block text-sm font-medium text-slate-700">
                    College ID
                  </Label>
                  <Input
                    value={formData.college_id}
                    readOnly
                    disabled
                    className="h-11 rounded-md border border-slate-300 bg-slate-100 px-3 text-sm text-slate-700"
                  />
                </div>

                {/* College Name */}
                <div>
                  <Label className="mb-1 block text-sm font-medium text-slate-700">
                    College Name
                  </Label>
                  <Input
                    value={formData.college_name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        college_name: e.target.value,
                      })
                    }
                    disabled={loading}
                    placeholder="Enter college name"
                    className="h-11 rounded-md border border-slate-300 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Subdomain */}
                <div>
                  <Label className="mb-1 block text-sm font-medium text-slate-700">
                    Subdomain
                  </Label>
                  <Input
                    value={formData.college_subdomain}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        college_subdomain: e.target.value,
                      })
                    }
                    disabled={loading}
                    placeholder="college.example.com"
                    className="h-11 rounded-md border border-slate-300 px-3 text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* College Status */}
                <div>
                  <Label className="mb-2 block text-sm font-medium text-slate-700">
                    College Status
                  </Label>

                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() =>
                        setFormData({
                          ...formData,
                          college_status:
                            formData.college_status === "active"
                              ? "inactive"
                              : "active",
                        })
                      }
                      className={`relative inline-flex h-4.5 w-7.5 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                        formData.college_status === "active"
                          ? "bg-blue-500"
                          : "bg-slate-300"
                      }`}
                    >
                      <span
                        className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform duration-200 ${
                          formData.college_status === "active"
                            ? "translate-x-4"
                            : "translate-x-0.75"
                        }`}
                      />
                    </button>

                    <p className="text-sm text-slate-600">
                      Status:
                      <span className="ml-1 font-medium capitalize">
                        {formData.college_status}
                      </span>
                    </p>
                  </div>
                </div>
              </div>

              {/* Button Row */}
              <div className="mt-8 flex justify-end">
                <Button
                  type="button"
                  onClick={handleUpdate}
                  disabled={updating || loading}
                  className="h-11 rounded-full bg-blue-600 px-6 py-3 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-60"
                >
                  {updating ? "Submitting..." : "Submit"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
   
  );
};

export default EditCollegePage;