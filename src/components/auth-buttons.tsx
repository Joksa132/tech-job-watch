"use client";

import { authClient } from "@/lib/auth-client";

export function SignInButton() {
  return (
    <button
      type="button"
      onClick={() => authClient.signIn.social({ provider: "github" })}
      className="rounded-md border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5"
    >
      Sign in with GitHub
    </button>
  );
}

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => authClient.signOut()}
      className="rounded-md border border-foreground/20 px-3 py-1.5 text-sm hover:bg-foreground/5"
    >
      Sign out
    </button>
  );
}
