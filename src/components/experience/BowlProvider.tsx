"use client";

import { createContext, useContext, useEffect, useMemo, useReducer, useState, type Dispatch, type ReactNode } from "react";
import {
  calculateOrder,
  isBrothId,
  isNoodleId,
  isStepId,
  isToppingId,
  MAX_QUANTITY,
  type BrothId,
  type NoodleId,
  type OrderTotals,
  type StepId,
  type ToppingId,
  sortToppings,
} from "@/lib/menu";

export interface PlacedOrder {
  code: string;
  createdAt: string;
  noodle: string;
  broth: string;
  toppings: string[];
  quantity: number;
  subtotalCents: number;
  taxCents: number;
  totalCents: number;
}

export interface BowlState {
  step: StepId;
  noodle: NoodleId;
  broth: BrothId;
  toppings: ToppingId[];
  quantity: number;
  /** Increases on every change so the 3D bowl can react (sway, pop) */
  tick: number;
  placed: PlacedOrder | null;
}

export const INITIAL_STATE: BowlState = {
  step: "noodles",
  noodle: "ramen",
  broth: "shoyu",
  toppings: [],
  quantity: 1,
  tick: 0,
  placed: null,
};

const STORAGE_KEY = "ember-ramen-bowl:v1";

export type BowlAction =
  | { type: "step"; step: StepId }
  | { type: "noodle"; noodle: NoodleId }
  | { type: "broth"; broth: BrothId }
  | { type: "toggleTopping"; id: ToppingId }
  | { type: "quantity"; quantity: number }
  | { type: "reset" }
  | { type: "hydrate"; saved: Partial<BowlState> }
  | { type: "placed"; order: PlacedOrder };

function clampQuantity(value: number): number {
  if (!Number.isFinite(value)) return 1;
  return Math.min(MAX_QUANTITY, Math.max(1, Math.round(value)));
}

export function bowlReducer(state: BowlState, action: BowlAction): BowlState {
  switch (action.type) {
    case "step":
      return { ...state, step: action.step };
    case "noodle":
      return { ...state, noodle: action.noodle, tick: state.tick + 1, placed: null };
    case "broth":
      return { ...state, broth: action.broth, tick: state.tick + 1, placed: null };
    case "toggleTopping": {
      const exists = state.toppings.includes(action.id);
      const next = exists ? state.toppings.filter((id) => id !== action.id) : sortToppings([...state.toppings, action.id]);
      return { ...state, toppings: next, tick: state.tick + 1, placed: null };
    }
    case "quantity":
      return { ...state, quantity: clampQuantity(action.quantity), placed: null };
    case "reset":
      return { ...INITIAL_STATE, tick: state.tick + 1 };
    case "hydrate": {
      const saved = action.saved;
      return {
        ...state,
        step: isStepId(saved.step) ? saved.step : state.step,
        noodle: isNoodleId(saved.noodle) ? saved.noodle : state.noodle,
        broth: isBrothId(saved.broth) ? saved.broth : state.broth,
        toppings: Array.isArray(saved.toppings) ? sortToppings(saved.toppings.filter(isToppingId)) : state.toppings,
        quantity: typeof saved.quantity === "number" ? clampQuantity(saved.quantity) : state.quantity,
      };
    }
    case "placed":
      return { ...state, placed: action.order };
    default:
      return state;
  }
}

interface BowlContextValue {
  state: BowlState;
  dispatch: Dispatch<BowlAction>;
  totals: OrderTotals;
  /** False until the saved bowl has been restored from this browser */
  ready: boolean;
}

const BowlContext = createContext<BowlContextValue | null>(null);

/** Holds the whole bowl configuration and keeps it saved in this browser between visits. */
export function BowlProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(bowlReducer, INITIAL_STATE);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) dispatch({ type: "hydrate", saved: JSON.parse(raw) as Partial<BowlState> });
    } catch {
      // Ignore corrupted or unavailable storage: the bowl simply starts empty.
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          step: state.step,
          noodle: state.noodle,
          broth: state.broth,
          toppings: state.toppings,
          quantity: state.quantity,
        }),
      );
    } catch {
      // Storage can be full or blocked; the bowl still works in memory.
    }
  }, [ready, state.step, state.noodle, state.broth, state.toppings, state.quantity]);

  const totals = useMemo(
    () =>
      calculateOrder({
        noodle: state.noodle,
        broth: state.broth,
        toppings: state.toppings,
        quantity: state.quantity,
      }),
    [state.noodle, state.broth, state.toppings, state.quantity],
  );

  const value = useMemo(() => ({ state, dispatch, totals, ready }), [state, totals, ready]);
  return <BowlContext.Provider value={value}>{children}</BowlContext.Provider>;
}

export function useBowl(): BowlContextValue {
  const context = useContext(BowlContext);
  if (!context) throw new Error("useBowl must be used inside BowlProvider");
  return context;
}
