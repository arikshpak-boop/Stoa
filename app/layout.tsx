import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Stoa | Institutional W&I Insurance Marketplace",
  description: "The institutional-grade marketplace connecting M&A dealmakers with warranty & indemnity underwriters.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
