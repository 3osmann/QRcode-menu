"use client";

import { STEP_IDS, STEP_LABELS, formatMoney, type StepId } from "@/lib/menu";
import { useBowl } from "./BowlProvider";

/** Top navigation: the four steps. Each tab shows a short summary of the current choice. */
export function StepNav() {
  const { state, dispatch, totals } = useBowl();
  const currentIndex = STEP_IDS.indexOf(state.step);

  const summaries: Record<StepId, string> = {
    noodles: state.noodle === "ramen" ? "Chukamen" : "Udon",
    toppings: state.toppings.length === 0 ? "None yet" : `${state.toppings.length} added`,
    broth: state.broth.charAt(0).toUpperCase() + state.broth.slice(1),
    serve: formatMoney(totals.totalCents),
  };

  return (
    <nav aria-label="Bowl steps" className="w-full overflow-x-auto">
      <ol className="mx-auto flex min-w-max items-stretch gap-2 md:gap-3">
        {STEP_IDS.map((id, index) => {
          const active = state.step === id;
          const done = index < currentIndex;
          return (
            <li key={id}>
              <button
                type="button"
                onClick={() => dispatch({ type: "step", step: id })}
                aria-current={active ? "step" : undefined}
                className={[
                  "group relative flex min-w-[118px] flex-col items-start rounded-2xl border px-4 py-2.5 text-left transition duration-500 md:min-w-[156px]",
                  active
                    ? "border-[#d9a85c]/70 bg-[#d9a85c]/12 shadow-[0_0_30px_-8px_rgba(230,160,80,0.55)]"
                    : "border-white/10 bg-white/[0.03] hover:-translate-y-0.5 hover:border-white/30 hover:bg-white/[0.07]",
                ].join(" ")}
              >
                <span className="flex items-center gap-2">
                  <span
                    className={[
                      "font-mono text-[11px] tracking-wider",
                      active ? "text-[#f0c77f]" : done ? "text-[#d9a85c]" : "text-[#8f7a61]",
                    ].join(" ")}
                  >
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span
                    className={[
                      "text-[13px] font-semibold uppercase tracking-[0.18em]",
                      active ? "text-[#fbeed6]" : "text-[#d8c4a3] group-hover:text-[#fbeed6]",
                    ].join(" ")}
                  >
                    {STEP_LABELS[id]}
                  </span>
                </span>
                <span className="mt-0.5 text-[11px] text-[#a88d69]">{summaries[id]}</span>
                <span
                  aria-hidden="true"
                  className={[
                    "absolute bottom-0 left-4 right-4 h-[2px] origin-left rounded-full bg-gradient-to-r from-[#f0c77f] to-[#d9753a] transition-transform duration-700",
                    active ? "scale-x-100" : "scale-x-0",
                  ].join(" ")}
                />
              </button>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
