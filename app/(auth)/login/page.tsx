"use client";

import { Suspense, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { EyebrowBadge } from "@/components/layout/EyebrowBadge";
import { roleHomePath, type Session } from "@/lib/session";

const DEMO_ACCOUNTS = [
  { label: "Broker demo", email: "alexandra.reyes@meridiancapital.com" },
  { label: "Carrier demo", email: "priya.narayan@atlas-assurance.com" },
  { label: "Admin demo (both sides)", email: "morgan.chen@stoa.com" },
];

export default function LoginPage() {
  return (
    <Suspense fallback={null}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const nextPath = searchParams.get("next");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Sign in failed.");
      }

      const payload = (await response.json()) as { session: Session };
      router.push(nextPath ?? roleHomePath(payload.session.role));
      router.refresh();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unexpected error signing in.");
      setIsSubmitting(false);
    }
  }

  return (
    <div className="w-full max-w-md">
      <div className="mb-6 flex justify-center">
        <EyebrowBadge>Secure Access · Institutional Trust</EyebrowBadge>
      </div>
      <Card>
      <CardHeader>
        <CardTitle className="text-2xl font-extrabold tracking-tight text-primary">Sign In</CardTitle>
        <CardDescription>Access your Broker or Carrier workspace.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="email">Email</Label>
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
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              <Link href="/forgot-password" className="text-xs font-medium text-accent hover:text-accent-hover">
                Forgot password?
              </Link>
            </div>
            <Input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {error && (
            <p role="alert" className="text-sm text-destructive">
              {error}
            </p>
          )}

          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Signing In…
              </>
            ) : (
              "Sign In"
            )}
          </Button>
        </form>

        <div className="rounded-md border border-accent/20 bg-accent/5 p-3">
          <p className="label-uppercase mb-2">Try a Demo Account</p>
          <div className="flex flex-col gap-1.5">
            {DEMO_ACCOUNTS.map((account) => (
              <button
                key={account.email}
                type="button"
                onClick={() => {
                  setEmail(account.email);
                  setPassword("stoa-demo");
                  setError(null);
                }}
                className="flex items-center justify-between rounded-md border border-transparent bg-white px-3 py-2 text-left text-xs shadow-sm transition-colors hover:border-accent/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              >
                <span className="font-medium text-primary">{account.label}</span>
                <span className="text-muted-foreground">Click to fill credentials</span>
              </button>
            ))}
          </div>
        </div>

        <p className="text-center text-sm text-muted-foreground">
          Don&apos;t have an account?{" "}
          <Link href="/signup" className="font-medium text-accent hover:text-accent-hover">
            Sign up
          </Link>
        </p>
      </CardContent>
      </Card>
    </div>
  );
}
