/** Inline SVG flags. No font/emoji dependency — render everywhere. */
import * as React from "react";

type FlagProps = { className?: string };

export function FlagUS({ className = "w-6 h-4" }: FlagProps) {
  return (
    <svg viewBox="0 0 60 40" className={className} aria-hidden>
      {Array.from({ length: 13 }).map((_, i) => (
        <rect
          key={i}
          x={0}
          y={(i * 40) / 13}
          width={60}
          height={40 / 13}
          fill={i % 2 === 0 ? "#B22234" : "#ffffff"}
        />
      ))}
      <rect width={24} height={(40 * 7) / 13} fill="#3C3B6E" />
      {Array.from({ length: 5 }).map((_, r) =>
        Array.from({ length: 6 }).map((_, c) => (
          <circle
            key={`${r}-${c}`}
            cx={2 + c * 4 + (r % 2) * 2}
            cy={2.5 + r * 4.3}
            r={0.9}
            fill="#ffffff"
          />
        )),
      )}
    </svg>
  );
}

export function FlagNL({ className = "w-6 h-4" }: FlagProps) {
  return (
    <svg viewBox="0 0 60 40" className={className} aria-hidden>
      <rect width="60" height="13.33" y="0" fill="#AE1C28" />
      <rect width="60" height="13.33" y="13.33" fill="#fff" />
      <rect width="60" height="13.33" y="26.67" fill="#21468B" />
    </svg>
  );
}
