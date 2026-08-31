import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-white">
      <header className="flex h-[68px] shrink-0 items-center justify-between border-b border-border bg-white px-8">
        <Logo />
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-semibold text-muted-foreground transition-colors hover:text-accent"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Home
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center bg-band-mist px-4 py-14">{children}</main>
    </div>
  );
}
