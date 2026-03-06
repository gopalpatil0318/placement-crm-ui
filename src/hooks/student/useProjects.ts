import { useState, useEffect, useCallback } from "react";
import { showToast } from "@/utils/ToastUtils";
import { StudentProjectsService } from "@/services/student/projects.service";
import type { ProjectData } from "@/services/student/projects.service";
import { projectSchema } from "@/validators/student/projectSchema";

const emptyForm = {
    project_title: "",
    project_description: "",
    project_type: "",
    project_url: "",
    github_link: "",
    demo_link: "",
    technologies_used: [] as string[],
    start_date: "",
    end_date: "",
    is_ongoing: false,
    team_size: "1",
    role_in_project: "",
    display_order: "1",
    is_featured: false,
};

type FormErrors = Partial<Record<string, string>>;

export const useProjects = () => {
    const [projects, setProjects] = useState<ProjectData[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState<string | null>(null);

    // Modal state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(emptyForm);
    const [errors, setErrors] = useState<FormErrors>({});

    // Tech tag input
    const [techInput, setTechInput] = useState("");

    const maxProjects = 10;

    const fetchProjects = useCallback(async () => {
        try {
            const response = await StudentProjectsService.getAllProjects();
            setProjects(response.data?.projects || response.projects || []);
        } catch {
            console.log("Error loading projects");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchProjects();
    }, [fetchProjects]);

    // Open add form
    const openAddForm = () => {
        setEditingId(null);
        setFormData({ ...emptyForm, display_order: String(projects.length + 1) });
        setErrors({});
        setTechInput("");
        setIsFormOpen(true);
    };

    // Open edit form
    const openEditForm = (project: ProjectData) => {
        setEditingId(project.project_id || null);
        setFormData({
            project_title: project.project_title || "",
            project_description: project.project_description || "",
            project_type: project.project_type || "",
            project_url: project.project_url || "",
            github_link: project.github_link || "",
            demo_link: project.demo_link || "",
            technologies_used: project.technologies_used || [],
            start_date: project.start_date ? project.start_date.substring(0, 10) : "",
            end_date: project.end_date ? project.end_date.substring(0, 10) : "",
            is_ongoing: project.is_ongoing || false,
            team_size: String(project.team_size || 1),
            role_in_project: project.role_in_project || "",
            display_order: String(project.display_order || 1),
            is_featured: project.is_featured || false,
        });
        setErrors({});
        setTechInput("");
        setIsFormOpen(true);
    };

    const closeForm = () => {
        setIsFormOpen(false);
        setEditingId(null);
    };

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev) => ({ ...prev, [name]: newValue }));
        if (errors[name]) setErrors((prev) => ({ ...prev, [name]: undefined }));
    };

    const addTech = () => {
        const tech = techInput.trim();
        if (tech && !formData.technologies_used.includes(tech)) {
            setFormData((prev) => ({
                ...prev,
                technologies_used: [...prev.technologies_used, tech],
            }));
            setTechInput("");
        }
    };

    const removeTech = (tech: string) => {
        setFormData((prev) => ({
            ...prev,
            technologies_used: prev.technologies_used.filter((t) => t !== tech),
        }));
    };

    const handleSubmit = async () => {
        const result = projectSchema.safeParse(formData);

        if (!result.success) {
            const fieldErrors: FormErrors = {};
            result.error.issues.forEach((issue) => {
                const field = issue.path[0] as string;
                if (!fieldErrors[field]) fieldErrors[field] = issue.message;
            });
            setErrors(fieldErrors);
            showToast({ type: "warning", title: "Validation Failed", description: result.error.issues[0].message });
            return;
        }

        setSaving(true);
        try {
            const payload = {
                project_title: formData.project_title,
                project_description: formData.project_description,
                project_type: formData.project_type,
                project_url: formData.project_url || null,
                github_link: formData.github_link || null,
                demo_link: formData.demo_link || null,
                technologies_used: formData.technologies_used,
                start_date: formData.start_date,
                end_date: formData.is_ongoing ? null : formData.end_date || null,
                is_ongoing: formData.is_ongoing,
                team_size: Number(formData.team_size),
                role_in_project: formData.role_in_project,
                display_order: Number(formData.display_order) || projects.length + 1,
                is_featured: formData.is_featured,
            };

            if (editingId) {
                await StudentProjectsService.updateProject(editingId, payload);
                showToast({ type: "success", title: "Updated", description: "Project updated successfully" });
            } else {
                await StudentProjectsService.addProject(payload);
                showToast({ type: "success", title: "Added", description: "Project added successfully" });
            }

            closeForm();
            fetchProjects();
        } catch (error: any) {
            showToast({ type: "error", title: "Error", description: error.message || "Something went wrong" });
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async (projectId: string) => {
        setDeleting(projectId);
        try {
            await StudentProjectsService.deleteProject(projectId);
            setProjects((prev) => prev.filter((p) => p.project_id !== projectId));
            showToast({ type: "success", title: "Deleted", description: "Project removed successfully" });
        } catch (error: any) {
            showToast({ type: "error", title: "Error", description: error.message || "Failed to delete" });
        } finally {
            setDeleting(null);
        }
    };

    return {
        projects,
        loading,
        saving,
        deleting,
        isFormOpen,
        editingId,
        formData,
        errors,
        techInput,
        setTechInput,
        maxProjects,
        openAddForm,
        openEditForm,
        closeForm,
        handleChange,
        addTech,
        removeTech,
        handleSubmit,
        handleDelete,
    };
};
