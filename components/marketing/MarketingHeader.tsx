import Link from "next/link";
import { ChevronDown, Search } from "lucide-react";
import { Logo } from "@/components/layout/Logo";
import { Button } from "@/components/ui/button";

const MENUS = [
  {
    label: "Solutions",
    items: [
      { href: "#solutions", label: "Warranty & Indemnity", hint: "Buy-side and sell-side R&W cover" },
      { href: "#solutions", label: "Tax Liability", hint: "Ring-fence an identified tax exposure" },
      { href: "#solutions", label: "Contingent Risk", hint: "Isolate a known, quantifiable issue" },
      { href: "#solutions", label: "Litigation Buyout", hint: "Transfer legacy claims off the balance sheet" },
    ],
  },
  {
    label: "Industries",
    items: [
      { href: "#solutions", label: "Technology & SaaS", hint: "IP, revenue recognition, data privacy" },
      { href: "#solutions", label: "Healthcare & Life Sciences", hint: "Regulatory and reimbursement risk" },
      { href: "#solutions", label: "Industrials & Manufacturing", hint: "Environmental and product liability" },
      { href: "#solutions", label: "Financial Services", hint: "Licensing, conduct, and capital adequacy" },
    ],
  },
];

export function MarketingHeader() {
  return (
    <>
      {/* Xometry-style announcement rail: one message, one link, always the same next step. */}
      <div className="bg-accent text-center text-sm text-white">
        <div className="container-page flex flex-wrap items-center justify-center gap-x-2 gap-y-1 py-3">
          <span>From data room to bound policy in under 7 days.</span>
          <Link href="/contact" className="font-semibold underline underline-offset-2 hover:text-white">
            Start your first deal
          </Link>
        </div>
      </div>

      <header className="sticky top-0 z-40 border-b border-border bg-white">
        <div className="container-page flex h-[76px] items-center justify-between gap-6">
          <div className="flex items-center gap-8">
            <Logo />
            <nav className="hidden items-center gap-1 lg:flex">
              {MENUS.map((menu) => (
                <div key={menu.label} className="group relative">
                  <button
                    type="button"
                    className="flex items-center gap-1 rounded-full px-3 py-2 text-[15px] font-medium text-primary transition-colors hover:text-accent"
                  >
                    {menu.label}
                    <ChevronDown className="h-3.5 w-3.5 transition-transform group-hover:rotate-180" aria-hidden="true" />
                  </button>
                  <div className="invisible absolute left-0 top-full z-50 w-[340px] translate-y-1 rounded-lg border border-border bg-white p-2 opacity-0 shadow-lift transition-all duration-150 group-hover:visible group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:visible group-focus-within:translate-y-0 group-focus-within:opacity-100">
                    {menu.items.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className="block rounded-md px-3 py-3 transition-colors hover:bg-accent-tint"
                      >
                        <span className="block text-sm font-semibold text-primary">{item.label}</span>
                        <span className="mt-0.5 block text-xs text-muted-foreground">{item.hint}</span>
                      </Link>
                    ))}
                  </div>
                </div>
              ))}
              <Link
                href="/signup"
                className="rounded-full px-3 py-2 text-[15px] font-medium text-primary transition-colors hover:text-accent"
              >
                Get Started
              </Link>
              <span className="ml-1 flex h-9 w-9 items-center justify-center rounded-md text-muted-foreground" aria-hidden="true">
                <Search className="h-4 w-4" />
              </span>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <Button variant="outline" className="hidden sm:inline-flex" asChild>
              <Link href="/login">Sign In</Link>
            </Button>
            <Button asChild>
              <Link href="/contact">Get Instant Terms</Link>
            </Button>
          </div>
        </div>
      </header>
    </>
  );
}
