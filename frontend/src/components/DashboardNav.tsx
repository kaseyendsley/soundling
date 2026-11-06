"use client";

// The dashboard nav links. A Client Component so it can read the current URL
// (usePathname) and highlight whichever section you're on. Rendered in two
// variants: the md+ sidebar and the mobile top bar.

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = { label: string; href: string; disabled?: boolean };
const NAV_ITEMS: NavItem[] = [
  { label: "Leads", href: "/dashboard" },
  { label: "Add Lead", href: "/dashboard/leads/new" },
  { label: "Schedule", href: "#", disabled: true },
  { label: "Sources", href: "#", disabled: true },
];

function isActive(href: string, pathname: string) {
  if (href === "/dashboard") {
    // The Leads section covers the dashboard and individual lead detail pages,
    // but not the dedicated "Add lead" page.
    return (
      pathname === "/dashboard" ||
      (pathname.startsWith("/dashboard/leads/") &&
        pathname !== "/dashboard/leads/new")
    );
  }
  return pathname === href;
}

type State = "active" | "link" | "disabled";
function navItemClass(state: State, variant: "sidebar" | "mobile") {
  const base =
    variant === "sidebar"
      ? "rounded-full px-4 py-2.5 text-sm"
      : "shrink-0 rounded-full px-3.5 py-1.5 text-sm";
  // Styled for the dark plum chrome. The active item gets a magenta dot (::before).
  if (state === "active")
    return `${base} bg-plum-800 font-semibold text-white before:mr-2.5 before:inline-block before:h-1.5 before:w-1.5 before:rounded-full before:bg-magenta-400 before:align-middle`;
  if (state === "link")
    return `${base} font-medium text-plum-200 hover:bg-plum-800/60 hover:text-white`;
  return `${base} cursor-default font-medium text-plum-500`;
}

export default function DashboardNav({
  variant,
}: {
  variant: "sidebar" | "mobile";
}) {
  const pathname = usePathname();
  return (
    <nav
      className={
        variant === "sidebar"
          ? "flex flex-col gap-1 px-3"
          : "mt-3 flex gap-2 overflow-x-auto"
      }
    >
      {NAV_ITEMS.map((item) => {
        const state: State = item.disabled
          ? "disabled"
          : isActive(item.href, pathname)
            ? "active"
            : "link";
        return (
          <Link
            key={item.label}
            href={item.href}
            aria-disabled={item.disabled}
            className={navItemClass(state, variant)}
          >
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}
