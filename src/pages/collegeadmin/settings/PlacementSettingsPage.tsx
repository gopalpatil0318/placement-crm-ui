import { useState, useCallback, useEffect, useMemo } from "react"
import { usePermissions } from "@/hooks/usePermissions"
import { Settings2, Info, Save } from "lucide-react"
import PageHeader from "@/components/collegeadmin/PageHeader"
import AnimatedPage from "@/components/ui/AnimatedPage"
import { useYearFilter } from "@/context/YearFilterContext"
import {
    usePlacementSettings,
    useUpsertPlacementSettings,
} from "@/hooks/collegeadmin/usePlacementSettings"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"

// ========================
// CONSTANTS
// ========================

const BREADCRUMBS = [
    { label: "Dashboard", path: "/college/dashboard" },
    { label: "Settings" },
    { label: "Placement Settings", active: true },
]

const WITHDRAWAL_RULES = [
    { value: "same_or_lower_tier", label: "Same or Lower Tier" },
    { value: "same_tier_only", label: "Same Tier Only" },
    { value: "any", label: "Any Tier" },
    { value: "none", label: "No Auto-Withdrawal" },
] as const

// ========================
// SETTING ROW
// ========================

function SettingRow({
    label,
    description,
    children,
}: Readonly<{
    label: string
    description: string
    children: React.ReactNode
}>) {
    return (
        <div className="flex items-center justify-between gap-4 rounded-lg border p-4">
            <div className="space-y-0.5">
                <p className="text-sm font-medium">{label}</p>
                <p className="text-xs text-muted-foreground">{description}</p>
            </div>
            <div className="shrink-0">{children}</div>
        </div>
    )
}

// ========================
// PAGE COMPONENT
// ========================

export default function PlacementSettingsPage() {
    const { hasPermission } = usePermissions()
    const canManage = hasPermission("settings.manage")
    const { selectedYear } = useYearFilter()
    const { data: settings, isLoading } = usePlacementSettings(selectedYear)

    // Derive initial form values from server data (or defaults)
    const initialForm = useMemo(() => {
        if (settings) {
            return {
                passout_year: settings.passout_year,
                max_active_offers: settings.max_active_offers,
                allow_dream_upgrade: settings.allow_dream_upgrade,
                auto_withdrawal_rule: settings.auto_withdrawal_rule,
                default_offer_days: settings.default_offer_days,
                exclude_placed_by_default: settings.exclude_placed_by_default,
                auto_reject_on_round_fail: settings.auto_reject_on_round_fail,
                allow_reapply_after_withdrawal: settings.allow_reapply_after_withdrawal,
                max_active_applications: settings.max_active_applications ?? null,
            }
        }
        return {
            passout_year: selectedYear,
            max_active_offers: 1,
            allow_dream_upgrade: true,
            auto_withdrawal_rule: "same_or_lower_tier" as string,
            default_offer_days: 7,
            exclude_placed_by_default: true,
            auto_reject_on_round_fail: true,
            allow_reapply_after_withdrawal: false,
            max_active_applications: null as number | null,
        }
    }, [settings, selectedYear])

    const [form, setForm] = useState(initialForm)

    // Reset form when server data changes (React-recommended render-time adjustment)
    const initialFormJson = JSON.stringify(initialForm)
    const [prevInitialJson, setPrevInitialJson] = useState(initialFormJson)
    if (initialFormJson !== prevInitialJson) {
        setPrevInitialJson(initialFormJson)
        setForm(initialForm)
    }

    const isDirty = JSON.stringify(form) !== initialFormJson

    // Warn on browser close with unsaved changes
    useEffect(() => {
        const handler = (e: BeforeUnloadEvent) => { if (isDirty) e.preventDefault() }
        window.addEventListener("beforeunload", handler)
        return () => window.removeEventListener("beforeunload", handler)
    }, [isDirty])

    const upsertMutation = useUpsertPlacementSettings()

    const handleSave = useCallback(() => {
        upsertMutation.mutate(form)
    }, [form, upsertMutation])

    return (
        <AnimatedPage>
            <div className="space-y-6">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    <div>
                        <PageHeader
                            title="Placement Settings"
                            breadcrumbs={BREADCRUMBS}
                        />
                        <p className="text-sm text-muted-foreground mt-1">{`Placement rules & policies for ${selectedYear}`}</p>
                    </div>
                    {canManage && (
                    <Button onClick={handleSave} size="sm" disabled={upsertMutation.isPending || isLoading || !isDirty}>
                        <Save className="mr-1.5 h-4 w-4" />
                        {upsertMutation.isPending && "Saving…"}
                        {!upsertMutation.isPending && isDirty && "Save Settings"}
                        {!upsertMutation.isPending && !isDirty && "Saved"}
                    </Button>
                    )}
                </div>

                {isLoading ? (
                    <div className="flex items-center justify-center py-16 text-muted-foreground">Loading settings…</div>
                ) : (
                    <div className="space-y-6">
                        {/* ── Offer Controls ── */}
                        <section className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <Settings2 className="h-4 w-4" /> Offer Controls
                            </div>

                            <SettingRow
                                label="Max Active Offers"
                                description="Maximum concurrent on-campus / pool-campus offers a student can hold. Off-campus placements are unlimited."
                            >
                                <Input
                                    type="number"
                                    min={1}
                                    max={10}
                                    className="w-20 text-center"
                                    value={form.max_active_offers}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, max_active_offers: Math.max(1, Math.min(10, Number(e.target.value) || 1)) }))
                                    }
                                />
                            </SettingRow>

                            <SettingRow
                                label="Default Offer Response Days"
                                description="Days students have to accept or decline an offer before it expires."
                            >
                                <Input
                                    type="number"
                                    min={1}
                                    max={90}
                                    className="w-20 text-center"
                                    value={form.default_offer_days}
                                    onChange={(e) =>
                                        setForm((p) => ({ ...p, default_offer_days: Math.max(1, Math.min(90, Number(e.target.value) || 7)) }))
                                    }
                                />
                            </SettingRow>
                        </section>

                        {/* ── Dream / Tier Upgrade ── */}
                        <section className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <Info className="h-4 w-4" /> Tier & Dream Upgrade
                            </div>

                            <SettingRow
                                label="Allow Dream Upgrade"
                                description="Let placed students apply to jobs at a higher tier (dream companies)."
                            >
                                <Switch
                                    aria-label="Allow dream upgrade"
                                    checked={form.allow_dream_upgrade}
                                    onCheckedChange={(checked: boolean) => setForm((p) => ({ ...p, allow_dream_upgrade: checked }))}
                                />
                            </SettingRow>

                            <SettingRow
                                label="Auto-Withdrawal Rule"
                                description="Automatically withdraw student from lower-priority drives when placed."
                            >
                                <Select
                                    value={form.auto_withdrawal_rule}
                                    onValueChange={(value) => setForm((p) => ({ ...p, auto_withdrawal_rule: value }))}
                                >
                                    <SelectTrigger className="w-48">
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {WITHDRAWAL_RULES.map((rule) => (
                                            <SelectItem key={rule.value} value={rule.value}>
                                                {rule.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </SettingRow>
                        </section>

                        {/* ── Job & Application Rules ── */}
                        <section className="space-y-3">
                            <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
                                <Settings2 className="h-4 w-4" /> Job & Application Rules
                            </div>

                            <SettingRow
                                label="Exclude Placed by Default"
                                description="Exclude already-placed students from eligibility checks when browsing new jobs."
                            >
                                <Switch
                                    aria-label="Exclude placed by default"
                                    checked={form.exclude_placed_by_default}
                                    onCheckedChange={(checked: boolean) => setForm((p) => ({ ...p, exclude_placed_by_default: checked }))}
                                />
                            </SettingRow>

                            <SettingRow
                                label="Auto-Reject on Round Failure"
                                description="Automatically reject students who fail a round (no manual override needed)."
                            >
                                <Switch
                                    aria-label="Auto-reject on round failure"
                                    checked={form.auto_reject_on_round_fail}
                                    onCheckedChange={(checked: boolean) => setForm((p) => ({ ...p, auto_reject_on_round_fail: checked }))}
                                />
                            </SettingRow>

                            <SettingRow
                                label="Allow Reapply After Withdrawal"
                                description="Let students re-apply to a job they previously withdrew from."
                            >
                                <Switch
                                    aria-label="Allow reapply after withdrawal"
                                    checked={form.allow_reapply_after_withdrawal}
                                    onCheckedChange={(checked: boolean) => setForm((p) => ({ ...p, allow_reapply_after_withdrawal: checked }))}
                                />
                            </SettingRow>

                            <SettingRow
                                label="Max Active Applications"
                                description="Maximum number of concurrent active applications per student. Leave empty for unlimited."
                            >
                                <Input
                                    type="number"
                                    min={1}
                                    max={100}
                                    className="w-20 text-center"
                                    placeholder="∞"
                                    value={form.max_active_applications ?? ""}
                                    onChange={(e) => {
                                        const val = e.target.value === "" ? null : Math.max(1, Math.min(100, Number(e.target.value) || 1))
                                        setForm((p) => ({ ...p, max_active_applications: val }))
                                    }}
                                />
                            </SettingRow>
                        </section>

                        {settings?.is_default && (
                            <p className="text-xs text-muted-foreground text-center">
                                These are default settings. Click Save to persist them for {selectedYear}.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </AnimatedPage>
    )
}
