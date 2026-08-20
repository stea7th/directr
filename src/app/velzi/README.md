# velzi — storefront + dashboard

Two routes, both self-contained under `/velzi`:

| Route | What it is |
|---|---|
| `/velzi` | Storefront for the VELZI 360 toothbrush |
| `/velzi/dashboard` | Operator dashboard: sales, traffic, funnel, orders, tool bench |

## Where the numbers come from

`src/lib/velzi/store.ts` has two modes.

**Snapshot (default).** Real store data captured from the Shopify Admin API on
2026-08-20 lives in `src/lib/velzi/snapshot.ts`. No credentials needed — the
dashboard renders truthful figures out of the box and labels itself
"Snapshot · Aug 20".

**Live.** Set both of these and the catalogue, orders and customers are fetched
on every request, and the sales timeseries is rebuilt from real orders. The
badge switches to "Live from Shopify".

```bash
SHOPIFY_STORE_DOMAIN=fhx138-s0.myshopify.com
SHOPIFY_ADMIN_ACCESS_TOKEN=shpat_...
```

Create the token in Shopify admin under **Settings → Apps and sales channels →
Develop apps → Create an app**, then grant these read scopes:
`read_products`, `read_orders`, `read_customers`, `read_inventory`.

If a live fetch fails the page logs the error and falls back to the snapshot
rather than erroring out.

> Session analytics (sessions, cart adds, checkouts) are **not** exposed by the
> Shopify Admin API — they come from the Analytics reports. Those fields always
> use the captured values, in both modes.

## Layout

```
src/lib/velzi/
  types.ts       shared shapes
  snapshot.ts    captured real store data
  store.ts       live Admin API loader + snapshot fallback
  metrics.ts     derived metrics and formatters
  insights.ts    threshold-driven callouts

src/app/velzi/
  velzi.css      theme, animations, every component style
  layout.tsx     shell, aurora background, nav
  page.tsx       storefront
  dashboard/     dashboard route
  _components/   charts, tools, palette, motion primitives
```

Nothing here imports from a chart or animation library — the charts are inline
SVG and the motion is CSS plus a small `IntersectionObserver` hook.

## Notes

- The theme is scoped to `.velzi`; the directr nav is hidden on these routes via
  `body:has(.velzi)` in `velzi.css`.
- Chart colours are validated for contrast and colour-vision deficiency against
  the dark surface — if you change them, re-check adjacent-pair separation.
- `⌘K` / `Ctrl+K` opens the command palette anywhere under `/velzi`.
- Everything honours `prefers-reduced-motion`.
