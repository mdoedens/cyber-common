"use client";

import * as React from "react";
import { useEffect, useRef, useState } from "react";
import { ChevronDown, Check } from "lucide-react";

import { TierBadge, TIER_META, type OrgType } from "./tier-badge";

type Props = {
  availableTiers: OrgType[];
  activeTier: OrgType;
  onSwitchTier: (tier: OrgType) => void;
  tierLabels?: Partial<Record<OrgType, string>>;
  triggerClassName?: string;
  menuClassName?: string;
};

/** Lets a multi-tier user switch panel context without switching org.
 *  Hidden entirely when only one tier is available. */
export function ContextSwitcher({
  availableTiers,
  activeTier,
  onSwitchTier,
  tierLabels,
  triggerClassName,
  menuClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (!rootRef.current?.contains(e.target as Node)) setOpen(false);
    }
    function onEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onDocClick);
    document.addEventListener("keydown", onEsc);
    return () => {
      document.removeEventListener("mousedown", onDocClick);
      document.removeEventListener("keydown", onEsc);
    };
  }, [open]);

  if (availableTiers.length <= 1) return null;

  const triggerCls =
    triggerClassName ??
    "inline-flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-700 rounded-md px-2 py-1 hover:border-[var(--color-brand-500,#2563EB)] transition";
  const menuCls =
    menuClassName ??
    "absolute left-0 mt-2 min-w-[200px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 py-1";

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Panel context: ${TIER_META[activeTier].label}`}
        className={triggerCls}
      >
        <span className="text-slate-400 dark:text-slate-500">View as</span>
        <TierBadge tier={activeTier} label={tierLabels?.[activeTier]} />
        <ChevronDown className="w-3 h-3 text-slate-400" />
      </button>
      {open && (
        <ul role="listbox" aria-label="Panel contexts" className={menuCls}>
          {availableTiers.map((tier) => {
            const isActive = tier === activeTier;
            return (
              <li key={tier}>
                <button
                  type="button"
                  role="option"
                  aria-selected={isActive}
                  onClick={() => {
                    setOpen(false);
                    if (!isActive) onSwitchTier(tier);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-sm transition ${
                    isActive
                      ? "bg-slate-50 dark:bg-slate-800/60"
                      : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                  } focus:outline-none focus:bg-slate-100 dark:focus:bg-slate-800`}
                >
                  <TierBadge tier={tier} label={tierLabels?.[tier]} />
                  <span className="flex-1" />
                  {isActive && (
                    <Check className="w-4 h-4 text-emerald-500" />
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
