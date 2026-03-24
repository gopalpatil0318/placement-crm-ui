import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/queryKeys";
import { ApiError } from "@/lib/api";
import { showToast } from "@/utils/ToastUtils";
import { StudentSkillsService } from "@/services/student/skills.service";
import type { CatalogSkill, StudentSkill, SyncSkillItem } from "@/services/student/skills.service";
import { addSkillSchema, VALID_SKILL_CATEGORIES } from "@/validators/student/skillsSchema";

export interface SelectedSkill {
    skill_id: string;
    skill_name: string;
    skill_category: string;
    proficiency_level: string;
}

export const useSkills = () => {
    const queryClient = useQueryClient();
    const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);

    // Add skill modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newSkillName, setNewSkillName] = useState("");
    const [newSkillCategory, setNewSkillCategory] = useState("");
    const [addErrors, setAddErrors] = useState<Record<string, string>>({});

    // Fetch catalog skills
    const catalogQuery = useQuery({
        queryKey: queryKeys.studentPortal.skillsCatalog(),
        queryFn: async () => {
            const res = await StudentSkillsService.getAllSkills();
            return (res.data || []) as CatalogSkill[];
        },
    });

    // Fetch student's skills
    const mySkillsQuery = useQuery({
        queryKey: queryKeys.studentPortal.mySkills(),
        queryFn: async () => {
            const res = await StudentSkillsService.getMySkills();
            return (res.data || []) as StudentSkill[];
        },
    });

    // Initialize selectedSkills from fetched data
    useEffect(() => {
        if (mySkillsQuery.data) {
            setSelectedSkills(
                mySkillsQuery.data.map((s) => ({
                    skill_id: s.skill_id,
                    skill_name: s.skill_name,
                    skill_category: s.skill_category,
                    proficiency_level: s.proficiency_level || "intermediate",
                }))
            );
        }
    }, [mySkillsQuery.data]);

    const catalogSkills = catalogQuery.data ?? [];
    const loading = catalogQuery.isLoading || mySkillsQuery.isLoading;

    // Toggle a skill on/off
    const toggleSkill = (skill: CatalogSkill) => {
        setSelectedSkills((prev) => {
            const exists = prev.find((s) => s.skill_id === skill.skill_id);
            if (exists) {
                return prev.filter((s) => s.skill_id !== skill.skill_id);
            }
            return [
                ...prev,
                {
                    skill_id: skill.skill_id,
                    skill_name: skill.skill_name,
                    skill_category: skill.skill_category,
                    proficiency_level: "intermediate",
                },
            ];
        });
    };

    // Update proficiency for a selected skill
    const updateProficiency = (skillId: string, level: string) => {
        setSelectedSkills((prev) =>
            prev.map((s) =>
                s.skill_id === skillId ? { ...s, proficiency_level: level } : s
            )
        );
    };

    // Check if a skill is selected
    const isSelected = (skillId: string) =>
        selectedSkills.some((s) => s.skill_id === skillId);

    // Add a new skill to catalog
    const addSkillMutation = useMutation({
        mutationFn: (args: { skill_name: string; skill_category: string }) =>
            StudentSkillsService.addSkill(args),
        onSuccess: (response, { skill_name, skill_category }) => {
            const skillData = response.data || response;
            const newSkill: CatalogSkill = {
                skill_id: skillData.skill_id,
                skill_name: skillData.skill_name || skill_name,
                skill_category: skillData.skill_category || skill_category,
            };

            // Update catalog cache optimistically
            queryClient.setQueryData<CatalogSkill[]>(
                queryKeys.studentPortal.skillsCatalog(),
                (prev) => [...(prev || []), newSkill]
            );

            // Auto-select the new skill
            setSelectedSkills((prev) => [
                ...prev,
                {
                    skill_id: newSkill.skill_id,
                    skill_name: newSkill.skill_name,
                    skill_category: newSkill.skill_category,
                    proficiency_level: "intermediate",
                },
            ]);

            setIsAddModalOpen(false);
            setNewSkillName("");
            setNewSkillCategory("");
            setAddErrors({});

            showToast({
                type: "success",
                title: "Skill Added",
                description: `"${newSkill.skill_name}" added to catalog and selected`,
            });
        },
        onError: (error) => {
            showToast({
                type: "error",
                title: "Error",
                description: error instanceof ApiError ? error.message : "Failed to add skill",
            });
        },
    });

    const handleAddSkill = () => {
        const result = addSkillSchema.safeParse({
            skill_name: newSkillName,
            skill_category: newSkillCategory,
        });

        if (!result.success) {
            const errs: Record<string, string> = {};
            result.error.issues.forEach((issue) => {
                errs[issue.path[0] as string] = issue.message;
            });
            setAddErrors(errs);
            return;
        }

        addSkillMutation.mutate({
            skill_name: newSkillName.trim(),
            skill_category: newSkillCategory,
        });
    };

    // Save — smart sync
    const syncMutation = useMutation({
        mutationFn: (payload: SyncSkillItem[]) =>
            StudentSkillsService.syncMySkills(payload),
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.mySkills() });
            queryClient.invalidateQueries({ queryKey: queryKeys.studentPortal.fullProfile() });
            showToast({
                type: "success",
                title: "Skills Saved",
                description: "Your skills have been synced successfully",
            });
        },
        onError: (error) => {
            showToast({
                type: "error",
                title: "Error Saving Skills",
                description: error instanceof ApiError ? error.message : "Something went wrong",
            });
        },
    });

    const handleSave = () => {
        const payload: SyncSkillItem[] = selectedSkills.map((s) => ({
            skill_id: s.skill_id,
            proficiency_level: s.proficiency_level,
        }));
        syncMutation.mutate(payload);
    };

    return {
        catalogSkills,
        selectedSkills,
        loading,
        saving: syncMutation.isPending,
        addingSkill: addSkillMutation.isPending,
        isAddModalOpen,
        setIsAddModalOpen,
        newSkillName,
        setNewSkillName,
        newSkillCategory,
        setNewSkillCategory,
        addErrors,
        toggleSkill,
        updateProficiency,
        isSelected,
        handleAddSkill,
        handleSave,
        VALID_SKILL_CATEGORIES,
    };
};
