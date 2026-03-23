import { useState, useCallback, useMemo } from "react";
import { useParams } from "react-router-dom";
import EnrollmentTable from "@/components/collegeadmin/training_programs/EnrollmentTable";
import UpdateEnrollmentModal from "@/components/collegeadmin/training_programs/UpdateEnrollmentModal";
import { useUpdateEnrollment } from "@/hooks/collegeadmin/training_programs/useUpdateEnrollment";
import { type Enrollment } from "@/hooks/collegeadmin/training_programs/useViewEnrollments";
import PageHeader from "@/components/collegeadmin/PageHeader";
import AnimatedPage from "@/components/ui/AnimatedPage";

const TrainingEnrollments = () => {
    const { programId } = useParams<{ programId: string }>();
    const [programName, setProgramName] = useState("");
    const [editingStudent, setEditingStudent] = useState<{ name: string; email: string; totalSessions?: number } | null>(null);

    const handleProgramLoaded = useCallback((name: string, totalSessions?: number) => {
        setProgramName(name);
        // totalSessions stored via editingStudent when editing
        void totalSessions;
    }, []);

    const enrollment = useUpdateEnrollment(programId!, () => {
        setEditingStudent(null);
    });

    const handleEditEnrollment = useCallback((e: Enrollment, totalSessions?: number) => {
        setEditingStudent({
            name: e.student_name,
            email: e.student_email,
            totalSessions,
        });
        enrollment.handleOpen(e);
    }, [enrollment]);

    const breadcrumbs = useMemo(() => [
        { label: "Dashboard", path: "/college/dashboard" },
        { label: "Training Programs", path: "/college/training-programs" },
        { label: programName || "Program", path: `/college/training-program/${programId}` },
        { label: "Enrollments", active: true },
    ], [programName, programId]);

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <PageHeader title={programName ? `${programName} — Enrollments` : "Enrollments"} breadcrumbs={breadcrumbs} />

                <EnrollmentTable
                    programId={programId!}
                    onEditEnrollment={handleEditEnrollment}
                    onProgramLoaded={handleProgramLoaded}
                />

                <UpdateEnrollmentModal
                    isOpen={enrollment.isOpen}
                    formData={enrollment.formData}
                    errors={enrollment.errors}
                    loading={enrollment.loading}
                    studentName={editingStudent?.name}
                    studentEmail={editingStudent?.email}
                    totalSessions={editingStudent?.totalSessions}
                    handleChange={enrollment.handleChange}
                    handleSubmit={enrollment.handleSubmit}
                    handleClose={enrollment.handleClose}
                />
            </div>
        </AnimatedPage>
    );
};

export default TrainingEnrollments;
