import { CheckCircle, CloudUpload, AlertTriangle, Download, Key } from "lucide-react";

interface CSVStudentRow {
  first_name?: string;
  last_name?: string;
  student_email?: string;
  dept_name?: string;
  student_passout_year?: string;
  current_year?: string;
  middle_name?: string;
  [key: string]: string | undefined;
}

interface RegisteredStudent {
  row: number;
  student_id: string;
  first_name: string;
  last_name: string;
  student_email: string;
  dept_name: string;
  default_password: string;
}

interface BulkRegisterError {
  row?: number;
  rowNumber?: number;
  index?: number;
  first_name?: string;
  last_name?: string;
  student_email?: string;
  email?: string;
  error?: string;
  message?: string;
}

interface BulkResultSectionProps {
  result: {
    success: boolean;
    message: string;
    data: {
      total: number;
      successful: number;
      failed: number;
      registered?: RegisteredStudent[];
      errors?: BulkRegisterError[];
    };
  };
  onReset: () => void;
  originalData: CSVStudentRow[];
  headers: string[];
}

export const BulkResultSection = ({ result, onReset, originalData, headers }: BulkResultSectionProps) => {
  const isSuccess = result.data.failed === 0;
  const errorsList = result.data.errors || [];

  const failedIndices = new Set<number>();
  const failedRecords: CSVStudentRow[] = [];

  errorsList.forEach((err) => {
    let recordIndex = -1;
    if (typeof err.rowNumber === "number") recordIndex = err.rowNumber - 1;
    else if (typeof err.index === "number") recordIndex = err.index;
    else if (typeof err.row === "number") recordIndex = err.row - 1;
    else {
      const originalIdx = originalData.findIndex(r => r.student_email === err.student_email || r.student_email === err.email);
      if (originalIdx !== -1) recordIndex = originalIdx;
    }

    if (recordIndex !== -1) {
      failedIndices.add(recordIndex);
      const errorReason = err.error || err.message || "Failed to register";
      failedRecords.push({ ...originalData[recordIndex], "Error Reason": errorReason });
    } else {
      failedRecords.push({ student_email: err.student_email || err.email, "Error Reason": err.error || err.message });
    }
  });

  const successfulRecords = originalData.filter((_, idx) => !failedIndices.has(idx));

  const toCsvBlob = (data: CSVStudentRow[], head: string[], isErrorCsv: boolean = false) => {
    if (data.length === 0) return null;
    let cols = Array.from(new Set([...head]));
    if (isErrorCsv) {
      const errorHeader = "Error Reason";
      cols = cols.filter(c => c !== errorHeader);
      if (cols.length >= 3) {
        cols.splice(3, 0, errorHeader);
      } else {
        cols.push(errorHeader);
      }
    } else {
      cols = cols.filter(c => c !== "Error Reason");
    }
    const headerRow = cols.join(",");
    const rows = data.map(item =>
      cols.map(c => `"${(item[c] || "").toString().replace(/"/g, '""')}"`).join(",")
    ).join("\n");
    return new Blob([headerRow + "\n" + rows], { type: "text/csv" });
  };

  const downloadSuccessCsv = () => {
    if (successfulRecords.length > 0) {
      const blob = toCsvBlob(successfulRecords, headers, false);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "successful_students.csv";
        link.click();
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
      }
    }
  };

  const downloadErrorCsv = () => {
    if (failedRecords.length > 0) {
      const firstFailed = failedRecords[0] || {};
      const dynamicHeaders = Object.keys(firstFailed).filter(k => k !== "Error Reason");
      const head = dynamicHeaders.includes("student_name") ? dynamicHeaders : headers;
      const blob = toCsvBlob(failedRecords, head, true);
      if (blob) {
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "failed_students.csv";
        link.click();
        setTimeout(() => window.URL.revokeObjectURL(url), 100);
      }
    }
  };

  // Download Credentials CSV — uses API response registered array
  const credentialsList: RegisteredStudent[] = result.data.registered || [];
  const hasCredentials = credentialsList.length > 0;

  const downloadCredentialsCsv = () => {
    if (!hasCredentials) return;

    const credHeaders = "first_name,last_name,student_email,default_password";
    const rows = credentialsList.map((r) => {
      return `"${r.first_name}","${r.last_name}","${r.student_email}","${r.default_password}"`;
    }).join("\n");
    const csvContent = credHeaders + "\n" + rows;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "student_credentials.csv";
    link.click();
    setTimeout(() => window.URL.revokeObjectURL(url), 100);
  };

  return (
    <div className="mt-8 space-y-6">
      <div
        className={`
          relative overflow-hidden rounded-2xl border
          ${isSuccess
            ? "border-emerald-200 dark:border-emerald-800 bg-gradient-to-br from-emerald-50 via-emerald-50 to-white dark:from-emerald-900/20 dark:via-emerald-900/10 dark:to-gray-900"
            : "border-amber-200 dark:border-amber-800 bg-gradient-to-br from-amber-50 via-amber-50 to-white dark:from-amber-900/20 dark:via-amber-900/10 dark:to-gray-900"}
          shadow-sm
        `}
      >
        <div
          className={`absolute left-0 top-0 h-full w-1 ${isSuccess ? "bg-emerald-500" : "bg-amber-500"
            }`}
        />

        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6 p-8">
          <div className="flex items-start gap-4">
            <div
              className={`
                flex h-12 w-12 items-center justify-center rounded-xl
                ${isSuccess
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400"
                  : "bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400"}
              `}
            >
              <CheckCircle size={26} strokeWidth={2.5} />
            </div>

            <div>
              <h3
                className={`text-lg font-semibold ${isSuccess ? "text-emerald-900 dark:text-emerald-200" : "text-amber-900 dark:text-amber-200"
                  }`}
              >
                {result.message}
              </h3>

              <p className="mt-1 text-sm text-slate-600 dark:text-slate-400">
                Processed{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {result.data.successful}
                </span>{" "}
                successes and{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {result.data.failed}
                </span>{" "}
                failures out of{" "}
                <span className="font-semibold text-slate-900 dark:text-slate-100">
                  {result.data.total}
                </span>{" "}
                records.
              </p>
            </div>
          </div>

          <div className="flex shrink-0 gap-3 flex-col sm:flex-row">
            {successfulRecords.length > 0 && (
              <button
                onClick={downloadSuccessCsv}
                className="
                                inline-flex items-center gap-2
                                rounded-xl border border-emerald-200 dark:border-emerald-800 bg-white dark:bg-gray-800
                                px-5 py-2.5 text-sm font-semibold text-emerald-700 dark:text-emerald-300
                                shadow-sm transition-all
                                hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:shadow
                                active:scale-[0.98]
                                "
              >
                <Download size={18} />
                Download Success CSV
              </button>
            )}

            {hasCredentials && (
              <button
                onClick={downloadCredentialsCsv}
                className="
                                inline-flex items-center gap-2
                                rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-900/20
                                px-5 py-2.5 text-sm font-bold text-blue-700 dark:text-blue-300
                                shadow-sm transition-all
                                hover:bg-blue-100 dark:hover:bg-blue-900/30 hover:shadow
                                active:scale-[0.98]
                                "
              >
                <Key size={18} />
                Download Credentials CSV
              </button>
            )}

            {!isSuccess && failedRecords.length > 0 && (
              <button
                onClick={downloadErrorCsv}
                className="
                                inline-flex items-center gap-2
                                rounded-xl border border-red-200 dark:border-red-800 bg-white dark:bg-gray-800
                                px-5 py-2.5 text-sm font-semibold text-red-700 dark:text-red-300
                                shadow-sm transition-all
                                hover:bg-red-50 dark:hover:bg-red-900/20 hover:shadow
                                active:scale-[0.98]
                                "
              >
                <Download size={18} />
                Download Error CSV
              </button>
            )}

            <button
              onClick={onReset}
              className="
                            inline-flex items-center gap-2
                            rounded-xl border border-slate-200 bg-white
                            px-5 py-2.5 text-sm font-semibold text-slate-700
                            shadow-sm transition-all
                            hover:bg-slate-50 hover:shadow
                            active:scale-[0.98]
                            "
            >
              <CloudUpload size={18} />
              Upload Another File
            </button>
          </div>
        </div>
      </div>

      {/* Error Data Summary */}
      {!isSuccess && failedRecords.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-red-200 dark:border-red-800 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-red-50 dark:bg-red-900/20 px-6 py-4 border-b border-red-100 dark:border-red-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle size={18} className="text-red-500" />
              <h3 className="font-bold text-red-800 dark:text-red-300 text-sm">Failed Students Detail</h3>
            </div>
            <span className="text-xs font-bold bg-white dark:bg-gray-800 text-red-600 dark:text-red-400 px-3 py-1.5 rounded-full shadow-sm">{failedRecords.length} Errors Found</span>
          </div>
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-gray-50/50 dark:bg-gray-800 sticky top-0 z-10 shadow-sm border-b border-gray-100 dark:border-gray-800">
                <tr>
                  {headers.slice(0, 3).map((h, i) => (
                    <th key={i} scope="col" className="px-6 py-3 font-semibold tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                  <th scope="col" className="px-6 py-3 font-bold tracking-wider text-red-600 whitespace-nowrap">Error Column</th>
                  {headers.slice(3).map((h, i) => (
                    <th key={i + 3} scope="col" className="px-6 py-3 font-semibold tracking-wider whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {failedRecords.map((req, idx) => (
                  <tr key={idx} className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 hover:bg-red-50/30 dark:hover:bg-red-900/10 transition-colors">
                    {headers.slice(0, 3).map((h, i) => (
                      <td key={i} className="px-6 py-4 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                        {req[h] || "-"}
                      </td>
                    ))}
                    <td className="px-6 py-4 font-bold text-red-600 max-w-xs break-words">
                      {req["Error Reason"] || "Validation Failed"}
                    </td>
                    {headers.slice(3).map((h, i) => (
                      <td key={i + 3} className="px-6 py-4 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                        {req[h] || "-"}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Success Data Summary */}
      {successfulRecords.length > 0 && (
        <div className="bg-white dark:bg-gray-900 border border-emerald-200 dark:border-emerald-800 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-5">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 px-6 py-4 border-b border-emerald-100 dark:border-emerald-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle size={18} className="text-emerald-500" />
              <h3 className="font-bold text-emerald-800 dark:text-emerald-300 text-sm">Successfully Registered Students</h3>
            </div>
            <span className="text-xs font-bold bg-white dark:bg-gray-800 text-emerald-600 dark:text-emerald-400 px-3 py-1.5 rounded-full shadow-sm">{successfulRecords.length} Users Added</span>
          </div>
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-sm text-left text-slate-600 dark:text-slate-300">
              <thead className="text-xs text-slate-500 dark:text-slate-400 uppercase bg-gray-50/50 dark:bg-gray-800 sticky top-0 z-10 shadow-sm border-b border-gray-100 dark:border-gray-800">
                <tr>
                  {headers.map((h, i) => (
                    <th key={i} scope="col" className="px-6 py-3 font-semibold tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {successfulRecords.map((req, idx) => (
                  <tr key={idx} className="bg-white dark:bg-gray-900 border-b border-gray-100 dark:border-gray-800 hover:bg-emerald-50/20 dark:hover:bg-emerald-900/10 transition-colors">
                    {headers.map((h, i) => (
                      <td key={i} className="px-6 py-4 whitespace-nowrap font-medium text-slate-700 dark:text-slate-300">
                        {req[h]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
