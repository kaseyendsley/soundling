import { redirect } from "next/navigation";

// The dashboard is the app's home. Send the root URL straight there.
// `redirect()` runs on the server, so there's no flash of an empty page.
export default function Home() {
  redirect("/dashboard");
}
