import { useQuery } from "@tanstack/react-query";
import { CollegeAdminService } from "@/services/collegeadmin/collegeadmin.services";
import { queryKeys } from "@/lib/queryKeys";
import type { SubscriptionStatus } from "@/types/auth";

export interface SubscriptionInfo {
  subscription: {
    subscription_id: string;
    subscription_status: SubscriptionStatus;
    student_quota: number;
    valid_from: string;
    valid_to: string;
    trial_ends_at: string | null;
    allowed_passout_years: number[] | null;
    grace_period_days: number;
  } | null;
  students_used: number;
  students_remaining?: number;
  subscription_status: SubscriptionStatus;
}

export function useSubscriptionInfo(enabled = true) {
  return useQuery<SubscriptionInfo>({
    queryKey: queryKeys.dashboard.subscription(),
    queryFn: async () => {
      const res = await CollegeAdminService.getSubscriptionCurrent();
      return res.data as SubscriptionInfo;
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled,
  });
}
