"use client";

import * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import { ChevronDown, Plus, Check, Loader2 } from "lucide-react";

import { TierBadge, TIER_META, type OrgType } from "./tier-badge";

export type Org = {
  membership_id: string;
  organization_id: string;
  organization_name: string;
  organization_slug: string;
  org_type: OrgType;
  role_slug: string | null;
  role_display_name: string | null;
  last_active_at: string | null;
  /** Unaccepted invites have this as null. */
  accepted_at?: string | null;
};

type Props = {
  memberships: Org[];
  activeOrgId: string;
  onSwitch: (orgId: string) => void | Promise<void>;
  onCreateOrg?: () => void;
  triggerClassName?: string;
  menuClassName?: string;
  tierLabels?: Partial<Record<OrgType, string>>;
};

const TIER_ORDER: OrgType[] = [
  "provider",
  "distributor",
  "reseller",
  "customer",
];

/** Dropdown listing all accepted memberships, grouped by org_type. */
export function OrgSwitcher({
  memberships,
  activeOrgId,
  onSwitch,
  onCreateOrg,
  triggerClassName,
  menuClassName,
  tierLabels,
}: Props) {
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [focusIdx, setFocusIdx] = useState<number>(-1);
  const rootRef = useRef<HTMLDivElement>(null);
  const itemRefs = useRef<Array<HTMLButtonElement | null>>([]);

  const accepted = useMemo(
    () => memberships.filter((m) => m.accepted_at !== null),
    [memberships],
  );
  const pendingInvites = useMemo(
    () => memberships.filter((m) => m.accepted_at === null).length,
    [memberships],
  );

  const active = useMemo(
    () => accepted.find((m) => m.organization_id === activeOrgId) ?? null,
    [accepted, activeOrgId],
  );

  const grouped = useMemo(() => {
    const groups: Record<OrgType, Org[]> = {
      provider: [],
      distributor: [],
      reseller: [],
      customer: [],
    };
    for (const m of accepted) groups[m.org_type].push(m);
    return TIER_ORDER.map((tier) => ({ tier, orgs: groups[tier] })).filter(
      (g) => g.orgs.length > 0,
    );
  }, [accepted]);

  /** Flat list of orgs in display order — used for keyboard nav. */
  const flat = useMemo(
    () => grouped.flatMap((g) => g.orgs),
    [grouped],
  );

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

  useEffect(() => {
    if (open && focusIdx >= 0) {
      itemRefs.current[focusIdx]?.focus();
    }
  }, [open, focusIdx]);

  async function pick(org: Org) {
    if (org.organization_id === activeOrgId) {
      setOpen(false);
      return;
    }
    try {
      setPendingId(org.organization_id);
      await onSwitch(org.organization_id);
      setOpen(false);
    } finally {
      setPendingId(null);
    }
  }

  function onListKeyDown(e: React.KeyboardEvent) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setFocusIdx((i) => Math.min(flat.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setFocusIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Home") {
      e.preventDefault();
      setFocusIdx(0);
    } else if (e.key === "End") {
      e.preventDefault();
      setFocusIdx(flat.length - 1);
    }
  }

  const triggerCls =
    triggerClassName ??
    "inline-flex items-center gap-2 border border-slate-200 dark:border-slate-700 rounded-md px-3 py-1.5 text-sm bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 hover:border-[var(--color-brand-500,#2563EB)] transition disabled:opacity-50";
  const menuCls =
    menuClassName ??
    "absolute left-0 mt-2 min-w-[280px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 py-1 max-h-[420px] overflow-y-auto";

  const hasOrgs = accepted.length > 0;

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => {
          setOpen((o) => !o);
          setFocusIdx(-1);
        }}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={
          active
            ? `Active organization: ${active.organization_name}`
            : "Select organization"
        }
        className={triggerCls}
      >
        {active ? (
          <>
            <span className="font-medium truncate max-w-[14ch]">
              {active.organization_name}
            </span>
            {active.role_display_name && (
              <span className="text-xs text-slate-500 dark:text-slate-400">
                · {active.role_display_name}
              </span>
            )}
            <TierBadge
              tier={active.org_type}
              label={tierLabels?.[active.org_type]}
            />
          </>
        ) : (
          <span className="text-slate-500 dark:text-slate-400">
            {hasOrgs ? "Select organization" : "No organizations"}
          </span>
        )}
        {pendingInvites > 0 && (
          <span
            className="inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-[10px] font-semibold rounded-full bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300"
            title={`${pendingInvites} pending invite${pendingInvites === 1 ? "" : "s"}`}
          >
            {pendingInvites}
          </span>
        )}
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>

      {open && (
        <div
          role="listbox"
          aria-label="Organizations"
          className={menuCls}
          onKeyDown={onListKeyDown}
        >
          {!hasOrgs ? (
            <div className="px-4 py-6 text-sm text-center text-slate-500 dark:text-slate-400">
              No organizations yet
            </div>
          ) : (
            grouped.map((group) => {
              const tierLabel =
                tierLabels?.[group.tier] ?? TIER_META[group.tier].label;
              return (
                <div key={group.tier} className="py-1">
                  <div className="px-3 py-1 text-[10px] uppercase tracking-wide font-semibold text-slate-400 dark:text-slate-500">
                    {tierLabel}
                  </div>
                  {group.orgs.map((org) => {
                    const idx = flat.indexOf(org);
                    const isActive = org.organization_id === activeOrgId;
                    const isPending = pendingId === org.organization_id;
                    return (
                      <button
                        key={org.membership_id}
                        ref={(el) => {
                          itemRefs.current[idx] = el;
                        }}
                        type="button"
                        role="option"
                        aria-selected={isActive}
                        disabled={isPending}
                        onClick={() => pick(org)}
                        className={`w-full flex items-center gap-2 px-3 py-2 text-sm text-left transition ${
                          isActive
                            ? "bg-slate-50 dark:bg-slate-800/60"
                            : "hover:bg-slate-50 dark:hover:bg-slate-800/60"
                        } focus:outline-none focus:bg-slate-100 dark:focus:bg-slate-800`}
                      >
                        <span className="flex-1 min-w-0">
                          <span className="block truncate font-medium text-slate-800 dark:text-slate-100">
                            {org.organization_name}
                          </span>
                          {org.role_display_name && (
                            <span className="block text-xs text-slate-500 dark:text-slate-400 truncate">
                              {org.role_display_name}
                            </span>
                          )}
                        </span>
                        <TierBadge
                          tier={org.org_type}
                          label={tierLabels?.[org.org_type]}
                        />
                        {isPending ? (
                          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                        ) : isActive ? (
                          <Check className="w-4 h-4 text-emerald-500" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              );
            })
          )}
          {onCreateOrg && (
            <div className="border-t border-slate-200 dark:border-slate-700 mt-1">
              <button
                type="button"
                onClick={() => {
                  setOpen(false);
                  onCreateOrg();
                }}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-[var(--color-brand-600,#2563EB)] hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
              >
                <Plus className="w-4 h-4" />
                Create organization
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
