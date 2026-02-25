import { CheckCircle, AlertCircle, CloudUpload } from "lucide-react";

interface BulkResultSectionProps {
    result: {
        success: boolean;
        message: string;
        data: {
            success: any[];
            failed: { student_email: string; error: string }[];
        };
    };
    onReset: () => void;
}

export const BulkResultSection = ({ result, onReset }: BulkResultSectionProps) => {
    return (
        <div className="mt-8 animate-in fade-in slide-in-from-bottom-4">
            <div className={`p-6 rounded-xl border ${result.data?.failed?.length === 0 ? 'bg-green-50 border-green-100' : 'bg-orange-50 border-orange-100'}`}>
                <div className="flex items-start gap-4 mb-6">
                    <div className={`p-2 rounded-full ${result.data?.failed?.length === 0 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-600'}`}>
                        {result.data?.failed?.length === 0 ? <CheckCircle size={32} /> : <AlertCircle size={32} />}
                    </div>
                    <div>
                        <h3 className={`text-xl font-bold ${result.data?.failed?.length === 0 ? 'text-green-800' : 'text-orange-800'}`}>
                            {result.message}
                        </h3>
                        <p className="text-slate-600 mt-1">
                            Processed {result.data?.success?.length || 0} successes and {result.data?.failed?.length || 0} failures.
                        </p>
                    </div>
                </div>

                {/* Failed Items List */}
                {result.data?.failed?.length > 0 && (
                    <div className="mb-6 bg-white rounded-xl border border-orange-100 overflow-hidden shadow-sm">
                        <div className="bg-orange-50 px-5 py-3 border-b border-orange-100 flex items-center gap-2">
                            <AlertCircle size={16} className="text-orange-600" />
                            <h4 className="font-bold text-orange-800 text-sm uppercase tracking-wider">Failed Registrations</h4>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold">Email</th>
                                        <th className="px-5 py-3 font-semibold">Error Reason</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.data.failed.map((fail, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3 font-medium text-gray-700">{fail.student_email}</td>
                                            <td className="px-5 py-3 text-red-600 font-medium">{fail.error}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Success Items List */}
                {result.data?.success?.length > 0 && (
                    <div className="mb-6 bg-white rounded-xl border border-green-100 overflow-hidden shadow-sm">
                        <div className="bg-green-50 px-5 py-3 border-b border-green-100 flex items-center gap-2">
                            <CheckCircle size={16} className="text-green-600" />
                            <h4 className="font-bold text-green-800 text-sm uppercase tracking-wider">Successful Registrations</h4>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto">
                            <table className="w-full text-sm text-left">
                                <thead className="text-xs text-gray-500 uppercase bg-gray-50 sticky top-0">
                                    <tr>
                                        <th className="px-5 py-3 font-semibold">Email</th>
                                        <th className="px-5 py-3 font-semibold">ID</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {result.data.success.map((student: any, idx) => (
                                        <tr key={idx} className="border-b border-gray-50 hover:bg-gray-50 transition-colors">
                                            <td className="px-5 py-3 font-medium text-gray-700">{student.student_email || "-"}</td>
                                            <td className="px-5 py-3 text-gray-500 font-mono text-xs">{student.student_id || "-"}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                )}

                {/* Button to reset and upload more */}
                <div className="flex justify-end pt-4 border-t border-gray-200/50">
                    <button
                        onClick={onReset}
                        className="bg-white border border-gray-200 hover:bg-gray-50 text-slate-700 font-bold py-2.5 px-6 rounded-xl shadow-sm hover:shadow-md transition-all active:scale-95 flex items-center gap-2"
                    >
                        <CloudUpload size={18} />
                        Upload New File
                    </button>
                </div>
            </div>
        </div>
    );
};
