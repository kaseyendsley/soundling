// The Leads dashboard route. LeadsDashboard is a Client Component that reads
// leads from the store (mock seed + any added by hand), so this page is just a
// thin mount point.

import LeadsDashboard from "@/components/LeadsDashboard";

export default function DashboardPage() {
  return <LeadsDashboard />;
}
