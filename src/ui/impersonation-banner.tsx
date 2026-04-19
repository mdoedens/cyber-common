"use client";

import * as React from "react";
import { useEffect, useState } from "react";
import { AlertTriangle, LogOut, Loader2 } from "lucide-react";

type Props = {
  actorName: string;
  targetOrgName: string;
  endsAt: string; // ISO datetime
  onEndImpersonation: () => void | Promise<void>;
  className?: string;
};

function formatRemaining(ms: number): string {
  if (ms <= 0) return "expired";
  const totalSec = Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  if (h > 0) return `${h}h ${m}m`;
  if (m > 0) return `${m}m ${s}s`;
  return `${s}s`;
}

/** Top-of-page amber banner shown while an impersonation session is active. */
export function ImpersonationBanner({
  actorName,
  targetOrgName,
  endsAt,
  onEndImpersonation,
  className,
}: Props) {
  const [now, setNow] = useState<number>(() => Date.now());
  const [ending, setEnding] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);

  const endsAtMs = new Date(endsAt).getTime();
  const remaining = endsAtMs - now;
  const expired = remaining <= 0;

  async function end() {
    try {
      setEnding(true);
      await onEndImpersonation();
    } finally {
      setEnding(false);
    }
  }

  return (
    <div
      role="banner"
      aria-live="polite"
      className={
        className ??
        "w-full bg-gradient-to-r from-amber-500 via-orange-500 to-amber-500 text-white shadow-sm"
      }
    >
      <div className="max-w-7xl mx-auto px-4 py-2 flex items-center gap-3 flex-wrap">
        <AlertTriangle
          className="w-4 h-4 flex-shrink-0"
          aria-hidden="true"
        />
        <p className="text-sm flex-1 min-w-0">
          <span className="font-semibold">{actorName}</span>
          <span className="opacity-90"> is impersonating </span>
          <span className="font-semibold">{targetOrgName}</span>
          <span className="opacity-90">
            {" "}
            · {expired ? "session expired" : `ends in ${formatRemaining(remaining)}`}
          </span>
        </p>
        <button
          type="button"
          onClick={end}
          disabled={ending}
          className="inline-flex items-center gap-1.5 bg-white/15 hover:bg-white/25 disabled:opacity-50 transition rounded-md px-3 py-1 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-white/60"
        >
          {ending ? (
            <Loader2 className="w-3.5 h-3.5 animate-spin" />
          ) : (
            <LogOut className="w-3.5 h-3.5" />
          )}
          End impersonation
        </button>
      </div>
    </div>
  );
}
