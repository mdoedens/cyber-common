"use client";

import * as React from "react";
import { LogIn, LogOut, Settings, User } from "lucide-react";

import type { Session } from "../auth";

type Props = {
  session: Session | null;
  /** Absolute URL to the project's app (e.g. https://app.cyberatp.com). */
  appUrl: string;
  /** i18n-ed "Log in" label (rendered when session is null). */
  tLogin: string;
  /** i18n-ed "Account settings" label (defaults to English). */
  tSettings?: string;
  /** i18n-ed "Log out" label (defaults to English). */
  tLogout?: string;
  /**
   * Colour pair for the avatar gradient (from, to). Defaults to blue-600 → blue-400.
   * Pass brand-appropriate colours per project.
   */
  avatarGradient?: [string, string];
  /**
   * Tailwind classes for the anonymous "Log in" button. Defaults work on a
   * light background; pass a dark-theme variant from the EMS nav.
   */
  anonClassName?: string;
  /** Tailwind classes for the signed-in account pill. */
  signedClassName?: string;
  /**
   * Path to the settings page inside the app (appended to appUrl).
   * Defaults to `/settings`.
   */
  settingsPath?: string;
};

/** Anonymous: "Log in" link. Signed-in: avatar pill with a dropdown for
 *  account settings and logout. */
export function AccountChip({
  session,
  appUrl,
  tLogin,
  tSettings = "Account settings",
  tLogout = "Log out",
  avatarGradient = ["#2563EB", "#60A5FA"],
  anonClassName = "inline-flex items-center gap-1.5 border border-slate-200 text-slate-700 hover:text-slate-900 hover:border-blue-600 rounded-full px-4 py-1.5 text-sm font-medium transition",
  signedClassName = "inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-slate-200 bg-white hover:border-blue-600 transition group",
  settingsPath = "/settings",
}: Props) {
  const [open, setOpen] = React.useState(false);
  const rootRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (!open) return;
    function onDocClick(e: MouseEvent) {
      if (
        rootRef.current &&
        !rootRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
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

  if (!session) {
    return (
      <a href="/login" className={anonClassName}>
        <LogIn className="w-4 h-4" />
        {tLogin}
      </a>
    );
  }
  const name = session.name || session.email || "Account";
  const initial = name.charAt(0).toUpperCase();
  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className={signedClassName}
        title={name}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <span
          className="w-6 h-6 rounded-full text-white text-xs font-bold inline-flex items-center justify-center"
          style={{
            background: `linear-gradient(135deg, ${avatarGradient[0]}, ${avatarGradient[1]})`,
          }}
        >
          {initial}
        </span>
        <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 max-w-[14ch] truncate">
          {name}
        </span>
      </button>
      {open && (
        <div
          role="menu"
          className="absolute right-0 mt-2 min-w-[240px] bg-[var(--color-navy-light,#1a2332)] border border-white/10 rounded-lg shadow-xl z-50 py-1 text-sm"
        >
          {(session.name || session.email) && (
            <div className="px-3 py-2 border-b border-white/10">
              {session.name && (
                <div className="text-white font-medium truncate">
                  {session.name}
                </div>
              )}
              {session.email && (
                <div className="text-slate-400 text-xs truncate">
                  {session.email}
                </div>
              )}
            </div>
          )}
          <a
            href={appUrl}
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2 text-slate-200 hover:bg-white/10 hover:text-white transition"
          >
            <User className="w-4 h-4" />
            Open app
          </a>
          <a
            href={`${appUrl}${settingsPath}`}
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2 text-slate-200 hover:bg-white/10 hover:text-white transition"
          >
            <Settings className="w-4 h-4" />
            {tSettings}
          </a>
          <a
            href="/auth/logout"
            role="menuitem"
            className="flex items-center gap-2 px-3 py-2 text-slate-200 hover:bg-white/10 hover:text-white transition"
          >
            <LogOut className="w-4 h-4" />
            {tLogout}
          </a>
        </div>
      )}
    </div>
  );
}
