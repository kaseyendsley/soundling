// Settings route. SettingsPanel is a Client Component (it uses the theme hook
// and sets the topbar title), so this page is just a mount point.

import SettingsPanel from "@/components/SettingsPanel";

export default function SettingsPage() {
  return <SettingsPanel />;
}
