"use client";

import { authClient } from "@/lib/auth-client";

export function SignInButton() {
  return (
    <button
      type="button"
      onClick={() => authClient.signIn.social({ provider: "github" })}
      className="hover:text-accent transition-colors duration-150 cursor-pointer"
    >
      Sign in
    </button>
  );
}

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signOut();
        window.location.href = "/";
      }}
      className="hover:text-accent transition-colors duration-150 cursor-pointer"
    >
      Sign out
    </button>
  );
}
