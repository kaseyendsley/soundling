"use client";

// Light/dark theme, powered by next-themes. Under the hood it:
//   1. injects a tiny <script> into <head> that reads the saved choice from
//      localStorage and adds `class="dark"` to <html> BEFORE the first paint —
//      so there's no flash of the wrong theme on load;
//   2. saves the choice to localStorage whenever it changes;
//   3. sets `color-scheme` on <html>, so native controls (date pickers, select
//      menus, scrollbars) also render dark;
//   4. exposes `useTheme()` so any component (e.g. the Settings toggle) can read
//      and change the theme.
// Light is the default. `enableSystem={false}` ignores the OS setting for now —
// flip it on later to offer a "System" option. (If we ever add color
// transitions app-wide, add `disableTransitionOnChange` so a theme switch
// doesn't animate every element at once.)

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ReactNode } from "react";

export default function ThemeProvider({ children }: { children: ReactNode }) {
  return (
    <NextThemesProvider
      attribute="class"
      defaultTheme="light"
      enableSystem={false}
    >
      {children}
    </NextThemesProvider>
  );
}
