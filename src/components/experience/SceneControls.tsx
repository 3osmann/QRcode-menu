"use client";

import { formatMoney } from "@/lib/menu";
import { CAMERA_EVENTS } from "@/components/three/CameraRig";
import { useBowl } from "./BowlProvider";

interface SceneControlsProps {
  autoRotate: boolean;
  onToggleAutoRotate: () => void;
}

function dispatchCamera(event: string, detail?: number) {
  window.dispatchEvent(new CustomEvent<number>(event, { detail: detail ?? 0 }));
}

/** Buttons floating over the 3D view: zoom, reset camera, auto-rotate and a live price tag. */
export function SceneControls({ autoRotate, onToggleAutoRotate }: SceneControlsProps) {
  const { totals, state } = useBowl();
  const stepLabel = state.step.charAt(0).toUpperCase() + state.step.slice(1);

  return (
    <>
      <div className="pointer-events-none absolute left-4 top-4 z-10 hidden sm:block">
        <p className="text-[10px] font-semibold uppercase tracking-[0.3em] text-[#e9b96e]/80">Live bowl view</p>
        <p className="mt-1 font-display text-lg text-[#fbeed6]/90">{stepLabel}</p>
      </div>

      <div className="absolute right-3 top-3 z-10 flex flex-col gap-2">
        <IconButton label="Zoom in" onClick={() => dispatchCamera(CAMERA_EVENTS.zoom, 0.8)}>
          <path d="M12 5v14M5 12h14" />
        </IconButton>
        <IconButton label="Zoom out" onClick={() => dispatchCamera(CAMERA_EVENTS.zoom, 1.25)}>
          <path d="M5 12h14" />
        </IconButton>
        <IconButton label="Reset camera" onClick={() => dispatchCamera(CAMERA_EVENTS.reset)}>
          <path d="M4 12a8 8 0 1 0 2.3-5.6M4 4v4h4" />
        </IconButton>
        <IconButton label={autoRotate ? "Stop turntable" : "Turntable"} active={autoRotate} onClick={onToggleAutoRotate}>
          <path d="M12 3a9 9 0 1 0 9 9M21 3v6h-6" />
        </IconButton>
      </div>

      <div className="pointer-events-none absolute bottom-4 left-1/2 z-10 -translate-x-1/2 whitespace-nowrap rounded-full border border-white/10 bg-black/55 px-4 py-2 text-xs text-[#e8d5b5] backdrop-blur-md">
        <span className="hidden sm:inline">Drag to rotate · Scroll to zoom · </span>
        Bowl <span className="font-mono text-[#f0c77f]">{formatMoney(totals.perBowlCents)}</span>
        {" · "}Total <span className="font-mono text-[#f0c77f]">{formatMoney(totals.totalCents)}</span>
      </div>
    </>
  );
}

function IconButton({
  label,
  onClick,
  active = false,
  children,
}: {
  label: string;
  onClick: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      title={label}
      className={[
        "grid h-10 w-10 place-items-center rounded-full border backdrop-blur-md transition duration-300 hover:scale-105 focus-visible:outline-2 focus-visible:outline-[#e9b96e]",
        active
          ? "border-[#d9a85c] bg-[#d9a85c]/25 text-[#fbeed6]"
          : "border-white/15 bg-black/45 text-[#e8d5b5] hover:border-[#d9a85c]/70 hover:text-[#f6cd86]",
      ].join(" ")}
    >
      <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
        {children}
      </svg>
    </button>
  );
}
