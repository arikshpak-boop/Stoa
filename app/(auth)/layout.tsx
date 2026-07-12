import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Logo } from "@/components/layout/Logo";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col bg-muted">
      <header className="flex h-16 shrink-0 items-center justify-between border-b border-border bg-white px-8">
        <Logo />
        <Link
          href="/"
          className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" aria-hidden="true" />
          Back to Home
        </Link>
      </header>
      <main className="bg-dot-grid flex flex-1 items-center justify-center px-4 py-12">{children}</main>
    </div>
  );
}
