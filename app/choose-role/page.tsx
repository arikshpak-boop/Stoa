import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { getServerSession } from "@/lib/get-session";
import { roleHomePath } from "@/lib/session";
import { Logo } from "@/components/layout/Logo";
import { SignOutButton } from "@/components/layout/SignOutButton";
import { ChooseRoleContent } from "@/components/auth/ChooseRoleContent";

export default function ChooseRolePage() {
  const session = getServerSession();

  if (!session) {
    redirect("/login?next=/choose-role");
  }

  if (session.role !== "Admin") {
    redirect(roleHomePath(session.role));
  }

  return (
    <div className="min-h-screen bg-muted">
      <header className="flex h-14 items-center justify-between border-b border-border bg-white px-6">
        <Link href="/login" className="flex items-center gap-1.5 text-sm font-medium text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Login
        </Link>
        <Logo />
        <SignOutButton variant="light" />
      </header>

      <ChooseRoleContent organizationName={session.organizationName} />
    </div>
  );
}
