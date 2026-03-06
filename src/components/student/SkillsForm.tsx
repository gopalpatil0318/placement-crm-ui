import { useSkills } from "@/hooks/student/useSkills";
import { SKILL_CATEGORY_LABELS, PROFICIENCY_LABELS, VALID_PROFICIENCY_LEVELS } from "@/validators/student/skillsSchema";
import { Plus, X, Search, Check } from "lucide-react";
import { useState } from "react";

interface Props {
    profileData: any;
    refreshProfile: () => Promise<void>;
    nextStep: () => void;
}

const SkillsForm = ({ }: Props) => {
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
        VALID_SKILL_CATEGORIES,
    } = useSkills();

    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [displayLimit, setDisplayLimit] = useState(20);

    // Filter catalog skills by search + category
    const filteredSkills = catalogSkills.filter((skill) => {
        const matchesSearch = skill.skill_name.toLowerCase().includes(search.toLowerCase());
        const matchesCategory = filterCategory === "all" || skill.skill_category === filterCategory;
        return matchesSearch && matchesCategory;
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
            <div className="p-8 bg-white rounded-xl border">
                <div className="flex items-center justify-center h-40">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
                    <span className="ml-3 text-gray-500">Loading skills...</span>
                </div>
            </div>
        );
    }

    return (
        <div className="p-8 bg-white rounded-xl border">
            {/* ================= Header ================= */}
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h2 className="text-xl font-semibold text-gray-800">Skills</h2>
                    <p className="text-sm text-gray-500 mt-1">
                        {selectedSkills.length} skill{selectedSkills.length !== 1 ? "s" : ""} selected
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
                    <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">Your Skills</h3>
                    <div className="flex flex-wrap gap-3">
                        {selectedSkills.map((skill) => (
                            <div
                                key={skill.skill_id}
                                className="flex items-center gap-2 p-2 border border-blue-100 bg-blue-50/30 rounded-lg"
                            >
                                <div className="flex flex-col min-w-0">
                                    <span className="text-sm font-medium text-gray-800 whitespace-nowrap">{skill.skill_name}</span>
                                    <span className="text-[10px] text-gray-500 uppercase tracking-wider whitespace-nowrap">
                                        {SKILL_CATEGORY_LABELS[skill.skill_category] || skill.skill_category}
                                    </span>
                                </div>
                                <select
                                    value={skill.proficiency_level}
                                    onChange={(e) => updateProficiency(skill.skill_id, e.target.value)}
                                    className="text-xs border border-gray-300 bg-white rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 mx-1"
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
                                    className="p-1 hover:bg-red-50 rounded-full text-red-400 hover:text-red-600 transition cursor-pointer"
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
                        className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                    />
                </div>
                <select
                    value={filterCategory}
                    onChange={(e) => handleCategoryChange(e.target.value)}
                    className="border border-gray-300 rounded-lg px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                >
                    <option value="all">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat} value={cat}>{SKILL_CATEGORY_LABELS[cat] || cat}</option>
                    ))}
                </select>
            </div>

            {/* ================= Catalog Grid ================= */}
            <div className="mb-6">
                <h3 className="text-sm font-semibold text-gray-600 uppercase tracking-wider mb-3">
                    Available Skills
                    <span className="text-gray-400 font-normal ml-2">({filteredSkills.length})</span>
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
                                    : "bg-white text-gray-700 border-gray-300 hover:border-blue-400 hover:text-blue-600"
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
                        className="mt-3 text-sm text-gray-500 hover:text-gray-700 font-medium cursor-pointer"
                    >
                        Show Less
                    </button>
                )}
            </div>

            {/* ================= Save Button ================= */}
            <div className="flex justify-end pt-4 border-t">
                <button
                    type="button"
                    onClick={handleSave}
                    disabled={saving}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-full font-medium transition cursor-pointer disabled:opacity-50"
                >
                    {saving ? "Saving..." : "Save Skills"}
                </button>
            </div>

            {/* ================= Add Skill Modal ================= */}
            {isAddModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center">
                    <div className="absolute inset-0 bg-black/50" onClick={() => setIsAddModalOpen(false)} />
                    <div className="relative bg-white rounded-2xl shadow-xl w-full max-w-md mx-4">
                        <div className="flex items-center justify-between p-6 border-b">
                            <h3 className="text-lg font-semibold text-gray-800">Add New Skill</h3>
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="p-1 hover:bg-gray-100 rounded-full transition cursor-pointer"
                            >
                                <X className="h-5 w-5 text-gray-500" />
                            </button>
                        </div>
                        <div className="p-6 space-y-5">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Skill Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={newSkillName}
                                    onChange={(e) => setNewSkillName(e.target.value)}
                                    placeholder="e.g. Docker"
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                />
                                {addErrors.skill_name && (
                                    <p className="text-xs text-red-500 mt-1">{addErrors.skill_name}</p>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Category <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={newSkillCategory}
                                    onChange={(e) => setNewSkillCategory(e.target.value)}
                                    className="w-full rounded-lg border border-gray-300 px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                >
                                    <option value="">Select Category</option>
                                    {VALID_SKILL_CATEGORIES.map((cat) => (
                                        <option key={cat} value={cat}>
                                            {SKILL_CATEGORY_LABELS[cat] || cat}
                                        </option>
                                    ))}
                                </select>
                                {addErrors.skill_category && (
                                    <p className="text-xs text-red-500 mt-1">{addErrors.skill_category}</p>
                                )}
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 p-6 border-t">
                            <button
                                type="button"
                                onClick={() => setIsAddModalOpen(false)}
                                className="px-6 py-2.5 border border-gray-300 rounded-full text-gray-700 hover:bg-gray-50 font-medium transition cursor-pointer"
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
                    </div>
                </div>
            )}
        </div>
    );
};

export default SkillsForm;
