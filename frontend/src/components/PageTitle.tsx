"use client";

// Sets the dashboard topbar title, then renders nothing. Setting the title
// needs a hook (client-only), so this tiny Client Component lets an otherwise
// server-rendered page set it without becoming a Client Component itself:
//
//   export default async function SchedulePage() {   // Server Component
//     return <><PageTitle title="Schedule" /> …</>;
//   }

import { useEffect } from "react";
import { useDashboardHeader } from "./DashboardHeaderContext";

export default function PageTitle({ title }: { title: string }) {
  const { setTitle } = useDashboardHeader();

  useEffect(() => {
    setTitle(title);
    return () => setTitle("Active Leads");
  }, [title, setTitle]);

  return null;
}
