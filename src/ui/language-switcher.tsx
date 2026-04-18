"use client";

import * as React from "react";
import { useEffect, useRef, useState, useTransition } from "react";
import { ChevronDown } from "lucide-react";

import { LOCALE_COOKIE, type Locale } from "../i18n";
import { FlagNL, FlagUS } from "./flags";

type Props = {
  /** Locale that's active right now. Comes from the server (getLocale). */
  currentLocale: Locale;
  /**
   * Optional Tailwind classes to theme the trigger button.
   * Defaults to a neutral light-background pill.
   */
  triggerClassName?: string;
  menuClassName?: string;
};

const FLAGS: Record<Locale, { Flag: typeof FlagUS; label: string }> = {
  en: { Flag: FlagUS, label: "English" },
  nl: { Flag: FlagNL, label: "Nederlands" },
};

/** Dropdown language selector: current flag + chevron; click opens a list
 *  of the other locales. Writes NEXT_LOCALE cookie and reloads. */
export function LanguageSwitcher({
  currentLocale,
  triggerClassName,
  menuClassName,
}: Props) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
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
  }, []);

  function pick(locale: Locale) {
    setOpen(false);
    if (locale === currentLocale) return;
    startTransition(() => {
      const oneYear = 60 * 60 * 24 * 365;
      document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=${oneYear}; samesite=lax`;
      window.location.reload();
    });
  }

  const Current = FLAGS[currentLocale].Flag;
  const others = (Object.keys(FLAGS) as Locale[]).filter(
    (l) => l !== currentLocale,
  );

  return (
    <div ref={rootRef} className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={isPending}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label={`Language: ${FLAGS[currentLocale].label}`}
        className={
          triggerClassName ??
          "inline-flex items-center gap-1.5 border border-slate-200 rounded-md px-2 py-1.5 hover:border-blue-600 transition disabled:opacity-50"
        }
      >
        <Current />
        <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
      </button>
      {open && (
        <ul
          role="listbox"
          className={
            menuClassName ??
            "absolute right-0 mt-2 min-w-[140px] bg-white border border-slate-200 rounded-lg shadow-lg z-50 py-1"
          }
        >
          {others.map((l) => {
            const F = FLAGS[l].Flag;
            return (
              <li key={l}>
                <button
                  type="button"
                  role="option"
                  aria-selected={false}
                  onClick={() => pick(l)}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50 transition"
                >
                  <F />
                  <span>{FLAGS[l].label}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
