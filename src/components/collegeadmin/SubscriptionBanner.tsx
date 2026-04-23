import { useState, useMemo } from "react";
import { AlertTriangle, Clock, XCircle, X, Sparkles } from "lucide-react";
import type { SubscriptionStatus } from "@/types/auth";

interface SubscriptionBannerProps {
  status: SubscriptionStatus;
  trialEndsAt?: string | null;
  validTo?: string | null;
  className?: string;
}

type BannerVariant = "info" | "warning" | "urgent" | "danger";
type LucideIcon = typeof Clock;

interface BannerConfig {
  variant: BannerVariant;
  icon: LucideIcon;
  title: string;
  message: string;
  dismissible: boolean;
}

/** Days between now and a future date (negative = past) */
function daysUntil(dateStr: string): number {
  const target = new Date(dateStr);
  const now = new Date();
  target.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

function formatDayMessage(days: number, prefix: string, suffix: string): string {
  return days === 1 ? `${prefix} tomorrow. ${suffix}` : `${prefix} in ${days} days. ${suffix}`;
}

function getTrialConfig(trialEndsAt: string): BannerConfig | null {
  const days = daysUntil(trialEndsAt);
  if (days <= 0) return null;
  const isUrgent = days <= 3;
  return {
    variant: isUrgent ? "urgent" : "info",
    icon: isUrgent ? Clock : Sparkles,
    title: isUrgent ? "Trial ending soon" : "Free trial active",
    message: formatDayMessage(days, "Your trial expires", isUrgent ? "Upgrade now to keep your data." : "Upgrade to unlock all features."),
    dismissible: true,
  };
}

function getActiveConfig(validTo: string): BannerConfig | null {
  const days = daysUntil(validTo);
  if (days > 30 || days <= 0) return null;
  return {
    variant: days <= 7 ? "urgent" : "warning",
    icon: Clock,
    title: "Subscription expiring",
    message: formatDayMessage(days, "Your subscription expires", "Contact admin to renew."),
    dismissible: true,
  };
}

const STATIC_CONFIGS: Partial<Record<SubscriptionStatus, BannerConfig>> = {
  expired: {
    variant: "danger",
    icon: XCircle,
    title: "Subscription expired",
    message: "Student registration is paused. Contact the Placenex team to renew your subscription.",
    dismissible: false,
  },
  suspended: {
    variant: "danger",
    icon: AlertTriangle,
    title: "Account suspended",
    message: "Your college account is suspended. Student registration is blocked. Contact the Placenex team.",
    dismissible: false,
  },
};

const SESSION_KEY = "placenex_sub_banner_dismissed";

export default function SubscriptionBanner({
  status,
  trialEndsAt,
  validTo,
  className = "",
}: Readonly<SubscriptionBannerProps>) {
  const [dismissed, setDismissed] = useState(() => {
    try {
      return sessionStorage.getItem(SESSION_KEY) === status;
    } catch {
      return false;
    }
  });

  const config = useMemo<BannerConfig | null>(() => {
    if (status === "trial" && trialEndsAt) return getTrialConfig(trialEndsAt);
    if (status === "active" && validTo) return getActiveConfig(validTo);
    return STATIC_CONFIGS[status] ?? null;
  }, [status, trialEndsAt, validTo]);

  if (!config || dismissed) return null;

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(SESSION_KEY, status);
    } catch {
      // sessionStorage unavailable — no-op
    }
  };

  const Icon = config.icon;

  const variantStyles = {
    info: {
      container:
        "bg-blue-50 border-blue-200 dark:bg-blue-950/40 dark:border-blue-800/50",
      icon: "text-blue-600 dark:text-blue-400",
      title: "text-blue-800 dark:text-blue-200",
      message: "text-blue-700 dark:text-blue-300",
      dismiss:
        "text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-200",
    },
    warning: {
      container:
        "bg-amber-50 border-amber-200 dark:bg-amber-950/40 dark:border-amber-800/50",
      icon: "text-amber-600 dark:text-amber-400",
      title: "text-amber-800 dark:text-amber-200",
      message: "text-amber-700 dark:text-amber-300",
      dismiss:
        "text-amber-500 hover:text-amber-700 dark:text-amber-400 dark:hover:text-amber-200",
    },
    urgent: {
      container:
        "bg-orange-50 border-orange-200 dark:bg-orange-950/40 dark:border-orange-800/50",
      icon: "text-orange-600 dark:text-orange-400",
      title: "text-orange-800 dark:text-orange-200",
      message: "text-orange-700 dark:text-orange-300",
      dismiss:
        "text-orange-500 hover:text-orange-700 dark:text-orange-400 dark:hover:text-orange-200",
    },
    danger: {
      container:
        "bg-red-50 border-red-200 dark:bg-red-950/40 dark:border-red-800/50",
      icon: "text-red-600 dark:text-red-400",
      title: "text-red-800 dark:text-red-200",
      message: "text-red-700 dark:text-red-300",
      dismiss:
        "text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200",
    },
  } as const;

  const vs = variantStyles[config.variant];

  return (
    <div
      className={`relative flex items-start gap-3 rounded-xl border px-4 py-3.5 ${vs.container} ${className}`}
      role="alert"
    >
      <div className="flex-shrink-0 mt-0.5">
        <Icon className={`h-5 w-5 ${vs.icon}`} />
      </div>
      <div className="min-w-0 flex-1">
        <p className={`text-sm font-semibold ${vs.title}`}>{config.title}</p>
        <p className={`mt-0.5 text-sm ${vs.message}`}>{config.message}</p>
      </div>
      {config.dismissible && (
        <button
          type="button"
          onClick={handleDismiss}
          className={`flex-shrink-0 rounded-md p-1 transition-colors ${vs.dismiss}`}
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}
