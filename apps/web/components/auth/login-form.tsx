"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { authClient } from "@/lib/auth/client";
import { getAuthErrorMessage } from "@/lib/auth/errors";
import { cn } from "@/lib/utils";

type LoginFormProps = {
  redirectTo?: string;
  className?: string;
};

const DEFAULT_REDIRECT = "/home";

export function LoginForm({ redirectTo, className, ...props }: LoginFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const destination = redirectTo ?? DEFAULT_REDIRECT;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();
    const rememberMe = formData.get("remember-me") === "on";

    if (!(email && password)) {
      setError("Enter your email and password to sign in.");
      return;
    }

    startTransition(async () => {
      setError(null);
      try {
        await authClient.signIn.email({
          email,
          password,
          rememberMe,
          callbackURL: destination,
        });
        router.replace(destination);
        router.refresh();
      } catch (err) {
        const message = getAuthErrorMessage(err, "Unable to sign in.");
        setError(message);
        toast.error(message);
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Log in to Monte</CardTitle>
          <CardDescription>Access your classroom workspace.</CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                autoComplete="email"
                id="email"
                name="email"
                placeholder="montessori@school.com"
                required
                type="email"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                autoComplete="current-password"
                id="password"
                name="password"
                required
                type="password"
              />
            </div>
            <div className="flex items-center justify-between">
              <label
                className="flex items-center gap-2 text-sm"
                htmlFor="remember-me"
              >
                <input
                  className="h-4 w-4 rounded border-input"
                  defaultChecked
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                />
                Keep me signed in
              </label>
              <Link
                className="text-muted-foreground text-sm underline-offset-4 hover:underline"
                href="/signup"
              >
                Need an account?
              </Link>
            </div>
            {error ? (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            ) : null}
            <Button className="w-full" disabled={isPending} type="submit">
              {isPending ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
