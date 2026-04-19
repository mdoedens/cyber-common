import * as React from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

/**
 * ValueDisplay — the shared primitive for rendering a numeric metric
 * with unit, optional trend indicator, and locale-aware formatting.
 *
 * Used wherever both products need to show a data value that the user
 * should be able to read quickly:
 *  - CyberEMS: energy values (kW, kWh), prices (EUR/kWh), battery SoC (%).
 *  - CyberATP: P&L, positions, bot ROI, fees.
 *
 * The value itself is rendered in monospace (tabular-nums) so digits
 * align vertically in tables and update cleanly without layout shift.
 *
 * See `design-review/DESIGN-REVIEW-2026-04-19.md` section 5 for the full
 * spec.
 */

export type ValueDisplaySize =
  | "hero"    // 48px — dashboard hero metric
  | "large"   // 32px — card primary value
  | "medium"  // 24px — secondary stat
  | "default" // 16px — inline values
  | "small";  // 13px — table cells, tooltips

export type ValueDisplayTone = "neutral" | "positive" | "negative" | "warning";

export interface ValueDisplayTrend {
  /** Signed delta versus the comparison period. */
  delta: number;
  /** Human period label, e.g. "vs gisteren" or "today". */
  period: string;
  /** Optional precision for the delta. Defaults to `precision`. */
  precision?: number;
  /** Optional unit; defaults to parent `unit`. */
  unit?: string;
}

export interface ValueDisplayProps {
  /** The numeric value. Pass `null` to render the no-data em-dash. */
  value: number | null;
  /** Unit string, rendered after the value at 80% size. */
  unit?: string;
  /** Size token — see `ValueDisplaySize`. */
  size?: ValueDisplaySize;
  /** Semantic tone. Default `"neutral"`. */
  tone?: ValueDisplayTone;
  /** Optional trend indicator shown below the value. */
  trend?: ValueDisplayTrend;
  /** Decimal places. Default `1`. */
  precision?: number;
  /** BCP-47 locale for number formatting. Default `"nl-NL"`. */
  locale?: string;
  /** Prefix for the screen-reader announcement. */
  ariaLabelPrefix?: string;
  /** Mark value as stale — shows warning dot + accessible note. */
  stale?: boolean;
  /** ms since last update, surfaced in the stale tooltip. */
  staleTooltip?: string;
  /** Loading skeleton state. */
  loading?: boolean;
  className?: string;
}

const SIZE_CLASSES: Record<ValueDisplaySize, { value: string; unit: string; trend: string }> = {
  hero:    { value: "text-5xl font-semibold",       unit: "text-[38px] font-normal", trend: "text-sm mt-2" },
  large:   { value: "text-[32px] font-semibold",    unit: "text-[26px] font-normal", trend: "text-[13px] mt-1.5" },
  medium:  { value: "text-2xl font-medium",         unit: "text-[19px] font-normal", trend: "text-[13px] mt-1" },
  default: { value: "text-base font-medium",        unit: "text-[13px] font-normal", trend: "text-xs mt-0.5" },
  small:   { value: "text-[13px] font-normal",      unit: "text-[10px] font-normal", trend: "text-xs" },
};

const TONE_CLASSES: Record<ValueDisplayTone, string> = {
  neutral:  "text-slate-900 dark:text-slate-100",
  positive: "text-emerald-600 dark:text-emerald-400",
  negative: "text-red-600 dark:text-red-400",
  warning:  "text-amber-600 dark:text-amber-400",
};

const SKELETON_WIDTH: Record<ValueDisplaySize, string> = {
  hero:    "w-32 h-12",
  large:   "w-24 h-9",
  medium:  "w-20 h-7",
  default: "w-16 h-5",
  small:   "w-12 h-4",
};

function formatNumber(value: number, precision: number, locale: string): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: precision,
    maximumFractionDigits: precision,
  }).format(value);
}

export const ValueDisplay = React.forwardRef<HTMLDivElement, ValueDisplayProps>(
  (
    {
      value,
      unit,
      size = "default",
      tone = "neutral",
      trend,
      precision = 1,
      locale = "nl-NL",
      ariaLabelPrefix,
      stale = false,
      staleTooltip,
      loading = false,
      className = "",
    },
    ref,
  ) => {
    const sizeClass = SIZE_CLASSES[size];
    const toneClass = TONE_CLASSES[tone];

    // Loading state: render skeleton.
    if (loading) {
      return (
        <div
          ref={ref}
          role="status"
          aria-label="Laden"
          aria-busy="true"
          className={["inline-flex flex-col", className].filter(Boolean).join(" ")}
        >
          <div
            className={[
              SKELETON_WIDTH[size],
              "bg-slate-200 dark:bg-slate-700 rounded animate-pulse",
            ].join(" ")}
            data-motion="pulse"
          />
        </div>
      );
    }

    // No-data: em-dash instead of zero to avoid misleading "0".
    if (value === null || Number.isNaN(value)) {
      return (
        <div
          ref={ref}
          className={[
            "inline-flex flex-col font-mono text-slate-400 dark:text-slate-500",
            className,
          ].join(" ")}
          aria-label={`${ariaLabelPrefix ?? ""}: geen gegevens`.trim()}
        >
          <span className={sizeClass.value}>—</span>
        </div>
      );
    }

    const formatted = formatNumber(value, precision, locale);

    // Trend formatting.
    let trendNode: React.ReactNode = null;
    if (trend) {
      const trendPrecision = trend.precision ?? precision;
      const signedDelta = formatNumber(Math.abs(trend.delta), trendPrecision, locale);
      const TrendIcon = trend.delta > 0 ? TrendingUp : trend.delta < 0 ? TrendingDown : Minus;
      const trendTone =
        trend.delta > 0
          ? "text-emerald-600 dark:text-emerald-400"
          : trend.delta < 0
            ? "text-red-600 dark:text-red-400"
            : "text-slate-500 dark:text-slate-400";
      const sign = trend.delta > 0 ? "+" : trend.delta < 0 ? "−" : "";
      const trendUnit = trend.unit ?? unit ?? "";

      trendNode = (
        <div className={["inline-flex items-center gap-1", sizeClass.trend, trendTone].join(" ")}>
          <TrendIcon className="h-3.5 w-3.5" aria-hidden="true" />
          <span className="font-mono tabular-nums">
            {sign}
            {signedDelta}
            {trendUnit ? <span className="ml-0.5 opacity-70">{trendUnit}</span> : null}
          </span>
          <span className="opacity-70">{trend.period}</span>
        </div>
      );
    }

    // Accessible label.
    const trendA11y = trend
      ? `, trend ${trend.delta >= 0 ? "plus" : "min"} ${Math.abs(trend.delta)} ${trend.unit ?? unit ?? ""} ${trend.period}`
      : "";
    const staleA11y = stale ? ", verouderd" : "";
    const a11yLabel = `${ariaLabelPrefix ?? ""}${ariaLabelPrefix ? ": " : ""}${formatted}${unit ? ` ${unit}` : ""}${trendA11y}${staleA11y}`.trim();

    return (
      <div
        ref={ref}
        role="status"
        aria-live="polite"
        aria-label={a11yLabel}
        className={["inline-flex flex-col", className].filter(Boolean).join(" ")}
      >
        <div className={["inline-flex items-baseline gap-1 font-mono tabular-nums", toneClass].join(" ")}>
          {stale && (
            <span
              className="mr-1 inline-block h-2 w-2 rounded-full bg-amber-500"
              aria-hidden="true"
              title={staleTooltip}
            />
          )}
          <span className={sizeClass.value}>{formatted}</span>
          {unit && <span className={[sizeClass.unit, "opacity-70"].join(" ")}>{unit}</span>}
        </div>
        {trendNode}
      </div>
    );
  },
);
ValueDisplay.displayName = "ValueDisplay";
