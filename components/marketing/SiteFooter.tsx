import Link from "next/link";
import { Logo } from "@/components/layout/Logo";

const COLUMNS = [
  {
    title: "Solutions",
    links: [
      { label: "Warranty & Indemnity", href: "#solutions" },
      { label: "Tax Liability", href: "#solutions" },
      { label: "Contingent Risk", href: "#solutions" },
      { label: "Litigation Buyout", href: "#solutions" },
    ],
  },
  {
    title: "For Deal Makers",
    links: [
      { label: "Start a Submission", href: "/signup?role=Broker" },
      { label: "Deal Portfolio", href: "/deals" },
      { label: "How It Works", href: "#process" },
      { label: "Document Checklist", href: "#process" },
    ],
  },
  {
    title: "For Carriers",
    links: [
      { label: "Join the Panel", href: "/signup?role=Carrier" },
      { label: "Deal Marketplace", href: "/marketplace" },
      { label: "Underwriting Workspace", href: "/marketplace" },
      { label: "Bid Standards", href: "#platform" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "Security & Compliance", href: "#trust" },
      { label: "Audit Trail", href: "#why" },
      { label: "News & Views", href: "#proof" },
      { label: "Contact", href: "/signup" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="bg-primary text-white">
      <div className="container-page py-14">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-2 lg:grid-cols-[1.2fr_repeat(4,1fr)]">
          <div>
            <Logo dark={false} />
            <p className="mt-5 max-w-xs text-sm leading-relaxed text-white/60">
              Institutional-grade infrastructure for M&amp;A warranty &amp; indemnity insurance — one verified
              submission, comparable carrier bids, a cryptographically auditable record.
            </p>
          </div>
          {COLUMNS.map((column) => (
            <div key={column.title}>
              <h3 className="text-xs font-bold uppercase tracking-[0.14em] text-white">{column.title}</h3>
              <ul className="mt-4 space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-sm text-white/60 transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-3 border-t border-white/10 pt-6 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 Stoa. Institutional-grade M&amp;A insurance infrastructure.</p>
          <p className="max-w-2xl sm:text-right">
            Stoa operates a technology marketplace and is not the risk carrier. Cover is written by the licensed
            insurers on the panel. Nothing on this page is an offer of insurance or a quotation.
          </p>
        </div>
      </div>
    </footer>
  );
}
