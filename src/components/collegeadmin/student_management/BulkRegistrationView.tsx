import { useState } from "react";
import { AlertCircle } from "lucide-react";
import { useBulkRegistration } from "@/hooks/collegeadmin/student_management/useBulkRegistration";
import { BulkUploadSection } from "@/components/collegeadmin/student_management/BulkUploadSection";
import { BulkResultSection } from "@/components/collegeadmin/student_management/BulkResultSection";
import PageHeader from "@/components/collegeadmin/PageHeader";

const BulkRegistrationView = () => {
    const [selectedFile, setSelectedFile] = useState<File | null>(null);
    const [csvData, setCsvData] = useState<any[]>([]);
    const [headers, setHeaders] = useState<string[]>([]);
    const { registerDefault, loading, error, result, reset } = useBulkRegistration();

    const handleFileChange = (file: File) => {
        setSelectedFile(file);
        reset();

        setCsvData([]);
        setHeaders([]);

        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            if (text) {
                const lines = text.split('\n').map(line => line.trim()).filter(line => line);
                if (lines.length > 0) {
                    const parsedHeaders = lines[0].split(',').map(h => h.trim());
                    const parsedData = lines.slice(1).map(line => {
                        const values = line.split(',').map(item => item.trim());
                        const obj: any = {};
                        parsedHeaders.forEach((header, index) => {
                            obj[header] = values[index];
                        });
                        return obj;
                    });
                    setHeaders(parsedHeaders);
                    setCsvData(parsedData);
                }
            }
        };
        reader.readAsText(file);
    };

    const handleUpload = async () => {
        if (!csvData.length) return;
        await registerDefault(csvData);
        if (!error) {
            setSelectedFile(null);
        }
    };

    const handleReset = () => {
        setSelectedFile(null);
        setCsvData([]);
        setHeaders([]);
        reset();
    };

    const handleDownloadSample = () => {
        const sampleStudents = [
            { name: "Rohan Das", email: "rohan.das@example.com", pass: "Password@123", dept: "Computer Science", year: 3 },
            { name: "Sarah Jenkins", email: "sarah.j@example.com", pass: "SecurePass!456", dept: "Mechanical Engineering", year: 2 },
            { name: "Amit Patel", email: "amit.patel@example.com", pass: "AmitUser#789", dept: "Civil Engineering", year: 4 },
            { name: "Emily Chen", email: "emily.chen@example.com", pass: "MySecretPassword2024", dept: "Electrical", year: 1 },
            { name: "Michael Brown", email: "michael.b@example.com", pass: "TemporaryPass1!", dept: "Information Technology", year: 3 }
        ];

        const headers = "student_name,student_email,student_password,student_department,student_year\n";

        const rows = sampleStudents.map(s =>
            `${s.name},${s.email},${s.pass},${s.dept},${s.year}`
        ).join("\n");

        const csvContent = headers + rows;

        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.href = url;
        link.download = "sample_students.csv";
        link.click();
        window.URL.revokeObjectURL(url);
    };

    return (
        <div className="font-sans text-slate-800">
            <PageHeader
                title="Bulk Registration"
                breadcrumbs={[
                    { label: "College Admin" },
                    { label: "Students" },
                    { label: "Bulk Registration", active: true }
                ]}
            />

            <div className="p-16 bg-white rounded-xl border border-gray-200 shadow-none max-w-5xl">

                {/* Result Section */}
                {result ? (
                    <BulkResultSection
                        result={result}
                        onReset={handleReset}
                        originalData={csvData}
                        headers={headers}
                    />
                ) : (
                    /* Upload Section */
                    <BulkUploadSection
                        onFileChange={handleFileChange}
                        onUpload={handleUpload}
                        onDownloadSample={handleDownloadSample}
                        selectedFile={selectedFile}
                        csvData={csvData}
                        headers={headers}
                        loading={loading}
                        onClearFile={() => {
                            setSelectedFile(null);
                            setCsvData([]);
                        }}
                    />
                )}

                {/* Global Error Banner (if not showing result, or if error persists) */}
                {error && !result && (
                    <div className="mt-6 p-4 rounded-xl bg-red-50 text-red-700 flex items-center gap-3 border border-red-100 animate-in fade-in slide-in-from-bottom-2">
                        <AlertCircle size={20} className="shrink-0" />
                        <div>
                            <h4 className="font-bold">Error</h4>
                            <p className="text-sm">{error}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BulkRegistrationView;
