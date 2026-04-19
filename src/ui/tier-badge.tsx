import * as React from "react";
import { Crown, Building2, Store, Home } from "lucide-react";

export type OrgType = "provider" | "distributor" | "reseller" | "customer";

type Props = {
  tier: OrgType;
  size?: "sm" | "md";
  className?: string;
  label?: string;
};

const TIER_META: Record<
  OrgType,
  { Icon: typeof Crown; label: string; classes: string }
> = {
  provider: {
    Icon: Crown,
    label: "Provider",
    classes:
      "bg-indigo-100 text-indigo-700 border-indigo-200 dark:bg-indigo-500/15 dark:text-indigo-300 dark:border-indigo-500/30",
  },
  distributor: {
    Icon: Building2,
    label: "Distributor",
    classes:
      "bg-blue-100 text-blue-700 border-blue-200 dark:bg-blue-500/15 dark:text-blue-300 dark:border-blue-500/30",
  },
  reseller: {
    Icon: Store,
    label: "Reseller",
    classes:
      "bg-teal-100 text-teal-700 border-teal-200 dark:bg-teal-500/15 dark:text-teal-300 dark:border-teal-500/30",
  },
  customer: {
    Icon: Home,
    label: "Customer",
    classes:
      "bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:border-slate-500/30",
  },
};

/** Small color-coded pill for an org_type. */
export function TierBadge({ tier, size = "sm", className, label }: Props) {
  const meta = TIER_META[tier];
  const Icon = meta.Icon;
  const sizing =
    size === "sm"
      ? "text-[10px] px-1.5 py-0.5 gap-1"
      : "text-xs px-2 py-1 gap-1.5";
  const iconSize = size === "sm" ? "w-3 h-3" : "w-3.5 h-3.5";
  return (
    <span
      className={`inline-flex items-center rounded-full border font-medium ${sizing} ${meta.classes} ${className ?? ""}`}
    >
      <Icon className={iconSize} aria-hidden="true" />
      <span>{label ?? meta.label}</span>
    </span>
  );
}

export { TIER_META };
