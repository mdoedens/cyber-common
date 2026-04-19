import * as React from "react";
import { Loader2 } from "lucide-react";

/**
 * Shared Button — matches DESIGN-SYSTEM.md section 4.1.
 *
 * Themes via each app's `--color-brand-*` tokens: CyberATP renders blue,
 * CyberEMS renders teal from the same component. Never reference a
 * specific brand shade in consumer code — use the `variant` prop.
 *
 * Sizes follow spec heights: sm=32, md=40, lg=48. Radii: sm=6, md=8,
 * lg=10. Focus ring is WCAG 2.1 AA (handled globally by a11y.css).
 */

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "sm" | "md" | "lg";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  leadingIcon?: React.ReactNode;
  trailingIcon?: React.ReactNode;
}

const VARIANT_CLASSES: Record<ButtonVariant, string> = {
  primary:
    "bg-brand-600 text-white hover:bg-brand-500 active:bg-brand-700 shadow-sm",
  secondary:
    "bg-transparent text-brand-600 border border-brand-600 hover:bg-brand-50 active:bg-brand-100 dark:text-brand-400 dark:border-brand-400 dark:hover:bg-brand-500/10",
  ghost:
    "bg-transparent text-slate-600 hover:bg-slate-100 hover:text-slate-900 active:bg-slate-200 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-slate-100",
  danger:
    "bg-red-500 text-white hover:bg-red-400 active:bg-red-600 shadow-sm",
};

const SIZE_CLASSES: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-[13px] rounded-md gap-1.5",   // 32px, 12px pad, radius 6
  md: "h-10 px-5 text-sm rounded-lg gap-2",        // 40px, 20px pad, radius 8
  lg: "h-12 px-7 text-base rounded-[10px] gap-2",  // 48px, 28px pad, radius 10
};

const ICON_SIZE: Record<ButtonSize, string> = {
  sm: "[&>svg]:h-4 [&>svg]:w-4",   // 16px
  md: "[&>svg]:h-5 [&>svg]:w-5",   // 20px
  lg: "[&>svg]:h-5 [&>svg]:w-5",   // 20px
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant = "primary",
      size = "md",
      loading = false,
      leadingIcon,
      trailingIcon,
      disabled,
      className = "",
      children,
      type = "button",
      ...rest
    },
    ref,
  ) => {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        type={type}
        disabled={isDisabled}
        aria-busy={loading || undefined}
        className={[
          "inline-flex items-center justify-center font-semibold",
          "transition-colors duration-150 ease-out",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          "active:scale-[0.98]",
          VARIANT_CLASSES[variant],
          SIZE_CLASSES[size],
          ICON_SIZE[size],
          className,
        ]
          .filter(Boolean)
          .join(" ")}
        {...rest}
      >
        {loading ? (
          <Loader2 className="animate-spin" aria-hidden="true" />
        ) : (
          leadingIcon
        )}
        {children}
        {!loading && trailingIcon}
      </button>
    );
  },
);
Button.displayName = "Button";
