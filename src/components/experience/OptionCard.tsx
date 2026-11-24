"use client";

import Image from "next/image";

interface OptionCardProps {
  title: string;
  japanese: string;
  description: string;
  priceLabel: string;
  /** Real photograph shown as the card thumbnail */
  image?: string;
  /** Colour swatch used instead of a photo (broth) */
  swatch?: string;
  selected: boolean;
  /** "select" = choose one option (radio); "toggle" = add or remove an individual ingredient */
  mode: "select" | "toggle";
  onClick: () => void;
}

/** A selectable card: a noodle, a broth, or an ingredient with an add/remove button. */
export function OptionCard({ title, japanese, description, priceLabel, image, swatch, selected, mode, onClick }: OptionCardProps) {
  const actionLabel =
    mode === "select" ? (selected ? "Selected" : "Choose") : selected ? "Remove" : "Add to bowl";

  return (
    <article
      className={[
        "group relative flex gap-4 rounded-2xl border p-3 transition duration-500",
        "hover:-translate-y-0.5 hover:shadow-[0_18px_40px_-18px_rgba(255,150,70,0.45)]",
        selected
          ? "border-[#d9a85c]/70 bg-[#2a1c12]/80 shadow-[0_0_0_1px_rgba(217,168,92,0.25),0_12px_30px_-14px_rgba(230,140,60,0.5)]"
          : "border-white/10 bg-white/[0.03] hover:border-white/25 hover:bg-white/[0.06]",
      ].join(" ")}
    >
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-xl bg-[#1a120c] sm:h-28 sm:w-28">
        {image ? (
          <Image
            src={image}
            alt={`${title} photograph`}
            fill
            sizes="112px"
            className="object-cover transition duration-700 group-hover:scale-110"
          />
        ) : (
          <div
            className="absolute inset-0 transition duration-700 group-hover:scale-110"
            style={{
              background: `radial-gradient(circle at 35% 30%, #fff6e0 0%, ${swatch} 38%, #1a0f08 100%)`,
            }}
            aria-hidden="true"
          />
        )}
        {selected && (
          <span className="absolute left-2 top-2 rounded-full bg-[#d9a85c] px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-[#1a100a]">
            In bowl
          </span>
        )}
      </div>

      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="font-display text-xl leading-tight text-[#f8ead0]">{title}</h3>
          <span className="shrink-0 font-mono text-sm text-[#e9b96e]">{priceLabel}</span>
        </div>
        <p className="font-jp text-[11px] tracking-wider text-[#b8906a]">{japanese}</p>
        <p className="mt-1 text-[13px] leading-snug text-[#cdb79a]">{description}</p>

        <button
          type="button"
          onClick={onClick}
          aria-pressed={selected}
          className={[
            "mt-auto self-start rounded-full px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.14em] transition duration-300",
            "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#e9b96e]",
            selected
              ? "border border-[#d9a85c]/60 text-[#f0c77f] hover:bg-[#d9a85c]/10"
              : "bg-[#e9b96e] text-[#1a100a] hover:bg-[#f6cd86] hover:shadow-[0_0_20px_rgba(233,185,110,0.45)]",
          ].join(" ")}
        >
          {mode === "toggle" && !selected ? "+ " : ""}
          {actionLabel}
        </button>
      </div>
    </article>
  );
}
