import {
  Upload,
  FileText,
  HelpCircle,
  CloudUpload,
  Loader2,
  X,
  Table as TableIcon,
} from "lucide-react";

interface BulkUploadSectionProps {
  onFileChange: (file: File) => void;
  onUpload: () => void;
  onDownloadSample: () => void;
  selectedFile: File | null;
  csvData: any[];
  headers: string[];
  loading: boolean;
  onClearFile: () => void;
}

export const BulkUploadSection = ({
  onFileChange,
  onUpload,
  onDownloadSample,
  selectedFile,
  csvData,
  headers,
  loading,
  onClearFile,
}: BulkUploadSectionProps) => {
  return (
    <>
      {/* Header Section inside Card */}
      <h1 className="text-xl font-semibold text-gray-800 mb-6 tracking-tight">
        Bulk Student Registration
      </h1>

      {/* Instructions Box */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-6 mb-8">
        <div className="flex items-center gap-2 mb-2">
          <HelpCircle size={16} className="text-blue-700" />
          <h3 className="font-bold text-blue-800 text-sm uppercase tracking-wider">
            Instructions
          </h3>
        </div>
        <p className="text-sm text-slate-500 mb-4 font-medium">
          Required: name, email, password, department, year.
        </p>

        <button
          onClick={onDownloadSample}
          className="text-blue-600 font-bold hover:underline flex items-center gap-2 text-[13px]"
        >
          <FileText size={16} /> Download Sample CSV
        </button>
      </div>

      {/* Upload Area */}
      <div className="mt-4">
        <label
          className={`flex flex-col items-center justify-center border-2 border-dashed rounded-[24px] p-16 cursor-pointer transition-all group min-h-[250px]
                            ${selectedFile ? "border-blue-200 bg-blue-50/30" : "border-gray-200 hover:bg-slate-50 hover:border-blue-200"}
                        `}
        >
          {loading ? (
            <div className="flex flex-col items-center justify-center animate-pulse">
              <Loader2 className="text-blue-500 animate-spin mb-4" size={48} />
              <p className="text-slate-500 font-medium">
                Processing Students...
              </p>
            </div>
          ) : selectedFile ? (
            <div className="flex flex-col items-center justify-center">
              <div className="p-4 bg-blue-100 text-blue-600 rounded-full mb-4 relative">
                <FileText size={40} />
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    onClearFile();
                  }}
                  className="absolute -top-1 -right-1 bg-white rounded-full p-1 shadow-md border border-gray-100 hover:bg-red-50 text-gray-400 hover:text-red-500"
                >
                  <X size={14} strokeWidth={3} />
                </button>
              </div>
              <p className="text-lg font-bold text-slate-700 mb-1">
                {selectedFile.name}
              </p>
              <p className="text-sm text-slate-400 font-medium mb-6">
                {(selectedFile.size / 1024).toFixed(2)} KB
              </p>

              <button
                onClick={(e) => {
                  e.preventDefault();
                  onUpload();
                }}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 px-8 rounded-full shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                Upload & Register {csvData.length > 0 && `(${csvData.length})`}
              </button>
            </div>
          ) : (
            <>
              <div className="p-4 bg-gray-50 rounded-full mb-4 group-hover:bg-blue-50 transition-colors">
                <CloudUpload
                  className="text-gray-300 group-hover:text-blue-400"
                  size={48}
                  strokeWidth={1.5}
                />
              </div>
              <p className="text-base font-bold text-slate-600 group-hover:text-slate-800 transition-colors">
                Click to upload CSV file
              </p>
              <input
                type="file"
                className="hidden"
                accept=".csv"
                onChange={(e) =>
                  e.target.files?.[0] && onFileChange(e.target.files[0])
                }
              />
            </>
          )}
        </label>
      </div>

      {/* CSV Preview Table */}
      {csvData.length > 0 && !loading && (
        <div className="mt-8 overflow-hidden border border-gray-200 rounded-xl animate-in fade-in slide-in-from-bottom-4">
          <div className="bg-gray-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <TableIcon size={18} className="text-slate-500" />
              <h3 className="font-bold text-slate-700 text-sm">File Preview</h3>
            </div>
            <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">
              {csvData.length} Rows found
            </span>
          </div>
          <div className="overflow-x-auto max-h-[400px]">
            <table className="w-full text-sm text-left text-slate-600">
              <thead className="text-xs text-slate-500 uppercase bg-gray-50 sticky top-0 z-10 shadow-sm">
                <tr>
                  {headers.map((header, index) => (
                    <th
                      key={index}
                      className="px-6 py-3 font-semibold tracking-wider"
                    >
                      {header}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {csvData.map((row, rowIndex) => (
                  <tr
                    key={rowIndex}
                    className="bg-white border-b border-gray-100 hover:bg-slate-50 transition-colors"
                  >
                    {headers.map((header, cellIndex) => (
                      <td
                        key={cellIndex}
                        className="px-6 py-3 whitespace-nowrap font-medium"
                      >
                        {row[header]}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </>
  );
};
