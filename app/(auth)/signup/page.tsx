"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Briefcase, CheckCircle2, Loader2, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { roleHomePath, type Session, type UserRole } from "@/lib/session";

const ROLE_OPTIONS: Array<{ role: UserRole; title: string; description: string; icon: typeof Briefcase }> = [
  {
    role: "Broker",
    title: "Dealmaker",
    description: "PE firms and M&A advisors submitting transactions for W&I coverage.",
    icon: Briefcase,
  },
  {
    role: "Carrier",
    title: "Carrier",
    description: "Underwriters reviewing risk reports and placing bids on submitted deals.",
    icon: ShieldCheck,
  },
];

export default function SignupPage() {
  return (
    <Suspense fallback={null}>
      <SignupForm />
    </Suspense>
  );
}

function SignupForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const roleParam = searchParams.get("role");
  const initialRole: UserRole = roleParam === "Carrier" ? "Carrier" : "Broker";

  const [role, setRole] = useState<UserRole>(initialRole);
  const [organizationName, setOrganizationName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/auth/signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ organizationName, email, password, role }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Sign up failed.");
      }

      const payload = (await response.json()) as { session: Session };
      router.push(roleHomePath(payload.session.role));
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unexpected error signing up.");
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-xl">
      <CardHeader>
        <CardTitle>Create Your Stoa Account</CardTitle>
        <CardDescription>Choose the workspace that matches your role in the transaction.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {ROLE_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = role === option.role;
            return (
              <button
                key={option.role}
                type="button"
                onClick={() => setRole(option.role)}
                className={cn(
                  "relative flex flex-col items-start gap-2 rounded-lg border p-4 text-left transition-colors",
                  isSelected ? "border-accent bg-accent/5" : "border-border bg-white hover:border-accent/40",
                )}
              >
                {isSelected && <CheckCircle2 className="absolute right-3 top-3 h-4 w-4 text-accent" />}
                <Icon className="h-5 w-5 text-accent" />
                <span className="text-sm font-semibold text-primary">{option.title}</span>
                <span className="text-xs text-muted-foreground">{option.description}</span>
              </button>
            );
          })}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="organizationName">Organization Name</Label>
            <Input
              id="organizationName"
              placeholder="e.g. Meridian Capital Partners"
              required
              value={organizationName}
              onChange={(e) => setOrganizationName(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="email">Work Email</Label>
            <Input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating Account…
              </>
            ) : (
              `Create ${role} Account`
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-muted-foreground">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-accent hover:text-accent-hover">
            Sign in
          </Link>
        </p>
      </CardContent>
    </Card>
  );
}
