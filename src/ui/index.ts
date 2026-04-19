export { FlagNL, FlagUS } from "./flags";
export { LanguageSwitcher } from "./language-switcher";
export { AccountChip } from "./account-chip";

// Multi-tenancy primitives (v0.2.0).
export { TierBadge } from "./tier-badge";
export type { OrgType } from "./tier-badge";

export { OrgSwitcher } from "./org-switcher";
export type { Org } from "./org-switcher";

export { ContextSwitcher } from "./context-switcher";
export { ImpersonationBanner } from "./impersonation-banner";
export { PermissionGate, hasPermission } from "./permission-gate";
export { PlanUpgradeModal } from "./plan-upgrade-modal";

// Shared design-system primitives (v0.3.0).
export { Button } from "./button";
export type { ButtonProps, ButtonVariant, ButtonSize } from "./button";

export { ValueDisplay } from "./value-display";
export type {
  ValueDisplayProps,
  ValueDisplaySize,
  ValueDisplayTone,
  ValueDisplayTrend,
} from "./value-display";
