"use client";

// Shares the topbar title between the layout (where the title is shown) and the
// dashboard page (which knows whether we're viewing active or archived leads).
// React Context is the clean way to pass state across that layout↔page boundary.

import { createContext, useContext, useState, type ReactNode } from "react";

type HeaderContext = { title: string; setTitle: (title: string) => void };

const Ctx = createContext<HeaderContext | null>(null);

export function DashboardHeaderProvider({ children }: { children: ReactNode }) {
  const [title, setTitle] = useState("Active Leads");
  return <Ctx.Provider value={{ title, setTitle }}>{children}</Ctx.Provider>;
}

export function useDashboardHeader() {
  const ctx = useContext(Ctx);
  if (!ctx) {
    throw new Error(
      "useDashboardHeader must be used within DashboardHeaderProvider",
    );
  }
  return ctx;
}

/** The topbar title, in the Righteous display font (magenta, like the wordmark). */
export function DashboardTitle() {
  const { title } = useDashboardHeader();
  return (
    <h1 className="font-display text-2xl tracking-wide text-magenta-300">{title}</h1>
  );
}
