// Lead detail route. Thin Server Component: it resolves the id and hands off to
// the LeadDetail Client Component, which reads the lead from the store (so it
// can show localStorage-added leads the server can't see).

import LeadDetail from "@/components/LeadDetail";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <LeadDetail id={id} />;
}
