"use client";

import * as React from "react";

type Props = {
  permissions: string[];
  requires: string | string[];
  mode?: "all" | "any";
  fallback?: React.ReactNode;
  children: React.ReactNode;
};

/** Render `children` iff the user has the required permissions. */
export function PermissionGate({
  permissions,
  requires,
  mode = "all",
  fallback = null,
  children,
}: Props) {
  const required = Array.isArray(requires) ? requires : [requires];
  if (required.length === 0) return <>{children}</>;

  const set = new Set(permissions);
  const allowed =
    mode === "all"
      ? required.every((p) => set.has(p))
      : required.some((p) => set.has(p));

  return <>{allowed ? children : fallback}</>;
}

/** Pure helper — same logic as the component, callable from event handlers. */
export function hasPermission(
  permissions: string[],
  requires: string | string[],
  mode: "all" | "any" = "all",
): boolean {
  const required = Array.isArray(requires) ? requires : [requires];
  if (required.length === 0) return true;
  const set = new Set(permissions);
  return mode === "all"
    ? required.every((p) => set.has(p))
    : required.some((p) => set.has(p));
}
