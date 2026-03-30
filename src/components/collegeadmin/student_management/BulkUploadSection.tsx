import { useRef, useCallback } from "react";
import { FileText, FileDown, CloudUpload, Loader2, X, Table as TableIcon, ArrowLeft, ArrowUpFromLine, Users } from "lucide-react";

interface BulkUploadSectionProps {
  onFileChange: (file: File) => void;
  onUpload: () => void;
  onDownloadSample: () => void;
  onBackToUpload: () => void;
  selectedFile: File | null;
  csvData: Record<string, string>[];
  headers: string[];
  loading: boolean;
  onClearFile: () => void;
}

const REQUIRED_COLUMNS = [
  "first_name", "last_name", "student_email",
  "dept_name", "student_passout_year", "current_year",
];

export const BulkUploadSection = ({
  onFileChange,
  onUpload,
  onDownloadSample,
  onBackToUpload,
  selectedFile,
  csvData,
  headers,
  loading,
  onClearFile,
}: BulkUploadSectionProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      const file = e.dataTransfer.files[0];
      if (file && file.name.endsWith(".csv")) onFileChange(file);
    },
    [onFileChange]
  );

  const showPreview = csvData.length > 0 && selectedFile && !loading;

  // Step 2: Preview & Confirm
  if (showPreview) {
    return (
      <div className="space-y-6">
        {/* File info bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400">
              <FileText size={20} />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-800 dark:text-gray-100">{selectedFile.name}</p>
              <p className="text-xs text-gray-400 dark:text-gray-500">
                {(selectedFile.size / 1024).toFixed(1)} KB &middot; {csvData.length} student{csvData.length !== 1 ? "s" : ""} found
              </p>
            </div>
            <button
              onClick={onClearFile}
              className="ml-2 p-1.5 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
              aria-label="Remove file"
            >
              <X size={16} strokeWidth={2.5} />
            </button>
          </div>
        </div>

        {/* Data Preview Table */}
        <div className="overflow-hidden border border-gray-200 dark:border-gray-700 rounded-xl">
          <div className="bg-gray-50 dark:bg-gray-800/80 px-5 py-3.5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TableIcon size={16} className="text-gray-400 dark:text-gray-500" />
              <span className="text-sm font-semibold text-gray-700 dark:text-gray-200">Data Preview</span>
            </div>
            <span className="text-xs font-medium text-gray-400 dark:text-gray-500 bg-white dark:bg-gray-700 px-2.5 py-1 rounded-full">
              {csvData.length} row{csvData.length !== 1 ? "s" : ""}
            </span>
          </div>
          <div className="overflow-x-auto max-h-[360px]">
            <table className="w-full text-sm text-left">
              <thead className="text-[11px] text-gray-500 dark:text-gray-400 uppercase bg-gray-50/80 dark:bg-gray-800/50 sticky top-0 z-10 border-b border-gray-100 dark:border-gray-800">
                <tr>
                  <th scope="col" className="px-4 py-2.5 font-semibold tracking-wider text-gray-400 dark:text-gray-500 w-12">#</th>
                  {headers.map((header, index) => (
                    <th key={index} scope="col" className="px-4 py-2.5 font-semibold tracking-wider whitespace-nowrap">
                      {header}
                      {REQUIRED_COLUMNS.includes(header) && (
                        <span className="text-red-400 ml-0.5">*</span>
                      )}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
                {csvData.map((row, rowIndex) => (
                  <tr key={rowIndex} className="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors">
                    <td className="px-4 py-2.5 text-xs text-gray-400 dark:text-gray-500 font-mono">{rowIndex + 1}</td>
                    {headers.map((header, cellIndex) => (
                      <td key={cellIndex} className="px-4 py-2.5 whitespace-nowrap text-gray-700 dark:text-gray-300 font-medium">
                        {row[header] || <span className="text-gray-300 dark:text-gray-600">—</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center justify-between pt-2">
          <button
            onClick={onBackToUpload}
            className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-gray-600 dark:text-gray-400 hover:text-gray-800 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-xl transition-colors"
          >
            <ArrowLeft size={16} />
            Choose Different File
          </button>
          <button
            onClick={onUpload}
            className="inline-flex items-center gap-2.5 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2.5 px-6 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-[0.98]"
          >
            <ArrowUpFromLine size={16} />
            Register {csvData.length} Student{csvData.length !== 1 ? "s" : ""}
          </button>
        </div>
      </div>
    );
  }

  // Loading state: full-card overlay
  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-full border-4 border-blue-100 dark:border-blue-900/30" />
          <Loader2 className="absolute inset-0 m-auto text-blue-500 animate-spin" size={32} />
        </div>
        <div className="text-center">
          <p className="text-base font-semibold text-gray-700 dark:text-gray-200">Processing students...</p>
          <p className="text-sm text-gray-400 dark:text-gray-500 mt-1">This may take a moment</p>
        </div>
      </div>
    );
  }

  // Step 1: Upload
  return (
    <div className="space-y-8">
      {/* Instructions + Download Sample */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-4 sm:gap-8">
        <div className="flex-1">
          <h2 className="text-lg font-semibold text-gray-800 dark:text-gray-100 mb-2">Upload Student CSV</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 leading-relaxed">
            Prepare a CSV file with the required columns. Each row represents one student to register.
          </p>
          <div className="flex flex-wrap gap-1.5 mt-3">
            {REQUIRED_COLUMNS.map((col) => (
              <span key={col} className="inline-flex items-center px-2 py-0.5 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 rounded text-xs font-mono">
                {col}
              </span>
            ))}
            <span className="inline-flex items-center px-2 py-0.5 bg-gray-50 dark:bg-gray-800/50 text-gray-400 dark:text-gray-500 rounded text-xs font-mono italic">
              middle_name
            </span>
          </div>
        </div>
        <button
          onClick={onDownloadSample}
          className="inline-flex items-center gap-2 shrink-0 px-4 py-2.5 text-sm font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded-xl transition-colors border border-blue-200 dark:border-blue-800"
        >
          <FileDown size={16} />
          Download Sample
        </button>
      </div>

      {/* Drop zone */}
      <label
        onDragOver={(e) => e.preventDefault()}
        onDrop={handleDrop}
        className="flex flex-col items-center justify-center border-2 border-dashed rounded-2xl p-12 sm:p-16 cursor-pointer transition-all duration-200 group
          border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-600 hover:bg-blue-50/30 dark:hover:bg-blue-900/10"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100 dark:bg-gray-800 group-hover:bg-blue-100 dark:group-hover:bg-blue-900/30 transition-colors mb-4">
          <CloudUpload className="text-gray-400 group-hover:text-blue-500 dark:group-hover:text-blue-400 transition-colors" size={28} />
        </div>
        <p className="text-sm font-semibold text-gray-600 dark:text-gray-300 group-hover:text-gray-800 dark:group-hover:text-gray-100 transition-colors">
          Drop your CSV file here, or <span className="text-blue-600 dark:text-blue-400">browse</span>
        </p>
        <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">Only .csv files are accepted</p>
        <input
          ref={inputRef}
          type="file"
          className="hidden"
          accept=".csv"
          aria-label="Upload CSV file"
          onChange={(e) => e.target.files?.[0] && onFileChange(e.target.files[0])}
        />
      </label>

      {/* Quick tip */}
      <div className="flex items-start gap-3 p-4 rounded-xl bg-amber-50/60 dark:bg-amber-900/10 border border-amber-200/60 dark:border-amber-800/40">
        <Users size={16} className="text-amber-500 shrink-0 mt-0.5" />
        <p className="text-xs text-amber-700 dark:text-amber-400 leading-relaxed">
          <span className="font-semibold">Tip:</span> Department names must exactly match existing departments. Duplicate emails will be reported as errors.
        </p>
      </div>
    </div>
  );
};
