import { redirect } from "next/navigation";
import { getServerSession } from "@/lib/get-session";
import { roleHomePath } from "@/lib/session";
import { TopNav } from "@/components/layout/TopNav";
import { Sidebar } from "@/components/layout/Sidebar";

export default function BrokerLayout({ children }: { children: React.ReactNode }) {
  const session = getServerSession();

  if (!session) {
    redirect("/login?next=/deals");
  }

  if (session.role !== "Broker" && session.role !== "Admin") {
    redirect(roleHomePath(session.role));
  }

  return (
    <div className="flex h-screen flex-col">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-accent focus:px-4 focus:py-2 focus:text-sm focus:font-medium focus:text-accent-foreground"
      >
        Skip to main content
      </a>
      <TopNav
        portalLabel="Deal Making / Broker Portal"
        organizationName={session.organizationName}
        userEmail={session.email}
        showRoleSwitch={session.role === "Admin"}
        primaryAction={{ href: "/deals/new", label: "New Submission" }}
      />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar portal="broker" />
        <main id="main-content" className="flex-1 overflow-y-auto bg-muted">{children}</main>
      </div>
    </div>
  );
}
