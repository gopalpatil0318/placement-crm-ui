import { useState, useCallback, useMemo } from "react";
import { AlertCircle, Upload, Eye, CheckCircle2, AlertTriangle, ShieldX } from "lucide-react";
import { useBulkRegistration } from "@/hooks/collegeadmin/student_management/useBulkRegistration";
import { useSubscriptionInfo } from "@/hooks/collegeadmin/useSubscriptionInfo";
import { BulkUploadSection } from "@/components/collegeadmin/student_management/BulkUploadSection";
import { BulkResultSection } from "@/components/collegeadmin/student_management/BulkResultSection";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";
import QuotaBar from "@/components/collegeadmin/QuotaBar";

// ========================
// CSV Parsing Helper
// ========================

/**
 * Parse a single CSV line respecting quoted fields.
 * Handles commas inside double-quoted values and escaped quotes ("").
 */
function handleQuotedChar(char: string, nextChar: string | undefined, state: { current: string; inQuotes: boolean; skip: boolean }) {
  if (char === '"' && nextChar === '"') {
    state.current += '"';
    state.skip = true;
  } else if (char === '"') {
    state.inQuotes = false;
  } else {
    state.current += char;
  }
}

function handleUnquotedChar(char: string, fields: string[], state: { current: string; inQuotes: boolean }) {
  if (char === '"') {
    state.inQuotes = true;
  } else if (char === ",") {
    fields.push(state.current.trim());
    state.current = "";
  } else {
    state.current += char;
  }
}

function parseCSVLine(line: string): string[] {
  const fields: string[] = [];
  const state = { current: "", inQuotes: false, skip: false };

  for (let i = 0; i < line.length; i++) {
    if (state.skip) { state.skip = false; i++; continue; }
    const char = line[i];
    if (state.inQuotes) {
      handleQuotedChar(char, line[i + 1], state);
    } else {
      handleUnquotedChar(char, fields, state);
    }
  }
  fields.push(state.current.trim());
  return fields;
}

const STEPS = [
  { id: 1, label: "Upload CSV", icon: Upload },
  { id: 2, label: "Preview & Confirm", icon: Eye },
  { id: 3, label: "Results", icon: CheckCircle2 },
] as const;

const BulkRegistrationView = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [csvData, setCsvData] = useState<Record<string, string>[]>([]);
  const [headers, setHeaders] = useState<string[]>([]);
  const { registerDefault, loading, error, result, reset } =
    useBulkRegistration();
  const { data: subInfo } = useSubscriptionInfo();

  const isBlocked = subInfo?.subscription_status === "expired" || subInfo?.subscription_status === "suspended";
  const isQuotaFull = subInfo?.subscription !== null && subInfo?.students_remaining === 0;

  const currentStep = useMemo(() => {
    if (result) return 3;
    if (csvData.length > 0) return 2;
    return 1;
  }, [result, csvData.length]);

  const handleFileChange = useCallback(async (file: File) => {
    setSelectedFile(file);
    reset();
    setCsvData([]);
    setHeaders([]);

    const text = await file.text();
    if (!text) return;
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    if (lines.length === 0) return;

    const parsedHeaders = parseCSVLine(lines[0]);
    const parsedData = lines.slice(1).map((line) => {
      const values = parseCSVLine(line);
      return Object.fromEntries(parsedHeaders.map((h, i) => [h, values[i] || ""]));
    });
    setHeaders(parsedHeaders);
    setCsvData(parsedData);
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
      "first_name,middle_name,last_name,student_email,dept_name,student_passout_year",
      "Rohan,Suresh,Das,rohan.das@example.com,Computer Engineering,2026",
      "Sarah,,Jenkins,sarah.j@example.com,Mechanical Engineering,2027",
      "Amit,Rajesh,Patel,amit.patel@example.com,Civil Engineering,2025",
      "Emily,,Chen,emily.chen@example.com,Electrical Engineering,2028",
      "Michael,James,Brown,michael.b@example.com,Information Technology,2026",
      "",
      "# Passwords are auto-generated as firstname@passoutyear (e.g. rohan@2026)",
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = globalThis.URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "sample_students.csv";
    link.click();
    globalThis.URL.revokeObjectURL(url);
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

        {/* Subscription blocked banner */}
        {isBlocked && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3.5 dark:border-red-800/50 dark:bg-red-950/40" role="alert">
            <ShieldX className="h-5 w-5 flex-shrink-0 mt-0.5 text-red-600 dark:text-red-400" />
            <div>
              <p className="text-sm font-semibold text-red-800 dark:text-red-200">Registration blocked</p>
              <p className="mt-0.5 text-sm text-red-700 dark:text-red-300">
                {subInfo?.subscription_status === "suspended"
                  ? "Your college account is suspended. Contact the Placenex team."
                  : "Your subscription has expired. Contact the Placenex team to renew."}
              </p>
            </div>
          </div>
        )}

        {/* Quota full banner */}
        {!isBlocked && isQuotaFull && (
          <div className="mt-6 flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5 dark:border-amber-800/50 dark:bg-amber-950/40" role="alert">
            <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5 text-amber-600 dark:text-amber-400" />
            <div>
              <p className="text-sm font-semibold text-amber-800 dark:text-amber-200">Student quota reached</p>
              <p className="mt-0.5 text-sm text-amber-700 dark:text-amber-300">
                All {subInfo?.subscription?.student_quota?.toLocaleString()} slots are used. Contact the Placenex team to increase your quota.
              </p>
            </div>
          </div>
        )}

        {/* Quota progress bar */}
        {!isBlocked && subInfo?.subscription && (
          <div className="mt-6 rounded-xl border border-gray-200 bg-white p-4 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <QuotaBar
              used={subInfo.students_used}
              quota={subInfo.subscription.student_quota}
            />
            {subInfo.students_remaining !== undefined && subInfo.students_remaining > 0 && csvData.length > 0 && (
              <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                You are about to register <span className="font-semibold text-gray-700 dark:text-gray-300">{csvData.length}</span> students.{" "}
                {csvData.length > subInfo.students_remaining
                  ? <span className="text-amber-600 dark:text-amber-400 font-medium">Only {subInfo.students_remaining} slots remaining — excess rows will fail.</span>
                  : <span>{subInfo.students_remaining - csvData.length} slots will remain after upload.</span>
                }
              </p>
            )}
          </div>
        )}

        {/* Stepper */}
        <div className="mt-8 mb-8 max-w-3xl">
          <div className="flex items-center">
            {STEPS.map((step, i) => {
              const Icon = step.icon;
              const isActive = currentStep === step.id;
              const isCompleted = currentStep > step.id;

              let circleClass = "border-gray-200 bg-white text-gray-400 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-500";
              if (isCompleted) circleClass = "border-emerald-500 bg-emerald-500 text-white dark:border-emerald-400 dark:bg-emerald-400 dark:text-gray-900";
              else if (isActive) circleClass = "border-blue-500 bg-blue-500 text-white dark:border-blue-400 dark:bg-blue-400 dark:text-gray-900 ring-4 ring-blue-500/20 dark:ring-blue-400/20";

              let labelClass = "text-gray-400 dark:text-gray-500";
              if (isActive) labelClass = "text-blue-600 dark:text-blue-400";
              else if (isCompleted) labelClass = "text-emerald-600 dark:text-emerald-400";

              return (
                <div key={step.id} className="flex items-center flex-1 last:flex-initial">
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full border-2 transition-all duration-300 ${circleClass}`}
                    >
                      {isCompleted ? <CheckCircle2 size={18} strokeWidth={2.5} /> : <Icon size={18} />}
                    </div>
                    <span
                      className={`text-xs font-semibold tracking-wide whitespace-nowrap transition-colors duration-300 ${labelClass}`}
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
                loading={loading || isBlocked || isQuotaFull}
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
