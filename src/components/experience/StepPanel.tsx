"use client";

import { gsap } from "gsap";
import { useEffect, useRef, useState } from "react";
import {
  BROTH_IDS,
  BROTHS,
  formatMoney,
  NOODLE_IDS,
  NOODLES,
  STEP_IDS,
  STEP_LABELS,
  TOPPING_IDS,
  TOPPINGS,
  type StepId,
} from "@/lib/menu";
import { useBowl, type PlacedOrder } from "./BowlProvider";
import { OptionCard } from "./OptionCard";

const STEP_COPY: Record<StepId, { title: string; text: string }> = {
  noodles: {
    title: "Choose your noodles",
    text: "Start with the foundation of every bowl. Your choice is kept while you explore the other steps.",
  },
  toppings: {
    title: "Add toppings",
    text: "Tap an ingredient to drop it into the bowl. Tap again to lift it back out.",
  },
  broth: {
    title: "Pour the broth",
    text: "The broth colours the whole bowl. Each style is simmered and seasoned differently.",
  },
  serve: {
    title: "Review and serve",
    text: "Check your bowl, choose how many to order, then send it to the kitchen.",
  },
};

/** Left-hand panel: the content of the current step, with previous/next navigation. */
export function StepPanel() {
  const { state, dispatch } = useBowl();
  const panel = useRef<HTMLDivElement>(null);
  const index = STEP_IDS.indexOf(state.step);
  const copy = STEP_COPY[state.step];

  useEffect(() => {
    // Page transition: the new step content fades and rises into place.
    const target = panel.current;
    if (!target) return;
    gsap.fromTo(
      target.querySelectorAll("[data-animate]"),
      { opacity: 0, y: 18 },
      { opacity: 1, y: 0, duration: 0.6, ease: "power3.out", stagger: 0.06, clearProps: "transform" },
    );
  }, [state.step]);

  const go = (step: StepId) => dispatch({ type: "step", step });

  return (
    <section
      aria-label="Ingredient selection"
      className="order-2 flex min-h-0 flex-col rounded-3xl border border-white/10 bg-black/35 backdrop-blur-md md:col-span-1 lg:order-1 lg:h-full"
    >
      <div ref={panel} key={state.step} className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto p-5 sm:p-6">
        <header data-animate>
          <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#d9a85c]">
            Step {String(index + 1).padStart(2, "0")} · {STEP_LABELS[state.step]}
          </p>
          <h2 className="mt-2 font-display text-3xl leading-tight text-[#fbeed6]">{copy.title}</h2>
          <p className="mt-2 text-sm leading-relaxed text-[#bfa686]">{copy.text}</p>
        </header>

        {state.step === "noodles" && (
          <div className="flex flex-col gap-3" data-animate>
            {NOODLE_IDS.map((id) => {
              const noodle = NOODLES[id];
              return (
                <OptionCard
                  key={id}
                  mode="select"
                  title={noodle.name}
                  japanese={noodle.japanese}
                  description={noodle.description}
                  priceLabel={formatMoney(noodle.priceCents)}
                  image={noodle.image}
                  selected={state.noodle === id}
                  onClick={() => dispatch({ type: "noodle", noodle: id })}
                />
              );
            })}
          </div>
        )}

        {state.step === "toppings" && (
          <div className="flex flex-col gap-3" data-animate>
            <div className="flex items-center justify-between text-xs uppercase tracking-[0.16em] text-[#bfa686]">
              <span>{state.toppings.length} of {TOPPING_IDS.length} selected</span>
              {state.toppings.length > 0 && (
                <button
                  type="button"
                  onClick={() => state.toppings.forEach((id) => dispatch({ type: "toggleTopping", id }))}
                  className="text-[#e9b96e] underline-offset-4 hover:underline"
                >
                  Clear toppings
                </button>
              )}
            </div>
            {TOPPING_IDS.map((id) => {
              const topping = TOPPINGS[id];
              return (
                <OptionCard
                  key={id}
                  mode="toggle"
                  title={topping.name}
                  japanese={topping.japanese}
                  description={topping.description}
                  priceLabel={formatMoney(topping.priceCents)}
                  image={topping.image}
                  selected={state.toppings.includes(id)}
                  onClick={() => dispatch({ type: "toggleTopping", id })}
                />
              );
            })}
          </div>
        )}

        {state.step === "broth" && (
          <div className="flex flex-col gap-3" data-animate>
            {BROTH_IDS.map((id) => {
              const broth = BROTHS[id];
              return (
                <OptionCard
                  key={id}
                  mode="select"
                  title={broth.name}
                  japanese={broth.japanese}
                  description={broth.description}
                  priceLabel={broth.priceCents === 0 ? "Included" : `+${formatMoney(broth.priceCents)}`}
                  swatch={broth.color}
                  selected={state.broth === id}
                  onClick={() => dispatch({ type: "broth", broth: id })}
                />
              );
            })}
          </div>
        )}

        {state.step === "serve" && <ServeStep placed={state.placed} />}
      </div>

      <footer className="flex items-center justify-between gap-3 border-t border-white/10 p-4 sm:px-6">
        <button
          type="button"
          onClick={() => index > 0 && go(STEP_IDS[index - 1])}
          disabled={index === 0}
          className="rounded-full border border-white/15 px-4 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#e8d5b5] transition hover:border-[#d9a85c]/60 hover:text-[#f6cd86] disabled:cursor-not-allowed disabled:opacity-30"
        >
          ← Back
        </button>
        <button
          type="button"
          onClick={() => index < STEP_IDS.length - 1 && go(STEP_IDS[index + 1])}
          disabled={index === STEP_IDS.length - 1}
          className="rounded-full bg-[#e9b96e] px-5 py-2 text-xs font-semibold uppercase tracking-[0.14em] text-[#1a100a] transition hover:bg-[#f6cd86] hover:shadow-[0_0_22px_rgba(233,185,110,0.45)] disabled:cursor-not-allowed disabled:opacity-30"
        >
          {index < STEP_IDS.length - 1 ? `Next: ${STEP_LABELS[STEP_IDS[index + 1]]} →` : "Finished"}
        </button>
      </footer>
    </section>
  );
}

interface RecentOrder {
  code: string;
  noodle: NoodleKey;
  broth: BrothKey;
  quantity: number;
  totalCents: number;
  createdAt: string;
}

type NoodleKey = keyof typeof NOODLES;
type BrothKey = keyof typeof BROTHS;

function ServeStep({ placed }: { placed: PlacedOrder | null }) {
  const { state, dispatch, totals } = useBowl();
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [message, setMessage] = useState<string | null>(null);
  const [history, setHistory] = useState<{ count: number; recent: RecentOrder[] } | null>(null);

  const loadHistory = async () => {
    try {
      const response = await fetch("/api/orders", { cache: "no-store" });
      if (!response.ok) throw new Error("History unavailable");
      setHistory((await response.json()) as { count: number; recent: RecentOrder[] });
    } catch {
      setHistory(null);
    }
  };

  useEffect(() => {
    void loadHistory();
  }, []);

  const placeOrder = async () => {
    setStatus("sending");
    setMessage(null);
    try {
      const response = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          noodle: state.noodle,
          broth: state.broth,
          toppings: state.toppings,
          quantity: state.quantity,
        }),
      });
      const data = (await response.json()) as { order?: PlacedOrder; error?: string };
      if (!response.ok || !data.order) throw new Error(data.error ?? "The order could not be sent.");
      dispatch({ type: "placed", order: data.order });
      setStatus("idle");
      void loadHistory();
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "The order could not be sent.");
    }
  };

  const hasNoBowl = state.toppings.length === 0 && state.broth === "shoyu" && state.noodle === "ramen";

  return (
    <div className="flex flex-col gap-5" data-animate>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#bfa686]">Your bowl</p>
        <ul className="mt-3 space-y-2 text-sm text-[#efdcbc]">
          <li className="flex justify-between gap-3">
            <span>{NOODLES[state.noodle].name}</span>
            <span className="font-mono text-[#e9b96e]">{formatMoney(NOODLES[state.noodle].priceCents)}</span>
          </li>
          <li className="flex justify-between gap-3">
            <span>{BROTHS[state.broth].name} broth</span>
            <span className="font-mono text-[#e9b96e]">
              {BROTHS[state.broth].priceCents === 0 ? "Included" : formatMoney(BROTHS[state.broth].priceCents)}
            </span>
          </li>
          {state.toppings.length === 0 && <li className="text-[#8f7a61]">No toppings yet</li>}
          {state.toppings.map((id) => (
            <li key={id} className="flex justify-between gap-3">
              <span>{TOPPINGS[id].name}</span>
              <span className="font-mono text-[#e9b96e]">{formatMoney(TOPPINGS[id].priceCents)}</span>
            </li>
          ))}
        </ul>
        {hasNoBowl && <p className="mt-3 text-xs text-[#8f7a61]">Your bowl is the classic base. Add toppings to make it yours.</p>}
      </div>

      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.03] p-4">
        <div>
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#bfa686]">Bowls</p>
          <p className="text-xs text-[#8f7a61]">Price per bowl {formatMoney(totals.perBowlCents)}</p>
        </div>
        <div className="flex items-center gap-2" role="group" aria-label="Quantity">
          <button
            type="button"
            onClick={() => dispatch({ type: "quantity", quantity: state.quantity - 1 })}
            disabled={state.quantity <= 1}
            aria-label="Remove one bowl"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-lg text-[#f0d9b0] transition hover:border-[#d9a85c] disabled:opacity-30"
          >
            −
          </button>
          <span className="w-8 text-center font-mono text-lg text-[#fbeed6]" aria-live="polite">
            {state.quantity}
          </span>
          <button
            type="button"
            onClick={() => dispatch({ type: "quantity", quantity: state.quantity + 1 })}
            disabled={state.quantity >= 9}
            aria-label="Add one bowl"
            className="grid h-9 w-9 place-items-center rounded-full border border-white/15 text-lg text-[#f0d9b0] transition hover:border-[#d9a85c] disabled:opacity-30"
          >
            +
          </button>
        </div>
      </div>

      <div className="flex items-end justify-between">
        <span className="text-xs uppercase tracking-[0.2em] text-[#bfa686]">Total with tax</span>
        <span className="font-display text-4xl text-[#fbeed6]">{formatMoney(totals.totalCents)}</span>
      </div>

      <button
        type="button"
        onClick={placeOrder}
        disabled={status === "sending"}
        className="rounded-full bg-gradient-to-r from-[#e9a456] to-[#d9753a] px-6 py-3.5 text-sm font-semibold uppercase tracking-[0.18em] text-[#1a100a] shadow-[0_12px_30px_-10px_rgba(230,120,50,0.7)] transition hover:brightness-110 hover:shadow-[0_16px_40px_-10px_rgba(230,120,50,0.9)] disabled:opacity-60"
      >
        {status === "sending" ? "Sending to kitchen…" : "Send to kitchen"}
      </button>

      {message && <p role="alert" className="text-sm text-[#ff9b7a]">{message}</p>}

      {placed && (
        <div className="rounded-2xl border border-[#d9a85c]/50 bg-[#d9a85c]/10 p-4" role="status">
          <p className="text-[11px] uppercase tracking-[0.2em] text-[#f0c77f]">Order received</p>
          <p className="mt-1 font-mono text-lg text-[#fbeed6]">{placed.code}</p>
          <p className="text-xs text-[#cdb79a]">Saved to the kitchen database. Total {formatMoney(placed.totalCents)}.</p>
        </div>
      )}

      <div>
        <p className="text-[11px] uppercase tracking-[0.2em] text-[#bfa686]">
          Kitchen log {history ? `· ${history.count} bowls served` : ""}
        </p>
        {history === null ? (
          <p className="mt-2 text-xs text-[#8f7a61]">Order history appears here once the kitchen database is reachable.</p>
        ) : history.recent.length === 0 ? (
          <p className="mt-2 text-xs text-[#8f7a61]">No orders yet. Your first bowl will appear here.</p>
        ) : (
          <ul className="mt-2 divide-y divide-white/10 text-xs text-[#cdb79a]">
            {history.recent.map((order) => (
              <li key={order.code} className="flex justify-between gap-3 py-2">
                <span className="font-mono">{order.code}</span>
                <span>
                  {NOODLES[order.noodle]?.name ?? order.noodle} · {BROTHS[order.broth]?.name ?? order.broth} · ×{order.quantity}
                </span>
                <span className="font-mono text-[#e9b96e]">{formatMoney(order.totalCents)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      <button
        type="button"
        onClick={() => dispatch({ type: "reset" })}
        className="self-start text-xs uppercase tracking-[0.16em] text-[#8f7a61] underline-offset-4 hover:text-[#e9b96e] hover:underline"
      >
        Start a new bowl
      </button>
    </div>
  );
}
