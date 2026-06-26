// Persistent chrome for every screen under /dashboard.
// This is a Server Component (no "use client") — it's static structure, so it
// renders on the server and ships no client JavaScript. Only `children` (the
// individual page) changes as you navigate; the sidebar + header stay mounted.

import Link from "next/link";

// Nav items. Only "Leads" is wired up today; the rest are placeholders that
// telegraph where the app is headed (and keep the layout honest about scope).
const NAV_ITEMS = [
  { label: "Leads", href: "/dashboard", active: true },
  { label: "Schedule", href: "#", active: false },
  { label: "Sources", href: "#", active: false },
  { label: "Settings", href: "#", active: false },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="flex w-60 flex-col border-r border-gray-200 bg-white">
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <span className="text-lg font-semibold tracking-tight">Soundling</span>
        </div>
        <nav className="flex flex-col gap-1 p-3">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.label}
              href={item.href}
              aria-disabled={!item.active}
              className={
                item.active
                  ? "rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-900"
                  : "cursor-default rounded-md px-3 py-2 text-sm font-medium text-gray-400"
              }
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-gray-200 p-4 text-xs text-gray-400">
          Lead generation for music licensing
        </div>
      </aside>

      {/* Main column: top header bar + the page content */}
      <div className="flex flex-1 flex-col">
        <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-8">
          <h1 className="text-base font-semibold">Leads</h1>
          <span className="text-sm text-gray-500">Kasey</span>
        </header>
        <main className="flex-1 p-8">{children}</main>
      </div>
    </div>
  );
}
