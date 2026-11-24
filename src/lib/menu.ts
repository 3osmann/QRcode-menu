// Shared menu catalogue and pricing rules for EMBER RAMEN BAR.
// This file has NO imports on purpose: it is used by the browser UI, the
// 3D scene, the API route and the pricing test script alike.
// All money is stored in integer cents to avoid floating point errors.

export const NOODLE_IDS = ["ramen", "udon"] as const;
export type NoodleId = (typeof NOODLE_IDS)[number];

export const BROTH_IDS = ["shoyu", "miso", "tonkotsu", "shio"] as const;
export type BrothId = (typeof BROTH_IDS)[number];

export const TOPPING_IDS = [
  "chashu",
  "egg",
  "shiitake",
  "scallion",
  "nori",
  "menma",
  "ginger",
  "narutomaki",
] as const;
export type ToppingId = (typeof TOPPING_IDS)[number];

export const STEP_IDS = ["noodles", "toppings", "broth", "serve"] as const;
export type StepId = (typeof STEP_IDS)[number];

export const MAX_QUANTITY = 9;
/** Consumption tax in basis points: 1000 = 10.00% */
export const TAX_BASIS_POINTS = 1000;

export interface NoodleOption {
  id: NoodleId;
  name: string;
  japanese: string;
  description: string;
  priceCents: number;
  image: string;
}

export interface BrothOption {
  id: BrothId;
  name: string;
  japanese: string;
  description: string;
  priceCents: number;
  /** Hex colour of the broth surface in the 3D bowl */
  color: string;
}

export interface ToppingOption {
  id: ToppingId;
  name: string;
  japanese: string;
  description: string;
  priceCents: number;
  image: string;
}

export const NOODLES: Record<NoodleId, NoodleOption> = {
  ramen: {
    id: "ramen",
    name: "Chukamen Ramen",
    japanese: "中華麺",
    description: "Hand-pulled wheat noodles with a curly, springy bite.",
    priceCents: 1200,
    image: "/images/ingredients/noodle-ramen.jpg",
  },
  udon: {
    id: "udon",
    name: "Sanuki Udon",
    japanese: "うどん",
    description: "Thick, chewy wheat noodles with a silky, slurp-worthy finish.",
    priceCents: 1100,
    image: "/images/ingredients/noodle-udon.jpg",
  },
};

export const BROTHS: Record<BrothId, BrothOption> = {
  shoyu: {
    id: "shoyu",
    name: "Shoyu",
    japanese: "醤油",
    description: "Amber soy-based chicken broth. Clean, balanced and classic.",
    priceCents: 0,
    color: "#8a4b1f",
  },
  miso: {
    id: "miso",
    name: "Miso",
    japanese: "味噌",
    description: "Fermented soybean paste stirred into a warm, earthy broth.",
    priceCents: 150,
    color: "#b5692a",
  },
  tonkotsu: {
    id: "tonkotsu",
    name: "Tonkotsu",
    japanese: "豚骨",
    description: "Pork bone broth simmered for twelve hours. Creamy and deep.",
    priceCents: 250,
    color: "#eee3c9",
  },
  shio: {
    id: "shio",
    name: "Shio",
    japanese: "塩",
    description: "Light sea-salt broth, golden and delicate on the palate.",
    priceCents: 100,
    color: "#e8bb5e",
  },
};

export const TOPPINGS: Record<ToppingId, ToppingOption> = {
  chashu: {
    id: "chashu",
    name: "Chashu Pork",
    japanese: "チャーシュー",
    description: "Slow-braised pork belly glazed with soy and mirin.",
    priceCents: 450,
    image: "/images/ingredients/chashu.jpg",
  },
  egg: {
    id: "egg",
    name: "Ajitama Egg",
    japanese: "味玉",
    description: "Soft-boiled egg marinated overnight with a jammy centre.",
    priceCents: 250,
    image: "/images/ingredients/egg.jpg",
  },
  shiitake: {
    id: "shiitake",
    name: "Shiitake",
    japanese: "椎茸",
    description: "Grilled shiitake caps with deep, smoky umami.",
    priceCents: 200,
    image: "/images/ingredients/shiitake.jpg",
  },
  scallion: {
    id: "scallion",
    name: "Scallions",
    japanese: "葱",
    description: "Hand-cut green onion rings. Bright, fresh and sharp.",
    priceCents: 100,
    image: "/images/ingredients/scallion.jpg",
  },
  nori: {
    id: "nori",
    name: "Nori",
    japanese: "海苔",
    description: "Toasted seaweed sheet with a crisp, briny finish.",
    priceCents: 150,
    image: "/images/ingredients/nori.jpg",
  },
  menma: {
    id: "menma",
    name: "Menma",
    japanese: "メンマ",
    description: "Fermented bamboo shoots with a sweet-savoury crunch.",
    priceCents: 200,
    image: "/images/ingredients/menma.jpg",
  },
  ginger: {
    id: "ginger",
    name: "Pickled Ginger",
    japanese: "紅生姜",
    description: "Thin pink pickled ginger to cleanse the palate between bites.",
    priceCents: 100,
    image: "/images/ingredients/ginger.jpg",
  },
  narutomaki: {
    id: "narutomaki",
    name: "Narutomaki",
    japanese: "なると",
    description: "Steamed fish cake with the signature pink spiral.",
    priceCents: 200,
    image: "/images/ingredients/narutomaki.jpg",
  },
};

export const STEP_LABELS: Record<StepId, string> = {
  noodles: "Noodles",
  toppings: "Toppings",
  broth: "Broth",
  serve: "Serve",
};

export function isNoodleId(value: unknown): value is NoodleId {
  return typeof value === "string" && (NOODLE_IDS as readonly string[]).includes(value);
}

export function isBrothId(value: unknown): value is BrothId {
  return typeof value === "string" && (BROTH_IDS as readonly string[]).includes(value);
}

export function isToppingId(value: unknown): value is ToppingId {
  return typeof value === "string" && (TOPPING_IDS as readonly string[]).includes(value);
}

export function isStepId(value: unknown): value is StepId {
  return typeof value === "string" && (STEP_IDS as readonly string[]).includes(value);
}

export function sortToppings(ids: readonly ToppingId[]): ToppingId[] {
  return TOPPING_IDS.filter((id) => ids.includes(id));
}

export interface OrderSelection {
  noodle: NoodleId;
  broth: BrothId;
  toppings: ToppingId[];
  quantity: number;
}

export type SelectionCheck =
  | { ok: true; value: OrderSelection }
  | { ok: false; error: string };

/** Validates untrusted input (for example a JSON request body). */
export function normalizeSelection(raw: unknown): SelectionCheck {
  if (typeof raw !== "object" || raw === null) {
    return { ok: false, error: "Request body must be a JSON object." };
  }
  const data = raw as Record<string, unknown>;

  if (!isNoodleId(data.noodle)) {
    return { ok: false, error: "Unknown noodle type." };
  }
  if (!isBrothId(data.broth)) {
    return { ok: false, error: "Unknown broth." };
  }
  if (!Array.isArray(data.toppings)) {
    return { ok: false, error: "Toppings must be a list." };
  }
  for (const topping of data.toppings) {
    if (!isToppingId(topping)) {
      return { ok: false, error: `Unknown topping: ${String(topping)}` };
    }
  }
  const toppings = sortToppings(data.toppings as ToppingId[]);

  const quantity = data.quantity;
  if (
    typeof quantity !== "number" ||
    !Number.isInteger(quantity) ||
    quantity < 1 ||
    quantity > MAX_QUANTITY
  ) {
    return { ok: false, error: `Quantity must be a whole number from 1 to ${MAX_QUANTITY}.` };
  }

  return {
    ok: true,
    value: { noodle: data.noodle, broth: data.broth, toppings, quantity },
  };
}

export interface ReceiptLine {
  key: string;
  category: "noodle" | "broth" | "topping";
  label: string;
  unitCents: number;
  quantity: number;
  lineCents: number;
}

export interface OrderTotals {
  lines: ReceiptLine[];
  perBowlCents: number;
  quantity: number;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
}

/**
 * The single source of truth for money.
 * Subtotal = (noodle + broth + each topping) x bowls.
 * Tax = subtotal x 10%, rounded to the nearest cent.
 */
export function calculateOrder(selection: OrderSelection): OrderTotals {
  const noodle = NOODLES[selection.noodle];
  const broth = BROTHS[selection.broth];
  if (!noodle || !broth) {
    throw new Error("Unknown noodle or broth in order.");
  }
  const quantity = Math.min(MAX_QUANTITY, Math.max(1, Math.trunc(selection.quantity)));
  const toppings = sortToppings(selection.toppings).map((id) => TOPPINGS[id]);

  const lines: ReceiptLine[] = [
    {
      key: `noodle-${noodle.id}`,
      category: "noodle",
      label: noodle.name,
      unitCents: noodle.priceCents,
      quantity,
      lineCents: noodle.priceCents * quantity,
    },
    {
      key: `broth-${broth.id}`,
      category: "broth",
      label: `${broth.name} broth`,
      unitCents: broth.priceCents,
      quantity,
      lineCents: broth.priceCents * quantity,
    },
    ...toppings.map((topping) => ({
      key: `topping-${topping.id}`,
      category: "topping" as const,
      label: topping.name,
      unitCents: topping.priceCents,
      quantity,
      lineCents: topping.priceCents * quantity,
    })),
  ];

  const perBowlCents = lines.reduce((sum, line) => sum + line.unitCents, 0);
  const subtotalCents = perBowlCents * quantity;
  const taxCents = Math.round((subtotalCents * TAX_BASIS_POINTS) / 10000);

  return {
    lines,
    perBowlCents,
    quantity,
    subtotalCents,
    taxCents,
    totalCents: subtotalCents + taxCents,
  };
}

export function formatMoney(cents: number): string {
  const sign = cents < 0 ? "-" : "";
  const absolute = Math.abs(cents);
  return `${sign}$${Math.floor(absolute / 100)}.${String(absolute % 100).padStart(2, "0")}`;
}
