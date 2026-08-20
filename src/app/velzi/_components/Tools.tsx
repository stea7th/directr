"use client";

import { useState } from "react";
import { money, percent } from "@/lib/velzi/metrics";
import type { Metrics } from "@/lib/velzi/metrics";
import { Meter, NumberField, Readout, Slider, Tool } from "./ToolKit";
import {
  IconBox,
  IconGauge,
  IconRefresh,
  IconSpark,
  IconTag,
  IconTarget,
} from "./Icons";

const usd = (n: number) => money(n, "USD");
const usd0 = (n: number) => money(n, "USD", 0);
const int = (n: number) => Math.round(n).toLocaleString("en-US");

/** Payment processing, Shopify's standard online card rate. */
const FEE_RATE = 0.029;
const FEE_FIXED = 0.3;

const GOOD = "var(--st-good)";
const WARN = "var(--st-warning)";
const BAD = "var(--st-critical)";

/** Colours for the cost-breakdown stack — categorical slots, fixed order. */
const STACK = [
  { key: "Profit", color: "var(--series-3)" },
  { key: "Product cost", color: "var(--series-1)" },
  { key: "Shipping", color: "var(--series-2)" },
  { key: "Fees", color: "var(--series-4)" },
];

export default function Tools({ metrics, price }: { metrics: Metrics; price: number }) {
  // Shared unit economics — every tool below reads from these.
  const [sellPrice, setSellPrice] = useState(price);
  const [cogs, setCogs] = useState(12);
  const [shipping, setShipping] = useState(6);
  const [cac, setCac] = useState(25);

  const fees = sellPrice * FEE_RATE + FEE_FIXED;
  const contribution = sellPrice - cogs - shipping - fees; // profit before ad spend
  const profitPerUnit = contribution - cac;
  const margin = sellPrice > 0 ? contribution / sellPrice : 0;
  const breakevenRoas = margin > 0 ? 1 / margin : Infinity;
  const maxCpa = contribution;

  const profitTone = profitPerUnit > 0 ? GOOD : BAD;

  return (
    <div className="v-tools" id="tools">
      {/* 1 ─ Unit economics */}
      <Tool
        icon={<IconGauge size={17} />}
        title="Unit Economics Lab"
        sub="Everything else on this bench reads from these four numbers. Product cost and shipping start as estimates — set them to your real figures."
      >
        <Slider
          label="Selling price"
          value={sellPrice}
          min={10}
          max={200}
          step={1}
          onChange={setSellPrice}
          display={usd}
        />
        <Slider
          label="Product cost (COGS)"
          value={cogs}
          min={0}
          max={100}
          step={0.5}
          onChange={setCogs}
          display={usd}
        />
        <Slider
          label="Shipping & handling"
          value={shipping}
          min={0}
          max={40}
          step={0.5}
          onChange={setShipping}
          display={usd}
        />
        <Slider
          label="Customer acquisition cost"
          value={cac}
          min={0}
          max={90}
          step={1}
          onChange={setCac}
          display={usd}
        />

        <div className="v-stack" role="img" aria-label="Where each sale goes">
          {[
            Math.max(contribution, 0),
            cogs,
            shipping,
            fees,
          ].map((amount, i) => (
            <div
              key={STACK[i].key}
              className="v-stack__seg"
              style={{
                flexGrow: Math.max(amount, 0.0001),
                background: STACK[i].color,
              }}
            />
          ))}
        </div>
        <div className="v-swatchrow">
          {STACK.map((entry, i) => (
            <span key={entry.key}>
              <i style={{ background: entry.color }} aria-hidden="true" />
              {entry.key} ·{" "}
              {usd([Math.max(contribution, 0), cogs, shipping, fees][i])}
            </span>
          ))}
        </div>

        <Readout
          rows={[
            {
              label: "Profit per order (after ads)",
              value: usd(profitPerUnit),
              hero: true,
              tone: profitTone,
            },
            { label: "Contribution margin", value: percent(margin) },
            { label: "Break-even ROAS", value: Number.isFinite(breakevenRoas) ? `${breakevenRoas.toFixed(2)}×` : "—" },
            { label: "Most you can pay per sale", value: usd(maxCpa) },
          ]}
        />
      </Tool>

      {/* 2 ─ Ad scale simulator */}
      <AdSimulator contribution={contribution} sellPrice={sellPrice} />

      {/* 3 ─ Revenue goal projector */}
      <GoalProjector
        sellPrice={sellPrice}
        contribution={contribution}
        conversionRate={metrics.conversionRate}
        cac={cac}
      />

      {/* 4 ─ Inventory runway */}
      <InventoryRunway
        units={metrics.inventoryUnits}
        sellRate={metrics.dailySellRate}
        cogs={cogs}
      />

      {/* 5 ─ Refund impact */}
      <RefundModel contribution={contribution} cac={cac} actualRate={metrics.refundRate} />

      {/* 6 ─ Discount test */}
      <DiscountTest sellPrice={sellPrice} cogs={cogs} shipping={shipping} />
    </div>
  );
}

function AdSimulator({ contribution, sellPrice }: { contribution: number; sellPrice: number }) {
  const [spend, setSpend] = useState(100);
  const [cpc, setCpc] = useState(0.9);
  const [cvr, setCvr] = useState(1.5);

  const clicks = cpc > 0 ? spend / cpc : 0;
  const orders = clicks * (cvr / 100);
  const revenue = orders * sellPrice;
  const grossProfit = orders * contribution;
  const netProfit = grossProfit - spend;
  const roas = spend > 0 ? revenue / spend : 0;
  const tone = netProfit > 0 ? GOOD : netProfit === 0 ? WARN : BAD;

  return (
    <Tool
      icon={<IconSpark size={17} />}
      title="Ad Scale Simulator"
      sub="Pushes a daily budget through your click cost and landing-page conversion rate to see what actually lands in the bank."
    >
      <Slider label="Daily ad spend" value={spend} min={0} max={2000} step={10} onChange={setSpend} display={usd0} />
      <Slider label="Cost per click" value={cpc} min={0.1} max={5} step={0.05} onChange={setCpc} display={usd} />
      <Slider
        label="Landing conversion rate"
        value={cvr}
        min={0.1}
        max={8}
        step={0.1}
        onChange={setCvr}
        display={(n) => `${n.toFixed(1)}%`}
      />

      <Readout
        rows={[
          { label: "Net profit per day", value: usd(netProfit), hero: true, tone },
          { label: "Clicks bought", value: int(clicks) },
          { label: "Orders", value: orders.toFixed(1) },
          { label: "Revenue", value: usd(revenue) },
          { label: "ROAS", value: `${roas.toFixed(2)}×` },
          { label: "Profit per month", value: usd(netProfit * 30) },
        ]}
      />
    </Tool>
  );
}

function GoalProjector({
  sellPrice,
  contribution,
  conversionRate,
  cac,
}: {
  sellPrice: number;
  contribution: number;
  conversionRate: number;
  cac: number;
}) {
  const [goal, setGoal] = useState(10000);
  const [days, setDays] = useState(30);

  const orders = sellPrice > 0 ? goal / sellPrice : 0;
  const ordersPerDay = days > 0 ? orders / days : 0;
  // Uses the store's live conversion rate, with a floor so the maths stays finite.
  const rate = conversionRate > 0 ? conversionRate : 0.01;
  const sessionsNeeded = orders / rate;
  const sessionsPerDay = days > 0 ? sessionsNeeded / days : 0;
  const adSpend = orders * cac;
  const profit = orders * contribution - adSpend;

  return (
    <Tool
      icon={<IconTarget size={17} />}
      title="Revenue Goal Projector"
      sub={`Works backwards from a target using your real conversion rate of ${percent(conversionRate, 2)}.`}
    >
      <NumberField label="Revenue target" value={goal} onChange={setGoal} step={500} />
      <Slider
        label="Days to get there"
        value={days}
        min={7}
        max={180}
        step={1}
        onChange={setDays}
        display={(n) => `${n} days`}
      />

      <Readout
        rows={[
          { label: "Sessions needed per day", value: int(sessionsPerDay), hero: true },
          { label: "Orders needed", value: `${int(orders)} (${ordersPerDay.toFixed(1)}/day)` },
          { label: "Total sessions", value: int(sessionsNeeded) },
          { label: "Ad spend at your CAC", value: usd0(adSpend) },
          {
            label: "Profit left over",
            value: usd0(profit),
            tone: profit > 0 ? GOOD : BAD,
          },
        ]}
      />
    </Tool>
  );
}

function InventoryRunway({
  units,
  sellRate,
  cogs,
}: {
  units: number;
  sellRate: number;
  cogs: number;
}) {
  const [rate, setRate] = useState(Math.max(1, Math.round(sellRate * 10) / 10));
  const [growth, setGrowth] = useState(0);

  // Compound the daily growth rate day by day until stock runs out.
  let remaining = units;
  let day = 0;
  let daily = rate;
  const cap = 3650;
  while (remaining > 0 && day < cap && daily > 0) {
    remaining -= daily;
    daily *= 1 + growth / 100;
    day += 1;
  }

  const runwayDays = daily <= 0 ? null : day >= cap ? null : day;
  const stockoutDate =
    runwayDays === null
      ? null
      : new Date(Date.now() + runwayDays * 86_400_000).toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
        });

  const capitalTied = units * cogs;
  // 90 days of cover is the comfortable end of the scale.
  const coverPct = runwayDays === null ? 100 : Math.min(100, (runwayDays / 90) * 100);
  const tone = runwayDays === null || runwayDays > 60 ? GOOD : runwayDays > 21 ? WARN : BAD;

  return (
    <Tool
      icon={<IconBox size={17} />}
      title="Inventory Runway"
      sub={`${int(units)} units on hand. Your current rate is ${sellRate.toFixed(1)} orders a day across days with traffic.`}
    >
      <Slider
        label="Orders per day"
        value={rate}
        min={0.5}
        max={300}
        step={0.5}
        onChange={setRate}
        display={(n) => `${n.toFixed(1)}/day`}
      />
      <Slider
        label="Daily growth"
        value={growth}
        min={0}
        max={15}
        step={0.5}
        onChange={setGrowth}
        display={(n) => `+${n.toFixed(1)}%`}
      />

      <div style={{ marginBottom: 16 }}>
        <Meter pct={coverPct} color={tone} />
      </div>

      <Readout
        rows={[
          {
            label: "Stock lasts",
            value: runwayDays === null ? "10+ years" : `${int(runwayDays)} days`,
            hero: true,
            tone,
          },
          { label: "Runs out around", value: stockoutDate ?? "not this decade" },
          { label: "Capital tied up in stock", value: usd0(capitalTied) },
          {
            label: "Reorder by (30-day lead time)",
            value:
              runwayDays === null
                ? "no rush at this rate"
                : runwayDays <= 30
                  ? "now"
                  : new Date(Date.now() + (runwayDays - 30) * 86_400_000).toLocaleDateString(
                      "en-US",
                      { month: "short", day: "numeric", year: "numeric" },
                    ),
          },
        ]}
      />
    </Tool>
  );
}

function RefundModel({
  contribution,
  cac,
  actualRate,
}: {
  contribution: number;
  cac: number;
  actualRate: number;
}) {
  const [refundRate, setRefundRate] = useState(Math.round(actualRate * 100));

  const r = refundRate / 100;
  // A refunded order gives the revenue back but keeps the acquisition cost —
  // and usually the shipping too, which is why this bites so hard.
  const perOrder = (1 - r) * contribution - cac;
  const vsToday = perOrder - ((1 - actualRate) * contribution - cac);
  const tone = perOrder > 0 ? GOOD : BAD;

  return (
    <Tool
      icon={<IconRefresh size={17} />}
      title="Refund Impact Model"
      sub={`Your refund rate is running at ${percent(actualRate, 0)}. A refunded order returns the revenue but never returns the ad spend.`}
    >
      <Slider
        label="Refund rate"
        value={refundRate}
        min={0}
        max={80}
        step={1}
        onChange={setRefundRate}
        display={(n) => `${n}%`}
      />

      <Readout
        rows={[
          { label: "True profit per order", value: usd(perOrder), hero: true, tone },
          {
            label: "Versus your rate today",
            value: `${vsToday >= 0 ? "+" : ""}${usd(vsToday)}`,
            tone: vsToday >= 0 ? GOOD : BAD,
          },
          { label: "Profit per 100 orders", value: usd0(perOrder * 100) },
          {
            label: "Rate you break even at",
            value:
              contribution > 0 && contribution > cac
                ? percent(1 - cac / contribution, 0)
                : "unprofitable at any rate",
          },
        ]}
      />
    </Tool>
  );
}

function DiscountTest({
  sellPrice,
  cogs,
  shipping,
}: {
  sellPrice: number;
  cogs: number;
  shipping: number;
}) {
  const [discount, setDiscount] = useState(15);
  const [lift, setLift] = useState(25);

  const baseUnit = sellPrice - cogs - shipping - (sellPrice * FEE_RATE + FEE_FIXED);
  const discounted = sellPrice * (1 - discount / 100);
  const discountUnit = discounted - cogs - shipping - (discounted * FEE_RATE + FEE_FIXED);

  // Compare 100 baseline orders against the lifted volume at the lower margin.
  const baseProfit = baseUnit * 100;
  const newProfit = discountUnit * 100 * (1 + lift / 100);
  const delta = newProfit - baseProfit;
  const breakevenLift = discountUnit > 0 ? (baseUnit / discountUnit - 1) * 100 : Infinity;
  const tone = delta > 0 ? GOOD : BAD;

  return (
    <Tool
      icon={<IconTag size={17} />}
      title="Discount Break-even"
      sub="A discount only pays for itself if the extra volume covers the margin you gave away. This says how much extra you need."
    >
      <Slider
        label="Discount offered"
        value={discount}
        min={0}
        max={60}
        step={1}
        onChange={setDiscount}
        display={(n) => `${n}%`}
      />
      <Slider
        label="Expected volume lift"
        value={lift}
        min={0}
        max={300}
        step={5}
        onChange={setLift}
        display={(n) => `+${n}%`}
      />

      <Readout
        rows={[
          {
            label: "Profit change per 100 orders",
            value: `${delta >= 0 ? "+" : ""}${usd0(delta)}`,
            hero: true,
            tone,
          },
          { label: "Discounted price", value: usd(discounted) },
          { label: "Margin per unit after discount", value: usd(discountUnit) },
          {
            label: "Lift needed to break even",
            value: Number.isFinite(breakevenLift) && breakevenLift >= 0
              ? `+${breakevenLift.toFixed(0)}%`
              : "no lift can cover it",
          },
        ]}
      />
    </Tool>
  );
}
