import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ApiError } from "@/lib/api";
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
    const queryClient = useQueryClient();

    const { data: projects = [], isLoading: loading } = useQuery({
        queryKey: queryKeys.studentPortal.projects(),
        queryFn: async () => {
            const response = await StudentProjectsService.getAllProjects();
            return (response.data?.projects || response.projects || []) as ProjectData[];
        },
        staleTime: 2 * 60 * 1000,
    });

    // Modal state
    const [isFormOpen, setIsFormOpen] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [formData, setFormData] = useState(emptyForm);
    const [errors, setErrors] = useState<FormErrors>({});

    // Tech tag input
    const [techInput, setTechInput] = useState("");

    const maxProjects = 10;

    const openAddForm = () => {
        setEditingId(null);
        setFormData({ ...emptyForm, display_order: String(projects.length + 1) });
        setErrors({});
        setTechInput("");
        setIsFormOpen(true);
    };

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

    const handleChange = useCallback((
        e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
        const { name, value, type } = e.target;
        const newValue = type === "checkbox" ? (e.target as HTMLInputElement).checked : value;
        setFormData((prev) => ({ ...prev, [name]: newValue }));
        setErrors((prev) => {
            if (!prev[name]) return prev;
            return { ...prev, [name]: undefined };
        });
    }, []);

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

    const saveMutation = useMutation({
        mutationFn: (payload: Omit<ProjectData, "project_id">) => {
            if (editingId) return StudentProjectsService.updateProject(editingId, payload);
            return StudentProjectsService.addProject(payload);
        },
        onError: (error) => {
            showToast({
                type: "error",
                title: "Error",
                description: error instanceof ApiError ? error.message : "Something went wrong",
            });
        },
    });

    const handleSubmit = () => {
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

        const isEditing = !!editingId;
        saveMutation.mutate(payload as Omit<ProjectData, "project_id">, {
            onSuccess: (response) => {
                queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.projects() });
                queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.fullProfile() });
                closeForm();
                showToast({
                    type: "success",
                    title: isEditing ? "Updated" : "Added",
                    description: response.message || (isEditing ? "Project updated successfully" : "Project added successfully"),
                });
            },
        });
    };

    const deleteMutation = useMutation({
        mutationFn: (projectId: string) => StudentProjectsService.deleteProject(projectId),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.projects() });
            queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.fullProfile() });
            showToast({ type: "success", title: "Deleted", description: data.message || "Project removed successfully" });
        },
        onError: (error) => {
            showToast({
                type: "error",
                title: "Error",
                description: error instanceof ApiError ? error.message : "Failed to delete",
            });
        },
    });

    const handleDelete = (projectId: string) => {
        deleteMutation.mutate(projectId);
    };

    return {
        projects,
        loading,
        saving: saveMutation.isPending,
        deleting: deleteMutation.isPending ? (deleteMutation.variables ?? null) : null,
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
