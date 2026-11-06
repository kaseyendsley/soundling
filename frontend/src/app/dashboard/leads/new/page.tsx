// Add-lead route. The form is a Client Component (it holds form state and
// writes to the store), so this page is just a mount point.

import AddLeadForm from "@/components/AddLeadForm";

export default function NewLeadPage() {
  return <AddLeadForm />;
}
