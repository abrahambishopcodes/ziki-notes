"use client";

import { useState, type ReactNode } from "react";

export const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Replays `animation` each time `value` changes, but not on first render,
 * so counts that are already on the page don't animate on load.
 */
export function OnChange({
  value,
  animation,
  className = "",
  children,
}: {
  value: number | string;
  animation: string;
  className?: string;
  children: ReactNode;
}) {
  const [initial] = useState(value);
  return (
    <span key={value} className={`${className} ${value !== initial ? animation : ""}`}>
      {children}
    </span>
  );
}

/** A count whose digits roll up into place when it changes. */
export function RollingCount({ value }: { value: number }) {
  return (
    <span className="inline-flex overflow-hidden leading-none">
      <OnChange value={value} animation="roll-in" className="inline-block">
        {value}
      </OnChange>
    </span>
  );
}
