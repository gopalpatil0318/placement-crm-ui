import { useSkills } from "@/hooks/student/useSkills";
import { PROFICIENCY_LABELS, VALID_PROFICIENCY_LEVELS } from "@/validators/student/skillsSchema";
import { SKILL_CATEGORY_LABELS, SKILL_CATEGORY_GROUPED_OPTIONS } from "@/constants/skillCategories";
import { Plus, X, Search, Check } from "lucide-react";
import { useState } from "react";
import ModalWrapper from "@/components/ui/ModalWrapper";
import FloatingInput from "@/components/ui/FloatingInput";

const SkillsForm = () => {
    const {
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
    } = useSkills();

    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [displayLimit, setDisplayLimit] = useState(20);

    // Filter catalog skills by search + category, excluding already-selected skills
    const filteredSkills = catalogSkills.filter((skill) => {
        const matchesSearch = skill.skill_name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = filterCategory === "all" || skill.skill_category === filterCategory;
        return matchesSearch && matchesCategory && !isSelected(skill.skill_id);
    });

    const visibleSkills = filteredSkills.slice(0, displayLimit);
    const hasMore = filteredSkills.length > displayLimit;

    // Reset limit when filter/search changes
    const handleSearchChange = (value: string) => {
        setSearch(value);
        setDisplayLimit(20);
    };
    const handleCategoryChange = (value: string) => {
        setFilterCategory(value);
        setDisplayLimit(20);
    };

    // Group catalog by category for display
    const categories = [...new Set(catalogSkills.map((s) => s.skill_category))];

    if (loading) {
        return (
            <div className="p-8 bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800">
                <div className="flex items-center justify-between mb-6">
                    <div>
                        <div className="h-5 w-20 rounded bg-gray-200 dark:bg-gray-700/60 animate-pulse" />
                        <div className="h-3.5 w-28 rounded bg-gray-200 dark:bg-gray-700/60 animate-pulse mt-2" />
                    </div>
                    <div className="h-9 w-24 rounded-full bg-gray-200 dark:bg-gray-700/60 animate-pulse" />
                </div>
                <div className="space-y-5">
                    {[3, 4, 5].map((count, i) => (
                        <div key={`skeleton-group-${String(count)}`}>
                            <div className="h-4 w-28 rounded bg-gray-200 dark:bg-gray-700/60 animate-pulse mb-3" />
                            <div className="flex flex-wrap gap-2">
                                {Array.from({ length: count }).map((_, j) => (
                                    <div key={`skeleton-chip-${String(i)}-${String(j)}`} className="h-8 rounded-lg bg-gray-200 dark:bg-gray-700/60 animate-pulse" style={{ width: `${60 + (j % 3) * 20}px` }} />
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex justify-end pt-4 mt-6 border-t dark:border-gray-700">
                    <div className="h-10 w-28 rounded-xl bg-gray-200 dark:bg-gray-700/60 animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-white dark:bg-gray-900 rounded-xl border dark:border-gray-800">
            {/* ================= Header ================= */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-100">Skills</h2>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {selectedSkills.length} skill{selectedSkills.length === 1 ? "" : "s"} selected
                    </p>
                </div>
                <button
                    type="button"
                    onClick={() => setIsAddModalOpen(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm rounded-full font-medium transition cursor-pointer"
                >
                    <Plus className="h-4 w-4" />
                    Add New Skill
                </button>
            </div>

            {/* ================= Selected Skills (with proficiency) ================= */}
            {selectedSkills.length > 0 && (
                <div className="mb-6">
                    <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">Your Skills</h3>
                    <div className="flex flex-wrap gap-3">
                        {selectedSkills.map((skill) => (
                            <div
                                key={skill.skill_id}
                                className="flex items-center gap-2 p-2 border border-blue-100 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/20 rounded-lg"
                            >
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-medium text-gray-800 dark:text-gray-100 whitespace-nowrap">{skill.skill_name}</span>
                                    <span className="text-[10px] text-gray-500 dark:text-gray-400 uppercase tracking-wider whitespace-nowrap">
                                        {SKILL_CATEGORY_LABELS[skill.skill_category] || skill.skill_category}
                                    </span>
                                </div>
                                <select
                                    value={skill.proficiency_level}
                                    onChange={(e) => updateProficiency(skill.skill_id, e.target.value)}
                                    className="text-sm border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 mx-1"
                                >
                                    {VALID_PROFICIENCY_LEVELS.map((level) => (
                                        <option key={level} value={level}>
                                            {PROFICIENCY_LABELS[level]}
                                        </option>
                                    ))}
                                </select>
                                <button
                                    type="button"
                                    onClick={() => toggleSkill(skill)}
                                    aria-label={`Remove ${skill.skill_name}`}
                                    className="p-2 hover:bg-red-50 dark:hover:bg-red-900/30 rounded-full text-red-400 hover:text-red-600 transition cursor-pointer"
                                    title="Remove"
                                >
                                    <X className="h-4 w-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* ================= Search + Filter ================= */}
            <div className="flex items-center gap-4 mb-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search skills..."
                        value={search}
                        onChange={(e) => handleSearchChange(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 text-sm"
                    />
                </div>
                <select
                    value={filterCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 rounded-xl px-4 py-2.5 outline-none focus:border-blue-500 dark:focus:border-blue-400 focus:ring-2 focus:ring-blue-500/20 text-sm"
                >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>{SKILL_CATEGORY_LABELS[cat] || cat}</option>
                    ))}
                </select>
            </div>

            {/* ================= Catalog Grid ================= */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider mb-3">
                    Available Skills
                    {" "}
                    <span className="text-gray-400 dark:text-gray-500 font-normal ml-2">({filteredSkills.length})</span>
                </h3>
                <div className="flex flex-wrap gap-2">
                    {visibleSkills.map((skill) => {
                        const selected = isSelected(skill.skill_id);
                        return (
                            <button
                                key={skill.skill_id}
                                type="button"
                                onClick={() => toggleSkill(skill)}
                                className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full text-sm font-medium transition cursor-pointer border ${selected
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 border-gray-300 dark:border-gray-600 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"
                                    }`}
                            >
                                {selected && <Check className="h-3.5 w-3.5" />}
                                {skill.skill_name}
                            </button>
                        );
                    })}
                    {filteredSkills.length === 0 && (
                        <p className="text-sm text-gray-400 italic">No skills found. Try a different search or add a new skill.</p>
                    )}
                </div>
                {hasMore && (
                    <button
                        type="button"
                        onClick={() => setDisplayLimit((prev) => prev + 20)}
                        className="mt-3 text-sm text-blue-600 hover:text-blue-700 font-medium cursor-pointer"
                    >
                        Show More ({filteredSkills.length - displayLimit} remaining)
                    </button>
                )}
                {!hasMore && displayLimit > 20 && filteredSkills.length > 20 && (
                    <button
                        type="button"
                        onClick={() => setDisplayLimit(20)}
                        className="mt-3 text-sm text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 font-medium cursor-pointer"
                    >
                        Show Less
                    </button>
                )}
            </div>

            {/* ================= Save Button ================= */}
            <div className="sticky bottom-0 bg-white dark:bg-gray-900 py-3 border-t border-gray-200 dark:border-gray-700 -mx-8 px-8 md:static md:border-0 md:mx-0 md:px-0 md:bg-transparent md:dark:bg-transparent flex justify-end pt-4">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition cursor-pointer disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save Skills"}
                </button>
            </div>

            {/* ================= Add Skill Modal ================= */}
            <ModalWrapper isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Skill" disabled={addingSkill} size="md" footer={
                <div className="flex justify-end gap-3 p-6 border-t dark:border-gray-700">
                    <button
                        type="button"
                        onClick={() => setIsAddModalOpen(false)}
                        className="px-6 py-2.5 border border-gray-300 dark:border-gray-600 rounded-full text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 font-medium transition cursor-pointer"
                    >
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleAddSkill}
                        disabled={addingSkill}
                        className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-full font-medium transition cursor-pointer disabled:opacity-50"
                    >
                        {addingSkill ? "Adding..." : "Add Skill"}
                    </button>
                </div>
            }>
                        <div className="p-6 space-y-5">
                            <FloatingInput label="Skill Name" name="skill_name" value={newSkillName} onChange={(e) => setNewSkillName(e.target.value)} error={addErrors.skill_name} required placeholder="e.g. Docker" />
                            <div>
                                <label htmlFor="add-skill-category" className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-gray-300">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    id="add-skill-category"
                                    value={newSkillCategory}
                                    onChange={(e) => setNewSkillCategory(e.target.value)}
                                    className={`w-full rounded-lg border px-3 py-2.5 text-sm transition-colors outline-none ${
                                        addErrors.skill_category
                                            ? "border-red-300 bg-red-50 text-red-900 dark:border-red-600 dark:bg-red-900/20 dark:text-red-300"
                                            : "border-gray-300 bg-white text-gray-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                                    }`}
                                >
                                    <option value="">Select a category</option>
                                    {SKILL_CATEGORY_GROUPED_OPTIONS.map((group) => (
                                        <optgroup key={group.group} label={group.group}>
                                            {group.options.map((opt) => (
                                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                                            ))}
                                        </optgroup>
                                    ))}
                                </select>
                                {addErrors.skill_category && (
                                    <p className="mt-1.5 text-xs text-red-600 dark:text-red-400">{addErrors.skill_category}</p>
                                )}
                            </div>
                        </div>
            </ModalWrapper>
        </div>
    );
};

export default SkillsForm;
