import { Suspense } from "react";
import { navigation } from "next/cache";
import { getSessionUser } from "@/lib/auth";
import { GuestShell, PrimaryLink } from "@/components/guest-shell";

export const metadata = {
  title: "Log in",
};

export const instant = false;

export default function LoginPage({ searchParams }) {
  return (
    <Suspense
      fallback={
        <GuestShell title="Queue">
          <p className="text-base leading-6 text-ink-soft">Loading.</p>
        </GuestShell>
      }
    >
      <LoginContent searchParams={searchParams} />
    </Suspense>
  );
}

async function LoginContent({ searchParams }) {
  await navigation();
  const user = await getSessionUser();

  if (user) {
    return (
      <GuestShell
        title="Queue"
        footer={<PrimaryLink href="/dashboard">Open the dashboard</PrimaryLink>}
      >
        <main>
          <h1 className="text-3xl font-semibold tracking-tight text-ink">
            Log in
          </h1>
          <p className="mt-3 text-base leading-6 text-ink-soft">
            You are logged in.
          </p>
        </main>
      </GuestShell>
    );
  }

  const params = await searchParams;
  const hasError = params?.error === "1";

  return (
    <GuestShell
      title="Queue"
      footer={<PrimaryLink href="/api/auth/google">Log in with Google</PrimaryLink>}
    >
      <main>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          Log in
        </h1>
        <p className="mt-3 text-base leading-6 text-ink-soft">
          Use your Google account to log in. Then join a queue for food or a
          barber.
        </p>
        {hasError ? (
          <p
            role="alert"
            className="mt-6 rounded-[20px] border border-ink bg-paper px-4 py-3 text-base leading-6 text-ink"
          >
            Login failed. Try again.
          </p>
        ) : null}
      </main>
    </GuestShell>
  );
}
