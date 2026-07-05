"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Loader2, MailCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmationMessage, setConfirmationMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!response.ok) {
        const payload = (await response.json()) as { error?: string };
        throw new Error(payload.error ?? "Something went wrong.");
      }

      const payload = (await response.json()) as { message: string };
      setConfirmationMessage(payload.message);
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Unexpected error.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle>Reset Your Password</CardTitle>
        <CardDescription>We&apos;ll send a reset link to your work email.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-5">
        {confirmationMessage ? (
          <div className="flex items-start gap-3 rounded-md border border-success/30 bg-success/5 p-4">
            <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-success" />
            <p className="text-sm text-primary">{confirmationMessage}</p>
          </div>
        ) : (
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

            {error && <p role="alert" className="text-sm text-destructive">{error}</p>}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending…
                </>
              ) : (
                "Send Reset Link"
              )}
            </Button>
          </form>
        )}

        <Button variant="ghost" size="sm" asChild className="w-full">
          <Link href="/login">
            <ArrowLeft className="mr-1.5 h-4 w-4" />
            Back to Sign In
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
}
