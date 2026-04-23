import { useState, useCallback } from "react"
import { usePermissions } from "@/hooks/usePermissions"
import {
    Plus, Pencil, Trash2, Layers, AlertTriangle,
} from "lucide-react"
import PageHeader from "@/components/collegeadmin/PageHeader"
import AnimatedPage from "@/components/ui/AnimatedPage"
import { AnimatedTableBody, AnimatedRow } from "@/components/ui/AnimatedList"
import { useYearFilter } from "@/context/YearFilterContext"
import {
    useCompanyTiers,
    useCreateCompanyTier,
    useUpdateCompanyTier,
    useDeleteCompanyTier,
    type CompanyTier,
} from "@/hooks/collegeadmin/useCompanyTiers"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import TierBadge from "@/components/collegeadmin/TierBadge"

// ========================
// CONSTANTS
// ========================

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Settings" },
    { label: "Company Tiers", active: true },
]

const INITIAL_FORM = {
    tier_name: "",
    tier_level: "",
    min_package: "",
    max_package: "",
    description: "",
    is_active: true,
}

// ========================
// PAGE COMPONENT
// ========================

export default function CompanyTierManager() {
    const { hasPermission } = usePermissions()
    const canManage = hasPermission("settings.manage")
    const { selectedYear } = useYearFilter()
    const { data: tiers = [], isLoading } = useCompanyTiers(selectedYear)

    const [dialogOpen, setDialogOpen] = useState(false)
    const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
    const [editingTier, setEditingTier] = useState<CompanyTier | null>(null)
    const [deletingTier, setDeletingTier] = useState<CompanyTier | null>(null)
    const [form, setForm] = useState(INITIAL_FORM)
    const [formErrors, setFormErrors] = useState<Record<string, string>>({})

    const closeDialog = useCallback(() => {
        setDialogOpen(false)
        setEditingTier(null)
        setForm(INITIAL_FORM)
        setFormErrors({})
    }, [])

    const createMutation = useCreateCompanyTier(closeDialog)
    const updateMutation = useUpdateCompanyTier(closeDialog)
    const deleteMutation = useDeleteCompanyTier()

    const handleOpenCreate = useCallback(() => {
        setEditingTier(null)
        setForm(INITIAL_FORM)
        setDialogOpen(true)
    }, [])

    const handleOpenEdit = useCallback((tier: CompanyTier) => {
        setEditingTier(tier)
        setForm({
            tier_name: tier.tier_name,
            tier_level: String(tier.tier_level),
            min_package: String(tier.min_package),
            max_package: tier.max_package == null ? "" : String(tier.max_package),
            description: tier.description ?? "",
            is_active: tier.is_active,
        })
        setDialogOpen(true)
    }, [])

    const handleOpenDelete = useCallback((tier: CompanyTier) => {
        setDeletingTier(tier)
        setDeleteDialogOpen(true)
    }, [])

    const handleSubmit = useCallback(() => {
        const errors: Record<string, string> = {}
        const name = form.tier_name.trim()
        const level = Number(form.tier_level)
        const minPkg = Number(form.min_package)
        const maxPkg = form.max_package ? Number(form.max_package) : null

        if (!name) errors.tier_name = "Tier name is required"
        else if (name.length > 100) errors.tier_name = "Max 100 characters"
        if (!form.tier_level || Number.isNaN(level) || level < 1 || level > 20) errors.tier_level = "Level must be 1–20"
        if (!form.min_package || Number.isNaN(minPkg) || minPkg < 0) errors.min_package = "Min package must be ≥ 0"
        if (maxPkg !== null && (Number.isNaN(maxPkg) || maxPkg < minPkg)) errors.max_package = "Must be ≥ min package"

        if (Object.keys(errors).length > 0) {
            setFormErrors(errors)
            return
        }
        setFormErrors({})

        const payload = {
            tier_name: name,
            tier_level: level,
            min_package: minPkg,
            max_package: maxPkg,
            description: form.description.trim() || undefined,
            is_active: form.is_active,
        }

        if (editingTier) {
            updateMutation.mutate({ tierId: editingTier.tier_id, data: payload })
        } else {
            createMutation.mutate({ ...payload, passout_year: selectedYear })
        }
    }, [form, editingTier, selectedYear, createMutation, updateMutation])

    const handleConfirmDelete = useCallback(() => {
        if (!deletingTier) return
        deleteMutation.mutate(deletingTier.tier_id, {
            onSuccess: () => {
                setDeleteDialogOpen(false)
                setDeletingTier(null)
            },
        })
    }, [deletingTier, deleteMutation])

    const isSaving = createMutation.isPending || updateMutation.isPending

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <PageHeader
                            title="Company Tiers"
                            breadcrumbs={BREADCRUMBS}
                        />
                        <p className="text-sm text-muted-foreground mt-1">Define salary-based tiers for classifying job drives</p>
                    </div>
                    {canManage && (
                    <Button onClick={handleOpenCreate} size="sm">
                        <Plus className="mr-1.5 h-4 w-4" /> Add Tier
                    </Button>
                    )}
                </div>

                {/* Tier Table */}
                {isLoading && (
                    <div className="flex items-center justify-center py-16 text-muted-foreground">Loading tiers…</div>
                )}
                {!isLoading && tiers.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
                        <Layers className="mb-2 h-10 w-10 opacity-40" />
                        <p className="text-sm">No tiers defined for {selectedYear}.</p>
                        <p className="text-xs mt-1">Add tiers to auto-classify jobs by salary range.</p>
                    </div>
                )}
                {!isLoading && tiers.length > 0 && (
                    <div className="rounded-lg border bg-card">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b bg-muted/50">
                                    <th className="px-4 py-3 text-left font-medium">Level</th>
                                    <th className="px-4 py-3 text-left font-medium">Tier Name</th>
                                    <th className="px-4 py-3 text-left font-medium">Package Range (LPA)</th>
                                    <th className="px-4 py-3 text-left font-medium">Jobs</th>
                                    <th className="px-4 py-3 text-left font-medium">Status</th>
                                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                                </tr>
                            </thead>
                            <AnimatedTableBody>
                                {tiers.map((tier) => (
                                    <AnimatedRow key={tier.tier_id}>
                                        <td className="px-4 py-3 font-mono text-xs">{tier.tier_level}</td>
                                        <td className="px-4 py-3">
                                            <TierBadge tierName={tier.tier_name} tierLevel={tier.tier_level} />
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">
                                            ₹{tier.min_package}
                                            {tier.max_package == null ? "+" : ` – ₹${tier.max_package}`}
                                        </td>
                                        <td className="px-4 py-3 text-muted-foreground">{tier.job_count}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${tier.is_active ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400"}`}>
                                                {tier.is_active ? "Active" : "Inactive"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-right">
                                            {canManage && (
                                            <div className="flex items-center justify-end gap-1">
                                                <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleOpenEdit(tier)}>
                                                    <Pencil className="h-3.5 w-3.5" />
                                                </Button>
                                                <Button variant="ghost" size="icon" className="h-8 w-8 text-destructive hover:text-destructive" onClick={() => handleOpenDelete(tier)} disabled={tier.job_count > 0}>
                                                    <Trash2 className="h-3.5 w-3.5" />
                                                </Button>
                                            </div>
                                            )}
                                        </td>
                                    </AnimatedRow>
                                ))}
                            </AnimatedTableBody>
                        </table>
                    </div>
                )}

                {/* Create / Edit Dialog */}
                <Dialog open={dialogOpen} onOpenChange={(open) => { if (!open) closeDialog() }}>
                    <DialogContent className="sm:max-w-md">
                        <DialogHeader>
                            <DialogTitle>{editingTier ? "Edit Tier" : "Add Company Tier"}</DialogTitle>
                            <DialogDescription>
                                {editingTier
                                    ? "Update the tier definition. Changing thresholds will reclassify existing jobs."
                                    : `Define a new tier for ${selectedYear}.`}
                            </DialogDescription>
                        </DialogHeader>

                        <div className="space-y-4 py-2">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="tier_name">Tier Name</Label>
                                    <Input id="tier_name" maxLength={100} placeholder="e.g. Dream" value={form.tier_name} onChange={(e) => { setForm((p) => ({ ...p, tier_name: e.target.value })); setFormErrors((p) => ({ ...p, tier_name: "" })) }} />
                                    {formErrors.tier_name && <p className="text-xs text-destructive">{formErrors.tier_name}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="tier_level">Level</Label>
                                    <Input id="tier_level" type="number" min={1} max={20} placeholder="1" value={form.tier_level} onChange={(e) => { setForm((p) => ({ ...p, tier_level: e.target.value })); setFormErrors((p) => ({ ...p, tier_level: "" })) }} />
                                    {formErrors.tier_level && <p className="text-xs text-destructive">{formErrors.tier_level}</p>}
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-1.5">
                                    <Label htmlFor="min_package">Min Package (LPA)</Label>
                                    <Input id="min_package" type="number" min={0} step="0.01" placeholder="0" value={form.min_package} onChange={(e) => { setForm((p) => ({ ...p, min_package: e.target.value })); setFormErrors((p) => ({ ...p, min_package: "" })) }} />
                                    {formErrors.min_package && <p className="text-xs text-destructive">{formErrors.min_package}</p>}
                                </div>
                                <div className="space-y-1.5">
                                    <Label htmlFor="max_package">Max Package (LPA)</Label>
                                    <Input id="max_package" type="number" min={0} step="0.01" placeholder="No limit" value={form.max_package} onChange={(e) => { setForm((p) => ({ ...p, max_package: e.target.value })); setFormErrors((p) => ({ ...p, max_package: "" })) }} />
                                    {formErrors.max_package && <p className="text-xs text-destructive">{formErrors.max_package}</p>}
                                </div>
                            </div>
                            <div className="space-y-1.5">
                                <Label htmlFor="description">Description</Label>
                                <Textarea id="description" rows={2} placeholder="Optional — helps TPOs understand the tier" value={form.description} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setForm((p) => ({ ...p, description: e.target.value }))} />
                            </div>
                            <div className="flex items-center justify-between">
                                <Label htmlFor="is_active">Active</Label>
                                <Switch id="is_active" aria-label="Toggle tier active status" checked={form.is_active} onCheckedChange={(checked: boolean) => setForm((p) => ({ ...p, is_active: checked }))} />
                            </div>
                        </div>

                        <DialogFooter>
                            <Button variant="outline" onClick={closeDialog} disabled={isSaving}>
                                Cancel
                            </Button>
                            <Button onClick={handleSubmit} disabled={isSaving || !form.tier_name.trim() || !form.tier_level || !form.min_package}>
                                {isSaving && "Saving…"}
                                {!isSaving && editingTier && "Update Tier"}
                                {!isSaving && !editingTier && "Create Tier"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>

                {/* Delete Confirmation */}
                <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
                    <DialogContent className="sm:max-w-sm">
                        <DialogHeader>
                            <DialogTitle className="flex items-center gap-2 text-destructive">
                                <AlertTriangle className="h-5 w-5" /> Delete Tier
                            </DialogTitle>
                            <DialogDescription>
                                Are you sure you want to delete <strong>{deletingTier?.tier_name}</strong>?
                                Jobs linked to this tier will have their tier cleared.
                            </DialogDescription>
                        </DialogHeader>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
                                Cancel
                            </Button>
                            <Button variant="destructive" onClick={handleConfirmDelete} disabled={deleteMutation.isPending}>
                                {deleteMutation.isPending ? "Deleting…" : "Delete"}
                            </Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </AnimatedPage>
    )
}
