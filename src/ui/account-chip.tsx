import * as React from "react";
import { LogIn } from "lucide-react";

import type { Session } from "../auth";

type Props = {
  session: Session | null;
  /** Absolute URL to the project's app (e.g. https://app.cyberatp.com). */
  appUrl: string;
  /** i18n-ed "Log in" label (rendered when session is null). */
  tLogin: string;
  /**
   * Colour pair for the avatar gradient (from, to). Defaults to blue-600 → blue-400.
   * Pass brand-appropriate colours per project.
   */
  avatarGradient?: [string, string];
};

/** Anonymous: "Log in" link. Signed-in: avatar pill linking to the app. */
export function AccountChip({
  session,
  appUrl,
  tLogin,
  avatarGradient = ["#2563EB", "#60A5FA"],
}: Props) {
  if (!session) {
    return (
      <a
        href="/login"
        className="hidden sm:inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900 transition"
      >
        <LogIn className="w-4 h-4" />
        {tLogin}
      </a>
    );
  }
  const name = session.name || session.email || "Account";
  const initial = name.charAt(0).toUpperCase();
  return (
    <a
      href={appUrl}
      className="inline-flex items-center gap-2 pl-1 pr-3 py-1 rounded-full border border-slate-200 bg-white hover:border-blue-600 transition group"
      title={name}
    >
      <span
        className="w-6 h-6 rounded-full text-white text-xs font-bold inline-flex items-center justify-center"
        style={{
          background: `linear-gradient(135deg, ${avatarGradient[0]}, ${avatarGradient[1]})`,
        }}
      >
        {initial}
      </span>
      <span className="text-sm font-medium text-slate-700 group-hover:text-blue-600 max-w-[9ch] truncate">
        {name}
      </span>
    </a>
  );
}
