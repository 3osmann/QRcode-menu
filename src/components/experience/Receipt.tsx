"use client";

import { useEffect, useState } from "react";
import { BROTHS, formatMoney, MAX_QUANTITY, NOODLES, TAX_BASIS_POINTS } from "@/lib/menu";
import { useBowl } from "./BowlProvider";

/** Right-hand panel: a live paper receipt that recalculates on every change. */
export function Receipt() {
  const { state, dispatch, totals } = useBowl();
  const [printedAt, setPrintedAt] = useState<string>("");

  useEffect(() => {
    setPrintedAt(new Date().toLocaleString("en-US", { dateStyle: "medium", timeStyle: "short" }));
  }, []);

  const noodleLines = totals.lines.filter((line) => line.category === "noodle");
  const brothLines = totals.lines.filter((line) => line.category === "broth");
  const toppingLines = totals.lines.filter((line) => line.category === "topping");

  return (
    <aside
      aria-label="Receipt"
      className="order-3 flex min-h-0 flex-col md:col-span-1 lg:order-3 lg:h-full"
    >
      <div className="receipt-scroll flex min-h-0 flex-1 flex-col overflow-y-auto rounded-3xl border border-white/10 bg-black/35 p-4 backdrop-blur-md sm:p-5">
        <div className="receipt-paper relative mx-auto w-full max-w-[380px] bg-[#f3e9d4] px-6 pb-8 pt-7 font-mono text-[12.5px] leading-relaxed text-[#2a2118] shadow-[0_30px_60px_-20px_rgba(0,0,0,0.7)]">
          <div className="text-center">
            <p className="font-display text-[26px] font-semibold tracking-[0.12em] text-[#1d140d]">EMBER RAMEN BAR</p>
            <p className="mt-0.5 text-[10.5px] uppercase tracking-[0.24em] text-[#6b5a48]">Counter seat 04 · Dine in</p>
            <p className="mt-1 text-[10.5px] text-[#6b5a48]">{printedAt || "\u00a0"}</p>
          </div>

          <Divider />

          <p className="flex justify-between text-[11px] uppercase tracking-[0.16em] text-[#6b5a48]">
            <span>Order</span>
            <span className="text-[#2a2118]">{state.placed ? state.placed.code : "Not sent yet"}</span>
          </p>

          <Divider />

          <Section title="Noodles">
            {noodleLines.map((line) => (
              <Row key={line.key} label={line.label} sub={NOODLES[state.noodle].japanese} amount={formatMoney(line.lineCents)} />
            ))}
          </Section>

          <Section title="Broth">
            {brothLines.map((line) => (
              <Row
                key={line.key}
                label={`${BROTHS[state.broth].name} broth`}
                sub={line.unitCents === 0 ? "included" : `${formatMoney(line.unitCents)} each`}
                amount={line.lineCents === 0 ? "$0.00" : formatMoney(line.lineCents)}
              />
            ))}
          </Section>

          <Section title={`Toppings (${toppingLines.length})`}>
            {toppingLines.length === 0 && <p className="text-[#8f7a61]">— none selected —</p>}
            {toppingLines.map((line) => (
              <Row
                key={line.key}
                label={line.label}
                sub={`${formatMoney(line.unitCents)} each`}
                amount={formatMoney(line.lineCents)}
              />
            ))}
          </Section>

          <Divider />

          <Row label="Price per bowl" amount={formatMoney(totals.perBowlCents)} />

          <div className="my-2 flex items-center justify-between">
            <span className="uppercase tracking-[0.12em]">Quantity</span>
            <div className="flex items-center gap-2" role="group" aria-label="Quantity">
              <button
                type="button"
                onClick={() => dispatch({ type: "quantity", quantity: state.quantity - 1 })}
                disabled={state.quantity <= 1}
                aria-label="Decrease quantity"
                className="grid h-6 w-6 place-items-center rounded-full border border-[#2a2118]/40 text-sm transition hover:bg-[#2a2118] hover:text-[#f3e9d4] disabled:opacity-30"
              >
                −
              </button>
              <span className="w-6 text-center font-semibold" aria-live="polite">
                {state.quantity}
              </span>
              <button
                type="button"
                onClick={() => dispatch({ type: "quantity", quantity: state.quantity + 1 })}
                disabled={state.quantity >= MAX_QUANTITY}
                aria-label="Increase quantity"
                className="grid h-6 w-6 place-items-center rounded-full border border-[#2a2118]/40 text-sm transition hover:bg-[#2a2118] hover:text-[#f3e9d4] disabled:opacity-30"
              >
                +
              </button>
            </div>
          </div>

          <Divider />

          <Row label={`Subtotal (× ${totals.quantity})`} amount={formatMoney(totals.subtotalCents)} />
          <Row label={`Tax ${TAX_BASIS_POINTS / 100}%`} amount={formatMoney(totals.taxCents)} />

          <div className="mt-2 border-t-2 border-double border-[#2a2118] pt-2">
            <div className="flex items-baseline justify-between text-[17px] font-bold">
              <span className="tracking-[0.08em]">TOTAL</span>
              <span>{formatMoney(totals.totalCents)}</span>
            </div>
          </div>

          <Divider />

          <p className="text-center text-[11px] text-[#6b5a48]">Thank you. ありがとうございました。</p>
          <div className="receipt-barcode mx-auto mt-3 h-8 w-48" aria-hidden="true" />
        </div>

        <button
          type="button"
          onClick={() => dispatch({ type: "reset" })}
          className="mx-auto mt-5 w-full max-w-[380px] rounded-full border border-[#d9a85c]/50 px-5 py-2.5 text-xs font-semibold uppercase tracking-[0.18em] text-[#f0c77f] transition hover:bg-[#d9a85c]/10 hover:shadow-[0_0_24px_rgba(217,168,92,0.25)]"
        >
          Reset bowl
        </button>
      </div>
    </aside>
  );
}

function Divider() {
  return <div className="my-3 border-t border-dashed border-[#2a2118]/50" />;
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mt-2">
      <p className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.2em] text-[#6b5a48]">{title}</p>
      <div className="space-y-1">{children}</div>
    </div>
  );
}

function Row({ label, sub, amount }: { label: string; sub?: string; amount: string }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="truncate">{label}</p>
        {sub && <p className="text-[10.5px] text-[#6b5a48]">{sub}</p>}
      </div>
      <span className="shrink-0 tabular-nums">{amount}</span>
    </div>
  );
}
