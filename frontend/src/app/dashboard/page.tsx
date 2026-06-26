// The Leads dashboard route. Thin Server Component: it provides the data and
// hands it to LeadsDashboard, the Client Component that owns all interactive
// state (archive toggling, active/archived view, stats, search, sort, filters).

import LeadsDashboard from "@/components/LeadsDashboard";
import { MOCK_LEADS } from "@/lib/mock-leads";

export default function DashboardPage() {
  return <LeadsDashboard leads={MOCK_LEADS} />;
}
