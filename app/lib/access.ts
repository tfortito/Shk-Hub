import { cookies } from "next/headers";

export const FREE_TRIAL_QUESTIONS = 5;
const TRIAL_COOKIE = "stichtag_trial_used";
const CLERK_CONFIGURED = Boolean(
  process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && process.env.CLERK_SECRET_KEY
);

export async function isSignedIn(): Promise<boolean> {
  if (!CLERK_CONFIGURED) return false;
  try {
    const { auth } = await import("@clerk/nextjs/server");
    const { userId } = await auth();
    return Boolean(userId);
  } catch {
    return false;
  }
}

export async function getTrialUsed(): Promise<number> {
  const store = await cookies();
  const raw = store.get(TRIAL_COOKIE)?.value;
  const n = raw ? parseInt(raw, 10) : 0;
  return Number.isFinite(n) ? n : 0;
}

// Returns the trial count to report in the response, and whether this request
// was allowed to proceed. Call `commit` only after the request actually succeeds,
// so a failed upstream call doesn't burn part of the visitor's trial.
export async function checkTrial(): Promise<{
  allowed: boolean;
  used: number;
  remaining: number;
  signedIn: boolean;
}> {
  const signedIn = await isSignedIn();
  const used = await getTrialUsed();
  if (signedIn) {
    return { allowed: true, used, remaining: Infinity as unknown as number, signedIn };
  }
  return {
    allowed: used < FREE_TRIAL_QUESTIONS,
    used,
    remaining: Math.max(0, FREE_TRIAL_QUESTIONS - used),
    signedIn,
  };
}

const YEAR_IN_SECONDS = 60 * 60 * 24 * 365;

export async function commitTrialUse(response: {
  cookies: { set: (name: string, value: string, opts: Record<string, unknown>) => void };
}) {
  const used = await getTrialUsed();
  response.cookies.set(TRIAL_COOKIE, String(used + 1), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: YEAR_IN_SECONDS,
    path: "/",
  });
}
