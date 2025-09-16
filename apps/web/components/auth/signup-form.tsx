"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { type FormEvent, useState, useTransition } from "react";
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
import { cn } from "@/lib/utils";

type SignupFormProps = {
  redirectTo?: string;
  className?: string;
};

type SignUpError = {
  body?: {
    message?: string;
  };
  message: string;
};

const MIN_PASSWORD_LENGTH = 8;
const DEFAULT_REDIRECT = "/home";

export function SignupForm({
  redirectTo,
  className,
  ...props
}: SignupFormProps) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const destination = redirectTo ?? DEFAULT_REDIRECT;

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = formData.get("name")?.toString().trim();
    const email = formData.get("email")?.toString().trim();
    const password = formData.get("password")?.toString();
    const confirm = formData.get("confirm-password")?.toString();

    if (!(name && email && password && confirm)) {
      setError("Fill in all fields to create your account.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords must match.");
      return;
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
      setError(`Password must be at least ${MIN_PASSWORD_LENGTH} characters.`);
      return;
    }

    startTransition(async () => {
      setError(null);
      try {
        await authClient.signUp.email({
          name,
          email,
          password,
          callbackURL: destination,
        });
        router.replace(destination);
        router.refresh();
      } catch (err) {
        const authError = err as SignUpError;
        const message =
          authError.body?.message ?? authError.message ?? "Unable to sign up.";
        setError(message);
      }
    });
  };

  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Create your Monte account</CardTitle>
          <CardDescription>
            Set up your workspace in a few minutes.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>
            <div className="grid gap-3">
              <Label htmlFor="name">Full name</Label>
              <Input
                autoComplete="name"
                id="name"
                name="name"
                required
                type="text"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="email">Email</Label>
              <Input
                autoComplete="email"
                id="email"
                name="email"
                placeholder="guide@monteschool.com"
                required
                type="email"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="password">Password</Label>
              <Input
                autoComplete="new-password"
                id="password"
                minLength={MIN_PASSWORD_LENGTH}
                name="password"
                required
                type="password"
              />
            </div>
            <div className="grid gap-3">
              <Label htmlFor="confirm-password">Confirm password</Label>
              <Input
                autoComplete="new-password"
                id="confirm-password"
                minLength={MIN_PASSWORD_LENGTH}
                name="confirm-password"
                required
                type="password"
              />
            </div>
            {error ? (
              <p className="text-destructive text-sm" role="alert">
                {error}
              </p>
            ) : null}
            <Button className="w-full" disabled={isPending} type="submit">
              {isPending ? "Creating account..." : "Create account"}
            </Button>
            <p className="text-center text-muted-foreground text-sm">
              Already have an account?{" "}
              <Link className="underline underline-offset-4" href="/login">
                Log in
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
