"use client";

// An accessible on/off switch for dark mode. It's a <button role="switch">, so
// keyboards (Tab, then Space/Enter) and screen readers ("Dark mode, switch, on")
// work out of the box. Pass the id of the visible label via `labelId`.

import { useEffect, useState } from "react";
import { useTheme } from "next-themes";

export default function ThemeToggle({ labelId }: { labelId: string }) {
  const { resolvedTheme, setTheme } = useTheme();

  // The saved theme lives in localStorage, which the server can't read. So the
  // server (and the browser's first render) can't know whether to draw the
  // switch on or off. We render it "off" and disabled until we've mounted in
  // the browser, then show the real state. Without this, React would warn that
  // the server HTML and the browser HTML don't match (a "hydration mismatch").
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isDark = mounted && resolvedTheme === "dark";

  return (
    <button
      type="button"
      role="switch"
      aria-checked={isDark}
      aria-labelledby={labelId}
      disabled={!mounted}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-magenta-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface focus-visible:outline-none ${
        isDark ? "bg-magenta-600" : "bg-line-strong"
      }`}
    >
      {/* The sliding knob */}
      <span
        aria-hidden
        className={`inline-block h-5 w-5 rounded-full bg-white shadow transition-transform ${
          isDark ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}
