import { useEffect, useState, useCallback, useMemo } from "react";
import { useSetJobCriteria } from "@/hooks/collegeadmin/company_management/Job_eligibility_criteria/useSetJobCriteria";
import { useAuth } from "@/hooks/collegeadmin/useAuth";
import {
    ShieldCheck, Loader2, AlertTriangle, Lightbulb, Info, GraduationCap,
    Briefcase, Users, Sparkles, Search, Plus, X,
} from "lucide-react";
import { CRITERIA_CONFIG, CRITERIA_GROUPS, type CriteriaConfigItem } from "@/constants/criteriaConfig";
import { SKILL_CATEGORY_LABELS, SKILL_CATEGORY_GROUPED_OPTIONS } from "@/constants/skillCategories";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import ModalWrapper from "@/components/ui/ModalWrapper";

// ========================
// TYPES
// ========================

interface Department {
    dept_id: string;
    dept_name: string;
}

interface CatalogSkill {
    skill_id: string;
    skill_name: string;
    skill_category: string;
    student_count: number;
}

interface JobCriteriaManagerProps {
    jobId: string;
    jobStatus?: string;
    existingCriteria: Record<string, unknown> | null;
    onSuccess: () => void;
}

// ========================
// CONSTANTS
// ========================

const GENDER_OPTIONS = ["Male", "Female", "Other"];
const GAP_OPTIONS = [
    { value: "no_gap", label: "No Gap" },
    { value: "gap", label: "Gap" },
];

const GROUP_ICONS = { GraduationCap, Briefcase, Users, Sparkles } as const;

const PLACEHOLDER_MAP: Record<string, string> = {
    min_overall_cgpa: "e.g. 7.0",
    max_live_kts: "e.g. 0",
    min_skill_match_percentage: "e.g. 60",
};

function getPlaceholder(key: string): string {
    return PLACEHOLDER_MAP[key] || "e.g. 60";
}

function getSubmitLabel(isLoading: boolean, isUpdate: boolean): string {
    if (isLoading) return isUpdate ? "Updating..." : "Setting...";
    return isUpdate ? "Update Criteria" : "Set Criteria";
}

// ========================
// STYLE HELPERS
// ========================

function getChipClass(isDisabled: boolean, isSelected: boolean): string {
    if (isDisabled) return "opacity-40 cursor-not-allowed bg-gray-50 dark:bg-gray-800";
    if (isSelected) return "bg-blue-50 dark:bg-blue-900/20 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-400 shadow-sm";
    return "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700 text-gray-600 dark:text-gray-300 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50/30 dark:hover:bg-blue-900/10";
}

function getInputClass(enabled: boolean, error?: string): string {
    const base = "w-full rounded-lg border px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition";
    if (enabled && error) return `${base} border-red-400 dark:border-red-500 bg-red-50 dark:bg-red-900/10 text-gray-900 dark:text-gray-100`;
    if (enabled) return `${base} border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500`;
    return `${base} bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-500 border-gray-200 dark:border-gray-700 cursor-not-allowed`;
}

function getCriteriaCardClass(disabled: boolean | undefined, enabled: boolean): string {
    if (disabled) return "bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 opacity-60";
    if (enabled) return "bg-white dark:bg-gray-900 border-blue-200 dark:border-blue-800 shadow-sm ring-1 ring-blue-100 dark:ring-blue-900/30";
    return "bg-gray-50/50 dark:bg-gray-800/50 border-gray-100 dark:border-gray-700 hover:border-gray-200 dark:hover:border-gray-600";
}

// ========================
// CRITERIA CARD COMPONENT
// ========================

function CriteriaCard({
    config, enabled, onToggle, error, disabled, children,
}: Readonly<{
    config: CriteriaConfigItem;
    enabled: boolean;
    onToggle: () => void;
    error?: string;
    disabled?: boolean;
    children: React.ReactNode;
}>) {
    const isActive = enabled && !disabled;

    return (
        <div className={`p-5 rounded-xl border transition-all duration-200 ${getCriteriaCardClass(disabled, enabled)}`}>
            {/* Header: Label + Toggle */}
            <div className="flex items-start justify-between gap-3 mb-3">
                <div className="flex-1 min-w-0">
                    <p className={`text-sm font-semibold transition-colors ${isActive ? "text-gray-800 dark:text-gray-100" : "text-gray-400 dark:text-gray-500"}`}>
                        {config.label}
                        {config.unit && isActive && (
                            <span className="ml-1.5 text-xs font-normal text-gray-400 dark:text-gray-500">({config.unit})</span>
                        )}
                    </p>
                    <p className={`text-xs mt-1 leading-relaxed transition-colors ${isActive ? "text-gray-500 dark:text-gray-400" : "text-gray-300 dark:text-gray-600"}`}>
                        {config.description}
                    </p>
                </div>
                <button
                    type="button"
                    onClick={onToggle}
                    disabled={disabled}
                    className={`relative inline-flex h-6 w-11 flex-shrink-0 items-center rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 disabled:cursor-not-allowed disabled:opacity-40 ${
                        enabled ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500"
                    }`}
                    aria-label={`Toggle ${config.label}`}
                >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-sm transition-transform duration-200 ${enabled ? "translate-x-6" : "translate-x-1"}`} />
                </button>
            </div>

            {/* Example Box */}
            <div className={`flex items-start gap-2 px-3 py-2 rounded-lg mb-3 transition-colors ${isActive ? "bg-blue-50 dark:bg-blue-950/30" : "bg-gray-50 dark:bg-gray-800/60"}`}>
                <Lightbulb className={`h-3.5 w-3.5 flex-shrink-0 mt-0.5 ${isActive ? "text-blue-500" : "text-gray-300 dark:text-gray-600"}`} />
                <p className={`text-xs leading-relaxed ${isActive ? "text-blue-700 dark:text-blue-300" : "text-gray-400 dark:text-gray-500"}`}>
                    {config.example}
                </p>
            </div>

            {/* Help Box — contextual */}
            {isActive && (
                <div className="flex items-start gap-2 px-3 py-2 rounded-lg mb-3 bg-emerald-50 dark:bg-emerald-950/30">
                    <Info className="h-3.5 w-3.5 flex-shrink-0 mt-0.5 text-emerald-500" />
                    <p className="text-xs leading-relaxed text-emerald-700 dark:text-emerald-300">
                        <span className="font-medium">What happens: </span>{config.helpWhenEnabled}
                    </p>
                </div>
            )}
            {!enabled && !disabled && (
                <p className="text-xs text-gray-400 dark:text-gray-500 italic mb-3">{config.helpWhenDisabled}</p>
            )}

            {/* Input */}
            <div className={`transition-opacity ${isActive ? "opacity-100" : "opacity-40 pointer-events-none"}`}>
                {children}
            </div>
            {error && <p className="text-xs text-red-500 dark:text-red-400 mt-2">{error}</p>}
        </div>
    );
}

// ========================
// SKILL SELECTOR COMPONENT
// ========================

function SkillSelector({
    selectedSkills, onAdd, onRemove, enabled, disabled,
}: Readonly<{
    selectedSkills: { skill_id: string; skill_name?: string; skill_category?: string }[];
    onAdd: (skill: CatalogSkill) => void;
    onRemove: (skillId: string) => void;
    enabled: boolean;
    disabled?: boolean;
}>) {
    const [search, setSearch] = useState("");
    const [categoryFilter, setCategoryFilter] = useState("");
    const [catalog, setCatalog] = useState<CatalogSkill[]>([]);
    const [loading, setLoading] = useState(false);
    const [showAll, setShowAll] = useState(false);
    const [showAddModal, setShowAddModal] = useState(false);
    const [newSkillName, setNewSkillName] = useState("");
    const [newSkillCategory, setNewSkillCategory] = useState("");
    const [addingSkill, setAddingSkill] = useState(false);

    const isActive = enabled && !disabled;
    const selectedIds = useMemo(() => new Set(selectedSkills.map((s) => s.skill_id)), [selectedSkills]);

    const fetchCatalog = useCallback(async () => {
        setLoading(true);
        try {
            const result = await CollegeAdminService.getAllSkills({
                search: search || undefined,
                skill_category: categoryFilter || undefined,
                limit: 100,
            });
            setCatalog(result.data?.skills || []);
        } catch {
            setCatalog([]);
        } finally {
            setLoading(false);
        }
    }, [search, categoryFilter]);

    useEffect(() => {
        if (!isActive) return;
        const timer = setTimeout(fetchCatalog, 300);
        return () => clearTimeout(timer);
    }, [fetchCatalog, isActive]);

    const displaySkills = showAll ? catalog : catalog.slice(0, 20);
    const hasMore = catalog.length > 20 && !showAll;

    const handleAddNewSkill = async () => {
        if (!newSkillName.trim()) return;
        setAddingSkill(true);
        try {
            const result = await CollegeAdminService.createSkill({
                skill_name: newSkillName.trim(),
                skill_category: newSkillCategory || undefined,
            });
            const created = result.data?.skill;
            if (created) {
                onAdd(created);
                fetchCatalog();
            }
            setShowAddModal(false);
            setNewSkillName("");
            setNewSkillCategory("");
        } catch {
            // API error handled by interceptor
        } finally {
            setAddingSkill(false);
        }
    };

    if (!isActive) return null;

    return (
        <div className="space-y-3">
            {/* Search + Filter */}
            <div className="flex gap-2">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <input
                        type="text"
                        value={search}
                        onChange={(e) => { setSearch(e.target.value); setShowAll(false); }}
                        placeholder="Search skills..."
                        className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>
                <select
                    value={categoryFilter}
                    onChange={(e) => { setCategoryFilter(e.target.value); setShowAll(false); }}
                    className="px-3 py-2 text-sm rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 max-w-[160px]"
                >
                    <option value="">All Categories</option>
                    {SKILL_CATEGORY_GROUPED_OPTIONS.map((group) => (
                        <optgroup key={group.group} label={group.group}>
                            {group.options.map((opt) => (
                                <option key={opt.value} value={opt.value}>{opt.label}</option>
                            ))}
                        </optgroup>
                    ))}
                </select>
                <button
                    type="button"
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">New</span>
                </button>
            </div>

            {/* Catalog Grid */}
            <div className="max-h-48 overflow-y-auto rounded-lg border border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/30 p-2">
                {loading ? (
                    <div className="flex items-center justify-center py-6">
                        <Loader2 className="h-5 w-5 animate-spin text-gray-400" />
                    </div>
                ) : catalog.length === 0 ? ( // NOSONAR - ternary is readable for loading states
                    <p className="text-xs text-gray-400 dark:text-gray-500 text-center py-6">No skills found. Try a different search or add a new skill.</p>
                ) : (
                    <>
                        <div className="flex flex-wrap gap-1.5">
                            {displaySkills.map((skill) => {
                                const isSelected = selectedIds.has(skill.skill_id);
                                return (
                                    <button
                                        key={skill.skill_id}
                                        type="button"
                                        onClick={() => isSelected ? onRemove(skill.skill_id) : onAdd(skill)}
                                        className={`inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full text-xs font-medium border transition-all ${
                                            isSelected
                                                ? "bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 text-blue-700 dark:text-blue-300"
                                                : "bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-400 hover:border-blue-200 dark:hover:border-blue-700 hover:bg-blue-50/50 dark:hover:bg-blue-900/10"
                                        }`}
                                    >
                                        {isSelected && <span className="text-blue-500">✓</span>}
                                        {skill.skill_name}
                                        {skill.skill_category && (
                                            <span className="text-[10px] opacity-60 ml-0.5">
                                                {SKILL_CATEGORY_LABELS[skill.skill_category] || skill.skill_category}
                                            </span>
                                        )}
                                    </button>
                                );
                            })}
                        </div>
                        {hasMore && (
                            <button type="button" onClick={() => setShowAll(true)} className="w-full mt-2 text-xs text-blue-600 dark:text-blue-400 hover:underline">
                                Show all {catalog.length} skills
                            </button>
                        )}
                    </>
                )}
            </div>

            {/* Selected Skills Chips */}
            {selectedSkills.length > 0 && (
                <div>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mb-1.5 font-medium">
                        Selected ({selectedSkills.length}/50):
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                        {selectedSkills.map((skill) => (
                            <span key={skill.skill_id} className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                                {skill.skill_name || skill.skill_id.slice(0, 8)}
                                <button type="button" onClick={() => onRemove(skill.skill_id)} className="hover:text-red-500 transition-colors">
                                    <X className="h-3 w-3" />
                                </button>
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Add New Skill Modal */}
            {showAddModal && (
                <ModalWrapper isOpen onClose={() => setShowAddModal(false)} title="Add New Skill">
                    <div className="space-y-4 p-1">
                        <div>
                            <label htmlFor="new-skill-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Skill Name</label>
                            <input
                                id="new-skill-name"
                                type="text"
                                value={newSkillName}
                                onChange={(e) => setNewSkillName(e.target.value)}
                                placeholder="e.g. React, Python, SQL"
                                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
                                maxLength={100}
                                autoFocus
                            />
                        </div>
                        <div>
                            <label htmlFor="new-skill-category" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Category (optional)</label>
                            <select
                                id="new-skill-category"
                                value={newSkillCategory}
                                onChange={(e) => setNewSkillCategory(e.target.value)}
                                className="w-full px-3 py-2.5 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">Select category</option>
                                {SKILL_CATEGORY_GROUPED_OPTIONS.map((group) => (
                                    <optgroup key={group.group} label={group.group}>
                                        {group.options.map((opt) => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </optgroup>
                                ))}
                            </select>
                        </div>
                        <div className="flex justify-end gap-2 pt-2">
                            <button type="button" onClick={() => setShowAddModal(false)} className="px-4 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors">
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={handleAddNewSkill}
                                disabled={!newSkillName.trim() || addingSkill}
                                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
                            >
                                {addingSkill && <Loader2 className="h-3.5 w-3.5 animate-spin" />}
                                Add Skill
                            </button>
                        </div>
                    </div>
                </ModalWrapper>
            )}
        </div>
    );
}

// ========================
// MAIN COMPONENT
// ========================

const JobCriteriaManager = ({ jobId, jobStatus, existingCriteria, onSuccess }: JobCriteriaManagerProps) => {
    const {
        formData, toggles, errors, loading, isUpdate,
        handleChange, handleToggle, handleMultiSelect, handleSubmit,
        loadExisting, addSkill, removeSkill,
    } = useSetJobCriteria(jobId, onSuccess);

    const { user } = useAuth();
    const departments: Department[] = user?.departments ?? [];
    const isCancelled = jobStatus === "cancelled";

    useEffect(() => {
        if (existingCriteria) loadExisting(existingCriteria);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [existingCriteria]);

    const renderInput = (config: CriteriaConfigItem) => {
        const key = config.key;
        const isActive = toggles[key as keyof typeof toggles] && !isCancelled;

        if (config.inputType === "number") return renderNumberInput(key, config, isActive);
        if (config.inputType === "boolean") return renderBooleanInput(key, isActive);
        if (config.inputType === "multiselect") return renderMultiSelect(key, isActive);
        if (config.inputType === "skills") {
            return (
                <SkillSelector
                    selectedSkills={formData.required_skills}
                    onAdd={addSkill}
                    onRemove={removeSkill}
                    enabled={toggles.required_skills}
                    disabled={isCancelled}
                />
            );
        }
        return null;
    };

    const renderNumberInput = (key: string, config: CriteriaConfigItem, isActive: boolean) => (
        <div className="relative">
            <input
                type="number"
                name={key}
                value={formData[key as keyof typeof formData] as number | ""}
                onChange={handleChange}
                min={config.min}
                max={config.max}
                step={config.step}
                inputMode={config.step && config.step < 1 ? "decimal" : "numeric"}
                disabled={!isActive}
                placeholder={getPlaceholder(key)}
                className={getInputClass(isActive, errors[key])}
            />
            {config.unit && (
                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 dark:text-gray-500 pointer-events-none">
                    {config.unit}
                </span>
            )}
        </div>
    );

    const renderBooleanInput = (key: string, isActive: boolean) => (
        <label className="flex items-center gap-3 mt-1">
            <input
                type="checkbox"
                name={key}
                checked={formData[key as keyof typeof formData] as boolean}
                onChange={handleChange}
                disabled={!isActive}
                className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 disabled:opacity-40"
            />
            <span className={`text-sm ${isActive ? "text-gray-700 dark:text-gray-300" : "text-gray-400 dark:text-gray-500"}`}>
                Yes, exclude placed students
            </span>
        </label>
    );
                                
    const renderMultiSelect = (key: string, isActive: boolean) => {
        if (key === "allowed_genders") {
            return (
                <div className="flex flex-wrap gap-2 mt-1">
                    {GENDER_OPTIONS.map((g) => (
                        <label key={g} className={`flex items-center gap-2 px-3 py-2.5 min-h-[44px] rounded-lg border text-sm cursor-pointer transition-all ${getChipClass(!isActive, formData.allowed_genders.includes(g))}`}>
                            <input type="checkbox" checked={formData.allowed_genders.includes(g)} onChange={() => handleMultiSelect("allowed_genders", g)} disabled={!isActive} className="sr-only" />
                            {g}
                        </label>
                    ))}
                </div>
            );
        }
        if (key === "allowed_gap_statuses") {
            return (
                <div className="flex flex-wrap gap-2 mt-1">
                    {GAP_OPTIONS.map((g) => (
                        <label key={g.value} className={`flex items-center gap-2 px-3 py-2.5 min-h-[44px] rounded-lg border text-sm cursor-pointer transition-all ${getChipClass(!isActive, formData.allowed_gap_statuses.includes(g.value))}`}>
                            <input type="checkbox" checked={formData.allowed_gap_statuses.includes(g.value)} onChange={() => handleMultiSelect("allowed_gap_statuses", g.value)} disabled={!isActive} className="sr-only" />
                            {g.label}
                        </label>
                    ))}
                </div>
            );
        }
        if (key === "allowed_departments") {
            return (
                <div className="flex flex-wrap gap-2 mt-1 max-h-40 overflow-y-auto">
                    {departments.map((d) => (
                        <label key={d.dept_id} className={`flex items-center gap-2 px-3 py-2.5 min-h-[44px] rounded-lg border text-sm cursor-pointer transition-all ${getChipClass(!isActive, formData.allowed_departments.includes(d.dept_name))}`}>
                            <input type="checkbox" checked={formData.allowed_departments.includes(d.dept_name)} onChange={() => handleMultiSelect("allowed_departments", d.dept_name)} disabled={!isActive} className="sr-only" />
                            {d.dept_name}
                        </label>
                    ))}
                    {departments.length === 0 && <p className="text-xs text-gray-400 dark:text-gray-500">No departments found</p>}
                </div>
            );
        }
        return null;
    };

    return (
        <div className="space-y-8">
            {isCancelled && (
                <div className="flex items-center gap-3 px-5 py-4 rounded-xl bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800">
                    <div className="h-9 w-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                    </div>
                    <div>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">This job is cancelled</p>
                        <p className="text-xs text-amber-600 dark:text-amber-400 mt-0.5">Criteria cannot be modified for cancelled jobs.</p>
                    </div>
                </div>
            )}

            <div className="flex items-center gap-4">
                <div className="h-11 w-11 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="h-5.5 w-5.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <div>
                    <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">
                        {isUpdate ? "Update Eligibility Criteria" : "Set Eligibility Criteria"}
                    </h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">
                        Toggle criteria on/off. Only enabled criteria will filter students.
                    </p>
                </div>
            </div>

            {CRITERIA_GROUPS.map((group) => {
                const Icon = GROUP_ICONS[group.icon];
                const configs = Object.values(CRITERIA_CONFIG).filter((c) => c.group === group.key);
                if (configs.length === 0) return null;
                const isSkillGroup = group.key === "skills";

                return (
                    <div key={group.key}>
                        <div className="flex items-center gap-2.5 mb-4">
                            <Icon className="h-4.5 w-4.5 text-gray-400 dark:text-gray-500" />
                            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wide">
                                {group.label}
                            </h4>
                        </div>
                        <div className={isSkillGroup ? "space-y-4" : "grid grid-cols-1 md:grid-cols-2 gap-4"}>
                            {configs.map((config) => (
                                <CriteriaCard
                                    key={config.key}
                                    config={config}
                                    enabled={toggles[config.key as keyof typeof toggles]}
                                    onToggle={() => handleToggle(config.key as keyof typeof toggles)}
                                    error={errors[config.key]}
                                    disabled={isCancelled}
                                >
                                    {renderInput(config)}
                                </CriteriaCard>
                            ))}
                        </div>
                    </div>
                );
            })}

            {!isCancelled && (
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={handleSubmit}
                        disabled={loading}
                        className="px-6 py-2.5 text-sm font-bold text-white bg-blue-600 rounded-xl hover:bg-blue-700 transition-all active:scale-[0.98] shadow-sm disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-2"
                    >
                        {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                        {getSubmitLabel(loading, isUpdate)}
                    </button>
                </div>
            )}
        </div>
    );
};

export default JobCriteriaManager;
