import { useState, useCallback, useMemo } from "react";
import { AlertCircle, Upload, Eye, CheckCircle2 } from "lucide-react";
import { useBulkRegistration } from "@/hooks/collegeadmin/student_management/useBulkRegistration";
import { BulkUploadSection } from "@/components/collegeadmin/student_management/BulkUploadSection";
import { BulkResultSection } from "@/components/collegeadmin/student_management/BulkResultSection";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";

const STEPS = [
  { id: 1, label: "Upload CSV", icon: Upload },
  { id: 2, label: "Preview & Confirm", icon: Eye },
  { id: 3, label: "Results", icon: CheckCircle2 },
] as const;

const BulkRegistrationView = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<any[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const { registerDefault, loading, error, result, reset } =
    useBulkRegistration();

  const currentStep = useMemo(() => {
    if (result) return 3;
    if (csvData.length > 0) return 2;
    return 1;
  }, [result, csvData.length]);

  const handleFileChange = useCallback((file: File) => {
    setSelectedFile(file);
    reset();
    setCsvData([]);
    setHeaders([]);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      if (!text) return;
      const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
      if (lines.length === 0) return;

      const parsedHeaders = lines[0].split(",").map((h) => h.trim());
      const parsedData = lines.slice(1).map((line) => {
        const values = line.split(",").map((v) => v.trim());
        const obj: any = {};
        parsedHeaders.forEach((header, i) => { obj[header] = values[i]; });
        return obj;
      });
      setHeaders(parsedHeaders);
      setCsvData(parsedData);
    };
    reader.readAsText(file);
  }, [reset]);

  const handleUpload = useCallback(async () => {
    if (!csvData.length) return;
    await registerDefault(csvData);
  }, [csvData, registerDefault]);

  const handleReset = useCallback(() => {
    setSelectedFile(null);
    setCsvData([]);
    setHeaders([]);
    reset();
  }, [reset]);

  const handleBackToUpload = useCallback(() => {
    setSelectedFile(null);
    setCsvData([]);
    setHeaders([]);
  }, []);

  const handleDownloadSample = useCallback(() => {
    const csvContent = [
      "first_name,middle_name,last_name,student_email,student_password,dept_name,student_passout_year,current_year",
      "Rohan,Suresh,Das,rohan.das@example.com,Password@123,Computer Engineering,2026,3",
      "Sarah,,Jenkins,sarah.j@example.com,SecurePass!456,Mechanical Engineering,2027,2",
      "Amit,Rajesh,Patel,amit.patel@example.com,AmitUser#789,Civil Engineering,2025,4",
      "Emily,,Chen,emily.chen@example.com,MySecretPass2024,Electrical Engineering,2028,1",
      "Michael,James,Brown,michael.b@example.com,TemporaryPass1!,Information Technology,2026,3",
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample_students.csv";
    link.click();
    window.URL.revokeObjectURL(url);
  }, []);

  return (
    <AnimatedPage>
      <div className="font-sans text-slate-800 dark:text-slate-200">
        <PageHeader
          title="Bulk Registration"
          breadcrumbs={[
            { label: "Dashboard", path: "/college/dashboard" },
            { label: "Students", path: "/college/students" },
            { label: "Bulk Registration", active: true },
          ]}
        />

        {/* Stepper */}
        <div className="mt-8 mb-8 max-w-3xl">
          <div className="flex items-center">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;
              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-initial">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`
                        flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300
                        ${isCompleted
                          ? "border-emerald-500 bg-emerald-500 text-white dark:border-emerald-400 dark:bg-emerald-400 dark:text-gray-900"
                          : isActive
                            ? "border-blue-500 bg-blue-500 text-white dark:border-blue-400 dark:bg-blue-400 dark:text-gray-900 ring-4 ring-blue-500/20 dark:ring-blue-400/20"
                            : "border-gray-200 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500"
                        }
                      `}
                    >
                      {isCompleted ? <CheckCircle2 size={18} strokeWidth={2.5} /> : <Icon size={18} />}
                    </div>
                    <span
                      className={`text-xs font-semibold tracking-wide whitespace-nowrap transition-colors duration-300 ${
                        isActive
                          ? "text-blue-600 dark:text-blue-400"
                          : isCompleted
                            ? "text-emerald-600 dark:text-emerald-400"
                            : "text-gray-400 dark:text-gray-500"
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {i < STEPS.length - 1 && (
                    <div className="flex-1 mx-4 mb-6">
                      <div className="h-0.5 rounded-full bg-gray-200 dark:bg-gray-700 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all duration-500 ease-out ${
                            isCompleted ? "w-full bg-emerald-500 dark:bg-emerald-400" : "w-0 bg-blue-500"
                          }`}
                        />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content Card */}
        <div className="bg-white dark:bg-gray-900 rounded-2xl border border-gray-200 dark:border-gray-800 shadow-sm overflow-hidden">
          {/* Result Section */}
          {result ? (
            <div className="p-8">
              <BulkResultSection
                result={result}
                onReset={handleReset}
                originalData={csvData}
                headers={headers}
              />
            </div>
          ) : (
            /* Upload Section */
            <div className="p-8 sm:p-10">
              <BulkUploadSection
                onFileChange={handleFileChange}
                onUpload={handleUpload}
                onDownloadSample={handleDownloadSample}
                onBackToUpload={handleBackToUpload}
                selectedFile={selectedFile}
                csvData={csvData}
                headers={headers}
                loading={loading}
                onClearFile={() => {
                  setSelectedFile(null);
                  setCsvData([]);
                }}
              />
            </div>
          )}

          {/* Error Banner */}
          {error && !result && (
            <div className="mx-8 mb-8 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300 flex items-center gap-3 border border-red-100 dark:border-red-800">
              <AlertCircle size={20} className="shrink-0" />
              <div>
                <p className="font-semibold text-sm">Registration Failed</p>
                <p className="text-sm mt-0.5">{error}</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AnimatedPage>
  );
};

export default BulkRegistrationView;
