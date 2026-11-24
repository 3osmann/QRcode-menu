"use client";

import dynamic from "next/dynamic";
import { useState } from "react";
import { BowlProvider, useBowl } from "./BowlProvider";
import { LoadingScreen } from "./LoadingScreen";
import { Receipt } from "./Receipt";
import { SceneControls } from "./SceneControls";
import { StepNav } from "./StepNav";
import { StepPanel } from "./StepPanel";

// The 3D scene only runs in the browser (WebGL), so it is loaded on the client only.
const BowlScene = dynamic(() => import("@/components/three/BowlScene"), { ssr: false });

/** Root of the website. Wraps the page in the shared bowl state. */
export function EmberExperience() {
  return (
    <BowlProvider>
      <ExperienceShell />
    </BowlProvider>
  );
}

function ExperienceShell() {
  const { state, dispatch } = useBowl();
  const [autoRotate, setAutoRotate] = useState(false);

  return (
    <div className="relative flex min-h-dvh flex-col lg:h-dvh lg:overflow-hidden">
      <LoadingScreen />
      <div aria-hidden="true" className="pointer-events-none fixed inset-0 bg-[radial-gradient(ellipse_at_top,rgba(255,160,80,0.10),transparent_55%),radial-gradient(ellipse_at_bottom,rgba(120,60,20,0.18),transparent_60%)]" />

      <header className="relative z-20 shrink-0 px-4 pt-4 sm:px-6 sm:pt-5">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div className="flex items-center justify-between gap-4 xl:min-w-[260px]">
            <div>
              <p className="font-display text-2xl tracking-[0.22em] text-[#fbeed6] sm:text-3xl">EMBER RAMEN BAR</p>
              <p className="mt-0.5 text-[10px] uppercase tracking-[0.3em] text-[#d9a85c]">Build your bowl · Est. 2026</p>
            </div>
            <ResetButton onReset={() => dispatch({ type: "reset" })} className="xl:hidden" />
          </div>

          <StepNav />

          <ResetButton onReset={() => dispatch({ type: "reset" })} className="hidden xl:inline-flex" />
        </div>
      </header>

      <main className="relative z-10 grid flex-1 gap-4 p-4 sm:p-6 md:grid-cols-2 lg:min-h-0 lg:grid-cols-[minmax(330px,380px)_minmax(0,1fr)_minmax(330px,380px)] lg:grid-rows-[minmax(0,1fr)]">
        <section
          aria-label="3D bowl"
          className="relative order-1 h-[58dvh] min-h-[420px] overflow-hidden rounded-3xl border border-white/10 bg-[#0a0604] shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] md:col-span-2 lg:order-2 lg:col-span-1 lg:h-full lg:min-h-0"
        >
          <BowlScene
            step={state.step}
            noodle={state.noodle}
            broth={state.broth}
            toppings={state.toppings}
            tick={state.tick}
            autoRotate={autoRotate}
          />
          <SceneControls autoRotate={autoRotate} onToggleAutoRotate={() => setAutoRotate((value) => !value)} />
        </section>

        <StepPanel />
        <Receipt />
      </main>
    </div>
  );
}

function ResetButton({ onReset, className = "" }: { onReset: () => void; className?: string }) {
  return (
    <button
      type="button"
      onClick={onReset}
      className={`items-center gap-2 whitespace-nowrap rounded-full border border-[#d9a85c]/50 px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#f0c77f] transition hover:bg-[#d9a85c]/10 hover:shadow-[0_0_24px_rgba(217,168,92,0.25)] ${className || "inline-flex"}`}
    >
      Reset Bowl
    </button>
  );
}
