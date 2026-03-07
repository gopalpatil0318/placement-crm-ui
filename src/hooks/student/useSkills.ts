import { useState, useEffect, useCallback } from "react";
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
    const [catalogSkills, setCatalogSkills] = useState<CatalogSkill[]>([]);
    const [selectedSkills, setSelectedSkills] = useState<SelectedSkill[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [addingSkill, setAddingSkill] = useState(false);

    // Add skill modal state
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [newSkillName, setNewSkillName] = useState("");
    const [newSkillCategory, setNewSkillCategory] = useState("");
    const [addErrors, setAddErrors] = useState<Record<string, string>>({});

    // Fetch catalog + student's skills
    const fetchData = useCallback(async () => {
        try {
            const [catalogRes, myRes] = await Promise.all([
                StudentSkillsService.getAllSkills(),
                StudentSkillsService.getMySkills(),
            ]);

            setCatalogSkills(catalogRes.data || []);

            // Map student's skills to SelectedSkill format
            const mySkills: StudentSkill[] = myRes.data || [];
            setSelectedSkills(
                mySkills.map((s) => ({
                    skill_id: s.skill_id,
                    skill_name: s.skill_name,
                    skill_category: s.skill_category,
                    proficiency_level: s.proficiency_level || "intermediate",
                }))
            );
        } catch {
            console.log("Error loading skills");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

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
    const handleAddSkill = async () => {
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

        setAddingSkill(true);
        try {
            const response = await StudentSkillsService.addSkill({
                skill_name: newSkillName.trim(),
                skill_category: newSkillCategory,
            });

            // API returns { skill_id, skill_name } — may not include skill_category
            const skillData = response.data || response;
            const newSkill: CatalogSkill = {
                skill_id: skillData.skill_id,
                skill_name: skillData.skill_name || newSkillName.trim(),
                skill_category: skillData.skill_category || newSkillCategory,
            };

            // Add to catalog
            setCatalogSkills((prev) => [...prev, newSkill]);

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

            // Close modal
            setIsAddModalOpen(false);
            setNewSkillName("");
            setNewSkillCategory("");
            setAddErrors({});

            showToast({
                type: "success",
                title: "Skill Added",
                description: `"${newSkill.skill_name}" added to catalog and selected`,
            });
        } catch (error: any) {
            showToast({
                type: "error",
                title: "Error",
                description: error.message || "Failed to add skill",
            });
        } finally {
            setAddingSkill(false);
        }
    };

    // Save — smart sync
    const handleSave = async () => {
        setSaving(true);
        try {
            const payload: SyncSkillItem[] = selectedSkills.map((s) => ({
                skill_id: s.skill_id,
                proficiency_level: s.proficiency_level,
            }));

            const response = await StudentSkillsService.syncMySkills(payload);
            showToast({
                type: "success",
                title: "Skills Saved",
                description: response?.message || "Your skills have been synced successfully",
            });
        } catch (error: any) {
            showToast({
                type: "error",
                title: "Error Saving Skills",
                description: error.message || "Something went wrong",
            });
        } finally {
            setSaving(false);
        }
    };

    return {
        catalogSkills,
        selectedSkills,
        loading,
        saving,
        addingSkill,
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
