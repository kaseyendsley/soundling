import type { Metadata } from "next";
import { Poppins, Righteous } from "next/font/google";
import "./globals.css";
import QueryProvider from "./QueryProvider";
import ThemeProvider from "./ThemeProvider";

// Poppins: clean rounded geometric sans for all UI text.
const poppins = Poppins({
  variable: "--font-poppins",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

// Righteous: retro display face, used sparingly for the wordmark + key headings.
const righteous = Righteous({
  variable: "--font-righteous",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Soundling",
  description: "Lead generation for music licensing — discover new venues early.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // suppressHydrationWarning: next-themes adds class="dark" to <html> before
    // React loads, so the server's <html> and the browser's legitimately
    // differ. This silences that one expected mismatch (it only applies to
    // this element's own attributes, not its children).
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${poppins.variable} ${righteous.variable} antialiased`}
      >
        <ThemeProvider>
          <QueryProvider>{children}</QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
