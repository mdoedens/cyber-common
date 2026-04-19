"use client";

import * as React from "react";
import { useEffect, useRef } from "react";
import { X, Sparkles, ArrowRight } from "lucide-react";

type Props = {
  open: boolean;
  onClose: () => void;
  feature: string;
  currentPlan: string;
  upgradeUrl: string;
  title?: string;
  description?: string;
  ctaLabel?: string;
  cancelLabel?: string;
};

/** Modal shown when an action requires a plan feature the org doesn't have
 *  (typically in response to an HTTP 402 from the API). */
export function PlanUpgradeModal({
  open,
  onClose,
  feature,
  currentPlan,
  upgradeUrl,
  title = "Upgrade required",
  description,
  ctaLabel = "View upgrade options",
  cancelLabel = "Not now",
}: Props) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const ctaRef = useRef<HTMLAnchorElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", onKey);
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    // Focus the primary CTA once mounted.
    const t = window.setTimeout(() => ctaRef.current?.focus(), 0);
    return () => {
      document.removeEventListener("keydown", onKey);
      document.body.style.overflow = prevOverflow;
      window.clearTimeout(t);
    };
  }, [open, onClose]);

  if (!open) return null;

  const defaultDesc =
    description ??
    `Your current plan (${currentPlan}) doesn't include "${feature}". Upgrade to unlock it.`;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="plan-upgrade-title"
      aria-describedby="plan-upgrade-desc"
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
    >
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        ref={dialogRef}
        className="relative w-full max-w-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl shadow-2xl overflow-hidden"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 p-1.5 rounded-md text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500,#2563EB)]"
        >
          <X className="w-4 h-4" />
        </button>
        <div className="p-6">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-[var(--color-brand-100,#DBEAFE)] dark:bg-[var(--color-brand-500,#2563EB)]/15 text-[var(--color-brand-600,#2563EB)] mb-4">
            <Sparkles className="w-5 h-5" />
          </div>
          <h2
            id="plan-upgrade-title"
            className="text-lg font-semibold text-slate-900 dark:text-slate-100"
          >
            {title}
          </h2>
          <p
            id="plan-upgrade-desc"
            className="mt-2 text-sm text-slate-600 dark:text-slate-400"
          >
            {defaultDesc}
          </p>
          <div className="mt-4 rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 px-3 py-2 text-xs text-slate-600 dark:text-slate-400">
            <div className="flex items-center justify-between">
              <span>Feature</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {feature}
              </span>
            </div>
            <div className="flex items-center justify-between mt-1">
              <span>Current plan</span>
              <span className="font-medium text-slate-800 dark:text-slate-200">
                {currentPlan}
              </span>
            </div>
          </div>
          <div className="mt-6 flex items-center justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 text-sm font-medium text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-slate-100 transition focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500,#2563EB)] rounded-md"
            >
              {cancelLabel}
            </button>
            <a
              ref={ctaRef}
              href={upgradeUrl}
              className="inline-flex items-center gap-1.5 px-4 py-2 text-sm font-semibold text-white bg-[var(--color-brand-600,#2563EB)] hover:bg-[var(--color-brand-700,#1D4ED8)] rounded-md transition focus:outline-none focus:ring-2 focus:ring-[var(--color-brand-500,#2563EB)] focus:ring-offset-2"
            >
              {ctaLabel}
              <ArrowRight className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
