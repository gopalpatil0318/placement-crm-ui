import { FileText, Loader2, AlertTriangle } from "lucide-react"
import AnimatedPage from "@/components/ui/AnimatedPage"
import { usePlacementPolicies } from "@/hooks/student/usePlacementPolicies"

export default function PlacementPolicies() {
  const { policies, total, isLoading, isError } = usePlacementPolicies()

  return (
    <AnimatedPage>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-xl font-semibold">Placement Policies</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Review your college&apos;s placement rules and guidelines for your batch.
          </p>
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex items-center justify-center py-16 text-muted-foreground">
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Loading policies…
          </div>
        )}

        {/* Error */}
        {isError && (
          <div className="flex items-center gap-2 rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-sm text-destructive">
            <AlertTriangle className="h-4 w-4 shrink-0" />
            Failed to load placement policies. Please try again later.
          </div>
        )}

        {/* Empty */}
        {!isLoading && !isError && total === 0 && (
          <div className="flex flex-col items-center justify-center py-16 text-muted-foreground">
            <FileText className="h-10 w-10 mb-3 opacity-40" />
            <p className="text-sm font-medium">No policies published yet</p>
            <p className="text-xs mt-1">Your college has not published any placement policies for your batch.</p>
          </div>
        )}

        {/* Policies List */}
        {!isLoading && !isError && total > 0 && (
          <div className="space-y-4">
            <p className="text-xs text-muted-foreground">
              {total} active {total === 1 ? "policy" : "policies"}
            </p>
            {policies.map((policy) => (
              <div
                key={policy.policy_id}
                className="rounded-lg border bg-card p-5 space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <h3 className="text-sm font-semibold leading-tight">
                    {policy.policy_title}
                  </h3>
                  <span className="shrink-0 rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
                    {policy.passout_year}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap leading-relaxed">
                  {policy.policy_description}
                </p>
                {policy.created_by_name && (
                  <p className="text-xs text-muted-foreground/70 pt-1">
                    Published by {policy.created_by_name}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </AnimatedPage>
  )
}
