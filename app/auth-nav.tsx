"use client";

import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs";
import { useLanguage } from "./i18n";

const CLERK_CONFIGURED = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);

export default function AuthNav() {
  const { t } = useLanguage();

  if (!CLERK_CONFIGURED) return null;

  return (
    <>
      <SignedOut>
        <SignInButton mode="modal">
          <button className="nav-link" style={{ border: "none", background: "transparent", cursor: "pointer" }}>
            {t.nav.signIn}
          </button>
        </SignInButton>
      </SignedOut>
      <SignedIn>
        <UserButton />
      </SignedIn>
    </>
  );
}
