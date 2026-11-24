// Run with: node --experimental-strip-types scripts/verify-pricing.ts
// Checks every price rule of the live receipt against hand-calculated values.
import {
  calculateOrder,
  formatMoney,
  normalizeSelection,
  TOPPING_IDS,
  type OrderSelection,
} from "../src/lib/menu.ts";

let failures = 0;
function check(name: string, actual: unknown, expected: unknown) {
  const ok = JSON.stringify(actual) === JSON.stringify(expected);
  if (!ok) failures += 1;
  console.log(`${ok ? "PASS" : "FAIL"}  ${name}  ->  ${JSON.stringify(actual)}${ok ? "" : ` (expected ${JSON.stringify(expected)})`}`);
}

// 1. Default bowl: ramen + shoyu, no toppings, 1 bowl.
// 1200 + 0 = 1200; tax 10% = 120; total 1320
{
  const t = calculateOrder({ noodle: "ramen", broth: "shoyu", toppings: [], quantity: 1 });
  check("default bowl per-bowl", t.perBowlCents, 1200);
  check("default bowl tax", t.taxCents, 120);
  check("default bowl total", t.totalCents, 1320);
}

// 2. Every topping, tonkotsu, 3 bowls.
// toppings = 450+250+200+100+150+200+100+200 = 1650; per bowl = 1200+250+1650 = 3100
// subtotal = 9300; tax = 930; total = 10230
{
  const t = calculateOrder({ noodle: "ramen", broth: "tonkotsu", toppings: [...TOPPING_IDS], quantity: 3 });
  check("all toppings per-bowl", t.perBowlCents, 3100);
  check("all toppings subtotal", t.subtotalCents, 9300);
  check("all toppings tax", t.taxCents, 930);
  check("all toppings total", t.totalCents, 10230);
  check("line count (noodle + broth + 8 toppings)", t.lines.length, 10);
}

// 3. Udon + miso + chashu + egg, 2 bowls.
// per bowl = 1100 + 150 + 450 + 250 = 1950; subtotal 3900; tax 390; total 4290
{
  const t = calculateOrder({ noodle: "udon", broth: "miso", toppings: ["egg", "chashu"], quantity: 2 });
  check("udon combo per-bowl", t.perBowlCents, 1950);
  check("udon combo total", t.totalCents, 4290);
  check("line total for chashu x2", t.lines.find((l) => l.key === "topping-chashu")?.lineCents, 900);
}

// 4. Rounding: udon + shio + scallion, 1 bowl -> 1100+100+100 = 1300; tax 130; total 1430
{
  const t = calculateOrder({ noodle: "udon", broth: "shio", toppings: ["scallion"], quantity: 1 });
  check("shio + scallion total", t.totalCents, 1430);
}

// 5. Topping order on the receipt is always menu order, regardless of click order.
{
  const t = calculateOrder({ noodle: "ramen", broth: "shoyu", toppings: ["narutomaki", "chashu"], quantity: 1 });
  check("receipt topping order", t.lines.filter((l) => l.category === "topping").map((l) => l.key), ["topping-chashu", "topping-narutomaki"]);
}

// 6. Validation of untrusted input.
{
  const good = normalizeSelection({ noodle: "ramen", broth: "shoyu", toppings: ["nori", "egg"], quantity: 2 });
  check("valid input accepted", good.ok, true);
  if (good.ok) check("valid input sorted to menu order", good.value.toppings, ["egg", "nori"]);
  check("quantity 0 rejected", normalizeSelection({ noodle: "ramen", broth: "shoyu", toppings: [], quantity: 0 }).ok, false);
  check("quantity 10 rejected", normalizeSelection({ noodle: "ramen", broth: "shoyu", toppings: [], quantity: 10 }).ok, false);
  check("quantity 1.5 rejected", normalizeSelection({ noodle: "ramen", broth: "shoyu", toppings: [], quantity: 1.5 }).ok, false);
  check("unknown topping rejected", normalizeSelection({ noodle: "ramen", broth: "shoyu", toppings: ["pizza"], quantity: 1 }).ok, false);
  check("unknown broth rejected", normalizeSelection({ noodle: "ramen", broth: "cola", toppings: [], quantity: 1 }).ok, false);
}

// 7. Money formatting.
check("format 1320 cents", formatMoney(1320), "$13.20");
check("format 5 cents", formatMoney(5), "$0.05");

// 8. Exhaustive combinations: every noodle x broth x topping subset (2 x 4 x 256) must price as the sum of its parts.
{
  let combos = 0;
  let mismatches = 0;
  for (const noodle of ["ramen", "udon"] as const) {
    for (const broth of ["shoyu", "miso", "tonkotsu", "shio"] as const) {
      for (let mask = 0; mask < 1 << TOPPING_IDS.length; mask++) {
        const toppings = TOPPING_IDS.filter((_, i) => (mask & (1 << i)) !== 0);
        const selection: OrderSelection = { noodle, broth, toppings: [...toppings], quantity: 1 };
        const t = calculateOrder(selection);
        const toppingSum = toppings.reduce((s, id) => s + t.lines.find((l) => l.key === `topping-${id}`)!.unitCents, 0);
        const expectedPerBowl = t.lines[0].unitCents + t.lines[1].unitCents + toppingSum;
        const expectedTax = Math.round(expectedPerBowl / 10);
        combos += 1;
        if (t.perBowlCents !== expectedPerBowl || t.taxCents !== expectedTax || t.totalCents !== expectedPerBowl + expectedTax) {
          mismatches += 1;
        }
      }
    }
  }
  check(`all ${combos} combinations price correctly`, mismatches, 0);
}

console.log(failures === 0 ? "\nALL PRICING CHECKS PASSED" : `\n${failures} PRICING CHECK(S) FAILED`);
process.exit(failures === 0 ? 0 : 1);
