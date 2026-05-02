"use client";

import { useRouter } from "next/navigation";
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
  const router = useRouter();
  return (
    <button
      type="button"
      onClick={async () => {
        await authClient.signOut();
        router.refresh();
      }}
      className="hover:text-accent transition-colors duration-150 cursor-pointer"
    >
      Sign out
    </button>
  );
}
