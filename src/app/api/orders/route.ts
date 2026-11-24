import { desc, sql } from "drizzle-orm";
import { db } from "@/db";
import { orders } from "@/db/schema";
import { BROTHS, calculateOrder, NOODLES, normalizeSelection, TOPPINGS } from "@/lib/menu";

export const dynamic = "force-dynamic";

function makeOrderCode(): string {
  const time = Date.now().toString(36).toUpperCase().slice(-4);
  const random = Math.random().toString(36).slice(2, 5).toUpperCase();
  return `EMB-${time}${random}`;
}

/** Sends a bowl order to the kitchen. Prices are always recalculated here, never trusted from the browser. */
export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Request body must be valid JSON." }, { status: 400 });
  }

  const checked = normalizeSelection(body);
  if (!checked.ok) {
    return Response.json({ error: checked.error }, { status: 400 });
  }

  const selection = checked.value;
  const totals = calculateOrder(selection);

  try {
    const [row] = await db
      .insert(orders)
      .values({
        code: makeOrderCode(),
        noodle: selection.noodle,
        broth: selection.broth,
        toppings: selection.toppings,
        quantity: selection.quantity,
        subtotalCents: totals.subtotalCents,
        taxCents: totals.taxCents,
        totalCents: totals.totalCents,
      })
      .returning();

    return Response.json(
      {
        order: {
          code: row.code,
          createdAt: row.createdAt.toISOString(),
          noodle: NOODLES[selection.noodle].name,
          broth: BROTHS[selection.broth].name,
          toppings: selection.toppings.map((id) => TOPPINGS[id].name),
          quantity: selection.quantity,
          subtotalCents: totals.subtotalCents,
          taxCents: totals.taxCents,
          totalCents: totals.totalCents,
        },
      },
      { status: 201 },
    );
  } catch (error) {
    console.error("Could not save order", error);
    return Response.json({ error: "The kitchen could not save this order. Please try again." }, { status: 500 });
  }
}

/** Returns the number of bowls ordered so far and the five most recent orders. */
export async function GET() {
  try {
    const [countRow] = await db.select({ count: sql<number>`count(*)::int` }).from(orders);
    const recent = await db
      .select({
        code: orders.code,
        noodle: orders.noodle,
        broth: orders.broth,
        quantity: orders.quantity,
        totalCents: orders.totalCents,
        createdAt: orders.createdAt,
      })
      .from(orders)
      .orderBy(desc(orders.createdAt))
      .limit(5);

    return Response.json({
      count: countRow?.count ?? 0,
      recent: recent.map((row) => ({ ...row, createdAt: row.createdAt.toISOString() })),
    });
  } catch (error) {
    console.error("Could not load orders", error);
    return Response.json({ error: "Order history is unavailable right now." }, { status: 500 });
  }
}
