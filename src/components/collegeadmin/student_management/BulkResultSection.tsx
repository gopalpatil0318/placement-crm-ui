import { CheckCircle, CloudUpload, AlertTriangle, Download } from "lucide-react";

interface BulkResultSectionProps {
    result: {
        success: boolean;
        message: string;
        data: {
            total: number;
            successful: number;
            failed: number;
            errors?: any[];
            [key: string]: any;
        };
    };
    onReset: () => void;
    originalData: any[];
    headers: string[];
}

export const BulkResultSection = ({ result, onReset, originalData, headers }: BulkResultSectionProps) => {
    const isSuccess = result.data.failed === 0;
    const errorsList = result.data.errors || [];

    const failedIndices = new Set();
    let failedRecords: any[] = [];
    let errorMessages: { [key: number]: string } = {};

    errorsList.forEach((err: any) => {
        let recordIndex = -1;
        if (typeof err.rowNumber === "number") recordIndex = err.rowNumber - 1;
        else if (typeof err.index === "number") recordIndex = err.index;
        else if (typeof err.row === "number") recordIndex = err.row - 1;
        else {
            const originalIdx = originalData.findIndex(r => r.student_email === err.student_email || r.email === err.email);
            if (originalIdx !== -1) recordIndex = originalIdx;
        }

        if (recordIndex !== -1) {
            failedIndices.add(recordIndex);
            errorMessages[recordIndex] = err.error || err.message || "Failed to register";
            failedRecords.push({ ...originalData[recordIndex], "Error Reason": errorMessages[recordIndex] });
        } else {
            failedRecords.push({ ...err });
        }
    });

    const successfulRecords = originalData.filter((_, idx) => !failedIndices.has(idx));

    const toCsvBlob = (data: any[], head: string[], isErrorCsv: boolean = false) => {
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

    return (
        <div className="mt-8 space-y-6">
            <div
                className={`
          relative overflow-hidden rounded-2xl border
          ${isSuccess
                        ? "border-emerald-200 bg-gradient-to-br from-emerald-50 via-emerald-50 to-white"
                        : "border-amber-200 bg-gradient-to-br from-amber-50 via-amber-50 to-white"}
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
                                    ? "bg-emerald-100 text-emerald-600"
                                    : "bg-amber-100 text-amber-600"}
              `}
                        >
                            <CheckCircle size={26} strokeWidth={2.5} />
                        </div>

                        <div>
                            <h3
                                className={`text-lg font-semibold ${isSuccess ? "text-emerald-900" : "text-amber-900"
                                    }`}
                            >
                                {result.message}
                            </h3>

                            <p className="mt-1 text-sm text-slate-600">
                                Processed{" "}
                                <span className="font-semibold text-slate-900">
                                    {result.data.successful}
                                </span>{" "}
                                successes and{" "}
                                <span className="font-semibold text-slate-900">
                                    {result.data.failed}
                                </span>{" "}
                                failures out of{" "}
                                <span className="font-semibold text-slate-900">
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
                                rounded-xl border border-emerald-200 bg-white
                                px-5 py-2.5 text-sm font-semibold text-emerald-700
                                shadow-sm transition-all
                                hover:bg-emerald-50 hover:shadow
                                active:scale-[0.98]
                                "
                            >
                                <Download size={18} />
                                Download Success CSV
                            </button>
                        )}

                        {!isSuccess && failedRecords.length > 0 && (
                            <button
                                onClick={downloadErrorCsv}
                                className="
                                inline-flex items-center gap-2
                                rounded-xl border border-red-200 bg-white
                                px-5 py-2.5 text-sm font-semibold text-red-700
                                shadow-sm transition-all
                                hover:bg-red-50 hover:shadow
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
                <div className="bg-white border border-red-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-4">
                    <div className="bg-red-50 px-6 py-4 border-b border-red-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <AlertTriangle size={18} className="text-red-500" />
                            <h3 className="font-bold text-red-800 text-sm">Failed Students Detail</h3>
                        </div>
                        <span className="text-xs font-bold bg-white text-red-600 px-3 py-1.5 rounded-full shadow-sm">{failedRecords.length} Errors Found</span>
                    </div>
                    <div className="overflow-x-auto max-h-[400px]">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="text-xs text-slate-500 uppercase bg-gray-50/50 sticky top-0 z-10 shadow-sm border-b border-gray-100">
                                <tr>
                                    {headers.slice(0, 3).map((h, i) => (
                                        <th key={i} className="px-6 py-3 font-semibold tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                    <th className="px-6 py-3 font-bold tracking-wider text-red-600 whitespace-nowrap">Error Column</th>
                                    {headers.slice(3).map((h, i) => (
                                        <th key={i + 3} className="px-6 py-3 font-semibold tracking-wider whitespace-nowrap">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {failedRecords.map((req, idx) => (
                                    <tr key={idx} className="bg-white border-b border-gray-100 hover:bg-red-50/30 transition-colors">
                                        {headers.slice(0, 3).map((h, i) => (
                                            <td key={i} className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
                                                {req[h] || "-"}
                                            </td>
                                        ))}
                                        <td className="px-6 py-4 font-bold text-red-600 max-w-xs break-words">
                                            {req["Error Reason"] || "Validation Failed"}
                                        </td>
                                        {headers.slice(3).map((h, i) => (
                                            <td key={i + 3} className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
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
                <div className="bg-white border border-emerald-200 rounded-xl overflow-hidden shadow-sm animate-in fade-in slide-in-from-bottom-5">
                    <div className="bg-emerald-50 px-6 py-4 border-b border-emerald-100 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <CheckCircle size={18} className="text-emerald-500" />
                            <h3 className="font-bold text-emerald-800 text-sm">Successfully Registered Students</h3>
                        </div>
                        <span className="text-xs font-bold bg-white text-emerald-600 px-3 py-1.5 rounded-full shadow-sm">{successfulRecords.length} Users Added</span>
                    </div>
                    <div className="overflow-x-auto max-h-[400px]">
                        <table className="w-full text-sm text-left text-slate-600">
                            <thead className="text-xs text-slate-500 uppercase bg-gray-50/50 sticky top-0 z-10 shadow-sm border-b border-gray-100">
                                <tr>
                                    {headers.map((h, i) => (
                                        <th key={i} className="px-6 py-3 font-semibold tracking-wider">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {successfulRecords.map((req, idx) => (
                                    <tr key={idx} className="bg-white border-b border-gray-100 hover:bg-emerald-50/20 transition-colors">
                                        {headers.map((h, i) => (
                                            <td key={i} className="px-6 py-4 whitespace-nowrap font-medium text-slate-700">
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
