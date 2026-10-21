"use client";

import { useState } from "react";
import {
  GuestShell,
  PrimaryButton,
  PrimaryLink,
  SecondaryButton,
} from "@/components/guest-shell";

const TRACK = {
  RESTAURANT: "restaurant",
  CUSTOMER: "customer",
};

export function HowItWorks() {
  const [track, setTrack] = useState(TRACK.RESTAURANT);
  const isRestaurant = track === TRACK.RESTAURANT;

  return (
    <GuestShell
      title="Queue"
      footer={
        isRestaurant ? (
          <div className="flex flex-col gap-3">
            <PrimaryLink href="/api/auth/google">Log in with Google</PrimaryLink>
            <button
              type="button"
              onClick={() => setTrack(TRACK.CUSTOMER)}
              className="text-center text-base leading-6 text-ink underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green"
            >
              See the customer steps
            </button>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            <p className="text-center text-base leading-6 text-ink">
              Ask the restaurant for the QR.
            </p>
            <SecondaryButton onClick={() => setTrack(TRACK.RESTAURANT)}>
              See the restaurant steps
            </SecondaryButton>
          </div>
        )
      }
    >
      <main>
        <h1 className="text-3xl font-semibold tracking-tight text-ink">
          We will tell you when it is your turn.
        </h1>
        <p className="mt-3 text-base leading-6 text-ink-soft">
          One phone for the restaurant. One phone for you.
        </p>

        <div
          role="tablist"
          aria-label="Who is this for"
          className="mt-6 flex gap-3"
        >
          <TrackChip
            selected={isRestaurant}
            onClick={() => setTrack(TRACK.RESTAURANT)}
          >
            Restaurant
          </TrackChip>
          <TrackChip
            selected={!isRestaurant}
            onClick={() => setTrack(TRACK.CUSTOMER)}
          >
            Customer
          </TrackChip>
        </div>

        {isRestaurant ? <RestaurantTrack /> : <CustomerTrack />}
      </main>
    </GuestShell>
  );
}

function TrackChip({ selected, onClick, children }) {
  return (
    <button
      type="button"
      role="tab"
      aria-selected={selected}
      onClick={onClick}
      className={`flex h-12 min-w-30 flex-1 items-center justify-center rounded-full px-4 text-base font-medium transition-colors duration-200 ease-out focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green ${
        selected
          ? "bg-green-wash text-green"
          : "border border-ink bg-paper text-ink"
      }`}
    >
      {children}
    </button>
  );
}

function RestaurantTrack() {
  return (
    <div className="mt-6 transition-opacity duration-200 ease-out">
      <p className="text-lg font-semibold tracking-tight text-ink">
        Create a token. Show the QR. Tap Ready.
      </p>

      <ol className="mt-4 flex list-decimal flex-col gap-3 pl-5 text-base leading-6 text-ink">
        <li>
          <span className="font-medium">Log in</span> with Google.
        </li>
        <li>Create an order. Optional label.</li>
        <li>Show the QR to the customer.</li>
        <li>
          Tap <span className="font-medium">Ready</span> when the food is ready.
        </li>
        <li>
          Tap <span className="font-medium">Picked up</span> when they take it.
        </li>
      </ol>

      <div className="mt-6 flex flex-col gap-4">
        <PreviewCard>
          <div className="flex items-center justify-between gap-3">
            <span className="text-lg font-semibold tabular-nums text-ink">
              12
              <span className="ml-2 text-base font-normal text-ink-soft">
                Table 4
              </span>
            </span>
            <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-ink">
              Waiting
            </span>
          </div>
          <div className="mt-3">
            <PrimaryButton disabled>Ready</PrimaryButton>
          </div>
        </PreviewCard>

        <PreviewCard className="bg-green-wash">
          <div className="flex items-center justify-between gap-3">
            <span className="text-lg font-semibold tabular-nums text-ink">
              12
              <span className="ml-2 text-base font-normal text-ink-soft">
                Table 4
              </span>
            </span>
            <span className="rounded-full bg-green px-3 py-1 text-sm font-medium text-white">
              Ready
            </span>
          </div>
          <p className="mt-3 text-base leading-6 text-ink">
            Your food is ready.
          </p>
        </PreviewCard>
      </div>
    </div>
  );
}

function CustomerTrack() {
  return (
    <div className="mt-6 transition-opacity duration-200 ease-out">
      <p className="text-lg font-semibold tracking-tight text-ink">
        Scan. Install Queue. We will tell you when it is ready.
      </p>

      <ol className="mt-4 flex list-decimal flex-col gap-3 pl-5 text-base leading-6 text-ink">
        <li>Scan the QR from the restaurant.</li>
        <li>
          <span className="font-medium">Install app.</span> In Chrome, tap the
          three dots at the top right, then tap{" "}
          <span className="font-medium">Install app</span>. Open{" "}
          <span className="font-medium">Queue</span> from the home screen.
          <p className="mt-2 text-base leading-6 text-ink-soft">
            On iPhone, add this site to your Home Screen. Then open the app and
            tap Notify me.
          </p>
        </li>
        <li>
          Read your <span className="font-medium">position</span> (the big
          number).
        </li>
        <li>
          Tap <span className="font-medium">Notify me</span>. Allow alerts.
        </li>
        <li>
          Wait. When it is <span className="font-medium">Ready</span>, the phone
          tells you. Come pick up the food.
        </li>
      </ol>

      <div className="mt-6 flex flex-col gap-4">
        <PreviewCard>
          <p className="text-base font-semibold tracking-tight text-ink">
            Chrome
          </p>
          <ol className="mt-3 flex list-decimal flex-col gap-2 pl-5 text-base leading-6 text-ink">
            <li>Tap the three dots at the top right.</li>
            <li>
              Tap <span className="font-medium">Install app</span>.
            </li>
            <li>
              Open <span className="font-medium">Queue</span> from the home
              screen.
            </li>
          </ol>
        </PreviewCard>

        <PreviewCard>
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-white px-3 py-1 text-sm font-medium text-ink">
              Waiting
            </span>
            <span className="text-base text-ink-soft">Position 12</span>
          </div>
          <p className="mt-6 font-semibold tracking-tight text-ink tabular-nums text-7xl md:text-8xl">
            12
          </p>
          <p className="mt-3 text-lg leading-6 text-ink">About 30 minutes</p>
          <p className="mt-4 text-base leading-6 text-ink-soft">
            We will tell you when it is your turn.
          </p>
          <div className="mt-4 h-2 overflow-hidden rounded-full bg-white">
            <div className="h-full w-1/3 rounded-full bg-green" />
          </div>
        </PreviewCard>

        <PreviewCard className="bg-green-wash">
          <div className="flex items-center justify-between gap-3">
            <span className="rounded-full bg-green px-3 py-1 text-sm font-medium text-white">
              Ready
            </span>
            <span className="text-base text-ink-soft">Position 12</span>
          </div>
          <p className="mt-6 font-semibold tracking-tight text-ink tabular-nums text-7xl md:text-8xl">
            12
          </p>
          <p className="mt-3 text-lg leading-6 text-ink">Your food is ready.</p>
        </PreviewCard>
      </div>
    </div>
  );
}

function PreviewCard({ children, className = "bg-paper" }) {
  return (
    <section
      aria-hidden="true"
      className={`rounded-[20px] border border-ink p-6 ${className}`}
    >
      {children}
    </section>
  );
}
